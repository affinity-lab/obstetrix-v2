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
    path: env.string('SOCKET_PATH', '/run/obstetrix/orchestrator.sock'),
  },
};

// Singletons — instantiated once when the SvelteKit server starts
export const services: Services = createServices(config);
export const modules: Modules  = createModules(services);
