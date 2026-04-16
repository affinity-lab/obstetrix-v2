import { modules } from '$lib/server/index.js';
import type { RequestHandler } from './$types';
import type { BuildEvent } from '@obstetrix/shared';

export const GET: RequestHandler = async ({ params, request }) => {
  const projectName = params.project;

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      const send = (event: BuildEvent) => {
        const data = `data: ${JSON.stringify(event)}\n\n`;
        controller.enqueue(encoder.encode(data));
      };

      const unsubscribe = modules.orchestrator.subscribeToLogs(projectName, send);

      request.signal.addEventListener('abort', () => {
        unsubscribe();
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type':      'text/event-stream',
      'Cache-Control':     'no-cache',
      'X-Accel-Buffering': 'no',
    },
  });
};
