package services

import "github.com/yourorg/obstetrix/orchestrator/internal/config"

type Services struct {
	Runner        *RunnerService
	GitHub        *GitHubService
	Socket        *SocketService
	ConfigWatcher *ConfigWatcherService
	State         *StateService
	ConfigRW      *ConfigRWService
	Backup        *BackupService
	DeployLog     *DeployLogService
}

func Create(cfg *config.Config, paths config.Paths) *Services {
	return &Services{
		Runner:        newRunnerService(cfg.Projects),
		GitHub:        newGitHubService(cfg.GitHub),
		Socket:        newSocketService(cfg.Socket),
		ConfigWatcher: newConfigWatcherService(paths, cfg.Projects.Dir),
		State:         newStateService(cfg.State.Dir),
		ConfigRW:      newConfigRWService(paths),
		Backup:        newBackupService(cfg.Backup),
		DeployLog:     newDeployLogService(cfg.Log.Dir),
	}
}
