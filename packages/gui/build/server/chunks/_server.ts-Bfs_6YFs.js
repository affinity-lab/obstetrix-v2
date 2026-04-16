import { m as modules } from './index-Bb-OgkoT.js';
import 'path';
import 'url';
import 'fs';
import 'net';
import 'readline';
import 'events';

const GET = async ({ params, request }) => {
  const projectName = params.project;
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();
      const send = (event) => {
        const data = `data: ${JSON.stringify(event)}

`;
        controller.enqueue(encoder.encode(data));
      };
      const unsubscribe = modules.orchestrator.subscribeToLogs(projectName, send);
      request.signal.addEventListener("abort", () => {
        unsubscribe();
        controller.close();
      });
    }
  });
  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "X-Accel-Buffering": "no"
    }
  });
};

export { GET };
//# sourceMappingURL=_server.ts-Bfs_6YFs.js.map
