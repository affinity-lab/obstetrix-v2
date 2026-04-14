package modules

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log/slog"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/yourorg/obstetrix/orchestrator/internal/config"
	"github.com/yourorg/obstetrix/orchestrator/internal/services"
)

// ObstetrixManifest represents the obstetrix.json manifest in the project repo root.
// Fields override their project.conf equivalents when present.
type ObstetrixManifest struct {
	Deploy struct {
		Include []string `json:"include"`
		Exclude []string `json:"exclude"`
	} `json:"deploy"`
	Persistent []string `json:"persistent"`
	Start      struct {
		Command string `json:"command"`
	} `json:"start"`
	Health struct {
		Path                string `json:"path"`
		TimeoutSeconds      int    `json:"timeout_seconds"`
		InitialDelaySeconds int    `json:"initial_delay_seconds"`
	} `json:"health"`
	Build struct {
		Command string `json:"command"`
	} `json:"build"`
}

// loadManifest reads obstetrix.json from workDir. If absent or invalid, returns defaults from proj.
func loadManifest(workDir string, proj *config.ProjectConfig) *ObstetrixManifest {
	data, err := os.ReadFile(filepath.Join(workDir, "obstetrix.json"))
	if err != nil {
		return defaultManifest(proj)
	}
	var m ObstetrixManifest
	if err := json.Unmarshal(data, &m); err != nil {
		return defaultManifest(proj)
	}
	// Fall back to project.conf values for empty manifest fields
	if len(m.Persistent) == 0 {
		m.Persistent = proj.PersistentDirs
	}
	if m.Build.Command == "" {
		m.Build.Command = proj.BuildCmd
	}
	if m.Health.TimeoutSeconds == 0 {
		m.Health.TimeoutSeconds = proj.HealthTimeout
	}
	if m.Health.Path == "" {
		m.Health.Path = "/health"
	}
	if m.Health.InitialDelaySeconds == 0 {
		m.Health.InitialDelaySeconds = 2
	}
	return &m
}

func defaultManifest(proj *config.ProjectConfig) *ObstetrixManifest {
	var m ObstetrixManifest
	m.Persistent = proj.PersistentDirs
	m.Build.Command = proj.BuildCmd
	m.Health.Path = "/health"
	m.Health.TimeoutSeconds = proj.HealthTimeout
	m.Health.InitialDelaySeconds = 2
	return &m
}

// copyArtifacts copies deploy.include globs from srcDir to dstDir, filtering by deploy.exclude.
// If Deploy.Include is empty, copies everything except .git/ and node_modules/.
func copyArtifacts(manifest *ObstetrixManifest, srcDir, dstDir string) error {
	includes := manifest.Deploy.Include
	if len(includes) == 0 {
		includes = []string{"."}
	}
	for _, pattern := range includes {
		src := filepath.Join(srcDir, pattern)
		matches, _ := filepath.Glob(src)
		if len(matches) == 0 {
			matches = []string{src}
		}
		for _, match := range matches {
			rel, _ := filepath.Rel(srcDir, match)
			if err := copyPath(match, filepath.Join(dstDir, rel), srcDir, manifest.Deploy.Exclude); err != nil {
				return fmt.Errorf("copy %s: %w", rel, err)
			}
		}
	}
	return nil
}

func copyPath(src, dst, srcRoot string, excludes []string) error {
	info, err := os.Stat(src)
	if os.IsNotExist(err) {
		return nil
	}
	if err != nil {
		return err
	}

	rel, _ := filepath.Rel(srcRoot, src)
	base := filepath.Base(src)
	if base == ".git" || base == "node_modules" {
		return nil
	}
	for _, exc := range excludes {
		if matched, _ := filepath.Match(exc, rel); matched {
			return nil
		}
	}

	if info.IsDir() {
		os.MkdirAll(dst, info.Mode())
		entries, _ := os.ReadDir(src)
		for _, e := range entries {
			if err := copyPath(filepath.Join(src, e.Name()), filepath.Join(dst, e.Name()), srcRoot, excludes); err != nil {
				return err
			}
		}
		return nil
	}
	os.MkdirAll(filepath.Dir(dst), 0755)
	return copyFile(src, dst, info.Mode())
}

