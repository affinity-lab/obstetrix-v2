package config

import (
	"bufio"
	"fmt"
	"os"
	"strings"
)

type ProjectConfig struct {
	Name    string
	AppDir  string // /obstetrix-projects/{name} — derived, not in conf
	WorkDir string // /obstetrix-projects/_work/{name} — derived, not in conf
	AppUser string // obstetrix-{name} — derived, not in conf

	// Source
	RepoURL string
	Branch  string

	// Build
	BuildCmd string

	// Runtime
	HealthCheckURL string
	HealthTimeout  int
	RollbackOnFail bool

	// Scaling
	BasePort         int
	PortCount        int
	DefaultInstances int

	// Persistent dirs within AppDir (git-ignored, never wiped)
	PersistentDirs []string

	// Backup
	BackupSchedule    string
	BackupRetention   int
	BackupDir         string
	BackupIncludeData bool
	BackupIncludeEnv  bool

	// Polling
	AutoDeploy bool
}

func LoadProjectConfig(confPath, name string, projectsDir string) (*ProjectConfig, error) {
	f, err := os.Open(confPath)
	if err != nil {
		return nil, fmt.Errorf("open project config %s: %w", confPath, err)
	}
	defer f.Close()

	raw := map[string]string{}
	scanner := bufio.NewScanner(f)
	for scanner.Scan() {
		line := strings.TrimSpace(scanner.Text())
		if line == "" || strings.HasPrefix(line, "#") {
			continue
		}
		k, v, ok := strings.Cut(line, "=")
		if !ok {
			continue
		}
		raw[strings.TrimSpace(k)] = strings.TrimSpace(v)
	}

	get := func(key, def string) string {
		if v, ok := raw[key]; ok && v != "" {
			return v
		}
		return def
	}
	require := func(key string) (string, error) {
		v := get(key, "")
		if v == "" {
			return "", fmt.Errorf("project %s: required key missing: %s", name, key)
		}
		return v, nil
	}
	getInt := func(key string, def int) int {
		s := get(key, "")
		if s == "" {
			return def
		}
		var n int
		if _, err := fmt.Sscan(s, &n); err != nil {
			return def
		}
		return n
	}
	getBool := func(key string, def bool) bool {
		switch strings.ToLower(get(key, "")) {
		case "true", "yes", "1":
			return true
		case "false", "no", "0":
			return false
		}
		return def
	}
	getList := func(key string) []string {
		s := get(key, "")
		if s == "" {
			return nil
		}
		var out []string
		for _, item := range strings.Split(s, ",") {
			if t := strings.TrimSpace(item); t != "" {
				out = append(out, t)
			}
		}
		return out
	}

	repoURL, err := require("REPO_URL")
	if err != nil {
		return nil, err
	}
	buildCmd, err := require("BUILD_CMD")
	if err != nil {
		return nil, err
	}

	return &ProjectConfig{
		Name:             name,
		AppDir:           projectsDir + "/" + name,
		WorkDir:          projectsDir + "/_work/" + name,
		AppUser:          "obstetrix",
		RepoURL:          repoURL,
		Branch:           get("BRANCH", "main"),
		BuildCmd:         buildCmd,
		HealthCheckURL:   get("HEALTH_CHECK_URL", ""),
		HealthTimeout:    getInt("HEALTH_TIMEOUT", 60),
		RollbackOnFail:   getBool("ROLLBACK_ON_FAIL", true),
		BasePort:         getInt("BASE_PORT", 0),
		PortCount:        getInt("PORT_COUNT", 1),
		DefaultInstances: getInt("DEFAULT_INSTANCES", 1),
		PersistentDirs:   getList("PERSISTENT_DIRS"),
		BackupSchedule:   get("BACKUP_SCHEDULE", ""),
		BackupRetention:  getInt("BACKUP_RETENTION", 0),
		BackupDir:        get("BACKUP_DIR", ""),
		BackupIncludeData: getBool("BACKUP_INCLUDE_DATA", true),
		BackupIncludeEnv:  getBool("BACKUP_INCLUDE_ENV", true),
		AutoDeploy:        getBool("AUTO_DEPLOY", true),
	}, nil
}
