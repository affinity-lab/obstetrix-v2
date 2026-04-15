import path, { join } from "path";
import { fileURLToPath } from "url";
import { readFileSync } from "fs";
import net from "net";
import readline from "readline";
import { EventEmitter } from "events";
class Env {
  data = /* @__PURE__ */ new Map();
  constructor(rootDir) {
    const envPath = join(rootDir, ".env");
    try {
      const content = readFileSync(envPath, "utf-8");
      for (const line of content.split("\n")) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const eqIdx = trimmed.indexOf("=");
        if (eqIdx < 0) continue;
        const key = trimmed.slice(0, eqIdx).trim();
        const value = trimmed.slice(eqIdx + 1).trim();
        this.data.set(key, value);
      }
    } catch {
    }
    for (const [key, value] of Object.entries(process.env)) {
      if (typeof value === "string") {
        this.data.set(key, value);
      }
    }
  }
  string(key, defaultValue) {
    return this.data.get(key) ?? defaultValue;
  }
  number(key, defaultValue) {
    const raw = this.data.get(key);
    if (raw === void 0) return defaultValue;
    const n = Number(raw);
    return isNaN(n) ? defaultValue : n;
  }
  boolean(key, defaultValue) {
    const raw = this.data.get(key)?.toLowerCase();
    if (raw === void 0) return defaultValue;
    if (raw === "true" || raw === "1" || raw === "yes") return true;
    if (raw === "false" || raw === "0" || raw === "no") return false;
    return defaultValue;
  }
}
class SocketClientService extends EventEmitter {
  socket = null;
  pending = /* @__PURE__ */ new Map();
  idCounter = 0;
  socketPath;
  reconnectTimer = null;
  constructor(cfg) {
    super();
    this.socketPath = cfg.socket.path;
    this.connect();
  }
  connect() {
    const sock = new net.Socket();
    this.socket = sock;
    sock.on("error", (err) => {
      console.error("[socket] error:", err.message);
      this.socket = null;
      this.scheduleReconnect();
    });
    sock.on("close", () => {
      for (const [, p] of this.pending) {
        p.reject(new Error("socket closed"));
      }
      this.pending.clear();
      this.scheduleReconnect();
    });
    const rl = readline.createInterface({ input: sock });
    rl.on("line", (line) => {
      let msg;
      try {
        msg = JSON.parse(line);
      } catch {
        return;
      }
      if (msg["stream"] === true) {
        this.emit("stream", msg["event"]);
        return;
      }
      const id = msg["id"];
      const pending = this.pending.get(id);
      if (!pending) return;
      this.pending.delete(id);
      if (msg["error"]) {
        const e = msg["error"];
        pending.reject(new Error(`RPC ${e.code}: ${e.message}`));
      } else {
        pending.resolve(msg["result"]);
      }
    });
    try {
      sock.connect(this.socketPath);
    } catch (err) {
      console.error("[socket] connect failed:", err.message);
      sock.destroy();
      this.socket = null;
      this.scheduleReconnect();
    }
  }
  scheduleReconnect() {
    if (this.reconnectTimer) return;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, 2e3);
  }
  call(method, params = null) {
    return new Promise((resolve, reject) => {
      if (!this.socket || this.socket.destroyed || !this.socket.writable) {
        return reject(new Error("socket not connected"));
      }
      const id = ++this.idCounter;
      this.pending.set(id, {
        resolve,
        reject
      });
      const msg = JSON.stringify({ id, method, params }) + "\n";
      this.socket.write(msg, "utf8", (err) => {
        if (err) {
          this.pending.delete(id);
          reject(err);
        }
      });
    });
  }
  /** Subscribe to stream events for a project. Returns an unsubscribe fn. */
  subscribe(projectName, handler) {
    const fn = (event) => {
      const e = event;
      if (e.projectName === projectName || !projectName) {
        handler(event);
      }
    };
    this.on("stream", fn);
    return () => this.off("stream", fn);
  }
}
function createServices(cfg) {
  const services = {};
  services.socketClient = new SocketClientService(cfg);
  return services;
}
class OrchestratorModule {
  constructor(svcs) {
    this.svcs = svcs;
  }
  listProjects() {
    return this.svcs.socketClient.call("status.all", null);
  }
  getProject(name) {
    return this.svcs.socketClient.call("status.project", { name });
  }
  triggerDeploy(name, sha) {
    return this.svcs.socketClient.call("deploy.trigger", { name, sha });
  }
  rollback(name) {
    return this.svcs.socketClient.call("deploy.rollback", { name });
  }
  setScale(name, instances) {
    return this.svcs.socketClient.call("scale.set", { name, instances });
  }
  getScale(name) {
    return this.svcs.socketClient.call("scale.get", { name });
  }
  reloadConfig() {
    return this.svcs.socketClient.call("config.reload", null);
  }
  getMainConf(mask) {
    return this.svcs.socketClient.call("config.getMainConf", { mask });
  }
  setMainConf(changes) {
    return this.svcs.socketClient.call("config.setMainConf", { changes });
  }
  getProjectConf(name) {
    return this.svcs.socketClient.call("config.getProjectConf", { name });
  }
  setProjectConf(name, changes) {
    return this.svcs.socketClient.call("config.setProjectConf", { name, changes });
  }
  setEnv(name, content) {
    return this.svcs.socketClient.call("config.setEnv", { name, content });
  }
  syncEnv(name) {
    return this.svcs.socketClient.call("config.syncEnv", { name });
  }
  createProject(name, repoUrl, branch, ports) {
    return this.svcs.socketClient.call("config.createProject", { name, repoUrl, branch, ports });
  }
  deleteProject(name, removeData) {
    return this.svcs.socketClient.call("config.deleteProject", { name, removeData });
  }
  listDeployLogs(name) {
    return this.svcs.socketClient.call("deployLogs.list", { name });
  }
  readDeployLog(path2) {
    return this.svcs.socketClient.call("deployLogs.read", { path: path2 });
  }
  runBackup(name) {
    return this.svcs.socketClient.call("backup.run", { name });
  }
  runSystemBackup() {
    return this.svcs.socketClient.call("backup.runSystem", null);
  }
  listBackups(name) {
    return this.svcs.socketClient.call("backup.list", { name });
  }
  listPorts() {
    return this.svcs.socketClient.call("port.list", null);
  }
  diskInfo() {
    return this.svcs.socketClient.call("system.disk", null);
  }
  getEnv(name) {
    return this.svcs.socketClient.call("config.getEnv", { name });
  }
  getNpmrc(name) {
    return this.svcs.socketClient.call("config.getNpmrc", { name });
  }
  setNpmrc(name, content) {
    return this.svcs.socketClient.call("config.setNpmrc", { name, content });
  }
  daemonStatus() {
    return this.svcs.socketClient.call("system.daemonStatus", null);
  }
  journalTail(name, lines = 200) {
    return this.svcs.socketClient.call("journal.tail", { name, lines });
  }
  listNginxConfigs() {
    return this.svcs.socketClient.call("nginx.list", null);
  }
  getNginxConfig(name) {
    return this.svcs.socketClient.call("nginx.get", { name });
  }
  setNginxConfig(name, content) {
    return this.svcs.socketClient.call("nginx.set", { name, content });
  }
  testNginx() {
    return this.svcs.socketClient.call("nginx.test", null);
  }
  reloadNginx() {
    return this.svcs.socketClient.call("nginx.reload", null);
  }
  enableNginxSite(name) {
    return this.svcs.socketClient.call("nginx.enable", { name });
  }
  disableNginxSite(name) {
    return this.svcs.socketClient.call("nginx.disable", { name });
  }
  /**
   * Subscribe to build events for a project.
   * Returns an unsubscribe function. Caller must call it when the SSE
   * connection closes to prevent memory/listener leaks.
   */
  subscribeToLogs(projectName, handler) {
    this.svcs.socketClient.call("logs.subscribe", { name: projectName }).catch(() => {
    });
    return this.svcs.socketClient.subscribe(projectName, handler);
  }
  /** Subscribe to ALL build events (for the dashboard live updates). */
  subscribeToAll(handler) {
    return this.svcs.socketClient.subscribe("", handler);
  }
}
function createModules(services) {
  const modules2 = {};
  modules2.orchestrator = new OrchestratorModule(services);
  return modules2;
}
const __dirname$1 = path.dirname(fileURLToPath(import.meta.url));
const env = new Env(path.resolve(__dirname$1, "../../../../"));
const config = {
  socket: {
    path: env.string("ORCHESTRATOR_SOCKET", "/run/obstetrix/orchestrator.sock")
  }
};
let _services = null;
let _modules = null;
function getServices() {
  if (!_services) _services = createServices(config);
  return _services;
}
function getModules() {
  if (!_modules) _modules = createModules(getServices());
  return _modules;
}
new Proxy({}, {
  get(_, key) {
    return getServices()[key];
  }
});
const modules = new Proxy({}, {
  get(_, key) {
    return getModules()[key];
  }
});
export {
  modules as m
};
