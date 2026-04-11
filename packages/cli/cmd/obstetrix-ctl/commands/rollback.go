package commands

import (
	"encoding/json"
	"fmt"
)

func Rollback(socketPath string, args []string) error {
	if len(args) == 0 {
		return fmt.Errorf("usage: obstetrix-ctl rollback <project>")
	}
	name := args[0]

	client, err := Dial(socketPath)
	if err != nil {
		return err
	}
	defer client.Close()

	result, err := client.Call("deploy.rollback", map[string]string{"name": name})
	if err != nil {
		return err
	}

	var r struct {
		OK bool `json:"ok"`
	}
	json.Unmarshal(result, &r)
	if r.OK {
		fmt.Printf("rollback queued for %s\n", name)
		fmt.Printf("watch logs: obstetrix-ctl logs %s --follow\n", name)
	}
	return nil
}
