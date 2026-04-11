package commands

import (
	"encoding/json"
	"fmt"
)

func Deploy(socketPath string, args []string) error {
	if len(args) == 0 {
		return fmt.Errorf("usage: obstetrix-ctl deploy <project> [--sha SHA]")
	}
	name := args[0]
	sha := flagValue(args, "--sha")

	client, err := Dial(socketPath)
	if err != nil {
		return err
	}
	defer client.Close()

	params := map[string]any{"name": name}
	if sha != "" {
		params["sha"] = sha
	}

	result, err := client.Call("deploy.trigger", params)
	if err != nil {
		return err
	}

	var r struct {
		Queued bool `json:"queued"`
	}
	json.Unmarshal(result, &r)
	if r.Queued {
		fmt.Printf("deploy queued for %s\n", name)
		fmt.Printf("watch logs: obstetrix-ctl logs %s --follow\n", name)
	}
	return nil
}
