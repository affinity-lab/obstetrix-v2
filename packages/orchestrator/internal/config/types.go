package config

import "reflect"

type ProjectStatus string

const (
	StatusRunning  ProjectStatus = "running"
	StatusStopped  ProjectStatus = "stopped"
	StatusBuilding ProjectStatus = "building"
	StatusFailed   ProjectStatus = "failed"
	StatusUnknown  ProjectStatus = "unknown"
)

type DeployRecord struct {
	SHA        string  `json:"sha"`
	At         string  `json:"at"`
	OK         bool    `json:"ok"`
	DurationMs int64   `json:"durationMs"`
	Error      *string `json:"error"`
}

type ProjectState struct {
	Name              string        `json:"name"`
	AppDir            string        `json:"appDir"`    // e.g. /obstetrix-projects/api
	AppUser           string        `json:"appUser"`   // e.g. obstetrix-api
	WorkDir           string        `json:"workDir"`
	Status            ProjectStatus `json:"status"`
	RepoURL           string        `json:"repoUrl"`
	TargetBranch      string        `json:"targetBranch"`
	CurrentSHA        *string       `json:"currentSha"`
	PreviousSHA       *string       `json:"previousSha"`
	LastDeployAt      *string       `json:"lastDeployAt"`
	LastDeployOK      *bool         `json:"lastDeployOk"`
	LastHealthCheckAt *string       `json:"lastHealthCheckAt"`
	BasePort          int           `json:"basePort"`
	PortCount         int           `json:"portCount"`
	Instances         int           `json:"instances"`
	RunningPorts      []int         `json:"runningPorts"`
	DefaultInstances  int           `json:"defaultInstances"`
	HealthCheckURL    *string       `json:"healthCheckUrl"`
	PersistentDirs    []string      `json:"persistentDirs"`
	DeployHistory     []DeployRecord `json:"deployHistory"`
}

type BuildEventType string

const (
	EventLog            BuildEventType = "log"
	EventStatus         BuildEventType = "status"
	EventDeployComplete BuildEventType = "deploy_complete"
)

type BuildEvent struct {
	Type        BuildEventType `json:"type"`
	ProjectName string         `json:"projectName"`
	Line        string         `json:"line,omitempty"`
	Level       string         `json:"level,omitempty"`
	Status      ProjectStatus  `json:"status,omitempty"`
	SHA         string         `json:"sha,omitempty"`
	OK          bool           `json:"ok,omitempty"`
	DurationMs  int64          `json:"durationMs,omitempty"`
	Ts          string         `json:"ts"`
}

type DeployLogMeta struct {
	DeployID  string  `json:"deployId"`
	Project   string  `json:"project"`
	SHA       string  `json:"sha"`
	StartedAt string  `json:"startedAt"`
	OK        *bool   `json:"ok"`
	DurationMs int64  `json:"durationMs"`
	Path      string  `json:"path"`
}

type DeployLogEntry struct {
	Ts         string  `json:"ts"`
	Type       string  `json:"type"`
	Line       string  `json:"line,omitempty"`
	Level      string  `json:"level,omitempty"`
	SHA        string  `json:"sha,omitempty"`
	Project    string  `json:"project,omitempty"`
	OK         *bool   `json:"ok,omitempty"`
	DurationMs int64   `json:"durationMs,omitempty"`
	Error      string  `json:"error,omitempty"`
}

type PortEntry struct {
	Name  string `json:"name"`
	Base  int    `json:"base"`
	Count int    `json:"count"`
	Ports []int  `json:"ports"`
}

// ProjectConfigEqual uses reflect.DeepEqual to handle slice fields correctly.
func ProjectConfigEqual(a, b *ProjectConfig) bool {
	return reflect.DeepEqual(a, b)
}
