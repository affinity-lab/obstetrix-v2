package services

import (
	"bufio"
	"os"
	"path/filepath"
	"sort"
	"strconv"
	"strings"
	"sync"

	"github.com/yourorg/obstetrix/orchestrator/internal/config"
)

type ConfigRWService struct {
	paths config.Paths
	mu    sync.RWMutex
	token string // cached GitHub token for netrc writes
}

func newConfigRWService(paths config.Paths) *ConfigRWService {
	svc := &ConfigRWService{paths: paths}
	conf, _ := parseKV(paths.ObstetrixConf)
	svc.token = conf["GITHUB_TOKEN"]
	return svc
}

func (s *ConfigRWService) GitHubToken() string { return s.token }
func (s *ConfigRWService) Paths() config.Paths { return s.paths }

func (s *ConfigRWService) ReadConf(path string) (map[string]string, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	return parseKV(path)
}

func (s *ConfigRWService) WriteConf(path string, changes map[string]string) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	existing, err := os.ReadFile(path)
	if err != nil && !os.IsNotExist(err) {
		return err
	}
	lines := strings.Split(string(existing), "\n")
	written := map[string]bool{}
	for i, line := range lines {
		trimmed := strings.TrimSpace(line)
		if trimmed == "" || strings.HasPrefix(trimmed, "#") {
			continue
		}
		k, _, ok := strings.Cut(trimmed, "=")
		if !ok {
			continue
		}
		k = strings.TrimSpace(k)
		if newVal, change := changes[k]; change {
			if newVal == "" {
				lines[i] = ""
			} else {
				lines[i] = k + "=" + newVal
			}
			written[k] = true
		}
	}
	for k, v := range changes {
		if !written[k] && v != "" {
			lines = append(lines, k+"="+v)
		}
	}
	return atomicWrite(path, strings.Join(lines, "\n"))
}

func (s *ConfigRWService) ReadRaw(path string) (string, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	b, err := os.ReadFile(path)
	if os.IsNotExist(err) {
		return "", nil
	}
	return string(b), err
}

func (s *ConfigRWService) WriteRaw(path, content string) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	return atomicWrite(path, content)
}

// ReadMainConf reads obstetrix.conf and optionally masks values for secret keys.
// Secret keys are those whose name contains "TOKEN", "SECRET", "PASSWORD", or "KEY".
func (s *ConfigRWService) ReadMainConf(mask bool) (map[string]string, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	m, err := parseKV(s.paths.ObstetrixConf)
	if err != nil || !mask {
		return m, err
	}
	secretPatterns := []string{"TOKEN", "SECRET", "PASSWORD", "KEY"}
	for k, v := range m {
		upper := strings.ToUpper(k)
		for _, p := range secretPatterns {
			if strings.Contains(upper, p) {
				if len(v) > 8 {
					m[k] = v[:4] + strings.Repeat("*", len(v)-8) + v[len(v)-4:]
				} else {
					m[k] = strings.Repeat("*", len(v))
				}
				break
			}
		}
	}
	return m, nil
}

// ResolveEnv reads a .env or .npmrc file and substitutes ${VAR} from obstetrix.conf.
// Used to produce the content written to $PROJECTS_DIR/{name}/.env before every deploy.
func (s *ConfigRWService) ResolveEnv(envPath string) (string, error) {
	s.mu.RLock()
	conf, err := parseKV(s.paths.ObstetrixConf)
	s.mu.RUnlock()
	if err != nil {
		return "", err
	}
	content, err := s.ReadRaw(envPath)
	if err != nil {
		return "", err
	}
	for k, v := range conf {
		content = strings.ReplaceAll(content, "${"+k+"}", v)
	}
	return content, nil
}

// Ports returns all PORT.{name}=base:count entries from obstetrix.conf.
func (s *ConfigRWService) Ports() ([]config.PortEntry, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	m, err := parseKV(s.paths.ObstetrixConf)
	if err != nil {
		return nil, err
	}
	return parsePorts(m), nil
}

