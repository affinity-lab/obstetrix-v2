package commands

import (
	"encoding/json"
	"fmt"
)

func Config(socketPath string, args []string) error {
	if len(args) == 0 {
		return fmt.Errorf("usage: obstetrix-ctl config reload")
	}

	switch args[0] {
	case "reload":
		client, err := Dial(socketPath)
		if err != nil {
			return err
		}
		defer client.Close()

		result, err := client.Call("config.reload", nil)
		if err != nil {
			return err
		}

		var r struct {
			Reloaded int `json:"reloaded"`
		}
		json.Unmarshal(result, &r)
		fmt.Printf("reloaded %d project config(s)\n", r.Reloaded)
		return nil

	default:
		return fmt.Errorf("unknown config subcommand: %s", args[0])
	}
}
