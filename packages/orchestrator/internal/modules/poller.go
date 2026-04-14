package modules

import (
	"context"
	"fmt"
	"log/slog"
	"sync"
	"time"

	"github.com/yourorg/obstetrix/orchestrator/internal/config"
	"github.com/yourorg/obstetrix/orchestrator/internal/services"
)

// PollerModule handles two concerns: GitHub SHA polling (auto-deploy) and background health watching.
type PollerModule struct {
	svcs     *services.Services
	mods     *Modules
	mu       sync.RWMutex
	projects map[string]*config.ProjectConfig
	// Per-project deploy queues. 1-slot buffer: collapses rapid triggers into one pending deploy.
	queues map[string]chan deployRequest
}

type deployRequest struct {
	sha        string
	isRollback bool
}

func newPollerModule(svcs *services.Services, mods *Modules) *PollerModule {
	return &PollerModule{
		svcs:     svcs,
		mods:     mods,
		projects: map[string]*config.ProjectConfig{},
		queues:   map[string]chan deployRequest{},
	}
}

// OnConfigChange is called by ConfigWatcherService when the project config map changes.
func (p *PollerModule) OnConfigChange(projects map[string]*config.ProjectConfig) {
	p.mu.Lock()
	defer p.mu.Unlock()
	p.projects = projects
	for name := range projects {
		if _, ok := p.queues[name]; !ok {
			ch := make(chan deployRequest, 1)
			p.queues[name] = ch
			go p.deployWorker(name, ch)
		}
	}
}

// deployWorker processes deploy requests for a single project serially (one at a time).
func (p *PollerModule) deployWorker(name string, ch <-chan deployRequest) {
	for req := range ch {
		p.mu.RLock()
		proj, ok := p.projects[name]
		p.mu.RUnlock()
		if !ok {
			continue
		}
		if err := p.mods.Deploy.Run(context.Background(), proj, req.sha, req.isRollback); err != nil {
			slog.Error("deploy failed", "project", name, "sha", req.sha, "err", err)
		}
	}
}

// TriggerDeploy queues a deploy. Non-blocking: if queue is full (deploy already queued), request is dropped.
func (p *PollerModule) TriggerDeploy(ctx context.Context, proj *config.ProjectConfig, sha string, isRollback bool) {
	p.mu.RLock()
	ch, ok := p.queues[proj.Name]
	p.mu.RUnlock()
	if !ok {
		return
	}
	select {
	case ch <- deployRequest{sha: sha, isRollback: isRollback}:
	default:
		slog.Warn("deploy queue full, dropping", "project", proj.Name)
	}
}

// ReloadProjects returns the number of currently loaded projects.
func (p *PollerModule) ReloadProjects() int {
	p.mu.RLock()
	defer p.mu.RUnlock()
	return len(p.projects)
}

// Run is the main GitHub polling loop. Ticks every PollInterval and calls pollOnce.
func (p *PollerModule) Run(ctx context.Context) {
	ticker := time.NewTicker(p.svcs.GitHub.PollInterval())
	defer ticker.Stop()
	for {
		select {
		case <-ctx.Done():
			return
		case <-ticker.C:
			p.pollOnce(ctx)
		}
	}
}

// pollOnce checks each project's remote HEAD SHA against the last deployed SHA.
func (p *PollerModule) pollOnce(ctx context.Context) {
	p.mu.RLock()
	projects := p.projects
	p.mu.RUnlock()

	for name, proj := range projects {
		headSHA, err := p.svcs.GitHub.HeadSHA(proj.RepoURL, proj.Branch)
		if err != nil {
			slog.Warn("github poll failed", "project", name, "err", err)
			continue
		}
		st, err := p.svcs.State.Read(name)
		if err != nil {
			slog.Warn("state read failed", "project", name, "err", err)
			continue
		}
		if st.CurrentSHA == nil {
			slog.Debug("skipping poll auto-deploy: project not yet deployed", "project", name)
			continue
		}
		if *st.CurrentSHA == headSHA {
			continue // already at HEAD
		}
		if !proj.AutoDeploy {
			slog.Debug("auto-deploy disabled for project", "project", name)
			continue
		}
		slog.Info("new commit detected, queuing deploy", "project", name, "sha", headSHA[:8])
		p.TriggerDeploy(ctx, proj, headSHA, false)
	}
}

// WatchServiceHealth checks each project's running ports every 30 seconds.
func (p *PollerModule) WatchServiceHealth(ctx context.Context) {
	ticker := time.NewTicker(30 * time.Second)
	defer ticker.Stop()
	for {
		select {
		case <-ctx.Done():
			return
		case <-ticker.C:
			p.mu.RLock()
			projs := p.projects
			p.mu.RUnlock()
			for _, proj := range projs {
				go p.checkServiceHealth(proj)
			}
		}
	}
}

func (p *PollerModule) checkServiceHealth(proj *config.ProjectConfig) {
	st, err := p.svcs.State.Read(proj.Name)
	if err != nil || st.Status != config.StatusRunning {
		return
	}

	anyDown := false
	for _, port := range st.RunningPorts {
		if !p.svcs.Runner.ServiceActive(fmt.Sprintf("%s@%d.service", proj.Name, port)) {
			anyDown = true
			break
		}
	}
	if anyDown {
		st.Status = config.StatusStopped
		_ = p.svcs.State.Write(st)
		p.mods.Events.Publish(config.BuildEvent{
			Type: config.EventStatus, ProjectName: proj.Name,
			Status: config.StatusStopped, Ts: time.Now().UTC().Format(time.RFC3339),
		})
		slog.Warn("service unexpectedly stopped", "project", proj.Name)
	}
}
