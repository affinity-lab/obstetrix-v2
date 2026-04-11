package config

import (
	"bufio"
	"fmt"
	"log/slog"
	"os"
	"strings"
	"time"
)

type Config struct {
	Projects ProjectsConfig
	GitHub   GitHubConfig
	Socket   SocketConfig
	State    StateConfig
	Log      LogConfig
	Backup   BackupConfig
	LogLevel slog.Level
}

// ProjectsConfig holds host-level settings for running project apps.
type ProjectsConfig struct {
	Dir string // /obstetrix-projects — parent dir for all project deploy dirs
}

// WorkDir returns the build scratch space for a given project.
func (c ProjectsConfig) WorkDir(projectName string) string {
	return c.Dir + "/_work/" + projectName
}

type GitHubConfig struct {
	Token          string
	PollInterval   time.Duration
	RequestTimeout time.Duration
}

func (c GitHubConfig) Interval() time.Duration { return c.PollInterval }
func (c GitHubConfig) Timeout() time.Duration  { return c.RequestTimeout }

type SocketConfig struct {
	Path string
	Mode os.FileMode
}

type StateConfig struct{ Dir string }
type LogConfig struct{ Dir string }
type BackupConfig struct {
	DefaultSchedule  string
	DefaultRetention int
	DefaultDir       string
}

func Load(paths Paths) (*Config, error) {
	raw := map[string]string{}

	f, err := os.Open(paths.ObstetrixConf)
	if err != nil && !os.IsNotExist(err) {
		return nil, fmt.Errorf("open config: %w", err)
	}
	if err == nil {
		defer f.Close()
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
	}

	for _, pair := range os.Environ() {
		k, v, _ := strings.Cut(pair, "=")
		raw[k] = v
	}

	get := func(key, def string) string {
		if v, ok := raw[key]; ok && v != "" {
			return v
		}
		return def
	}

	token := get("GITHUB_TOKEN", "")
	if token == "" {
		return nil, fmt.Errorf("GITHUB_TOKEN is required — set it in %s", paths.ObstetrixConf)
	}

	logLevel := slog.LevelInfo
	if get("LOG_LEVEL", "info") == "debug" {
		logLevel = slog.LevelDebug
	}

	dur := func(key, def string) time.Duration {
		s := get(key, def)
		d, err := time.ParseDuration(s)
		if err != nil {
			d, _ = time.ParseDuration(def)
		}
		return d
	}

	return &Config{
		Projects: ProjectsConfig{Dir: get("PROJECTS_DIR", "/obstetrix-projects")},
		GitHub: GitHubConfig{
			Token:          token,
			PollInterval:   dur("POLL_INTERVAL", "30s"),
			RequestTimeout: dur("GITHUB_TIMEOUT", "10s"),
		},
		Socket: SocketConfig{
			Path: get("SOCKET_PATH", "/run/obstetrix/orchestrator.sock"),
			Mode: 0660,
		},
		State:  StateConfig{Dir: get("STATE_DIR", "/var/obstetrix/state")},
		Log:    LogConfig{Dir: get("LOG_DIR", "/var/obstetrix/logs")},
		Backup: BackupConfig{
			DefaultSchedule:  get("BACKUP_SCHEDULE", "0 3 * * *"),
			DefaultRetention: atoi(get("BACKUP_RETENTION", "7"), 7),
			DefaultDir:       get("BACKUP_DIR", "/var/obstetrix/backups"),
		},
		LogLevel: logLevel,
	}, nil
}

func atoi(s string, def int) int {
	var n int
	if _, err := fmt.Sscan(s, &n); err != nil {
		return def
	}
	return n
}
