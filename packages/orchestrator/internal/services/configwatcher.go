package services

import (
	"context"
	"log/slog"
	"os"
	"reflect"
	"sync"
	"time"

	"github.com/yourorg/obstetrix/orchestrator/internal/config"
)

type ConfigWatcherService struct {
	paths    config.Paths
	appsRoot string
	mu       sync.RWMutex
	projects map[string]*config.ProjectConfig
	onChange func(map[string]*config.ProjectConfig)
	onBackup func(map[string]*config.ProjectConfig)
}

func newConfigWatcherService(paths config.Paths, appsRoot string) *ConfigWatcherService {
	return &ConfigWatcherService{paths: paths, appsRoot: appsRoot, projects: map[string]*config.ProjectConfig{}}
}

func (s *ConfigWatcherService) Watch(
	ctx context.Context,
	onProjectsChange func(map[string]*config.ProjectConfig),
	onBackupScheduleChange func(map[string]*config.ProjectConfig),
) {
	s.onChange = onProjectsChange
	s.onBackup = onBackupScheduleChange

	fresh := s.load()
	s.mu.Lock()
	s.projects = fresh
	s.mu.Unlock()
	onProjectsChange(fresh)
	onBackupScheduleChange(fresh)

	ticker := time.NewTicker(10 * time.Second)
	defer ticker.Stop()
	for {
		select {
		case <-ctx.Done():
			return
		case <-ticker.C:
			fresh = s.load()
			if s.changed(fresh) {
				s.mu.Lock()
				s.projects = fresh
				s.mu.Unlock()
				slog.Info("project configs reloaded", "count", len(fresh))
				onProjectsChange(fresh)
				onBackupScheduleChange(fresh)
			}
		}
	}
}

// ForceReload immediately re-reads all project configs from disk and notifies listeners.
// Call after writing any project.conf to ensure the in-memory cache is up-to-date.
func (s *ConfigWatcherService) ForceReload() int {
	fresh := s.load()
	s.mu.Lock()
	s.projects = fresh
	s.mu.Unlock()
	if s.onChange != nil {
		s.onChange(fresh)
	}
	if s.onBackup != nil {
		s.onBackup(fresh)
	}
	slog.Info("config force-reloaded", "count", len(fresh))
	return len(fresh)
}

func (s *ConfigWatcherService) All() map[string]*config.ProjectConfig {
	s.mu.RLock()
	defer s.mu.RUnlock()
	out := make(map[string]*config.ProjectConfig, len(s.projects))
	for k, v := range s.projects {
		out[k] = v
	}
	return out
}

func (s *ConfigWatcherService) Paths() config.Paths { return s.paths }

func (s *ConfigWatcherService) load() map[string]*config.ProjectConfig {
	entries, err := os.ReadDir(s.paths.ProjectsDir)
	if err != nil {
		slog.Warn("projects dir read failed", "dir", s.paths.ProjectsDir, "err", err)
		return map[string]*config.ProjectConfig{}
	}
	out := map[string]*config.ProjectConfig{}
	for _, e := range entries {
		if !e.IsDir() {
			continue
		}
		name := e.Name()
		pp := s.paths.Project(name)
		pc, err := config.LoadProjectConfig(pp.Conf, name, s.appsRoot)
		if err != nil {
			slog.Warn("project config load failed", "project", name, "err", err)
			continue
		}
		out[name] = pc
		if err := config.EnsureProjectDirs(name, pc.AppUser, s.appsRoot); err != nil {
			slog.Warn("ensureProjectDirs failed", "project", name, "err", err)
		}
	}
	return out
}

func (s *ConfigWatcherService) changed(fresh map[string]*config.ProjectConfig) bool {
	s.mu.RLock()
	defer s.mu.RUnlock()
	if len(fresh) != len(s.projects) {
		return true
	}
	for name, fp := range fresh {
		cp, ok := s.projects[name]
		if !ok || !reflect.DeepEqual(fp, cp) {
			return true
		}
	}
	return false
}
