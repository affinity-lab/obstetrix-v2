import fs from 'fs';
import path from 'path';
import type { RequestHandler } from './$types';

const BACKUP_DIR = '/var/obstetrix/backups';

export const GET: RequestHandler = async ({ url }) => {
  const filePath = url.searchParams.get('path');

  if (!filePath) {
    return new Response('missing path parameter', { status: 400 });
  }

  // Security: verify path stays within BACKUP_DIR
  const resolved = path.resolve(filePath);
  if (!resolved.startsWith(BACKUP_DIR + path.sep) && resolved !== BACKUP_DIR) {
    return new Response('forbidden', { status: 403 });
  }

  if (!fs.existsSync(resolved)) {
    return new Response('not found', { status: 404 });
  }

  const stat = fs.statSync(resolved);
  const filename = path.basename(resolved);

  const stream = new ReadableStream({
    start(controller) {
      const rs = fs.createReadStream(resolved);
      rs.on('data', (chunk) => controller.enqueue(chunk));
      rs.on('end', () => controller.close());
      rs.on('error', (err) => controller.error(err));
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type':        'application/gzip',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length':      String(stat.size),
    },
  });
};
