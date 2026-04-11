package services

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/yourorg/obstetrix/orchestrator/internal/config"
)

type DeployLogService struct {
	logDir string
}

func newDeployLogService(logDir string) *DeployLogService {
	return &DeployLogService{logDir: logDir}
}

// DeployLogWriter wraps an open log file for writing deploy entries.
type DeployLogWriter struct {
	file      *os.File
	project   string
	sha       string
	startedAt time.Time
	logDir    string
	tmpPath   string
}

// OpenWriter creates a new deploy log file. Returns nil writer (no error) if log dir unavailable.
func (s *DeployLogService) OpenWriter(projectName, sha string) (*DeployLogWriter, error) {
	logDir := filepath.Join(s.logDir, projectName)
	if err := os.MkdirAll(logDir, 0755); err != nil {
		return nil, fmt.Errorf("deploylog mkdir: %w", err)
	}

	now := time.Now().UTC()
	ts := now.Format("2006-01-02T15-04-05Z")
	sha8 := sha
	if len(sha8) > 8 {
		sha8 = sha8[:8]
	}
	tmpPath := filepath.Join(logDir, fmt.Sprintf("%s_%s.jsonl.running", ts, sha8))

	f, err := os.Create(tmpPath)
	if err != nil {
		return nil, fmt.Errorf("deploylog create: %w", err)
	}

	w := &DeployLogWriter{
		file:      f,
		project:   projectName,
		sha:       sha,
		startedAt: now,
		logDir:    logDir,
		tmpPath:   tmpPath,
	}

	// Write start entry
	w.writeEntry(config.DeployLogEntry{
		Ts:      now.Format(time.RFC3339),
		Type:    "start",
		SHA:     sha,
		Project: projectName,
	})

	return w, nil
}

func (w *DeployLogWriter) Write(line string) {
	if w == nil || w.file == nil {
		return
	}
	level := ""
	lower := strings.ToLower(line)
	if strings.HasPrefix(lower, "error:") || strings.HasPrefix(lower, "fatal:") ||
		strings.HasPrefix(lower, "panic:") || strings.HasPrefix(lower, "err:") ||
		strings.HasPrefix(lower, "fail") {
		level = "error"
	}
	entry := config.DeployLogEntry{
		Ts:    time.Now().UTC().Format(time.RFC3339),
		Type:  "log",
		Line:  line,
		Level: level,
	}
	w.writeEntry(entry)
}

func (w *DeployLogWriter) Close(ok bool, durationMs int64, errMsg string) {
	if w == nil || w.file == nil {
		return
	}

	entry := config.DeployLogEntry{
		Ts:         time.Now().UTC().Format(time.RFC3339),
		Type:       "end",
		DurationMs: durationMs,
		Error:      errMsg,
	}
	okVal := ok
	entry.OK = &okVal
	w.writeEntry(entry)
	w.file.Close()

	// Rename to final path with _ok or _fail suffix
	suffix := "_ok"
	if !ok {
		suffix = "_fail"
	}
	finalPath := strings.TrimSuffix(w.tmpPath, ".running") + suffix + ".jsonl"
	os.Rename(w.tmpPath, finalPath)
}

func (w *DeployLogWriter) writeEntry(entry config.DeployLogEntry) {
	data, err := json.Marshal(entry)
	if err != nil {
		return
	}
	w.file.Write(data)
	w.file.Write([]byte("\n"))
}

// List returns deploy log metadata for a project, newest first.
func (s *DeployLogService) List(projectName string) ([]config.DeployLogMeta, error) {
	logDir := filepath.Join(s.logDir, projectName)
	entries, err := os.ReadDir(logDir)
	if err != nil {
		return nil, nil
	}

	var metas []config.DeployLogMeta
	for _, e := range entries {
		if e.IsDir() {
			continue
		}
		name := e.Name()
		if !strings.HasSuffix(name, ".jsonl") && !strings.HasSuffix(name, ".jsonl.running") {
			continue
		}
		meta, err := parseLogFilename(projectName, filepath.Join(logDir, name))
		if err != nil {
			continue
		}
		metas = append(metas, meta)
	}

	// Reverse for newest first
	for i, j := 0, len(metas)-1; i < j; i, j = i+1, j-1 {
		metas[i], metas[j] = metas[j], metas[i]
	}
	return metas, nil
}

// ReadAll reads all entries from a deploy log file.
func (s *DeployLogService) ReadAll(path string) ([]config.DeployLogEntry, error) {
	data, err := os.ReadFile(path)
	if err != nil {
		return nil, fmt.Errorf("read deploy log: %w", err)
	}

	var entries []config.DeployLogEntry
	for _, line := range strings.Split(string(data), "\n") {
		line = strings.TrimSpace(line)
		if line == "" {
			continue
		}
		var entry config.DeployLogEntry
		if err := json.Unmarshal([]byte(line), &entry); err != nil {
			continue
		}
		entries = append(entries, entry)
	}
	return entries, nil
}

func parseLogFilename(project, path string) (config.DeployLogMeta, error) {
	base := filepath.Base(path)

	// Format: 2006-01-02T15-04-05Z_{sha8}[_ok|_fail].jsonl[.running]
	name := base
	name = strings.TrimSuffix(name, ".running")
	name = strings.TrimSuffix(name, ".jsonl")

	var ok *bool
	if strings.HasSuffix(name, "_ok") {
		v := true
		ok = &v
		name = strings.TrimSuffix(name, "_ok")
	} else if strings.HasSuffix(name, "_fail") {
		v := false
		ok = &v
		name = strings.TrimSuffix(name, "_fail")
	}

	parts := strings.SplitN(name, "_", 2)
	if len(parts) != 2 {
		return config.DeployLogMeta{}, fmt.Errorf("invalid log filename: %s", base)
	}

	tsStr := parts[0]
	sha8 := parts[1]

	// Parse timestamp: 2006-01-02T15-04-05Z
	t, err := time.Parse("2006-01-02T15-04-05Z", tsStr)
	if err != nil {
		return config.DeployLogMeta{}, fmt.Errorf("invalid timestamp in log filename: %s", tsStr)
	}

	return config.DeployLogMeta{
		DeployID:  strings.TrimSuffix(filepath.Base(path), ".jsonl"),
		Project:   project,
		SHA:       sha8,
		StartedAt: t.Format(time.RFC3339),
		OK:        ok,
		Path:      path,
	}, nil
}
