import * as server from '../entries/pages/project/_name_/_page.server.ts.js';

export const index = 5;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/project/_name_/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/project/[name]/+page.server.ts";
export const imports = ["_app/immutable/nodes/5.Dm6a5ui3.js","_app/immutable/chunks/WKV7vUDn.js","_app/immutable/chunks/CUwUpJBf.js","_app/immutable/chunks/Dr3dSFlc.js","_app/immutable/chunks/BcWH02EJ.js","_app/immutable/chunks/CbVhQ-Aj.js","_app/immutable/chunks/BwDC1gyS.js","_app/immutable/chunks/BZAsA66_.js","_app/immutable/chunks/BdEY9UWb.js","_app/immutable/chunks/Z7bqoLHg.js","_app/immutable/chunks/CMQ4u_sr.js","_app/immutable/chunks/CmIw7Gxx.js","_app/immutable/chunks/BMJmLXW8.js","_app/immutable/chunks/DUusoSRR.js","_app/immutable/chunks/CTWY7moR.js","_app/immutable/chunks/LUUAI3mx.js","_app/immutable/chunks/BIL3r2Rt.js","_app/immutable/chunks/_7fdNqou.js"];
export const stylesheets = [];
export const fonts = [];
