package services

import (
	"encoding/json"
	"os"
	"path/filepath"
	"strings"

	"github.com/yourorg/obstetrix/orchestrator/internal/config"
)

type StateService struct{ stateDir string }

func newStateService(dir string) *StateService { return &StateService{stateDir: dir} }

// Read loads the state for a project. Returns a zero state (StatusStopped) if not found.
func (s *StateService) Read(name string) (*config.ProjectState, error) {
	path := filepath.Join(s.stateDir, name+".json")
	data, err := os.ReadFile(path)
	if os.IsNotExist(err) {
		return &config.ProjectState{Name: name, Status: config.StatusStopped}, nil
	}
	if err != nil {
		return nil, err
	}
	var st config.ProjectState
	if err := json.Unmarshal(data, &st); err != nil {
		return nil, err
	}
	return &st, nil
}

// Write persists the project state atomically.
func (s *StateService) Write(st *config.ProjectState) error {
	if err := os.MkdirAll(s.stateDir, 0755); err != nil {
		return err
	}
	data, err := json.MarshalIndent(st, "", "  ")
	if err != nil {
		return err
	}
	path := filepath.Join(s.stateDir, st.Name+".json")
	tmp := path + ".tmp"
	if err := os.WriteFile(tmp, data, 0644); err != nil {
		return err
	}
	return os.Rename(tmp, path)
}

// ReadAll returns state for every project that has a state file.
func (s *StateService) ReadAll() ([]*config.ProjectState, error) {
	entries, err := os.ReadDir(s.stateDir)
	if err != nil {
		return []*config.ProjectState{}, nil
	}
	states := make([]*config.ProjectState, 0)
	for _, e := range entries {
		if e.IsDir() || !strings.HasSuffix(e.Name(), ".json") {
			continue
		}
		name := strings.TrimSuffix(e.Name(), ".json")
		st, err := s.Read(name)
		if err != nil {
			continue
		}
		states = append(states, st)
	}
	return states, nil
}
