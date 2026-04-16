package modules

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log/slog"
	"os"
	"os/user"
	"path/filepath"
	"strconv"
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
		// Use the path from HEALTH_CHECK_URL if set, otherwise disable health checks.
		if proj.HealthCheckURL != "" {
			m.Health.Path = healthPathFromURL(proj.HealthCheckURL)
		}
		// If HealthCheckURL is empty, leave m.Health.Path as "" → health check is skipped.
	}
	if m.Health.InitialDelaySeconds == 0 {
		m.Health.InitialDelaySeconds = 2
	}
	return &m
}

// healthPathFromURL extracts the path component from a full health check URL.
// e.g. "http://127.0.0.1:$PORT/health" → "/health"
func healthPathFromURL(rawURL string) string {
	if schemeEnd := strings.Index(rawURL, "://"); schemeEnd != -1 {
		rest := rawURL[schemeEnd+3:]
		if slashIdx := strings.Index(rest, "/"); slashIdx != -1 {
			return rest[slashIdx:]
		}
	}
	return "/health"
}

func defaultManifest(proj *config.ProjectConfig) *ObstetrixManifest {
	var m ObstetrixManifest
	m.Persistent = proj.PersistentDirs
	m.Build.Command = proj.BuildCmd
	// Derive health path from HEALTH_CHECK_URL. Empty URL → health checks disabled.
	if proj.HealthCheckURL != "" {
		m.Health.Path = healthPathFromURL(proj.HealthCheckURL)
	}
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

	appUID := 0
	appGID := 0
	if u, err := user.Lookup(proj.AppUser); err == nil {
		appUID, _ = strconv.Atoi(u.Uid)
		appGID, _ = strconv.Atoi(u.Gid)
	}

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
		os.Chown(proj.WorkDir+"/.env", appUID, appGID)
	}
	if npmrcContent, err := d.svcs.ConfigRW.ResolveEnv(pp.Npmrc); err == nil {
		os.WriteFile(proj.WorkDir+"/.npmrc", []byte(npmrcContent), 0640)
		os.Chown(proj.WorkDir+"/.npmrc", appUID, appGID)
	}

	// 3. git fetch + checkout in _work/{name}/
	emit("==> git fetch")
	res, err := d.svcs.Runner.RunRaw(ctx, proj, lw, "env", "HOME=/var/obstetrix", "GIT_TERMINAL_PROMPT=0", "git", "fetch", "--all")
	if err != nil || res.ExitCode != 0 {
		return d.fail(ctx, logWriter, proj, previousSHA, sha, start, isRollback,
			fmt.Errorf("git fetch failed (exit %d)", res.ExitCode))
	}
	emit("==> git checkout")
	res, err = d.svcs.Runner.RunRaw(ctx, proj, lw, "env", "HOME=/var/obstetrix", "GIT_TERMINAL_PROMPT=0", "git", "checkout", "-f", sha)
	if err != nil || res.ExitCode != 0 {
		return d.fail(ctx, logWriter, proj, previousSHA, sha, start, isRollback,
			fmt.Errorf("git checkout failed (exit %d)", res.ExitCode))
	}
	res, err = d.svcs.Runner.RunRaw(ctx, proj, lw, "env", "HOME=/var/obstetrix", "GIT_TERMINAL_PROMPT=0", "git", "reset", "--hard", sha)
	if err != nil || res.ExitCode != 0 {
		return d.fail(ctx, logWriter, proj, previousSHA, sha, start, isRollback,
			fmt.Errorf("git reset failed (exit %d)", res.ExitCode))
	}

	// 4. Read obstetrix.json (before build — build command may come from it)
	manifest := loadManifest(proj.WorkDir, proj)
	buildCmd := manifest.Build.Command

	// 5. Build in _work/{name}/
	// Always clean .svelte-kit/ so svelte-kit sync regenerates it fresh.
	os.RemoveAll(filepath.Join(proj.WorkDir, ".svelte-kit"))
	// If there is no lockfile in the repo, delete node_modules before installing.
	// Without a lockfile bun compares installed packages against package.json ranges
	// and may declare "no changes" even when the installed versions are stale (e.g.
	// left over from a different bun version). A clean install ensures consistency.
	lockfiles := []string{"bun.lock", "bun.lockb", "package-lock.json", "yarn.lock", "pnpm-lock.yaml"}
	hasLockfile := false
	for _, lf := range lockfiles {
		if _, err := os.Stat(filepath.Join(proj.WorkDir, lf)); err == nil {
			hasLockfile = true
			break
		}
	}
	if !hasLockfile {
		emit("==> no lockfile found — cleaning node_modules for a fresh install")
		os.RemoveAll(filepath.Join(proj.WorkDir, "node_modules"))
	}
	emit("==> build: " + buildCmd)
	// We run the build command inside bash as the project user to allow pipes/redirects if needed.
	// However, we pass the command as a single argument to bash -c to avoid word splitting issues.
	res, err = d.svcs.Runner.RunRaw(ctx, proj, lw, "bash", "-c", buildCmd)
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
		os.Chown(target, appUID, appGID)
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
		os.Chown(proj.AppDir+"/.env", appUID, appGID)
	}
	if npmrcContent, err := d.svcs.ConfigRW.ResolveEnv(pp.Npmrc); err == nil {
		os.WriteFile(proj.AppDir+"/.npmrc", []byte(npmrcContent), 0640)
		os.Chown(proj.AppDir+"/.npmrc", appUID, appGID)
	}

	// 9. Update systemd ExecStart if start.command changed
	if manifest.Start.Command != "" {
		emit("==> updating systemd ExecStart")
		unitPath := fmt.Sprintf("/etc/systemd/system/%s@.service", proj.Name)
		if err := updateExecStart(unitPath, proj.AppDir, manifest.Start.Command); err != nil {
			emit("warn: could not update ExecStart: " + err.Error())
		} else {
			d.svcs.Runner.RunAsRootRaw(ctx, nil, "systemctl", "daemon-reload")
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
		res, err = d.svcs.Runner.RunAsRootRaw(ctx, lw, "systemctl", "restart", svcName)
		if err != nil || res.ExitCode != 0 {
			return d.fail(ctx, logWriter, proj, previousSHA, sha, start, isRollback,
				fmt.Errorf("restart %s failed (exit %d)", svcName, res.ExitCode))
		}
		time.Sleep(initialDelay)
		if manifest.Health.Path != "" {
			portHealthURL := fmt.Sprintf("http://127.0.0.1:%d%s", port, manifest.Health.Path)
			emit(fmt.Sprintf("==> health check: %s", portHealthURL))
			if err := d.mods.Health.Check(ctx, portHealthURL, manifest.Health.TimeoutSeconds); err != nil {
				return d.fail(ctx, logWriter, proj, previousSHA, sha, start, isRollback, err)
			}
		} else {
			emit("==> health check: disabled")
		}
	}

	// 11. Success
	durationMs := time.Since(start).Milliseconds()
	emit(fmt.Sprintf("==> deploy complete in %dms", durationMs))
	// Close the log writer first so DeployID() is populated before we store it in state.
	if logWriter != nil {
		logWriter.Close(true, durationMs, "")
	}
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
	token := d.svcs.ConfigRW.GitHubToken()

	// 0. Ensure obstetrix user has a home dir (needed for npm/bun package caches).
	if err := os.MkdirAll("/home/obstetrix", 0750); err != nil {
		return fmt.Errorf("bootstrap: mkdir /home/obstetrix: %w", err)
	}
	u, err := user.Lookup("obstetrix")
	if err == nil {
		uid, _ := strconv.Atoi(u.Uid)
		gid, _ := strconv.Atoi(u.Gid)
		os.Chown("/home/obstetrix", uid, gid)
		// Note: usermod -d requires root/shell, but we assume the installer set it up correctly.
	}

	// 1. Create _work/{name}/ and deploy dir
	emit("==> creating work dir and deploy dir")
	appUID := 0
	appGID := 0
	if u, err := user.Lookup(proj.AppUser); err == nil {
		appUID, _ = strconv.Atoi(u.Uid)
		appGID, _ = strconv.Atoi(u.Gid)
	}

	for _, dir := range []string{proj.WorkDir, proj.AppDir} {
		if err := os.MkdirAll(dir, 0750); err != nil {
			return fmt.Errorf("bootstrap: mkdir %s: %w", dir, err)
		}
		if err := os.Chown(dir, appUID, appGID); err != nil {
			return fmt.Errorf("bootstrap: chown %s: %w", dir, err)
		}
	}

	// 2. Write shared .netrc for git auth
	emit("==> writing git credentials")
	netrcContent := fmt.Sprintf("machine github.com\nlogin x-token\npassword %s\n", token)
	netrcPath := "/var/obstetrix/.netrc"
	if err := os.WriteFile(netrcPath, []byte(netrcContent), 0600); err != nil {
		return fmt.Errorf("bootstrap: write netrc: %w", err)
	}
	os.Chown(netrcPath, appUID, appGID)

	// 3. git clone into _work/{name}/
	emit("==> git clone " + proj.RepoURL)
	// We use git clone directly via RunRaw to avoid shell expansion issues.
	// Note: RunRaw currently doesn't support custom env. I'll use a small helper or wrapper.
	// For now, I'll use RunRaw with a wrapper script if needed, or just improve RunRaw.
	// Actually, I'll just use a direct exec.Command in a local helper for complex ones.
	
	res, err := d.svcs.Runner.RunRaw(ctx, proj, &lineWriter{emit: emit}, 
		"env", "HOME=/var/obstetrix", "GIT_TERMINAL_PROMPT=0", "git", "clone", proj.RepoURL, proj.WorkDir)
	if err != nil || res.ExitCode != 0 {
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
	d.svcs.Runner.RunAsRootRaw(ctx, nil, "systemctl", "daemon-reload")

	// 6. Write scale.sh to deploy dir
	emit("==> writing scale.sh")
	scaleScript := `#!/usr/bin/env bash
...
`
	scaleFile := proj.AppDir + "/scale.sh"
	os.WriteFile(scaleFile, []byte(scaleScript), 0750)
	os.Chown(scaleFile, 0, appGID)
	os.Chmod(scaleFile, 0750)
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
	appUID := 0
	appGID := 0
	if u, err := user.Lookup(proj.AppUser); err == nil {
		appUID, _ = strconv.Atoi(u.Uid)
		appGID, _ = strconv.Atoi(u.Gid)
	}
	os.Chown(proj.AppDir+"/.env", appUID, appGID)

	st, _ := d.svcs.State.Read(name)
	lw := &lineWriter{emit: func(string) {}}
	for _, port := range st.RunningPorts {
		svcName := fmt.Sprintf("%s@%d.service", name, port)
		d.svcs.Runner.RunAsRootRaw(ctx, lw, "systemctl", "restart", svcName)
		if proj.HealthCheckURL != "" {
			d.mods.Health.Check(ctx, fmt.Sprintf("http://127.0.0.1:%d/health", port), proj.HealthTimeout)
		}
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

	res, err := d.svcs.Runner.RunAsRootRaw(ctx, lw, "bash", filepath.Join(proj.AppDir, "scale.sh"),
		strconv.Itoa(instances), proj.Name, strconv.Itoa(proj.BasePort), strconv.Itoa(proj.PortCount))
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
