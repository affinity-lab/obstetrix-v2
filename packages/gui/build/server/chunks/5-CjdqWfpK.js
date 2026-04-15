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
const component = async () => component_cache ??= (await import('./_page.svelte-v5FzE-wb.js')).default;
const server_id = "src/routes/project/[name]/+page.server.ts";
const imports = ["_app/immutable/nodes/5.Dm6a5ui3.js","_app/immutable/chunks/WKV7vUDn.js","_app/immutable/chunks/CUwUpJBf.js","_app/immutable/chunks/Dr3dSFlc.js","_app/immutable/chunks/BcWH02EJ.js","_app/immutable/chunks/CbVhQ-Aj.js","_app/immutable/chunks/BwDC1gyS.js","_app/immutable/chunks/BZAsA66_.js","_app/immutable/chunks/BdEY9UWb.js","_app/immutable/chunks/Z7bqoLHg.js","_app/immutable/chunks/CMQ4u_sr.js","_app/immutable/chunks/CmIw7Gxx.js","_app/immutable/chunks/BMJmLXW8.js","_app/immutable/chunks/DUusoSRR.js","_app/immutable/chunks/CTWY7moR.js","_app/immutable/chunks/LUUAI3mx.js","_app/immutable/chunks/BIL3r2Rt.js","_app/immutable/chunks/_7fdNqou.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=5-CjdqWfpK.js.map
