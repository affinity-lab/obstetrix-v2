import { tango, createHandler } from "@atom-forge/tango-rpc";
import { m as modules } from "./index.js";
const api = {
  projects: {
    list: tango.query(async (_args) => modules.orchestrator.listProjects()),
    get: tango.query(async (args) => modules.orchestrator.getProject(args.name))
  },
  deploy: {
    trigger: tango.command(async (args) => modules.orchestrator.triggerDeploy(args.name, args.sha)),
    rollback: tango.command(async (args) => modules.orchestrator.rollback(args.name))
  },
  scale: {
    set: tango.command(async (args) => modules.orchestrator.setScale(args.name, args.instances)),
    get: tango.query(async (args) => modules.orchestrator.getScale(args.name))
  },
  config: {
    reload: tango.command(async (_args) => modules.orchestrator.reloadConfig()),
    getMainConf: tango.query(async (args) => modules.orchestrator.getMainConf(args.mask)),
    setMainConf: tango.command(async (args) => modules.orchestrator.setMainConf(args.changes)),
    getProjectConf: tango.query(async (args) => modules.orchestrator.getProjectConf(args.name)),
    setProjectConf: tango.command(async (args) => modules.orchestrator.setProjectConf(args.name, args.changes)),
    setEnv: tango.command(async (args) => modules.orchestrator.setEnv(args.name, args.content)),
    getEnv: tango.query(async (args) => modules.orchestrator.getEnv(args.name)),
    getNpmrc: tango.query(async (args) => modules.orchestrator.getNpmrc(args.name)),
    setNpmrc: tango.command(async (args) => modules.orchestrator.setNpmrc(args.name, args.content)),
    syncEnv: tango.command(async (args) => modules.orchestrator.syncEnv(args.name)),
    createProject: tango.command(async (args) => modules.orchestrator.createProject(args.name, args.repoUrl, args.branch, args.ports ?? 1)),
    deleteProject: tango.command(async (args) => modules.orchestrator.deleteProject(args.name, args.removeData))
  },
  deployLogs: {
    list: tango.query(async (args) => modules.orchestrator.listDeployLogs(args.name)),
    read: tango.query(async (args) => modules.orchestrator.readDeployLog(args.path))
  },
  backup: {
    run: tango.command(async (args) => modules.orchestrator.runBackup(args.name)),
    runSystem: tango.command(async (_args) => modules.orchestrator.runSystemBackup()),
    list: tango.query(async (args) => modules.orchestrator.listBackups(args.name))
  },
  port: {
    list: tango.query(async (_args) => modules.orchestrator.listPorts())
  },
  system: {
    disk: tango.query(async (_args) => modules.orchestrator.diskInfo()),
    daemonStatus: tango.query(async (_args) => modules.orchestrator.daemonStatus())
  },
  journal: {
    tail: tango.query(async (args) => modules.orchestrator.journalTail(args.name, args.lines))
  },
  nginx: {
    list: tango.query(async (_args) => modules.orchestrator.listNginxConfigs()),
    get: tango.query(async (args) => modules.orchestrator.getNginxConfig(args.name)),
    set: tango.command(async (args) => modules.orchestrator.setNginxConfig(args.name, args.content)),
    test: tango.query(async (_args) => modules.orchestrator.testNginx()),
    reload: tango.command(async (_args) => modules.orchestrator.reloadNginx()),
    enable: tango.command(async (args) => modules.orchestrator.enableNginxSite(args.name)),
    disable: tango.command(async (args) => modules.orchestrator.disableNginxSite(args.name))
  }
};
const [handler, definition] = createHandler(api);
export {
  handler as h
};
