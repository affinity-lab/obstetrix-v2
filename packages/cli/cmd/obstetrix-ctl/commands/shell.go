package commands

import (
	"fmt"
	"os"
	"os/exec"
)

// Shell opens an interactive shell as the project's system user.
// Does not go through the orchestrator socket — calls sudo directly.
func Shell(args []string) error {
	if len(args) == 0 {
		return fmt.Errorf("usage: obstetrix-ctl shell <project>")
	}
	name := args[0]
	user := "obstetrix-" + name
	workDir := "/obstetrix-projects/" + name

	cmd := exec.Command("sudo", "-u", user, "-i", "--",
		"bash", "--login", "-c", "cd "+workDir+" && exec bash")
	cmd.Stdin = os.Stdin
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr

	if err := cmd.Run(); err != nil {
		return fmt.Errorf("shell as %s: %w", user, err)
	}
	return nil
}
