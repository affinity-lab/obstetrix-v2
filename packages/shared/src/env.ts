import { readFileSync } from 'fs';
import { join } from 'path';

/**
 * Env reads a .env file (key=value format) and provides typed getters with defaults.
 * Used by the GUI server to read socket path and other configuration.
 */
export class Env {
  private data: Map<string, string> = new Map();

  constructor(rootDir: string) {
    const envPath = join(rootDir, '.env');
    try {
      const content = readFileSync(envPath, 'utf-8');
      for (const line of content.split('\n')) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const eqIdx = trimmed.indexOf('=');
        if (eqIdx < 0) continue;
        const key = trimmed.slice(0, eqIdx).trim();
        const value = trimmed.slice(eqIdx + 1).trim();
        this.data.set(key, value);
      }
    } catch {
      // .env file may not exist — that's fine, fall back to defaults
    }

    // Also merge process.env so environment variables override .env
    for (const [key, value] of Object.entries(process.env)) {
      if (value !== undefined) {
        this.data.set(key, value);
      }
    }
  }

  string(key: string, defaultValue: string): string {
    return this.data.get(key) ?? defaultValue;
  }

  number(key: string, defaultValue: number): number {
    const raw = this.data.get(key);
    if (raw === undefined) return defaultValue;
    const n = Number(raw);
    return isNaN(n) ? defaultValue : n;
  }

  boolean(key: string, defaultValue: boolean): boolean {
    const raw = this.data.get(key)?.toLowerCase();
    if (raw === undefined) return defaultValue;
    if (raw === 'true' || raw === '1' || raw === 'yes') return true;
    if (raw === 'false' || raw === '0' || raw === 'no') return false;
    return defaultValue;
  }
}
