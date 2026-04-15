import { m as modules } from './index-Bb-OgkoT.js';
import 'path';
import 'url';
import 'fs';
import 'net';
import 'readline';
import 'events';

const load = async ({ params }) => {
  const { name } = params;
  const [project, scale] = await Promise.all([
    modules.orchestrator.getProject(name),
    modules.orchestrator.getScale(name)
  ]);
  return { project, scale };
};

var _page_server_ts = /*#__PURE__*/Object.freeze({
  __proto__: null,
  load: load
});

const index = 5;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-DRkKcdS0.js')).default;
const server_id = "src/routes/project/[name]/+page.server.ts";
const imports = ["_app/immutable/nodes/5.hiW2e6GR.js","_app/immutable/chunks/BhxVAyZt.js","_app/immutable/chunks/BVwrKYFG.js","_app/immutable/chunks/AYkmf9zX.js","_app/immutable/chunks/7k1y1Y6e.js","_app/immutable/chunks/B-QN7h4W.js","_app/immutable/chunks/DRAekN9s.js","_app/immutable/chunks/B7-vS7SU.js","_app/immutable/chunks/Z7bqoLHg.js","_app/immutable/chunks/CMQ4u_sr.js","_app/immutable/chunks/D5qxqzK8.js","_app/immutable/chunks/C_jr69VV.js","_app/immutable/chunks/CZUOPdaP.js","_app/immutable/chunks/Dt05CAHJ.js","_app/immutable/chunks/BmkMrBLf.js","_app/immutable/chunks/KUuZ5k8X.js","_app/immutable/chunks/CgVN-kXQ.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=5-Da3kPB5L.js.map
