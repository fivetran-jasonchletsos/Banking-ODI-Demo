// EPIC-Clarity-style mission-control surface: animated 5-node flow diagram +
// KPI tile row + counter helper. Self-contained, reads its own props.
// Ported from Healthcare-EPIC-Snowflake-Demo to standardise the "how it
// works" moment across all industry ODI demos.

import { useEffect, useRef, useState } from 'react';

export function AnimatedCounter({
  to,
  duration = 1100,
  format = (n) => n.toFixed(1),
  className,
}: {
  to: number;
  duration?: number;
  format?: (n: number) => string;
  className?: string;
}) {
  const [val, setVal] = useState(0);
  const startRef = useRef<number | null>(null);
  const fromRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    fromRef.current = val;
    startRef.current = null;
    const step = (ts: number) => {
      if (startRef.current === null) startRef.current = ts;
      const elapsed = ts - startRef.current;
      const t = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setVal(fromRef.current + (to - fromRef.current) * eased);
      if (t < 1) rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [to]);

  return <span className={className}>{format(val)}</span>;
}

// ─── KPI Tile ────────────────────────────────────────────────────────────────

export type KpiTone = 'healthy' | 'caution' | 'alert' | 'info';

export interface KpiTileProps {
  label: string;
  value: React.ReactNode;
  subValue?: string;
  delta?: { value: string; trend: 'good' | 'bad' | 'flat'; vs?: string };
  badge?: string;
  badgeTone?: KpiTone;
}

export function KpiTile(props: KpiTileProps) {
  const { label, value, subValue, delta, badge, badgeTone = 'info' } = props;
  const deltaColor =
    delta?.trend === 'good' ? 'var(--gold)'
      : delta?.trend === 'bad' ? '#b04a3c'
      : 'var(--ink-soft)';
  const deltaArrow = delta?.trend === 'good' ? '▲' : delta?.trend === 'bad' ? '▼' : '◆';
  const badgeColor = badgeTone === 'healthy' ? 'var(--gold)'
    : badgeTone === 'caution' ? '#c08a3e'
    : badgeTone === 'alert' ? '#b04a3c' : 'var(--ink-soft)';
  return (
    <div className="research-card p-4 sm:p-5 relative">
      <div className="flex items-start justify-between gap-3">
        <div className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--ink-soft)] leading-tight">
          {label}
        </div>
        {badge && (
          <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-sm"
                style={{ color: badgeColor, border: `1px solid ${badgeColor}`, background: 'transparent' }}>
            {badge}
          </span>
        )}
      </div>
      <div className="mt-2.5 flex items-baseline gap-2 flex-wrap">
        <div className="font-serif text-[32px] sm:text-[36px] font-semibold leading-none text-[var(--ink-strong)]" style={{ fontVariantNumeric: 'tabular-nums' }}>
          {value}
        </div>
        {subValue && (
          <div className="text-xs text-[var(--ink-soft)]" style={{ fontVariantNumeric: 'tabular-nums' }}>{subValue}</div>
        )}
      </div>
      {delta && (
        <div className="mt-3 text-xs">
          <span className="font-semibold" style={{ color: deltaColor, fontVariantNumeric: 'tabular-nums' }}>
            <span className="text-[10px] mr-0.5">{deltaArrow}</span>
            {delta.value}
          </span>
          {delta.vs && <span className="text-[var(--ink-soft)] ml-1.5">{delta.vs}</span>}
        </div>
      )}
    </div>
  );
}

// ─── Sparkline (tiny inline trend line) ───────────────────────────────────────

export function Sparkline({
  values,
  width = 80,
  height = 20,
  stroke = 'var(--gold)',
  fill = 'var(--gold)',
  strokeWidth = 1.5,
}: {
  values: number[];
  width?: number;
  height?: number;
  stroke?: string;
  fill?: string;
  strokeWidth?: number;
}) {
  if (!values.length) return null;
  const max = Math.max(...values, 1);
  const min = Math.min(...values);
  const range = max - min || 1;
  const stepX = width / (values.length - 1 || 1);
  const points = values.map((v, i) => {
    const x = i * stepX;
    const y = height - ((v - min) / range) * (height - 2) - 1;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const path = `M ${points.join(' L ')}`;
  const area = `${path} L ${width.toFixed(1)},${height.toFixed(1)} L 0,${height.toFixed(1)} Z`;
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
      <path d={area} fill={fill} fillOpacity="0.12" />
      <path d={path} fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── Animated flow diagram ────────────────────────────────────────────────────

export interface FlowNode {
  id: string;
  logo: 'source' | 'fivetran' | 'snowflake' | 'dbt' | 'app';
  label: string;
  sub: string;
  status: 'healthy' | 'caution' | 'alert';
  metric: string;
}

export function DataFlowDiagram({ nodes }: { nodes: FlowNode[] }) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => (t + 1) % nodes.length), 1400);
    return () => clearInterval(id);
  }, [nodes.length]);

  const statusColor = (s: FlowNode['status']) =>
    s === 'healthy' ? 'var(--gold)' : s === 'caution' ? '#c08a3e' : '#b04a3c';

  return (
    <div className="research-card p-6 overflow-x-auto">
      <div className="flex items-stretch gap-3 min-w-[820px]">
        {nodes.map((n, i) => (
          <div key={n.id} className="flex items-stretch gap-3 flex-1">
            <div
              className={`flex-1 rounded-sm border p-4 transition-all duration-700`}
              style={{
                borderColor: tick === i ? statusColor(n.status) : 'var(--hairline)',
                background: tick === i ? 'rgba(192,154,62,0.06)' : 'transparent',
                boxShadow: tick === i ? '0 0 0 1px var(--gold)' : 'none',
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <LogoMark kind={n.logo} />
                <div className="text-[10px] font-semibold uppercase tracking-wider"
                     style={{ color: statusColor(n.status) }}>
                  {n.status}
                </div>
              </div>
              <div className="font-serif text-base font-semibold text-[var(--ink-strong)] leading-tight">
                {n.label}
              </div>
              <div className="text-xs text-[var(--ink-soft)] mt-0.5">{n.sub}</div>
              <div className="text-[11px] text-[var(--ink-strong)] mt-2 font-semibold" style={{ fontVariantNumeric: 'tabular-nums' }}>
                {n.metric}
              </div>
            </div>
            {i < nodes.length - 1 && (
              <div className="flex items-center" aria-hidden>
                <svg width="22" height="40" viewBox="0 0 22 40">
                  <line x1="2" y1="20" x2="20" y2="20" stroke="var(--ink-soft)" strokeWidth="1.4" strokeLinecap="round" opacity="0.5" />
                  <polygon points="14,15 20,20 14,25" fill="var(--ink-soft)" opacity="0.6" />
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function LogoMark({ kind }: { kind: FlowNode['logo'] }) {
  const cls = "w-5 h-5 flex items-center justify-center rounded-sm text-[9px] font-bold";
  if (kind === 'source')    return <span className={cls} style={{ background: 'var(--ink-strong)', color: 'var(--paper-warm,#fefaf3)' }}>DB</span>;
  if (kind === 'fivetran')  return <span className={cls} style={{ background: '#0073ff', color: 'white' }}>FT</span>;
  if (kind === 'snowflake') return <span className={cls} style={{ background: '#29b5e8', color: 'white' }}>SF</span>;
  if (kind === 'dbt')       return <span className={cls} style={{ background: '#ff694a', color: 'white' }}>dbt</span>;
  return <span className={cls} style={{ background: 'var(--gold)', color: 'var(--ink-strong)' }}>UI</span>;
}
