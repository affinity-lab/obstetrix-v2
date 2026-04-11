package commands

import (
	"bufio"
	"encoding/json"
	"fmt"
	"net"
	"sync/atomic"
	"time"
)

var idCounter atomic.Int64

type RPCClient struct {
	conn net.Conn
	enc  *json.Encoder
	dec  *bufio.Scanner
}

func Dial(socketPath string) (*RPCClient, error) {
	conn, err := net.DialTimeout("unix", socketPath, 3*time.Second)
	if err != nil {
		return nil, fmt.Errorf("cannot connect to orchestrator at %s\n"+
			"  Is obstetrix-orchestratord running? Check: systemctl status obstetrix-orchestratord\n"+
			"  Error: %w", socketPath, err)
	}
	return &RPCClient{
		conn: conn,
		enc:  json.NewEncoder(conn),
		dec:  bufio.NewScanner(conn),
	}, nil
}

func (c *RPCClient) Close() { c.conn.Close() }

// Call sends a single RPC request and returns the result.
func (c *RPCClient) Call(method string, params any) (json.RawMessage, error) {
	id := idCounter.Add(1)

	req := map[string]any{
		"id":     id,
		"method": method,
		"params": params,
	}
	if err := c.enc.Encode(req); err != nil {
		return nil, fmt.Errorf("send: %w", err)
	}

	if !c.dec.Scan() {
		return nil, fmt.Errorf("no response from orchestrator")
	}

	var resp struct {
		ID     int64           `json:"id"`
		Result json.RawMessage `json:"result"`
		Error  *struct {
			Code    int    `json:"code"`
			Message string `json:"message"`
		} `json:"error"`
	}
	if err := json.Unmarshal(c.dec.Bytes(), &resp); err != nil {
		return nil, fmt.Errorf("decode response: %w", err)
	}
	if resp.Error != nil {
		return nil, fmt.Errorf("rpc error %d: %s", resp.Error.Code, resp.Error.Message)
	}
	return resp.Result, nil
}

// Stream sends an RPC request that starts a stream, then calls onFrame for
// each streamed frame until the connection closes.
func (c *RPCClient) Stream(method string, params any, onFrame func(json.RawMessage)) error {
	if _, err := c.Call(method, params); err != nil {
		return err
	}

	for c.dec.Scan() {
		var frame struct {
			Stream bool            `json:"stream"`
			Event  json.RawMessage `json:"event"`
		}
		if err := json.Unmarshal(c.dec.Bytes(), &frame); err != nil {
			continue
		}
		if frame.Stream {
			onFrame(frame.Event)
		}
	}
	return nil
}
