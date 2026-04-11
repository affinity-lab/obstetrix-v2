package main

import (
	"context"
	"flag"
	"log/slog"
	"os"
	"os/signal"
	"syscall"

	"github.com/yourorg/obstetrix/orchestrator/internal/config"
	"github.com/yourorg/obstetrix/orchestrator/internal/modules"
	"github.com/yourorg/obstetrix/orchestrator/internal/services"
)

func main() {
	configRoot := flag.String("config-root", "/etc/obstetrix", "platform config root directory")
	flag.Parse()

	paths := config.NewPaths(*configRoot)

	if err := config.EnsureDirs(*configRoot, "/obstetrix-projects"); err != nil {
		slog.Error("failed to create required directories", "err", err)
		os.Exit(1)
	}

	cfg, err := config.Load(paths)
	if err != nil {
		slog.Error("config load failed", "err", err)
		os.Exit(1)
	}

	// Also ensure dirs with configured projectsDir
	if err := config.EnsureDirs(*configRoot, cfg.Projects.Dir); err != nil {
		slog.Error("failed to create project directories", "err", err)
		os.Exit(1)
	}

	slog.SetDefault(slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{
		Level: cfg.LogLevel,
	})))

	svcs := services.Create(cfg, paths)
	mods := modules.Create(svcs)

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	go svcs.Socket.Serve(ctx, mods.RPC.Dispatch)
	go svcs.ConfigWatcher.Watch(ctx, mods.Poller.OnConfigChange, mods.Backup.ScheduleAll)
	go mods.Poller.Run(ctx)
	go mods.Poller.WatchServiceHealth(ctx)

	slog.Info("obstetrix-orchestratord started",
		"config-root", *configRoot,
		"socket", cfg.Socket.Path,
	)

	sig := make(chan os.Signal, 1)
	signal.Notify(sig, syscall.SIGTERM, syscall.SIGINT)
	<-sig
	slog.Info("shutting down")
	cancel()
}
