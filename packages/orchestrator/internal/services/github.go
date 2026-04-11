package services

import (
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/yourorg/obstetrix/orchestrator/internal/config"
)

type GitHubService struct {
	token        string
	pollInterval time.Duration
	client       *http.Client
}

func newGitHubService(cfg config.GitHubConfig) *GitHubService {
	return &GitHubService{
		token:        cfg.Token,
		pollInterval: cfg.PollInterval,
		client:       &http.Client{Timeout: cfg.RequestTimeout},
	}
}

func (g *GitHubService) PollInterval() time.Duration { return g.pollInterval }

// HeadSHA returns the current HEAD SHA of a branch on a GitHub repository.
// Uses Accept: application/vnd.github.sha for a minimal plain-text response.
// repoURL is https://github.com/{owner}/{repo}[.git]
func (g *GitHubService) HeadSHA(repoURL, branch string) (string, error) {
	repoURL = strings.TrimSuffix(strings.TrimSuffix(repoURL, "/"), ".git")
	parts := strings.Split(repoURL, "/")
	if len(parts) < 2 {
		return "", fmt.Errorf("invalid repo URL: %s", repoURL)
	}
	owner, repo := parts[len(parts)-2], parts[len(parts)-1]

	apiURL := fmt.Sprintf("https://api.github.com/repos/%s/%s/commits/%s", owner, repo, branch)
	req, _ := http.NewRequest("GET", apiURL, nil)
	req.Header.Set("Authorization", "Bearer "+g.token)
	req.Header.Set("Accept", "application/vnd.github.sha")

	resp, err := g.client.Do(req)
	if err != nil {
		return "", fmt.Errorf("github poll: %w", err)
	}
	defer resp.Body.Close()
	if resp.StatusCode != 200 {
		return "", fmt.Errorf("github poll: HTTP %d for %s@%s", resp.StatusCode, repo, branch)
	}

	var buf [64]byte
	n, _ := resp.Body.Read(buf[:])
	sha := strings.TrimSpace(string(buf[:n]))
	if len(sha) < 40 {
		return "", fmt.Errorf("github poll: unexpected response %q", sha)
	}
	return sha, nil
}
