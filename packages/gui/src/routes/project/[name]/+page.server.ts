import { modules } from '$lib/server/index.js';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
  const { name } = params;
  const [project, scale] = await Promise.all([
    modules.orchestrator.getProject(name),
    modules.orchestrator.getScale(name),
  ]);
  return { project, scale };
};
