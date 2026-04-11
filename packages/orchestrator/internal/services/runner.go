package services

import (
	"context"
	"fmt"
	"io"
	"os/exec"
	"strings"

	"github.com/yourorg/obstetrix/orchestrator/internal/config"
)

// RunnerService executes shell commands on the host as the project system user.
// Isolation comes from Linux user separation and systemd service hardening directives.
type RunnerService struct {
	projectsDir string
}

func newRunnerService(cfg config.ProjectsConfig) *RunnerService {
	return &RunnerService{projectsDir: cfg.Dir}
}

// RunResult holds the outcome of a command.
type RunResult struct {
	ExitCode int
	Output   string
}

// Run executes shellCmd as appUser in the project's app directory.
// stdout and stderr are merged and written to logWriter line-by-line.
// Uses: sudo -u {appUser} -H bash --login -c "{shellCmd}"
func (r *RunnerService) Run(ctx context.Context, proj *config.ProjectConfig, shellCmd string, logWriter io.Writer) (*RunResult, error) {
	cmd := exec.CommandContext(ctx, "sudo", "-u", proj.AppUser, "-H",
		"bash", "--login", "-c", shellCmd)
	cmd.Dir = proj.AppDir

	var out strings.Builder
	if logWriter != nil {
		cmd.Stdout = io.MultiWriter(&out, logWriter)
		cmd.Stderr = io.MultiWriter(&out, logWriter)
	} else {
		cmd.Stdout = &out
		cmd.Stderr = &out
	}

	err := cmd.Run()
	exitCode := 0
	if err != nil {
		if exitErr, ok := err.(*exec.ExitError); ok {
			exitCode = exitErr.ExitCode()
		} else {
			return nil, fmt.Errorf("run as %s: %w", proj.AppUser, err)
		}
	}
	return &RunResult{ExitCode: exitCode, Output: out.String()}, nil
}

// RunAsRoot executes a command as root (for systemctl operations on project units,
// which are host-level system services).
func (r *RunnerService) RunAsRoot(ctx context.Context, shellCmd string, logWriter io.Writer) (*RunResult, error) {
	cmd := exec.CommandContext(ctx, "bash", "-c", shellCmd)
	var out strings.Builder
	if logWriter != nil {
		cmd.Stdout = io.MultiWriter(&out, logWriter)
		cmd.Stderr = io.MultiWriter(&out, logWriter)
	} else {
		cmd.Stdout = &out
		cmd.Stderr = &out
	}
	err := cmd.Run()
	exitCode := 0
	if err != nil {
		if exitErr, ok := err.(*exec.ExitError); ok {
			exitCode = exitErr.ExitCode()
		} else {
			return nil, fmt.Errorf("runAsRoot: %w", err)
		}
	}
	return &RunResult{ExitCode: exitCode, Output: out.String()}, nil
}

// ServiceActive returns true if a systemd service is active (running) on the host.
func (r *RunnerService) ServiceActive(serviceName string) bool {
	cmd := exec.Command("systemctl", "is-active", "--quiet", serviceName)
	return cmd.Run() == nil
}

// ProjectsDir returns the configured root for project deploy directories.
func (r *RunnerService) ProjectsDir() string { return r.projectsDir }
