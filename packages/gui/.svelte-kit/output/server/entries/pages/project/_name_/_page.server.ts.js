import { m as modules } from "../../../../chunks/index.js";
const load = async ({ params }) => {
  const { name } = params;
  const [project, scale] = await Promise.all([
    modules.orchestrator.getProject(name),
    modules.orchestrator.getScale(name)
  ]);
  return { project, scale };
};
export {
  load
};