func copyFile(src, dst string, mode os.FileMode) error {
	in, err := os.Open(src)
	if err != nil {
		return err
	}
	defer in.Close()
	out, err := os.OpenFile(dst, os.O_WRONLY|os.O_CREATE|os.O_TRUNC, mode)
	if err != nil {
		return err
	}
	defer out.Close()
	_, err = io.Copy(out, in)
	return err
}

// updateExecStart rewrites the ExecStart= line in a systemd unit file.
func updateExecStart(unitPath, appDir, command string) error {
	parts := strings.Fields(command)
	if len(parts) == 0 {
		return nil
	}
	binaries := map[string]string{"bun": "/usr/local/bin/bun", "node": "/usr/bin/node"}
	bin := parts[0]
	if resolved, ok := binaries[bin]; ok {
		bin = resolved
	}
	args := []string{bin}
	for _, arg := range parts[1:] {
		if !filepath.IsAbs(arg) && !strings.HasPrefix(arg, "-") {
			arg = filepath.Join(appDir, arg)
		}
		args = append(args, arg)
	}
	data, err := os.ReadFile(unitPath)
	if err != nil {
		return err
	}
	lines := strings.Split(string(data), "\n")
	for i, line := range lines {
		if strings.HasPrefix(strings.TrimSpace(line), "ExecStart=") {
			lines[i] = "ExecStart=" + strings.Join(args, " ")
			break
		}
	}
	return os.WriteFile(unitPath, []byte(strings.Join(lines, "\n")), 0644)
}

type DeployModule struct {
	mods *Modules
	svcs *services.Services
}

func newDeployModule(mods *Modules, svcs *services.Services) *DeployModule {
	return &DeployModule{mods: mods, svcs: svcs}
}

func (d *DeployModule) ListStates() ([]*config.ProjectState, error) {
	return d.svcs.State.ReadAll()
}

func (d *DeployModule) GetState(name string) (*config.ProjectState, error) {
	return d.svcs.State.Read(name)
}

