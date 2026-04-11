package modules

import "github.com/yourorg/obstetrix/orchestrator/internal/services"

type Modules struct {
	Deploy *DeployModule
	Poller *PollerModule
	Backup *BackupModule
	Health *HealthModule
	Events *EventBus
	RPC    *RPCModule
	Config *ConfigModule
	System *SystemModule
}

func Create(svcs *services.Services) *Modules {
	mods := &Modules{}
	mods.Events = newEventBus()
	mods.Health = newHealthModule()
	mods.Deploy = newDeployModule(mods, svcs)
	mods.Poller = newPollerModule(svcs, mods)
	mods.Backup = newBackupModule(svcs)
	mods.RPC = newRPCModule(mods, svcs)
	mods.Config = newConfigModule(mods, svcs)
	mods.System = newSystemModule(svcs)
	return mods
}
