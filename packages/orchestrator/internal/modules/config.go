package modules

import (
	"context"
	"fmt"
	"os"

	"github.com/yourorg/obstetrix/orchestrator/internal/services"
)

type ConfigModule struct {
	mods *Modules
	svcs *services.Services
}

func newConfigModule(mods *Modules, svcs *services.Services) *ConfigModule {
	return &ConfigModule{mods: mods, svcs: svcs}
}

// CreateProject creates /etc/obstetrix/projects/{name}/ with project.conf, .env, .npmrc
// and allocates a port range in obstetrix.conf.
func (c *ConfigModule) CreateProject(ctx context.Context, name, repoURL, branch string, portCount int) (map[string]interface{}, error) {
	if portCount <= 0 {
		portCount = 1
	}
	basePort, err := c.svcs.ConfigRW.AllocatePort(name, portCount)
	if err != nil {
		return nil, fmt.Errorf("allocate ports: %w", err)
	}

	pp := c.svcs.ConfigWatcher.Paths().Project(name)
	if err := os.MkdirAll(pp.Dir, 0750); err != nil {
		return nil, fmt.Errorf("create project dir: %w", err)
	}
	conf := fmt.Sprintf(
		"REPO_URL=%s\nBRANCH=%s\nBUILD_CMD=bun install && bun run build\n"+
			"HEALTH_CHECK_URL=http://127.0.0.1:%d/health\nHEALTH_TIMEOUT=60\n"+
			"ROLLBACK_ON_FAIL=true\nDEFAULT_INSTANCES=1\nPERSISTENT_DIRS=uploads,data\n",
		repoURL, branch, basePort)
	if err := os.WriteFile(pp.Conf, []byte(conf), 0640); err != nil {
		return nil, fmt.Errorf("write project.conf: %w", err)
	}
	os.WriteFile(pp.Env, []byte("NODE_ENV=production\n"), 0640)
	os.WriteFile(pp.Npmrc, []byte("frozen-lockfile=true\n"), 0640)

	return map[string]interface{}{
		"name": name, "basePort": basePort, "ports": portCount,
	}, nil
}

// DeleteProject stops all instances, removes systemd units, config dir, port allocation,
// _work/ dir, and optionally the deploy dir.
func (c *ConfigModule) DeleteProject(ctx context.Context, name string, removeData bool) error {
	// 1. Stop and disable systemd units
	unitPattern := name + "@*.service"
	templateUnit := name + "@.service"
	unitFile := "/etc/systemd/system/" + templateUnit

	// We use bash -c for the wildcard stop/disable safely here as 'name' is validated 
	// (or should be) before this call.
	c.svcs.Runner.RunAsRootRaw(ctx, nil, "bash", "-c", 
		fmt.Sprintf("systemctl stop %q 2>/dev/null; systemctl disable %q 2>/dev/null", unitPattern, templateUnit))
	
	os.Remove(unitFile)
	c.svcs.Runner.RunAsRootRaw(ctx, nil, "systemctl", "daemon-reload")

	// 2. Remove configuration
	pp := c.svcs.ConfigWatcher.Paths().Project(name)
	os.RemoveAll(pp.Dir)

	// 3. Free port allocation
	c.svcs.ConfigRW.FreePort(name)

	// 4. Clean up work and deploy directories
	projectsDir := c.svcs.Runner.ProjectsDir()
	os.RemoveAll(projectsDir + "/_work/" + name)
	if removeData {
		os.RemoveAll(projectsDir + "/" + name)
	}

	return nil
}
