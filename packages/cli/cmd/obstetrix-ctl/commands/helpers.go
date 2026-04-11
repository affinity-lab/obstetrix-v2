package commands

import "strings"

// These types mirror packages/shared/src/types.ts exactly.
type ContainerStatus string

type ProjectState struct {
	Name             string          `json:"name"`
	Status           ContainerStatus `json:"status"`
	AppDir           string          `json:"appDir"`
	AppUser          string          `json:"appUser"`
	WorkDir          string          `json:"workDir"`
	RepoURL          string          `json:"repoUrl"`
	TargetBranch     string          `json:"targetBranch"`
	CurrentSHA       *string         `json:"currentSha"`
	PreviousSHA      *string         `json:"previousSha"`
	LastDeployAt     *string         `json:"lastDeployAt"`
	LastDeployOK     *bool           `json:"lastDeployOk"`
	BasePort         int             `json:"basePort"`
	PortCount        int             `json:"portCount"`
	Instances        int             `json:"instances"`
	RunningPorts     []int           `json:"runningPorts"`
	DefaultInstances int             `json:"defaultInstances"`
	DeployHistory    []DeployRecord  `json:"deployHistory"`
}

type DeployRecord struct {
	SHA        string `json:"sha"`
	At         string `json:"at"`
	OK         bool   `json:"ok"`
	DurationMs int64  `json:"durationMs"`
	Error      string `json:"error"`
}

type BuildEvent struct {
	Type        string `json:"type"`
	ProjectName string `json:"projectName"`
	Line        string `json:"line"`
	Status      string `json:"status"`
	SHA         string `json:"sha"`
	OK          bool   `json:"ok"`
	DurationMs  int64  `json:"durationMs"`
	Ts          string `json:"ts"`
}

type DeployLogMeta struct {
	DeployID   string `json:"deployId"`
	Project    string `json:"project"`
	SHA        string `json:"sha"`
	StartedAt  string `json:"startedAt"`
	OK         *bool  `json:"ok"`
	DurationMs int64  `json:"durationMs"`
	Path       string `json:"path"`
}

func hasFlag(args []string, flag string) bool {
	for _, a := range args {
		if a == flag {
			return true
		}
	}
	return false
}

func flagValue(args []string, flag string) string {
	for i, a := range args {
		if a == flag && i+1 < len(args) {
			return args[i+1]
		}
		if strings.HasPrefix(a, flag+"=") {
			return strings.TrimPrefix(a, flag+"=")
		}
	}
	return ""
}
