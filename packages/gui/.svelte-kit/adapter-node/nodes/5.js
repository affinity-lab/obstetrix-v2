import * as server from '../entries/pages/project/_name_/_page.server.ts.js';

export const index = 5;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/project/_name_/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/project/[name]/+page.server.ts";
export const imports = ["_app/immutable/nodes/5.hiW2e6GR.js","_app/immutable/chunks/BhxVAyZt.js","_app/immutable/chunks/BVwrKYFG.js","_app/immutable/chunks/AYkmf9zX.js","_app/immutable/chunks/7k1y1Y6e.js","_app/immutable/chunks/B-QN7h4W.js","_app/immutable/chunks/DRAekN9s.js","_app/immutable/chunks/B7-vS7SU.js","_app/immutable/chunks/Z7bqoLHg.js","_app/immutable/chunks/CMQ4u_sr.js","_app/immutable/chunks/D5qxqzK8.js","_app/immutable/chunks/C_jr69VV.js","_app/immutable/chunks/CZUOPdaP.js","_app/immutable/chunks/Dt05CAHJ.js","_app/immutable/chunks/BmkMrBLf.js","_app/immutable/chunks/KUuZ5k8X.js","_app/immutable/chunks/CgVN-kXQ.js"];
export const stylesheets = [];
export const fonts = [];
