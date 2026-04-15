import { m as modules } from './index-Bb-OgkoT.js';
import 'path';
import 'url';
import 'fs';
import 'net';
import 'readline';
import 'events';

const GET = async ({ request }) => {
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();
      const send = (event) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}

`));
      };
      const unsubscribe = modules.orchestrator.subscribeToAll(send);
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
//# sourceMappingURL=_server.ts-6I7V5fM3.js.map
