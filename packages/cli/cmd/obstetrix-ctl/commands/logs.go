package commands

import (
	"encoding/json"
	"fmt"
	"os"
	"os/signal"
	"syscall"
)

func Logs(socketPath string, args []string) error {
	if len(args) == 0 {
		return fmt.Errorf("usage: obstetrix-ctl logs <project> [--follow]")
	}
	name := args[0]
	follow := hasFlag(args, "--follow")

	client, err := Dial(socketPath)
	if err != nil {
		return err
	}
	defer client.Close()

	if !follow {
		// Show deploy history from status
		result, err := client.Call("status.project", map[string]string{"name": name})
		if err != nil {
			return err
		}
		var st ProjectState
		json.Unmarshal(result, &st)
		if len(st.DeployHistory) == 0 {
			fmt.Println("no deploy history")
			return nil
		}
		for _, r := range st.DeployHistory {
			sha := r.SHA
			if len(sha) > 8 {
				sha = sha[:8]
			}
			fmt.Printf("[%s] sha=%s ok=%v duration=%dms\n", r.At, sha, r.OK, r.DurationMs)
		}
		return nil
	}

	// Streaming mode
	fmt.Printf("streaming logs for %s (Ctrl-C to stop)...\n", name)

	sig := make(chan os.Signal, 1)
	signal.Notify(sig, syscall.SIGTERM, syscall.SIGINT)
	done := make(chan struct{})

	go func() {
		defer close(done)
		client.Stream("logs.subscribe", map[string]string{"name": name}, func(raw json.RawMessage) {
			var event BuildEvent
			if err := json.Unmarshal(raw, &event); err != nil {
				return
			}
			switch event.Type {
			case "log":
				fmt.Printf("[%s] %s\n", event.Ts, event.Line)
			case "status":
				fmt.Printf("[%s] status → %s\n", event.Ts, event.Status)
			case "deploy_complete":
				ok := "OK"
				if !event.OK {
					ok = "FAILED"
				}
				sha := event.SHA
				if len(sha) > 8 {
					sha = sha[:8]
				}
				fmt.Printf("[%s] deploy %s  sha=%s  duration=%dms\n",
					event.Ts, ok, sha, event.DurationMs)
			}
		})
	}()

	select {
	case <-sig:
	case <-done:
	}
	return nil
}
