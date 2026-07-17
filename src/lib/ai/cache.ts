import crypto from 'crypto';
import type { ExtractionResult } from '@/types';

const CACHE_TTL = 60 * 60 * 1000;

interface CacheEntry {
  result: ExtractionResult;
  timestamp: number;
}

const cache = new Map<string, CacheEntry>();

function isExpired(entry: CacheEntry): boolean {
  return Date.now() - entry.timestamp > CACHE_TTL;
}

export function hashFile(buffer: ArrayBuffer): string {
  const hash = crypto.createHash('sha256');
  hash.update(Buffer.from(buffer));
  return hash.digest('hex');
}

export function getCached(hash: string): ExtractionResult | null {
  const entry = cache.get(hash);
  if (!entry) return null;
  if (isExpired(entry)) {
    cache.delete(hash);
    return null;
  }
  return entry.result;
}

export function setCached(hash: string, result: ExtractionResult): void {
  cache.set(hash, { result, timestamp: Date.now() });
}

export function invalidateCache(hash: string): void {
  cache.delete(hash);
}

export function clearExpired(): number {
  const now = Date.now();
  let cleared = 0;
  for (const [key, entry] of cache.entries()) {
    if (now - entry.timestamp > CACHE_TTL) {
      cache.delete(key);
      cleared++;
    }
  }
  return cleared;
}

const GC_INTERVAL = 15 * 60 * 1000;
if (typeof setInterval !== 'undefined') {
  setInterval(clearExpired, GC_INTERVAL);
}
