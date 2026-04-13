import net from 'net';
import readline from 'readline';
import { EventEmitter } from 'events';
import type { GuiServerConfig } from '../index.js';

type PendingCall = {
  resolve: (result: unknown) => void;
  reject:  (err: Error) => void;
};

/**
 * SocketClientService maintains a persistent connection to the orchestrator's
 * Unix domain socket. It multiplexes JSON-RPC requests by id and handles
 * reconnection automatically.
 *
 * Stream frames (stream: true) are emitted as 'stream' events on the
 * EventEmitter so subscribers (SSE routes) can listen.
 */
export class SocketClientService extends EventEmitter {
  private socket:   net.Socket | null = null;
  private pending:  Map<number, PendingCall> = new Map();
  private idCounter = 0;
  private socketPath: string;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(cfg: GuiServerConfig) {
    super();
    this.socketPath = cfg.socket.path;
    this.connect();
  }

  private connect() {
    let sock: net.Socket;
    try {
      sock = net.createConnection(this.socketPath);
    } catch (err) {
      console.error('[socket] connect failed:', (err as Error).message);
      this.scheduleReconnect();
      return;
    }
    this.socket = sock;

    const rl = readline.createInterface({ input: sock });

    rl.on('line', (line) => {
      let msg: Record<string, unknown>;
      try { msg = JSON.parse(line); }
      catch { return; }

      // Stream frame — no id, has stream: true
      if (msg['stream'] === true) {
        this.emit('stream', msg['event']);
        return;
      }

      // RPC response — has id
      const id = msg['id'] as number;
      const pending = this.pending.get(id);
      if (!pending) return;
      this.pending.delete(id);

      if (msg['error']) {
        const e = msg['error'] as { message: string; code: number };
        pending.reject(new Error(`RPC ${e.code}: ${e.message}`));
      } else {
        pending.resolve(msg['result']);
      }
    });

    sock.on('error', (err) => {
      console.error('[socket] error:', err.message);
      this.scheduleReconnect();
    });

    sock.on('close', () => {
      // Reject all pending calls
      for (const [, p] of this.pending) {
        p.reject(new Error('socket closed'));
      }
      this.pending.clear();
      this.scheduleReconnect();
    });
  }

  private scheduleReconnect() {
    if (this.reconnectTimer) return;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, 2000);
  }

  call<T = unknown>(method: string, params: unknown = null): Promise<T> {
    return new Promise((resolve, reject) => {
      if (!this.socket || this.socket.destroyed) {
        return reject(new Error('socket not connected'));
      }
      const id = ++this.idCounter;
      this.pending.set(id, {
        resolve: resolve as (r: unknown) => void,
        reject,
      });
      const msg = JSON.stringify({ id, method, params }) + '\n';
      this.socket.write(msg, 'utf8', (err) => {
        if (err) {
          this.pending.delete(id);
          reject(err);
        }
      });
    });
  }

  /** Subscribe to stream events for a project. Returns an unsubscribe fn. */
  subscribe(projectName: string, handler: (event: unknown) => void): () => void {
    const fn = (event: unknown) => {
      const e = event as { projectName?: string };
      if (e.projectName === projectName || !projectName) {
        handler(event);
      }
    };
    this.on('stream', fn);
    return () => this.off('stream', fn);
  }
}
