import { handler } from '$lib/server/tango-api.js';
import type { Handle, RequestEvent } from '@sveltejs/kit';

// Bun 1.x crashes on unhandled promise rejections by default.
// Catch them here so transient socket errors don't bring down the process.
process.on('unhandledRejection', (reason: unknown) => {
  console.error('[unhandledRejection]', reason);
});

const API_ROUTES: Record<string, (event: RequestEvent) => Response | Promise<Response>> = {
  '/api/tango': handler,
};

export const handle: Handle = async ({ event, resolve }) => {
  const { pathname } = event.url;
  const match = Object.keys(API_ROUTES)
    .sort((a, b) => b.length - a.length)
    .find((prefix) => pathname.startsWith(prefix));
  if (match) {
    const path = pathname.slice(match.length).replace(/^\//, '');
    event.params = { path } as never;
    return API_ROUTES[match](event);
  }
  return resolve(event);
};
