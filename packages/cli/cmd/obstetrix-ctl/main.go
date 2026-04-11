package main

import (
	"fmt"
	"os"

	"github.com/yourorg/obstetrix/cli/cmd/obstetrix-ctl/commands"
)

const defaultSocket = "/run/obstetrix/orchestrator.sock"

func main() {
	if len(os.Args) < 2 {
		printUsage()
		os.Exit(1)
	}

	socketPath := defaultSocket
	// Allow override via env var
	if v := os.Getenv("OBSTETRIX_SOCKET"); v != "" {
		socketPath = v
	}

	cmd := os.Args[1]
	args := os.Args[2:]

	var err error
	switch cmd {
	case "status":
		err = commands.Status(socketPath, args)
	case "deploy":
		err = commands.Deploy(socketPath, args)
	case "rollback":
		err = commands.Rollback(socketPath, args)
	case "logs":
		err = commands.Logs(socketPath, args)
	case "config":
		err = commands.Config(socketPath, args)
	case "shell":
		err = commands.Shell(args)
	case "scale":
		err = commands.Scale(socketPath, args)
	case "project":
		if len(args) == 0 {
			err = fmt.Errorf("usage: obstetrix-ctl project create|delete <name>")
		} else {
			switch args[0] {
			case "create":
				err = commands.ProjectCreate(socketPath, args[1:])
			case "delete":
				err = commands.ProjectDelete(socketPath, args[1:])
			default:
				err = fmt.Errorf("unknown project subcommand: %s", args[0])
			}
		}
	case "port":
		if len(args) > 0 && args[0] == "list" {
			err = commands.PortList(socketPath, args[1:])
		} else {
			err = fmt.Errorf("usage: obstetrix-ctl port list")
		}
	case "help", "--help", "-h":
		printUsage()
	default:
		fmt.Fprintf(os.Stderr, "unknown command: %s\n\n", cmd)
		printUsage()
		os.Exit(1)
	}

	if err != nil {
		fmt.Fprintf(os.Stderr, "error: %v\n", err)
		os.Exit(1)
	}
}

func printUsage() {
	fmt.Print(`obstetrix-ctl — obstetrix CI/CD CLI

Usage:
  obstetrix-ctl status [project]                        Show status of all or one project
  obstetrix-ctl deploy <project> [--sha SHA]            Trigger a deploy
  obstetrix-ctl rollback <project>                      Rollback to previous SHA
  obstetrix-ctl logs <project> [--follow]               Show recent logs; --follow streams live
  obstetrix-ctl scale <project> <instances>             Scale project to N instances
  obstetrix-ctl config reload                           Reload project configs from /etc/obstetrix/projects/
  obstetrix-ctl shell <project>                         Open an interactive shell as the project user
  obstetrix-ctl project create <name> [--ports N]       Create a project (auto-assigns port pool)
  obstetrix-ctl project delete <name>                   Delete a project
  obstetrix-ctl port list                               List all port assignments

Environment:
  OBSTETRIX_SOCKET   Path to orchestrator Unix socket (default: /run/obstetrix/orchestrator.sock)

Flags available on all commands:
  --json         Output raw JSON instead of formatted text
`)
}
