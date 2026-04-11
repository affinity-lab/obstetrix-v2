import type { GuiServerConfig } from '../index.js';
import { SocketClientService } from './socketClient.js';

export type Services = {
  socketClient: SocketClientService;
};

export function createServices(cfg: GuiServerConfig): Services {
  const services = {} as Services;
  services.socketClient = new SocketClientService(cfg);
  return services;
}