func (d *DeployModule) Run(ctx context.Context, proj *config.ProjectConfig, sha string, isRollback bool) error {
	start := time.Now()
	logWriter, _ := d.svcs.DeployLog.OpenWriter(proj.Name, sha)

	emit := func(line string) {
		if logWriter != nil {
			logWriter.Write(line)
		}
		d.mods.Events.Publish(config.BuildEvent{
			Type: config.EventLog, ProjectName: proj.Name,
			Line: line, Ts: time.Now().UTC().Format(time.RFC3339),
		})
		slog.Info("deploy", "project", proj.Name, "line", line)
	}

	setStatus := func(status config.ProjectStatus) {
		d.mods.Events.Publish(config.BuildEvent{
			Type: config.EventStatus, ProjectName: proj.Name,
			Status: status, Ts: time.Now().UTC().Format(time.RFC3339),
		})
		st, _ := d.svcs.State.Read(proj.Name)
		st.Status = status
		_ = d.svcs.State.Write(st)
	}

	prevState, err := d.svcs.State.Read(proj.Name)
	if err != nil {
		return fmt.Errorf("read state: %w", err)
	}
	previousSHA := prevState.CurrentSHA

	setStatus(config.StatusBuilding)
	emit(fmt.Sprintf("==> deploying %s @ %s", proj.Name, sha[:8]))

	// 1. Ensure work dir, system user, git clone, systemd unit
	if err := d.ensureAppDir(ctx, proj, emit); err != nil {
		return d.fail(ctx, logWriter, proj, previousSHA, sha, start, isRollback, err)
	}

	lw := &lineWriter{emit: emit}
	pp := d.svcs.ConfigWatcher.Paths().Project(proj.Name)

	// 2. Sync .env + .npmrc into _work/{name}/ (for build)
	emit("==> syncing .env and .npmrc to work dir")
	if envContent, err := d.svcs.ConfigRW.ResolveEnv(pp.Env); err == nil {
		os.WriteFile(proj.WorkDir+"/.env", []byte(envContent), 0640)
		d.svcs.Runner.RunAsRoot(ctx, fmt.Sprintf("chown %s:%s %s/.env",
			proj.AppUser, proj.AppUser, proj.WorkDir), nil)
	}
	if npmrcContent, err := d.svcs.ConfigRW.ResolveEnv(pp.Npmrc); err == nil {
		os.WriteFile(proj.WorkDir+"/.npmrc", []byte(npmrcContent), 0640)
		d.svcs.Runner.RunAsRoot(ctx, fmt.Sprintf("chown %s:%s %s/.npmrc",
			proj.AppUser, proj.AppUser, proj.WorkDir), nil)
	}

	// 3. git fetch + checkout in _work/{name}/
	emit("==> git fetch")
	gitCmd := fmt.Sprintf("cd %s && git fetch origin && git checkout %s && git reset --hard %s",
		proj.WorkDir, sha, sha)
	res, err := d.svcs.Runner.Run(ctx, proj, gitCmd, lw)
	if err != nil || res.ExitCode != 0 {
		return d.fail(ctx, logWriter, proj, previousSHA, sha, start, isRollback,
			fmt.Errorf("git checkout failed (exit %d)", res.ExitCode))
	}

	// 4. Read obstetrix.json (before build — build command may come from it)
	manifest := loadManifest(proj.WorkDir, proj)
	buildCmd := manifest.Build.Command

	// 5. Build in _work/{name}/
	emit("==> build: " + buildCmd)
	res, err = d.svcs.Runner.Run(ctx, proj, fmt.Sprintf("cd %s && %s", proj.WorkDir, buildCmd), lw)
	if err != nil || res.ExitCode != 0 {
		return d.fail(ctx, logWriter, proj, previousSHA, sha, start, isRollback,
			fmt.Errorf("build failed (exit %d)", res.ExitCode))
	}

	// Re-read manifest after build (build output may contain an updated obstetrix.json)
	manifest = loadManifest(proj.WorkDir, proj)

	// 6. Ensure persistent dirs exist in deploy dir (never deleted, idempotent)
	emit("==> ensuring persistent dirs")
	for _, dir := range manifest.Persistent {
		target := proj.AppDir + "/" + dir
		os.MkdirAll(target, 0755)
		d.svcs.Runner.RunAsRoot(ctx, fmt.Sprintf("chown %s:%s %s",
			proj.AppUser, proj.AppUser, target), nil)
	}

	// 7. Copy deploy.include globs from _work/ to deploy dir
	emit("==> copying artifacts to deploy dir")
	if err := copyArtifacts(manifest, proj.WorkDir, proj.AppDir); err != nil {
		return d.fail(ctx, logWriter, proj, previousSHA, sha, start, isRollback,
			fmt.Errorf("copy artifacts: %w", err))
	}

	// 8. Write .env + .npmrc to deploy dir (what systemd reads at runtime)
	emit("==> writing .env and .npmrc to deploy dir")
	if envContent, err := d.svcs.ConfigRW.ResolveEnv(pp.Env); err == nil {
		os.WriteFile(proj.AppDir+"/.env", []byte(envContent), 0640)
		d.svcs.Runner.RunAsRoot(ctx, fmt.Sprintf("chown %s:%s %s/.env",
			proj.AppUser, proj.AppUser, proj.AppDir), nil)
	}
	if npmrcContent, err := d.svcs.ConfigRW.ResolveEnv(pp.Npmrc); err == nil {
		os.WriteFile(proj.AppDir+"/.npmrc", []byte(npmrcContent), 0640)
		d.svcs.Runner.RunAsRoot(ctx, fmt.Sprintf("chown %s:%s %s/.npmrc",
			proj.AppUser, proj.AppUser, proj.AppDir), nil)
	}

	// 9. Update systemd ExecStart if start.command changed
	if manifest.Start.Command != "" {
		emit("==> updating systemd ExecStart")
		unitPath := fmt.Sprintf("/etc/systemd/system/%s@.service", proj.Name)
		if err := updateExecStart(unitPath, proj.AppDir, manifest.Start.Command); err != nil {
			emit("warn: could not update ExecStart: " + err.Error())
		} else {
			d.svcs.Runner.RunAsRoot(ctx, "systemctl daemon-reload", nil)
		}
	}

	// 10. Rolling restart
	runningPorts := prevState.RunningPorts
	if len(runningPorts) == 0 {
		for i := 0; i < proj.DefaultInstances; i++ {
			runningPorts = append(runningPorts, proj.BasePort+i)
		}
	}
	initialDelay := time.Duration(manifest.Health.InitialDelaySeconds) * time.Second

	for _, port := range runningPorts {
		svcName := fmt.Sprintf("%s@%d.service", proj.Name, port)
		emit(fmt.Sprintf("==> restarting %s", svcName))
		res, err = d.svcs.Runner.RunAsRoot(ctx, "systemctl restart "+svcName, lw)
		if err != nil || res.ExitCode != 0 {
			return d.fail(ctx, logWriter, proj, previousSHA, sha, start, isRollback,
				fmt.Errorf("restart %s failed (exit %d)", svcName, res.ExitCode))
		}
		time.Sleep(initialDelay)
		portHealthURL := fmt.Sprintf("http://127.0.0.1:%d%s", port, manifest.Health.Path)
		emit(fmt.Sprintf("==> health check: %s", portHealthURL))
		if err := d.mods.Health.Check(ctx, portHealthURL, manifest.Health.TimeoutSeconds); err != nil {
			return d.fail(ctx, logWriter, proj, previousSHA, sha, start, isRollback, err)
		}
	}

	// 11. Success
	durationMs := time.Since(start).Milliseconds()
	emit(fmt.Sprintf("==> deploy complete in %dms", durationMs))
	now := time.Now().UTC().Format(time.RFC3339)
	ok := true
	newState := config.ProjectState{
		Name:             proj.Name,
		AppDir:           proj.AppDir,
		WorkDir:          proj.WorkDir,
		AppUser:          proj.AppUser,
		Status:           config.StatusRunning,
		RepoURL:          proj.RepoURL,
		TargetBranch:     proj.Branch,
		CurrentSHA:       &sha,
		PreviousSHA:      previousSHA,
		LastDeployAt:     &now,
		LastDeployOK:     &ok,
		BasePort:         proj.BasePort,
		PortCount:        proj.PortCount,
		Instances:        len(runningPorts),
		RunningPorts:     runningPorts,
		DefaultInstances: proj.DefaultInstances,
		PersistentDirs:   manifest.Persistent,
		DeployHistory: append([]config.DeployRecord{{
			DeployID: logWriter.DeployID(), SHA: sha, At: now, OK: true, DurationMs: durationMs,
		}}, prevState.DeployHistory...),
	}
	_ = d.svcs.State.Write(&newState)
	d.mods.Events.Publish(config.BuildEvent{
		Type: config.EventDeployComplete, ProjectName: proj.Name,
		SHA: sha, OK: true, DurationMs: durationMs, Ts: now,
	})
	setStatus(config.StatusRunning)
	if logWriter != nil {
		logWriter.Close(true, durationMs, "")
	}
	return nil
}

