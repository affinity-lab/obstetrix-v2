package commands

import (
	"encoding/json"
	"fmt"
)

func Scale(socketPath string, args []string) error {
	if len(args) < 2 {
		return fmt.Errorf("usage: obstetrix-ctl scale <project> <instances>")
	}
	name := args[0]
	var instances int
	if _, err := fmt.Sscan(args[1], &instances); err != nil || instances < 1 {
		return fmt.Errorf("instances must be a positive integer")
	}

	client, err := Dial(socketPath)
	if err != nil {
		return err
	}
	defer client.Close()

	result, err := client.Call("scale.set", map[string]any{
		"name":      name,
		"instances": instances,
	})
	if err != nil {
		return err
	}

	var r struct {
		Instances int   `json:"instances"`
		Ports     []int `json:"ports"`
	}
	json.Unmarshal(result, &r)
	fmt.Printf("scaled %s to %d instance(s), ports: %v\n", name, r.Instances, r.Ports)
	return nil
}
