// Tiny data hook: fetches a JSON file from /data/<name>.json and caches it in module memory.
import { useEffect, useState } from 'react';

const cache = new Map<string, unknown>();

export function useJson<T = unknown>(name: string): { data: T | null; error: string | null } {
  const [data, setData] = useState<T | null>((cache.get(name) as T) ?? null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (cache.has(name)) {
      setData(cache.get(name) as T);
      return;
    }
    const base = (import.meta.env.BASE_URL ?? '/').replace(/\/$/, '');
    const url = `${base}/data/${name}.json`;
    let cancelled = false;
    fetch(url)
      .then((r) => {
        if (!r.ok) throw new Error(`${r.status} fetching ${url}`);
        return r.json();
      })
      .then((j) => {
        if (cancelled) return;
        cache.set(name, j);
        setData(j as T);
      })
      .catch((e: Error) => { if (!cancelled) setError(e.message); });
    return () => { cancelled = true; };
  }, [name]);

  return { data, error };
}

export function fmtCurrencyB(n: number, digits = 1): string {
  return `$${n.toLocaleString(undefined, { minimumFractionDigits: digits, maximumFractionDigits: digits })}B`;
}
export function fmtCurrencyM(n: number, digits = 1): string {
  return `$${n.toLocaleString(undefined, { minimumFractionDigits: digits, maximumFractionDigits: digits })}M`;
}
export function fmtPct(n: number, digits = 1): string {
  return `${n.toFixed(digits)}%`;
}
export function fmtInt(n: number): string {
  return n.toLocaleString();
}
export function fmtCompact(n: number): string {
  if (Math.abs(n) >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(2)}B`;
  if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toFixed(0);
}