func (d *DeployModule) fail(
	ctx context.Context, logWriter *services.DeployLogWriter,
	proj *config.ProjectConfig, previousSHA *string, sha string,
	start time.Time, isRollback bool, cause error,
) error {
	durationMs := time.Since(start).Milliseconds()
	now := time.Now().UTC().Format(time.RFC3339)
	errMsg := cause.Error()
	ok := false

	emit := func(line string) {
		if logWriter != nil {
			logWriter.Write(line)
		}
		d.mods.Events.Publish(config.BuildEvent{
			Type: config.EventLog, ProjectName: proj.Name,
			Line: line, Ts: time.Now().UTC().Format(time.RFC3339),
		})
	}
	emit("==> deploy FAILED: " + errMsg)
	if logWriter != nil {
		logWriter.Close(false, durationMs, errMsg)
	}

	if proj.RollbackOnFail && previousSHA != nil && !isRollback {
		emit(fmt.Sprintf("==> rolling back to %s", (*previousSHA)[:8]))
		d.mods.Poller.TriggerDeploy(ctx, proj, *previousSHA, true)
		return cause
	}

	st, _ := d.svcs.State.Read(proj.Name)
	st.Status = config.StatusFailed
	st.LastDeployOK = &ok
	st.LastDeployAt = &now
	st.DeployHistory = append([]config.DeployRecord{{
		DeployID: logWriter.DeployID(), SHA: sha, At: now, OK: false, DurationMs: durationMs, Error: &errMsg,
	}}, st.DeployHistory...)
	_ = d.svcs.State.Write(st)
	d.mods.Events.Publish(config.BuildEvent{
		Type: config.EventDeployComplete, ProjectName: proj.Name,
		SHA: sha, OK: false, DurationMs: durationMs, Ts: now,
	})
	d.mods.Events.Publish(config.BuildEvent{
		Type: config.EventStatus, ProjectName: proj.Name,
		Status: config.StatusFailed, Ts: now,
	})
	return cause
}

