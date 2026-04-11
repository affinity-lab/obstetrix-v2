package commands

import (
	"encoding/json"
	"fmt"
)

func ProjectCreate(socketPath string, args []string) error {
	if len(args) == 0 {
		return fmt.Errorf("usage: obstetrix-ctl project create <name> [--ports N]")
	}
	name := args[0]
	portCount := 4 // default
	if v := flagValue(args, "--ports"); v != "" {
		if _, err := fmt.Sscan(v, &portCount); err != nil || portCount < 1 {
			return fmt.Errorf("--ports must be a positive integer")
		}
	}

	client, err := Dial(socketPath)
	if err != nil {
		return err
	}
	defer client.Close()

	result, err := client.Call("config.createProject", map[string]any{
		"name":  name,
		"ports": portCount,
	})
	if err != nil {
		return err
	}

	var r struct {
		Name     string `json:"name"`
		BasePort int    `json:"basePort"`
		Ports    int    `json:"ports"`
	}
	json.Unmarshal(result, &r)
	fmt.Printf("project '%s' created — base port %d, count %d (ports %d–%d)\n",
		name, r.BasePort, r.Ports, r.BasePort, r.BasePort+r.Ports-1)
	fmt.Printf("next: edit /etc/obstetrix/projects/%s/project.conf then trigger a deploy\n", name)
	return nil
}

func ProjectDelete(socketPath string, args []string) error {
	if len(args) == 0 {
		return fmt.Errorf("usage: obstetrix-ctl project delete <name>")
	}
	name := args[0]
	removeData := hasFlag(args, "--remove-data")

	client, err := Dial(socketPath)
	if err != nil {
		return err
	}
	defer client.Close()

	result, err := client.Call("config.deleteProject", map[string]any{
		"name":       name,
		"removeData": removeData,
	})
	if err != nil {
		return err
	}

	var r struct {
		OK bool `json:"ok"`
	}
	json.Unmarshal(result, &r)
	fmt.Printf("project '%s' deleted\n", name)
	return nil
}

func PortList(socketPath string, args []string) error {
	client, err := Dial(socketPath)
	if err != nil {
		return err
	}
	defer client.Close()

	result, err := client.Call("port.list", nil)
	if err != nil {
		return err
	}

	if hasFlag(args, "--json") {
		fmt.Println(string(result))
		return nil
	}

	var ports []struct {
		Name  string `json:"name"`
		Base  int    `json:"base"`
		Count int    `json:"count"`
	}
	json.Unmarshal(result, &ports)

	if len(ports) == 0 {
		fmt.Println("no port assignments")
		return nil
	}

	for _, p := range ports {
		fmt.Printf("%-20s  base=%-5d  count=%-3d  range=%d–%d\n",
			p.Name, p.Base, p.Count, p.Base, p.Base+p.Count-1)
	}
	return nil
}
