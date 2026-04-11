package commands

import (
	"encoding/json"
	"fmt"
	"os"
	"strings"
	"text/tabwriter"
	"time"
)

func Status(socketPath string, args []string) error {
	jsonMode := hasFlag(args, "--json")
	client, err := Dial(socketPath)
	if err != nil {
		return err
	}
	defer client.Close()

	if len(args) > 0 && !strings.HasPrefix(args[0], "--") {
		// Single project
		result, err := client.Call("status.project", map[string]string{"name": args[0]})
		if err != nil {
			return err
		}
		if jsonMode {
			fmt.Println(string(result))
			return nil
		}
		var st ProjectState
		json.Unmarshal(result, &st)
		printProjectDetail(st)
		return nil
	}

	// All projects
	result, err := client.Call("status.all", nil)
	if err != nil {
		return err
	}
	if jsonMode {
		fmt.Println(string(result))
		return nil
	}

	var states []ProjectState
	json.Unmarshal(result, &states)

	if len(states) == 0 {
		fmt.Println("no projects configured")
		return nil
	}

	w := tabwriter.NewWriter(os.Stdout, 0, 0, 2, ' ', 0)
	fmt.Fprintln(w, "PROJECT\tSTATUS\tSHA\tLAST DEPLOY\t")
	for _, st := range states {
		sha := "—"
		if st.CurrentSHA != nil {
			s := *st.CurrentSHA
			if len(s) > 8 {
				s = s[:8]
			}
			sha = s
		}
		lastDeploy := "never"
		if st.LastDeployAt != nil {
			t, _ := time.Parse(time.RFC3339, *st.LastDeployAt)
			lastDeploy = time.Since(t).Round(time.Second).String() + " ago"
		}
		status := statusIcon(st.Status) + " " + string(st.Status)
		fmt.Fprintf(w, "%s\t%s\t%s\t%s\t\n", st.Name, status, sha, lastDeploy)
	}
	w.Flush()
	return nil
}

func statusIcon(s ContainerStatus) string {
	switch s {
	case "running":
		return "●"
	case "building":
		return "◌"
	case "failed":
		return "✗"
	case "stopped":
		return "○"
	default:
		return "?"
	}
}

func printProjectDetail(st ProjectState) {
	fmt.Printf("Project:    %s\n", st.Name)
	fmt.Printf("Status:     %s %s\n", statusIcon(st.Status), st.Status)
	if st.CurrentSHA != nil {
		fmt.Printf("SHA:        %s\n", *st.CurrentSHA)
	}
	if st.LastDeployAt != nil {
		fmt.Printf("Deployed:   %s\n", *st.LastDeployAt)
	}
	if st.LastDeployOK != nil {
		ok := "yes"
		if !*st.LastDeployOK {
			ok = "no"
		}
		fmt.Printf("Deploy OK:  %s\n", ok)
	}
	if len(st.DeployHistory) > 0 {
		fmt.Println("\nDeploy history:")
		for _, r := range st.DeployHistory {
			mark := "✓"
			if !r.OK {
				mark = "✗"
			}
			sha := r.SHA
			if len(sha) > 8 {
				sha = sha[:8]
			}
			fmt.Printf("  %s  %s  %s  (%dms)\n", mark, sha, r.At, r.DurationMs)
		}
	}
}
