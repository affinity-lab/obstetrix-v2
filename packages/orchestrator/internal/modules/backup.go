package modules

import (
	"context"
	"fmt"
	"log/slog"
	"path/filepath"
	"strings"
	"sync"
	"time"

	"github.com/yourorg/obstetrix/orchestrator/internal/config"
	"github.com/yourorg/obstetrix/orchestrator/internal/services"
)

type BackupModule struct {
	svcs   *services.Services
	mu     sync.Mutex
	timers map[string]*time.Timer
}

func newBackupModule(svcs *services.Services) *BackupModule {
	return &BackupModule{svcs: svcs, timers: map[string]*time.Timer{}}
}

func (b *BackupModule) RunProject(ctx context.Context, projectName string) (*services.BackupResult, error) {
	projects := b.svcs.ConfigWatcher.All()
	proj, ok := projects[projectName]
	if !ok {
		return nil, fmt.Errorf("backup: unknown project %q", projectName)
	}

	destDir := proj.BackupDir
	if destDir == "" {
		destDir = filepath.Join(b.svcs.Backup.DefaultDir(), projectName)
	}

	paths := []string{
		filepath.Join("/var/obstetrix/state", projectName+".json"),
		b.svcs.ConfigRW.Paths().Project(projectName).Conf,
	}
	if proj.BackupIncludeEnv {
		pp := b.svcs.ConfigRW.Paths().Project(projectName)
		paths = append(paths, pp.Env, pp.Npmrc)
	}
	if proj.BackupIncludeData {
		for _, dir := range proj.PersistentDirs {
			paths = append(paths, filepath.Join(proj.AppDir, dir))
		}
	}

	result, err := b.svcs.Backup.Create(projectName, destDir, paths)
	if err != nil {
		return nil, err
	}

	retention := proj.BackupRetention
	if retention == 0 {
		retention = b.svcs.Backup.DefaultRetention()
	}
	_ = b.svcs.Backup.Prune(projectName, destDir, retention)

	slog.Info("backup complete", "project", projectName, "path", result.Path, "bytes", result.SizeBytes)
	return result, nil
}

func (b *BackupModule) RunSystem(ctx context.Context) (*services.BackupResult, error) {
	paths := []string{
		b.svcs.ConfigRW.Paths().Root,
		"/var/obstetrix/state",
	}
	destDir := "/var/obstetrix/backups/system"
	result, err := b.svcs.Backup.Create("system", destDir, paths)
	if err != nil {
		return nil, err
	}
	_ = b.svcs.Backup.Prune("system", destDir, b.svcs.Backup.DefaultRetention())
	return result, nil
}

func (b *BackupModule) ScheduleAll(projects map[string]*config.ProjectConfig) {
	b.mu.Lock()
	defer b.mu.Unlock()
	for _, t := range b.timers {
		t.Stop()
	}
	b.timers = map[string]*time.Timer{}

	for name, proj := range projects {
		schedule := proj.BackupSchedule
		if schedule == "" {
			schedule = b.svcs.Backup.DefaultSchedule()
		}
		if schedule == "" || strings.EqualFold(schedule, "off") {
			continue
		}

		next := nextDailyTime(schedule)
		if next <= 0 {
			continue
		}

		pName := name
		b.timers[pName] = time.AfterFunc(next, func() {
			if _, err := b.RunProject(context.Background(), pName); err != nil {
				slog.Error("scheduled backup failed", "project", pName, "err", err)
			}
			b.ScheduleAll(b.svcs.ConfigWatcher.All())
		})
		slog.Info("backup scheduled", "project", pName, "in", next.Round(time.Second).String())
	}
}

// nextDailyTime parses a 5-field cron expression and returns duration until next run.
// O(1) — direct time arithmetic, no polling loop.
func nextDailyTime(expr string) time.Duration {
	parts := strings.Fields(expr)
	if len(parts) != 5 {
		return 0
	}
	var targetMin, targetHour int
	if _, err := fmt.Sscan(parts[0], &targetMin); err != nil && parts[0] != "*" {
		return 0
	}
	if _, err := fmt.Sscan(parts[1], &targetHour); err != nil && parts[1] != "*" {
		return 0
	}
	if parts[0] == "*" {
		targetMin = 0
	}
	if parts[1] == "*" {
		targetHour = 0
	}
	now := time.Now()
	target := time.Date(now.Year(), now.Month(), now.Day(), targetHour, targetMin, 0, 0, now.Location())
	if !target.After(now) {
		target = target.Add(24 * time.Hour)
	}
	return time.Until(target)
}
