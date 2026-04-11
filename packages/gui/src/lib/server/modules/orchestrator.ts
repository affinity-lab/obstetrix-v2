import type { ProjectState, BuildEvent, DeployLogMeta, DeployLogEntry, BackupResult, PortEntry, DiskInfo } from '@obstetrix/shared';
import type { Services } from '../services/services.js';

/**
 * OrchestratorModule is a typed wrapper around every RPC method.
 * It is the only thing that calls services.socketClient.call().
 * Modules and routes import this — never socketClient directly.
 */
export class OrchestratorModule {
  constructor(private svcs: Services) {}

  listProjects(): Promise<ProjectState[]> {
    return this.svcs.socketClient.call('status.all', null);
  }

  getProject(name: string): Promise<ProjectState> {
    return this.svcs.socketClient.call('status.project', { name });
  }

  triggerDeploy(name: string, sha?: string): Promise<{ queued: boolean }> {
    return this.svcs.socketClient.call('deploy.trigger', { name, sha });
  }

  rollback(name: string): Promise<{ ok: boolean }> {
    return this.svcs.socketClient.call('deploy.rollback', { name });
  }

  setScale(name: string, instances: number): Promise<{ instances: number; ports: number[] }> {
    return this.svcs.socketClient.call('scale.set', { name, instances });
  }

  getScale(name: string): Promise<{ instances: number; ports: number[] }> {
    return this.svcs.socketClient.call('scale.get', { name });
  }

  reloadConfig(): Promise<{ reloaded: number }> {
    return this.svcs.socketClient.call('config.reload', null);
  }

  getMainConf(mask: boolean): Promise<Record<string, string>> {
    return this.svcs.socketClient.call('config.getMainConf', { mask });
  }

  setMainConf(changes: Record<string, string>): Promise<{ ok: boolean }> {
    return this.svcs.socketClient.call('config.setMainConf', { changes });
  }

  getProjectConf(name: string): Promise<Record<string, string>> {
    return this.svcs.socketClient.call('config.getProjectConf', { name });
  }

  setProjectConf(name: string, changes: Record<string, string>): Promise<{ ok: boolean }> {
    return this.svcs.socketClient.call('config.setProjectConf', { name, changes });
  }

  setEnv(name: string, content: string): Promise<{ ok: boolean }> {
    return this.svcs.socketClient.call('config.setEnv', { name, content });
  }

  syncEnv(name: string): Promise<{ ok: boolean }> {
    return this.svcs.socketClient.call('config.syncEnv', { name });
  }

  createProject(name: string, repoUrl: string, branch: string, ports: number): Promise<{ name: string; basePort: number; ports: number }> {
    return this.svcs.socketClient.call('config.createProject', { name, repoUrl, branch, ports });
  }

  deleteProject(name: string, removeData: boolean): Promise<{ ok: boolean }> {
    return this.svcs.socketClient.call('config.deleteProject', { name, removeData });
  }

  listDeployLogs(name: string): Promise<DeployLogMeta[]> {
    return this.svcs.socketClient.call('deployLogs.list', { name });
  }

  readDeployLog(path: string): Promise<DeployLogEntry[]> {
    return this.svcs.socketClient.call('deployLogs.read', { path });
  }

  runBackup(name: string): Promise<BackupResult> {
    return this.svcs.socketClient.call('backup.run', { name });
  }

  runSystemBackup(): Promise<BackupResult> {
    return this.svcs.socketClient.call('backup.runSystem', null);
  }

  listBackups(name: string): Promise<BackupResult[]> {
    return this.svcs.socketClient.call('backup.list', { name });
  }

  listPorts(): Promise<PortEntry[]> {
    return this.svcs.socketClient.call('port.list', null);
  }

  diskInfo(): Promise<DiskInfo[]> {
    return this.svcs.socketClient.call('system.disk', null);
  }

  /**
   * Subscribe to build events for a project.
   * Returns an unsubscribe function. Caller must call it when the SSE
   * connection closes to prevent memory/listener leaks.
   */
  subscribeToLogs(projectName: string, handler: (event: BuildEvent) => void): () => void {
    this.svcs.socketClient.call('logs.subscribe', { name: projectName }).catch(() => {});
    return this.svcs.socketClient.subscribe(projectName, handler as (e: unknown) => void);
  }

  /** Subscribe to ALL build events (for the dashboard live updates). */
  subscribeToAll(handler: (event: BuildEvent) => void): () => void {
    return this.svcs.socketClient.subscribe('', handler as (e: unknown) => void);
  }
}
