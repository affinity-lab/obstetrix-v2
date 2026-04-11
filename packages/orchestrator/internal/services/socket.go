package services

import (
	"context"
	"log/slog"
	"net"
	"os"
	"os/user"
	"strconv"
	"time"

	"github.com/yourorg/obstetrix/orchestrator/internal/config"
)

type SocketService struct{ cfg config.SocketConfig }

func newSocketService(cfg config.SocketConfig) *SocketService { return &SocketService{cfg: cfg} }

// Serve listens on the Unix domain socket and dispatches each connection to dispatchFn.
// Each connection has a 5-minute idle deadline — renewed by the RPC handler on every message.
func (s *SocketService) Serve(ctx context.Context, dispatchFn func(net.Conn)) {
	_ = os.Remove(s.cfg.Path)
	ln, err := net.Listen("unix", s.cfg.Path)
	if err != nil {
		slog.Error("socket listen failed", "path", s.cfg.Path, "err", err)
		return
	}
	// Allow the obstetrix group (GUI user) to connect
	os.Chmod(s.cfg.Path, 0660)
	if grp, err := user.LookupGroup("obstetrix"); err == nil {
		if gid, err := strconv.Atoi(grp.Gid); err == nil {
			os.Lchown(s.cfg.Path, 0, gid)
		}
	}
	defer ln.Close()

	go func() { <-ctx.Done(); ln.Close() }()

	for {
		conn, err := ln.Accept()
		if err != nil {
			if ctx.Err() != nil {
				return
			}
			slog.Warn("socket accept error", "err", err)
			continue
		}
		conn.SetDeadline(time.Now().Add(5 * time.Minute))
		go dispatchFn(conn)
	}
}
