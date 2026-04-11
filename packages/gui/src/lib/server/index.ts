import path from 'path';
import { fileURLToPath } from 'url';
import { Env } from '@obstetrix/shared';
import { createServices, type Services } from './services/services.js';
import { createModules, type Modules } from './modules/modules.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// SocketConfig is the only config the GUI server needs
export type GuiServerConfig = {
  socket: { path: string };
};

const env = new Env(path.resolve(__dirname, '../../../../'));

const config: GuiServerConfig = {
  socket: {
    path: env.string('ORCHESTRATOR_SOCKET', '/run/obstetrix/orchestrator.sock'),
  },
};

// Lazy singletons — deferred until first request, not at import time.
// This prevents the socket connection attempt during `vite build`.
let _services: Services | null = null;
let _modules:  Modules  | null = null;

function getServices(): Services {
  if (!_services) _services = createServices(config);
  return _services;
}

function getModules(): Modules {
  if (!_modules) _modules = createModules(getServices());
  return _modules;
}

export const services = new Proxy({} as Services, {
  get(_, key) { return getServices()[key as keyof Services]; },
});

export const modules = new Proxy({} as Modules, {
  get(_, key) { return getModules()[key as keyof Modules]; },
});
