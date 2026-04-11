package config

import (
	"fmt"
	"os"
	"path/filepath"
)

// EnsureDirs creates all permanent system directories. Called once at startup.
func EnsureDirs(configRoot string, projectsDir string) error {
	dirs := []struct {
		path string
		mode os.FileMode
	}{
		{"/var/obstetrix", 0755},
		{"/var/obstetrix/state", 0755},
		{"/var/obstetrix/backups", 0750},
		{"/var/obstetrix/logs", 0755},
		{projectsDir, 0755},
		{filepath.Join(projectsDir, "_work"), 0755},
		{configRoot, 0750},
		{filepath.Join(configRoot, "projects"), 0750},
	}
	for _, d := range dirs {
		if err := os.MkdirAll(d.path, d.mode); err != nil {
			return fmt.Errorf("ensureDirs %s: %w", d.path, err)
		}
	}
	return nil
}

// EnsureProjectDirs creates per-project log, backup, deploy, and work directories.
func EnsureProjectDirs(projectName, appUser, projectsDir string) error {
	logDir := "/var/obstetrix/logs/" + projectName
	backupDir := "/var/obstetrix/backups/" + projectName
	deployDir := projectsDir + "/" + projectName
	workDir := projectsDir + "/_work/" + projectName

	for _, d := range []string{logDir, backupDir, deployDir, workDir} {
		if err := os.MkdirAll(d, 0755); err != nil {
			return fmt.Errorf("ensureProjectDirs %s: %w", d, err)
		}
	}
	return nil
}
