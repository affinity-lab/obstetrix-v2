// @ts-nocheck
import { modules } from '$lib/server/index.js';
import type { PageServerLoad } from './$types';

export const load = async ({ params }: Parameters<PageServerLoad>[0]) => {
  const { name } = params;
  const [project, scale] = await Promise.all([
    modules.orchestrator.getProject(name),
    modules.orchestrator.getScale(name),
  ]);
  return { project, scale };
};