// ensureAppDir checks if the project work dir is already bootstrapped.
// If not (no .git in _work/{name}/), it runs bootstrap.
func (d *DeployModule) ensureAppDir(ctx context.Context, proj *config.ProjectConfig, emit func(string)) error {
	if _, err := os.Stat(proj.WorkDir + "/.git"); err == nil {
		return nil // already bootstrapped
	}
	emit("==> bootstrapping " + proj.Name)
	return d.bootstrap(ctx, proj, emit)
}

// bootstrap sets up a fresh project on the host.
func (d *DeployModule) bootstrap(ctx context.Context, proj *config.ProjectConfig, emit func(string)) error {
	lw := &lineWriter{emit: emit}
	token := d.svcs.ConfigRW.GitHubToken()

	// 1. Create system user (idempotent)
	emit("==> creating system user " + proj.AppUser)
	userCmd := fmt.Sprintf(
		"id %s &>/dev/null || useradd --system --no-create-home --shell /usr/sbin/nologin %s",
		proj.AppUser, proj.AppUser)
	if res, err := d.svcs.Runner.RunAsRoot(ctx, userCmd, lw); err != nil || res.ExitCode != 0 {
		return fmt.Errorf("bootstrap: create user failed")
	}

	// 2. Create _work/{name}/ and deploy dir owned by the project user
	emit("==> creating work dir and deploy dir")
	mkdirCmd := fmt.Sprintf(
		"mkdir -p %s %s && chown -R %s:%s %s %s && chmod 750 %s %s",
		proj.WorkDir, proj.AppDir,
		proj.AppUser, proj.AppUser, proj.WorkDir, proj.AppDir,
		proj.WorkDir, proj.AppDir)
	if res, err := d.svcs.Runner.RunAsRoot(ctx, mkdirCmd, lw); err != nil || res.ExitCode != 0 {
		return fmt.Errorf("bootstrap: create dirs failed")
	}

	// 3. Write .netrc for git auth
	emit("==> writing git credentials")
	netrcContent := fmt.Sprintf("machine github.com\nlogin x-token\npassword %s\n", token)
	netrcPath := fmt.Sprintf("/var/obstetrix/%s/.netrc", proj.Name)
	netrcDir := fmt.Sprintf("/var/obstetrix/%s", proj.Name)
	netrcCmd := fmt.Sprintf(
		"mkdir -p %s && chown %s:%s %s && printf '%%s' '%s' > %s && chmod 600 %s && chown %s:%s %s",
		netrcDir, proj.AppUser, proj.AppUser, netrcDir,
		netrcContent, netrcPath, netrcPath,
		proj.AppUser, proj.AppUser, netrcPath)
	if res, err := d.svcs.Runner.RunAsRoot(ctx, netrcCmd, lw); err != nil || res.ExitCode != 0 {
		return fmt.Errorf("bootstrap: write netrc failed")
	}
	d.svcs.Runner.Run(ctx, proj,
		fmt.Sprintf("git config --global credential.helper 'store --file=%s'", netrcPath), lw)

	// 4. git clone into _work/{name}/
	emit("==> git clone " + proj.RepoURL)
	cloneCmd := fmt.Sprintf("git clone %s %s", proj.RepoURL, proj.WorkDir)
	if res, err := d.svcs.Runner.Run(ctx, proj, cloneCmd, lw); err != nil || res.ExitCode != 0 {
		return fmt.Errorf("bootstrap: git clone failed")
	}

	// 5. Write systemd template unit
	emit("==> writing systemd unit")
	unitContent := fmt.Sprintf(`[Unit]
Description=%s instance %%i
After=network.target

[Service]
Type=simple
User=%s
Group=%s
WorkingDirectory=%s
EnvironmentFile=%s/.env
ExecStart=/usr/local/bin/bun %s/build/index.js
Environment=PORT=%%i
Restart=always
RestartSec=5
StartLimitIntervalSec=60
StartLimitBurst=5

NoNewPrivileges=yes
PrivateTmp=yes
ProtectSystem=strict
ReadWritePaths=%s /var/obstetrix/%s

[Install]
WantedBy=multi-user.target
`,
		proj.Name,
		proj.AppUser, proj.AppUser,
		proj.AppDir,
		proj.AppDir, proj.AppDir,
		proj.AppDir, proj.Name,
	)
	unitPath := fmt.Sprintf("/etc/systemd/system/%s@.service", proj.Name)
	if err := os.WriteFile(unitPath, []byte(unitContent), 0644); err != nil {
		return fmt.Errorf("bootstrap: write systemd unit: %w", err)
	}
	d.svcs.Runner.RunAsRoot(ctx, "systemctl daemon-reload", lw)

	// 6. Write scale.sh to deploy dir
	emit("==> writing scale.sh")
	scaleScript := `#!/usr/bin/env bash
set -euo pipefail
TARGET="$1"; SERVICE="$2"; BASE_PORT="$3"; MAX="$4"
[[ "$TARGET" =~ ^[0-9]+$ ]] || { echo "error: count must be integer"; exit 1; }
(( TARGET >= 1 && TARGET <= MAX )) || { echo "error: count must be 1..$MAX"; exit 1; }
running=()
for (( i=0; i<MAX; i++ )); do
  port=$(( BASE_PORT+i ))
  systemctl is-active --quiet "${SERVICE}@${port}.service" 2>/dev/null && running+=("$port")
done
current=${#running[@]}
echo "current: $current  target: $TARGET"
if (( TARGET > current )); then
  started=0
  for (( i=0; i<MAX && started<(TARGET-current); i++ )); do
    port=$(( BASE_PORT+i ))
    systemctl is-active --quiet "${SERVICE}@${port}.service" 2>/dev/null && continue
    echo "starting ${SERVICE}@${port}"; systemctl start "${SERVICE}@${port}.service" && (( started++ ))
  done
elif (( TARGET < current )); then
  stopped=0
  for (( i=MAX-1; i>=0 && stopped<(current-TARGET); i-- )); do
    port=$(( BASE_PORT+i ))
    systemctl is-active --quiet "${SERVICE}@${port}.service" 2>/dev/null || continue
    echo "stopping ${SERVICE}@${port}"; systemctl stop "${SERVICE}@${port}.service" && (( stopped++ ))
  done
fi
`
	scaleFile := proj.AppDir + "/scale.sh"
	os.WriteFile(scaleFile, []byte(scaleScript), 0750)
	d.svcs.Runner.RunAsRoot(ctx, fmt.Sprintf("chown root:%s %s && chmod 750 %s",
		proj.AppUser, scaleFile, scaleFile), nil)
	return nil
}

