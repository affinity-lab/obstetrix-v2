package modules

import (
	"syscall"

	"github.com/yourorg/obstetrix/orchestrator/internal/services"
)

type SystemModule struct{ svcs *services.Services }

func newSystemModule(svcs *services.Services) *SystemModule { return &SystemModule{svcs: svcs} }

type DiskInfo struct {
	Label   string  `json:"label"`
	Path    string  `json:"path"`
	TotalGB float64 `json:"totalGb"`
	UsedGB  float64 `json:"usedGb"`
	FreeGB  float64 `json:"freeGb"`
	UsedPct float64 `json:"usedPct"`
}

func (s *SystemModule) DiskInfo() ([]DiskInfo, error) {
	paths := []struct{ path, label string }{
		{"/var/obstetrix", "obstetrix data"},
		{"/var/obstetrix/backups", "backups"},
		{s.svcs.Runner.ProjectsDir(), "apps"},
		{s.svcs.ConfigRW.Paths().Root, "config"},
	}
	var result []DiskInfo
	for _, p := range paths {
		info, err := diskUsage(p.path)
		if err != nil {
			continue
		}
		info.Label = p.label
		result = append(result, info)
	}
	return result, nil
}

func diskUsage(path string) (DiskInfo, error) {
	var stat syscall.Statfs_t
	if err := syscall.Statfs(path, &stat); err != nil {
		return DiskInfo{}, err
	}
	block := uint64(stat.Bsize)
	total := float64(stat.Blocks * block)
	free := float64(stat.Bfree * block)
	used := total - free
	return DiskInfo{
		Path: path, TotalGB: total / 1e9, UsedGB: used / 1e9,
		FreeGB: free / 1e9, UsedPct: used / total * 100,
	}, nil
}
