package modules

import (
	"context"
	"fmt"
	"net/http"
	"time"
)

type HealthModule struct{}

func newHealthModule() *HealthModule { return &HealthModule{} }

// Check polls the URL until it returns HTTP 200 or the timeout elapses.
// Waits 1 second before the first check (minimum cool-down after systemctl restart).
// Polls every second thereafter.
func (h *HealthModule) Check(ctx context.Context, url string, timeoutSeconds int) error {
	if timeoutSeconds <= 0 {
		timeoutSeconds = 60
	}
	deadline := time.Now().Add(time.Duration(timeoutSeconds) * time.Second)
	client := &http.Client{Timeout: 5 * time.Second}

	time.Sleep(1 * time.Second)

	for {
		resp, err := client.Get(url)
		if err == nil {
			resp.Body.Close()
			if resp.StatusCode == 200 {
				return nil
			}
		}
		if time.Now().After(deadline) {
			return fmt.Errorf("health check timed out after %ds: %s", timeoutSeconds, url)
		}
		select {
		case <-ctx.Done():
			return ctx.Err()
		case <-time.After(1 * time.Second):
		}
	}
}