// SyncEnv resolves the project .env, writes it to the deploy dir, and rolling-restarts all instances.
func (d *DeployModule) SyncEnv(ctx context.Context, name string) error {
	projects := d.svcs.ConfigWatcher.All()
	proj, ok := projects[name]
	if !ok {
		return fmt.Errorf("syncEnv: project %q not found", name)
	}
	pp := d.svcs.ConfigWatcher.Paths().Project(name)
	envContent, err := d.svcs.ConfigRW.ResolveEnv(pp.Env)
	if err != nil {
		return err
	}
	if err := os.WriteFile(proj.AppDir+"/.env", []byte(envContent), 0640); err != nil {
		return err
	}
	d.svcs.Runner.RunAsRoot(ctx, fmt.Sprintf("chown %s:%s %s/.env",
		proj.AppUser, proj.AppUser, proj.AppDir), nil)
	st, _ := d.svcs.State.Read(name)
	lw := &lineWriter{emit: func(string) {}}
	for _, port := range st.RunningPorts {
		svcName := fmt.Sprintf("%s@%d.service", name, port)
		d.svcs.Runner.RunAsRoot(ctx, "systemctl restart "+svcName, lw)
		d.mods.Health.Check(ctx, fmt.Sprintf("http://127.0.0.1:%d/health", port), proj.HealthTimeout)
	}
	return nil
}

