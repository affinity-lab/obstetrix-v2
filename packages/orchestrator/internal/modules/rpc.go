package modules

import (
	"bufio"
	"context"
	"encoding/json"
	"fmt"
	"log/slog"
	"net"
	"os"
	"os/exec"
	"strings"
	"time"

	"github.com/yourorg/obstetrix/orchestrator/internal/config"
	"github.com/yourorg/obstetrix/orchestrator/internal/services"
)

type RPCModule struct {
	mods *Modules
	svcs *services.Services
}

func newRPCModule(mods *Modules, svcs *services.Services) *RPCModule {
	return &RPCModule{mods: mods, svcs: svcs}
}

type rpcRequest struct {
	ID     int             `json:"id"`
	Method string          `json:"method"`
	Params json.RawMessage `json:"params"`
}

type rpcResponse struct {
	ID     int         `json:"id"`
	Result interface{} `json:"result,omitempty"`
	Error  *rpcError   `json:"error,omitempty"`
}

type rpcError struct {
	Code    int    `json:"code"`
	Message string `json:"message"`
}

func errResp(id int, msg string) rpcResponse {
	return rpcResponse{ID: id, Error: &rpcError{Code: -32000, Message: msg}}
}

// Dispatch is passed to SocketService.Serve. Called once per connection in a goroutine.
// It renews the 5-minute idle deadline on every received line.
func (r *RPCModule) Dispatch(conn net.Conn) {
	defer conn.Close()
	scanner := bufio.NewScanner(conn)
	enc := json.NewEncoder(conn)

	var unsubscribe func()
	defer func() {
		if unsubscribe != nil {
			unsubscribe()
		}
	}()

	for scanner.Scan() {
		conn.SetDeadline(time.Now().Add(5 * time.Minute))

		var req rpcRequest
		if err := json.Unmarshal(scanner.Bytes(), &req); err != nil {
			enc.Encode(errResp(0, "parse error: "+err.Error()))
			continue
		}

		ctx := context.Background()
		var result interface{}
		var rpcErr string

		slog.Debug("rpc call", "method", req.Method, "id", req.ID)

		switch req.Method {

		case "status.all":
			states, err := r.svcs.State.ReadAll()
			if err != nil {
				rpcErr = err.Error()
				break
			}
			result = states

		case "status.project":
			var p struct {
				Name string `json:"name"`
			}
			json.Unmarshal(req.Params, &p)
			st, err := r.svcs.State.Read(p.Name)
			if err != nil {
				rpcErr = err.Error()
				break
			}
			result = st

		case "deploy.trigger":
			var p struct {
				Name string `json:"name"`
				SHA  string `json:"sha"`
			}
			json.Unmarshal(req.Params, &p)
			projects := r.svcs.ConfigWatcher.All()
			proj, ok := projects[p.Name]
			if !ok {
				rpcErr = fmt.Sprintf("project %q not found", p.Name)
				break
			}
			sha := p.SHA
			if sha == "" {
				sha, _ = r.svcs.GitHub.HeadSHA(proj.RepoURL, proj.Branch)
			}
			slog.Info("deploy triggered via rpc", "project", p.Name, "sha", sha)
			r.mods.Poller.TriggerDeploy(ctx, proj, sha, false)
			result = map[string]bool{"queued": true}

		case "deploy.rollback":
			var p struct {
				Name string `json:"name"`
			}
			json.Unmarshal(req.Params, &p)
			st, _ := r.svcs.State.Read(p.Name)
			if st.PreviousSHA == nil {
				rpcErr = "no previous SHA"
				break
			}
			projects := r.svcs.ConfigWatcher.All()
			proj, ok := projects[p.Name]
			if !ok {
				rpcErr = fmt.Sprintf("project %q not found", p.Name)
				break
			}
			slog.Info("rollback triggered via rpc", "project", p.Name, "sha", *st.PreviousSHA)
			r.mods.Poller.TriggerDeploy(ctx, proj, *st.PreviousSHA, true)
			result = map[string]bool{"ok": true}

		case "scale.set":
			var p struct {
				Name      string `json:"name"`
				Instances int    `json:"instances"`
			}
			json.Unmarshal(req.Params, &p)
			projects := r.svcs.ConfigWatcher.All()
			proj, ok := projects[p.Name]
			if !ok {
				rpcErr = fmt.Sprintf("project %q not found", p.Name)
				break
			}
			slog.Info("scale set via rpc", "project", p.Name, "instances", p.Instances)
			res, err := r.mods.Deploy.Scale(ctx, proj, p.Instances)
			if err != nil {
				rpcErr = err.Error()
				break
			}
			result = res

		case "scale.get":
			var p struct {
				Name string `json:"name"`
			}
			json.Unmarshal(req.Params, &p)
			st, err := r.svcs.State.Read(p.Name)
			if err != nil {
				rpcErr = err.Error()
				break
			}
			result = map[string]interface{}{"instances": st.Instances, "ports": st.RunningPorts}

		case "config.reload":
			n := r.svcs.ConfigWatcher.ForceReload()
			slog.Info("config reloaded via rpc", "count", n)
			result = map[string]int{"reloaded": n}

		case "config.setEnv":
			var p struct {
				Name    string `json:"name"`
				Content string `json:"content"`
			}
			json.Unmarshal(req.Params, &p)
			pp := r.svcs.ConfigWatcher.Paths().Project(p.Name)
			if err := r.svcs.ConfigRW.WriteRaw(pp.Env, p.Content); err != nil {
				rpcErr = err.Error()
				break
			}
			result = map[string]bool{"ok": true}

		case "config.getEnv":
			var p struct {
				Name string `json:"name"`
			}
			json.Unmarshal(req.Params, &p)
			pp := r.svcs.ConfigWatcher.Paths().Project(p.Name)
			content, err := r.svcs.ConfigRW.ReadRaw(pp.Env)
			if err != nil {
				rpcErr = err.Error()
				break
			}
			result = map[string]string{"content": content}

		case "config.getNpmrc":
			var p struct {
				Name string `json:"name"`
			}
			json.Unmarshal(req.Params, &p)
			pp := r.svcs.ConfigWatcher.Paths().Project(p.Name)
			content, err := r.svcs.ConfigRW.ReadRaw(pp.Npmrc)
			if err != nil {
				rpcErr = err.Error()
				break
			}
			result = map[string]string{"content": content}

		case "config.setNpmrc":
			var p struct {
				Name    string `json:"name"`
				Content string `json:"content"`
			}
			json.Unmarshal(req.Params, &p)
			pp := r.svcs.ConfigWatcher.Paths().Project(p.Name)
			if err := r.svcs.ConfigRW.WriteRaw(pp.Npmrc, p.Content); err != nil {
				rpcErr = err.Error()
				break
			}
			result = map[string]bool{"ok": true}

		case "config.syncEnv":
			var p struct {
				Name string `json:"name"`
			}
			json.Unmarshal(req.Params, &p)
			if err := r.mods.Deploy.SyncEnv(ctx, p.Name); err != nil {
				rpcErr = err.Error()
				break
			}
			result = map[string]bool{"ok": true}

		case "config.getMainConf":
			var p struct {
				Mask bool `json:"mask"`
			}
			json.Unmarshal(req.Params, &p)
			m, err := r.svcs.ConfigRW.ReadMainConf(p.Mask)
			if err != nil {
				rpcErr = err.Error()
				break
			}
			result = m

		case "config.setMainConf":
			var p struct {
				Changes map[string]string `json:"changes"`
			}
			json.Unmarshal(req.Params, &p)
			if err := r.svcs.ConfigRW.WriteConf(r.svcs.ConfigRW.Paths().ObstetrixConf, p.Changes); err != nil {
				rpcErr = err.Error()
				break
			}
			result = map[string]bool{"ok": true}

		case "config.getProjectConf":
			var p struct {
				Name string `json:"name"`
			}
			json.Unmarshal(req.Params, &p)
			pp := r.svcs.ConfigWatcher.Paths().Project(p.Name)
			m, err := r.svcs.ConfigRW.ReadConf(pp.Conf)
			if err != nil {
				rpcErr = err.Error()
				break
			}
			result = m

		case "config.setProjectConf":
			var p struct {
				Name    string            `json:"name"`
				Changes map[string]string `json:"changes"`
			}
			json.Unmarshal(req.Params, &p)
			pp := r.svcs.ConfigWatcher.Paths().Project(p.Name)
			if err := r.svcs.ConfigRW.WriteConf(pp.Conf, p.Changes); err != nil {
				rpcErr = err.Error()
				break
			}
			r.svcs.ConfigWatcher.ForceReload()
			result = map[string]bool{"ok": true}

		case "config.createProject":
			var p struct {
				Name    string `json:"name"`
				RepoURL string `json:"repoUrl"`
				Branch  string `json:"branch"`
				Ports   int    `json:"ports"`
			}
			json.Unmarshal(req.Params, &p)
			if p.Branch == "" {
				p.Branch = "main"
			}
			slog.Info("creating project via rpc", "project", p.Name, "repo", p.RepoURL, "ports", p.Ports)
			res, err := r.mods.Config.CreateProject(ctx, p.Name, p.RepoURL, p.Branch, p.Ports)
			if err != nil {
				rpcErr = err.Error()
				break
			}
			slog.Info("project created", "project", p.Name)
			result = res

		case "config.deleteProject":
			var p struct {
				Name       string `json:"name"`
				RemoveData bool   `json:"removeData"`
			}
			json.Unmarshal(req.Params, &p)
			slog.Info("deleting project via rpc", "project", p.Name, "removeData", p.RemoveData)
			if err := r.mods.Config.DeleteProject(ctx, p.Name, p.RemoveData); err != nil {
				rpcErr = err.Error()
				break
			}
			slog.Info("project deleted", "project", p.Name)
			result = map[string]bool{"ok": true}

		case "deployLogs.list":
			var p struct {
				Name string `json:"name"`
			}
			json.Unmarshal(req.Params, &p)
			metas, err := r.svcs.DeployLog.List(p.Name)
			if err != nil {
				rpcErr = err.Error()
				break
			}
			if metas == nil {
				metas = []config.DeployLogMeta{}
			}
			result = metas

		case "deployLogs.read":
			var p struct {
				Path string `json:"path"`
			}
			json.Unmarshal(req.Params, &p)
			entries, err := r.svcs.DeployLog.ReadAll(p.Path)
			if err != nil {
				rpcErr = err.Error()
				break
			}
			if entries == nil {
				entries = []config.DeployLogEntry{}
			}
			result = entries

		case "backup.run":
			var p struct {
				Name string `json:"name"`
			}
			json.Unmarshal(req.Params, &p)
			res, err := r.mods.Backup.RunProject(ctx, p.Name)
			if err != nil {
				rpcErr = err.Error()
				break
			}
			result = res

		case "backup.runSystem":
			res, err := r.mods.Backup.RunSystem(ctx)
			if err != nil {
				rpcErr = err.Error()
				break
			}
			result = res

		case "backup.list":
			var p struct {
				Name string `json:"name"`
			}
			json.Unmarshal(req.Params, &p)
			entries, err := r.svcs.Backup.List(p.Name, fmt.Sprintf("/var/obstetrix/backups/%s", p.Name))
			if err != nil {
				rpcErr = err.Error()
				break
			}
			result = entries

		case "port.list":
			ports, err := r.svcs.ConfigRW.Ports()
			if err != nil {
				rpcErr = err.Error()
				break
			}
			result = ports

		case "system.disk":
			info, err := r.mods.System.DiskInfo()
			if err != nil {
				rpcErr = err.Error()
				break
			}
			result = info

		case "system.daemonStatus":
			result = map[string]interface{}{
				"startedAt":  time.Now().UTC().Format(time.RFC3339),
				"uptime":     "unknown",
				"socketPath": r.svcs.ConfigRW.Paths().ObstetrixConf,
				"configRoot": r.svcs.ConfigRW.Paths().Root,
				"version":    "1.0.0",
				"projects":   len(r.svcs.ConfigWatcher.All()),
			}

		case "logs.subscribe":
			// Register this connection as a stream subscriber.
			if unsubscribe != nil {
				unsubscribe()
			}
			ch, unsub := r.mods.Events.Subscribe()
			unsubscribe = unsub
			go func() {
				for event := range ch {
					conn.SetDeadline(time.Now().Add(5 * time.Minute))
					enc.Encode(map[string]interface{}{"stream": true, "event": event})
				}
			}()
			result = map[string]bool{"ok": true}

		case "journal.tail":
			var p struct {
				Name  string `json:"name"`
				Lines int    `json:"lines"`
			}
			json.Unmarshal(req.Params, &p)
			if p.Lines <= 0 || p.Lines > 2000 {
				p.Lines = 200
			}
			unitPattern := fmt.Sprintf("%s@*.service", p.Name)
			out, err := exec.Command("journalctl", "-u", unitPattern,
				"--no-pager", fmt.Sprintf("-n%d", p.Lines), "--output=short-iso").CombinedOutput()
			if err != nil && len(out) == 0 {
				rpcErr = err.Error()
				break
			}
			result = map[string]string{"output": string(out)}

		case "nginx.list":
			entries, err := os.ReadDir("/etc/nginx/sites-available")
			if err != nil {
				rpcErr = err.Error()
				break
			}
			type nginxSite struct {
				Name    string `json:"name"`
				Enabled bool   `json:"enabled"`
			}
			sites := make([]nginxSite, 0, len(entries))
			for _, e := range entries {
				if e.IsDir() {
					continue
				}
				name := e.Name()
				_, statErr := os.Lstat("/etc/nginx/sites-enabled/" + name)
				sites = append(sites, nginxSite{Name: name, Enabled: statErr == nil})
			}
			result = sites

		case "nginx.get":
			var p struct {
				Name string `json:"name"`
			}
			json.Unmarshal(req.Params, &p)
			if strings.ContainsAny(p.Name, "/\\.") {
				rpcErr = "invalid config name"
				break
			}
			data, err := os.ReadFile("/etc/nginx/sites-available/" + p.Name)
			if err != nil {
				rpcErr = err.Error()
				break
			}
			result = map[string]string{"content": string(data)}

		case "nginx.set":
			var p struct {
				Name    string `json:"name"`
				Content string `json:"content"`
			}
			json.Unmarshal(req.Params, &p)
			if strings.ContainsAny(p.Name, "/\\.") {
				rpcErr = "invalid config name"
				break
			}
			path := "/etc/nginx/sites-available/" + p.Name
			// Back up existing content so we can restore on nginx -t failure.
			existing, _ := os.ReadFile(path)
			if err := os.WriteFile(path, []byte(p.Content), 0644); err != nil {
				rpcErr = err.Error()
				break
			}
			out, err := exec.Command("nginx", "-t").CombinedOutput()
			if err != nil {
				// Restore backup.
				if existing != nil {
					os.WriteFile(path, existing, 0644)
				} else {
					os.Remove(path)
				}
				rpcErr = "nginx -t failed: " + strings.TrimSpace(string(out))
				break
			}
			slog.Info("nginx config saved", "site", p.Name)
			result = map[string]interface{}{"ok": true, "output": strings.TrimSpace(string(out))}

		case "nginx.test":
			out, err := exec.Command("nginx", "-t").CombinedOutput()
			result = map[string]interface{}{"ok": err == nil, "output": strings.TrimSpace(string(out))}

		case "nginx.reload":
			out, err := exec.Command("systemctl", "reload", "nginx").CombinedOutput()
			if err != nil {
				rpcErr = "reload failed: " + strings.TrimSpace(string(out))
				break
			}
			slog.Info("nginx reloaded via rpc")
			result = map[string]interface{}{"ok": true, "output": strings.TrimSpace(string(out))}

		case "nginx.enable":
			var p struct {
				Name string `json:"name"`
			}
			json.Unmarshal(req.Params, &p)
			if strings.ContainsAny(p.Name, "/\\.") {
				rpcErr = "invalid config name"
				break
			}
			src := "/etc/nginx/sites-available/" + p.Name
			dst := "/etc/nginx/sites-enabled/" + p.Name
			os.Remove(dst)
			if err := os.Symlink(src, dst); err != nil {
				rpcErr = err.Error()
				break
			}
			slog.Info("nginx site enabled", "site", p.Name)
			result = map[string]bool{"ok": true}

		case "nginx.disable":
			var p struct {
				Name string `json:"name"`
			}
			json.Unmarshal(req.Params, &p)
			if strings.ContainsAny(p.Name, "/\\.") {
				rpcErr = "invalid config name"
				break
			}
			if err := os.Remove("/etc/nginx/sites-enabled/" + p.Name); err != nil {
				rpcErr = err.Error()
				break
			}
			slog.Info("nginx site disabled", "site", p.Name)
			result = map[string]bool{"ok": true}

		default:
			rpcErr = fmt.Sprintf("unknown method: %s", req.Method)
		}

		if rpcErr != "" {
			slog.Warn("rpc error", "method", req.Method, "err", rpcErr)
			enc.Encode(errResp(req.ID, rpcErr))
		} else {
			enc.Encode(rpcResponse{ID: req.ID, Result: result})
		}
	}
}

// ensure config.BuildEvent fields are used (suppress unused import)
var _ = config.EventLog