// AllocatePort finds the first gap >= count from PORT_RANGE_START=4000 and writes
// PORT.{name}=base:count to obstetrix.conf. Returns the allocated base port.
func (s *ConfigRWService) AllocatePort(name string, count int) (int, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	m, err := parseKV(s.paths.ObstetrixConf)
	if err != nil {
		return 0, err
	}
	entries := parsePorts(m)
	sort.Slice(entries, func(i, j int) bool { return entries[i].Base < entries[j].Base })

	const rangeStart = 4000
	candidate := rangeStart
	for _, e := range entries {
		if candidate+count <= e.Base {
			break
		}
		if e.Base+e.Count > candidate {
			candidate = e.Base + e.Count
		}
	}
	key := "PORT." + name
	val := strconv.Itoa(candidate) + ":" + strconv.Itoa(count)
	return candidate, s.writeConfLocked(m, map[string]string{key: val})
}

// FreePort removes PORT.{name} from obstetrix.conf on project deletion.
func (s *ConfigRWService) FreePort(name string) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	m, err := parseKV(s.paths.ObstetrixConf)
	if err != nil {
		return err
	}
	return s.writeConfLocked(m, map[string]string{"PORT." + name: ""})
}

// writeConfLocked must be called with mu already held.
func (s *ConfigRWService) writeConfLocked(existing map[string]string, changes map[string]string) error {
	raw, err := os.ReadFile(s.paths.ObstetrixConf)
	if err != nil && !os.IsNotExist(err) {
		return err
	}
	lines := strings.Split(string(raw), "\n")
	written := map[string]bool{}
	for i, line := range lines {
		trimmed := strings.TrimSpace(line)
		if trimmed == "" || strings.HasPrefix(trimmed, "#") {
			continue
		}
		k, _, ok := strings.Cut(trimmed, "=")
		if !ok {
			continue
		}
		k = strings.TrimSpace(k)
		if newVal, change := changes[k]; change {
			if newVal == "" {
				lines[i] = ""
			} else {
				lines[i] = k + "=" + newVal
			}
			written[k] = true
		}
	}
	for k, v := range changes {
		if !written[k] && v != "" {
			lines = append(lines, k+"="+v)
		}
	}
	return atomicWrite(s.paths.ObstetrixConf, strings.Join(lines, "\n"))
}

func parsePorts(m map[string]string) []config.PortEntry {
	var entries []config.PortEntry
	for k, v := range m {
		if !strings.HasPrefix(k, "PORT.") {
			continue
		}
		name := strings.TrimPrefix(k, "PORT.")
		parts := strings.SplitN(v, ":", 2)
		if len(parts) != 2 {
			continue
		}
		base, err1 := strconv.Atoi(parts[0])
		count, err2 := strconv.Atoi(parts[1])
		if err1 != nil || err2 != nil {
			continue
		}
		ports := make([]int, count)
		for i := range ports {
			ports[i] = base + i
		}
		entries = append(entries, config.PortEntry{Name: name, Base: base, Count: count, Ports: ports})
	}
	return entries
}

func parseKV(path string) (map[string]string, error) {
	f, err := os.Open(path)
	if os.IsNotExist(err) {
		return map[string]string{}, nil
	}
	if err != nil {
		return nil, err
	}
	defer f.Close()
	m := map[string]string{}
	scanner := bufio.NewScanner(f)
	for scanner.Scan() {
		line := strings.TrimSpace(scanner.Text())
		if line == "" || strings.HasPrefix(line, "#") {
			continue
		}
		k, v, ok := strings.Cut(line, "=")
		if ok {
			m[strings.TrimSpace(k)] = strings.TrimSpace(v)
		}
	}
	return m, scanner.Err()
}

func atomicWrite(path, content string) error {
	if err := os.MkdirAll(filepath.Dir(path), 0755); err != nil {
		return err
	}
	tmp := path + ".tmp"
	if err := os.WriteFile(tmp, []byte(content), 0640); err != nil {
		return err
	}
	return os.Rename(tmp, path)
}