// Scale sets the number of running instances by calling scale.sh as root.
func (d *DeployModule) Scale(ctx context.Context, proj *config.ProjectConfig, instances int) (map[string]any, error) {
	emit := func(line string) {
		d.mods.Events.Publish(config.BuildEvent{
			Type: config.EventLog, ProjectName: proj.Name,
			Line: line, Ts: time.Now().UTC().Format(time.RFC3339),
		})
	}
	emit(fmt.Sprintf("==> scaling %s to %d instance(s)", proj.Name, instances))
	lw := &lineWriter{emit: emit}

	scaleCmd := fmt.Sprintf("bash %s/scale.sh %d %s %d %d",
		proj.AppDir, instances, proj.Name, proj.BasePort, proj.PortCount)
	res, err := d.svcs.Runner.RunAsRoot(ctx, scaleCmd, lw)
	if err != nil || res.ExitCode != 0 {
		return nil, fmt.Errorf("scale failed (exit %d)", res.ExitCode)
	}

	runningPorts := make([]int, instances)
	for i := range runningPorts {
		runningPorts[i] = proj.BasePort + i
	}

	st, _ := d.svcs.State.Read(proj.Name)
	st.Instances = instances
	st.RunningPorts = runningPorts
	_ = d.svcs.State.Write(st)

	emit(fmt.Sprintf("==> scaled to %d instance(s)", instances))
	return map[string]any{"instances": instances, "ports": runningPorts}, nil
}

type lineWriter struct {
	emit func(string)
	buf  strings.Builder
}

func (w *lineWriter) Write(p []byte) (int, error) {
	w.buf.Write(p)
	s := w.buf.String()
	for {
		idx := strings.IndexByte(s, '\n')
		if idx < 0 {
			break
		}
		w.emit(s[:idx])
		s = s[idx+1:]
	}
	w.buf.Reset()
	w.buf.WriteString(s)
	return len(p), nil
}
