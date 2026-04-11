import type { Services } from '../services/services.js';
import { OrchestratorModule } from './orchestrator.js';

export type Modules = {
  orchestrator: OrchestratorModule;
};

export function createModules(services: Services): Modules {
  const modules = {} as Modules;
  modules.orchestrator = new OrchestratorModule(services);
  return modules;
}
