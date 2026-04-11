import { createHandler, tango } from '@atom-forge/tango-rpc';
import { modules } from './index.js';
import type {
  ProjectState, DeployLogMeta, DeployLogEntry, BackupResult, PortEntry, DiskInfo,
} from '@obstetrix/shared';

const api = {
  projects: {
    list: tango.query(async (_args: undefined): Promise<ProjectState[]> =>
      modules.orchestrator.listProjects()),

    get: tango.query(async (args: { name: string }): Promise<ProjectState> =>
      modules.orchestrator.getProject(args.name)),
  },

  deploy: {
    trigger: tango.command(async (args: { name: string; sha?: string }): Promise<{ queued: boolean }> =>
      modules.orchestrator.triggerDeploy(args.name, args.sha)),

    rollback: tango.command(async (args: { name: string }): Promise<{ ok: boolean }> =>
      modules.orchestrator.rollback(args.name)),
  },

  scale: {
    set: tango.command(async (args: { name: string; instances: number }): Promise<{ instances: number; ports: number[] }> =>
      modules.orchestrator.setScale(args.name, args.instances)),

    get: tango.query(async (args: { name: string }): Promise<{ instances: number; ports: number[] }> =>
      modules.orchestrator.getScale(args.name)),
  },

  config: {
    reload: tango.command(async (_args: undefined): Promise<{ reloaded: number }> =>
      modules.orchestrator.reloadConfig()),

    getMainConf: tango.query(async (args: { mask: boolean }): Promise<Record<string, string>> =>
      modules.orchestrator.getMainConf(args.mask)),

    setMainConf: tango.command(async (args: { changes: Record<string, string> }): Promise<{ ok: boolean }> =>
      modules.orchestrator.setMainConf(args.changes)),

    getProjectConf: tango.query(async (args: { name: string }): Promise<Record<string, string>> =>
      modules.orchestrator.getProjectConf(args.name)),

    setProjectConf: tango.command(async (args: { name: string; changes: Record<string, string> }): Promise<{ ok: boolean }> =>
      modules.orchestrator.setProjectConf(args.name, args.changes)),

    setEnv: tango.command(async (args: { name: string; content: string }): Promise<{ ok: boolean }> =>
      modules.orchestrator.setEnv(args.name, args.content)),

    syncEnv: tango.command(async (args: { name: string }): Promise<{ ok: boolean }> =>
      modules.orchestrator.syncEnv(args.name)),

    createProject: tango.command(async (args: { name: string; repoUrl: string; branch: string; ports?: number }): Promise<{ name: string; basePort: number; ports: number }> =>
      modules.orchestrator.createProject(args.name, args.repoUrl, args.branch, args.ports ?? 1)),

    deleteProject: tango.command(async (args: { name: string; removeData: boolean }): Promise<{ ok: boolean }> =>
      modules.orchestrator.deleteProject(args.name, args.removeData)),
  },

  deployLogs: {
    list: tango.query(async (args: { name: string }): Promise<DeployLogMeta[]> =>
      modules.orchestrator.listDeployLogs(args.name)),

    read: tango.query(async (args: { path: string }): Promise<DeployLogEntry[]> =>
      modules.orchestrator.readDeployLog(args.path)),
  },

  backup: {
    run: tango.command(async (args: { name: string }): Promise<BackupResult> =>
      modules.orchestrator.runBackup(args.name)),

    runSystem: tango.command(async (_args: undefined): Promise<BackupResult> =>
      modules.orchestrator.runSystemBackup()),

    list: tango.query(async (args: { name: string }): Promise<BackupResult[]> =>
      modules.orchestrator.listBackups(args.name)),
  },

  port: {
    list: tango.query(async (_args: undefined): Promise<PortEntry[]> =>
      modules.orchestrator.listPorts()),
  },

  system: {
    disk: tango.query(async (_args: undefined): Promise<DiskInfo[]> =>
      modules.orchestrator.diskInfo()),
  },
};

export const [handler, definition] = createHandler(api);
export type Definition = typeof definition;
