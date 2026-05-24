import { useState } from 'react';
import { useJson } from '../components/data';
import { DataFlowDiagram, KpiTile, AnimatedCounter, type FlowNode } from '../components/PipelineFlow';

type Pipeline = {
  as_of: string;
  fivetran_dashboard_url?: string;
  connectors: { id: string; fivetran_id?: string; name: string; type: string; status: string; rows_today: number; last_sync: string; lag_seconds: number; freshness: string; issue?: string }[];
  dbt_layers: { layer: string; models: number; tests: number; last_run: string; status: string }[];
  failure_simulator: { id: string; label: string; impact: string }[];
};

// EPIC-Clarity-style flow nodes for the Northbay banking pipeline.
// Source IDs that don't have a real Fivetran connector yet are placeholders;
// rewire to the real connector_id once the bank's source systems are
// onboarded.
const FLOW_NODES: FlowNode[] = [
  { id: 'core',      logo: 'source',    label: 'Northbay Core Banking',   sub: 'FIS Profile · CDC source',          status: 'healthy', metric: '11 tables · 4.2M rows' },
  { id: 'fivetran',  logo: 'fivetran',  label: 'Fivetran',                sub: 'CDC + REST connectors',             status: 'healthy', metric: '5-min cadence · 99.6% SLA' },
  { id: 'iceberg',   logo: 'iceberg',   label: 'Iceberg (MDLS)',          sub: 'Apache Iceberg on S3 · MDLS',       status: 'healthy', metric: 'One copy of the bytes' },
  { id: 'compute',   logo: 'snowflake', label: 'Snowflake / Athena / Trino', sub: 'External Iceberg reads',         status: 'healthy', metric: 'No copies, no extracts' },
  { id: 'dbt',       logo: 'dbt',       label: 'dbt Labs',                sub: 'Bronze → Silver → Gold · Triggered by Fivetran', status: 'healthy', metric: '31s avg · 0 failures' },
  { id: 'app',       logo: 'app',       label: 'React',                   sub: 'Northbay app · static JSON',        status: 'healthy', metric: 'CDN · 9 min deploy' },
];

// Fivetran dashboard URL format: /dashboard/connections/{schema_name}/settings
// The {schema_name} is the connector's "Schema" identifier shown in the connector
// settings page (e.g. weather_compromise, salesforce_sandbox).
const FIVETRAN_BASE = 'https://fivetran.com/dashboard/connections';
const FIVETRAN_TAIL = '/status';

export default function PipelinePage() {
  const { data } = useJson<Pipeline>('pipeline');
  const [simulated, setSimulated] = useState<string | null>(null);

  const sim = data?.failure_simulator.find((s) => s.id === simulated);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-8 max-w-3xl">
        <div className="eyebrow mb-1">Fivetran lineage and freshness</div>
        <h1 className="font-serif text-[2rem] sm:text-[2.4rem] font-semibold tracking-tight text-[var(--ink-strong)]">
          Eight banking sources → Iceberg → multi-engine, end-to-end
        </h1>
        <p className="mt-3 text-[var(--ink-muted)] leading-relaxed">
          Fivetran lands every CDC row into Iceberg (MDLS) on S3 in open Apache Iceberg format — one
          copy of the bytes. Snowflake, Athena, and Trino read the same Iceberg bytes via external
          catalogs (no copies, no extracts). Fivetran Transformations triggers dbt Labs the moment the
          source sync finishes, so bronze → silver → gold stays in Iceberg.
        </p>
        <div className="mt-5">
          <a
            href={data?.fivetran_dashboard_url || FIVETRAN_BASE}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-sm font-semibold text-sm text-[var(--navy-deep)] px-4 py-2.5 hover:opacity-95 transition-opacity"
            style={{ background: 'var(--gold)' }}
          >
            Open in Fivetran
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M7 17 17 7M9 7h8v8" />
            </svg>
          </a>
          <span className="ml-3 text-[11px] text-[var(--ink-soft)]">
            Each connector below deep-links to its job in the Fivetran dashboard.
          </span>
        </div>
      </header>

      {/* ── EPIC-Clarity-style flow diagram + KPI strip ─────────────────────── */}
      <section className="mb-10">
        <h2 className="font-serif text-xl font-semibold text-[var(--ink-strong)] pb-3 mb-4 border-b-2 border-[var(--gold-dim)]">
          Source → Activation
        </h2>
        <DataFlowDiagram nodes={FLOW_NODES} />
      </section>

      <section className="mb-10">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <KpiTile
            label="Connectors live"
            value={<AnimatedCounter to={data?.connectors?.length || 0} format={(n) => Math.round(n).toString()} />}
            subValue="Fivetran-managed"
            delta={{ value: '0 failed', trend: 'good', vs: 'last 24h' }}
            badge="HEALTHY"
            badgeTone="healthy"
          />
          <KpiTile
            label="Rows landed today"
            value={<AnimatedCounter
              to={(data?.connectors || []).reduce((a, c) => a + (c.rows_today || 0), 0)}
              format={(n) => Math.round(n).toLocaleString()}
            />}
            subValue="across all sources"
            delta={{ value: '+8.4%', trend: 'good', vs: 'vs 7-day avg' }}
          />
          <KpiTile
            label="dbt models passing"
            value={<AnimatedCounter
              to={(data?.dbt_layers || []).reduce((a, l) => a + (l.models || 0), 0)}
              format={(n) => Math.round(n).toString()}
            />}
            subValue={`across ${(data?.dbt_layers || []).length} layers`}
            delta={{ value: '100%', trend: 'good', vs: 'last build' }}
            badge="GREEN"
            badgeTone="healthy"
          />
          <KpiTile
            label="Median connector lag"
            value={
              <>
                <AnimatedCounter
                  to={(() => { const ls = (data?.connectors || []).map((c) => c.lag_seconds).filter((x): x is number => typeof x === 'number').sort((a, b) => a - b); return ls[Math.floor(ls.length / 2)] || 0; })()}
                  format={(n) => Math.round(n).toString()}
                />
                <span className="text-base font-normal text-[var(--ink-soft)] ml-1">s</span>
              </>
            }
            subValue="p50"
            delta={{ value: '−4s', trend: 'good', vs: 'vs yesterday' }}
          />
        </div>
      </section>

      <section className="mb-10">
        <h2 className="font-serif text-xl font-semibold text-[var(--ink-strong)] pb-3 mb-4 border-b-2 border-[var(--gold-dim)]">Connectors, Fivetran-managed</h2>
        <div className="research-card overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Connector</th>
                <th>Type</th>
                <th>Status</th>
                <th className="num">Rows today</th>
                <th>Freshness</th>
                <th className="num">Lag (s)</th>
              </tr>
            </thead>
            <tbody>
              {(data?.connectors ?? []).map((c) => (
                <tr key={c.id}>
                  <td>
                    {c.fivetran_id ? (
                      <a
                        href={`${FIVETRAN_BASE}/${c.fivetran_id}${FIVETRAN_TAIL}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-[var(--ink-strong)] hover:text-[var(--navy-deep)] hover:underline decoration-[var(--gold)] decoration-2 underline-offset-2 inline-flex items-center gap-1.5"
                      >
                        {c.name}
                        <svg viewBox="0 0 24 24" className="h-3 w-3 text-[var(--ink-soft)]" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                          <path d="M7 17 17 7M9 7h8v8" />
                        </svg>
                      </a>
                    ) : (
                      <div className="font-semibold text-[var(--ink-strong)]">{c.name}</div>
                    )}
                    {c.issue && <div className="text-[11px] text-[var(--alert)] mt-0.5">{c.issue}</div>}
                  </td>
                  <td className="text-[var(--ink-muted)] text-[12px]">{c.type}</td>
                  <td>
                    <span className={`status-pill ${c.status === 'healthy' ? 'bull' : c.status === 'degraded' ? 'caution' : 'bear'}`}>{c.status}</span>
                  </td>
                  <td className="num">{c.rows_today.toLocaleString()}</td>
                  <td className="text-[var(--ink-muted)] text-[12px]">{c.freshness}</td>
                  <td className="num" style={{ color: c.lag_seconds > 900 ? 'var(--alert)' : c.lag_seconds > 300 ? 'var(--caution)' : 'var(--ink)' }}>
                    {c.lag_seconds.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="font-serif text-xl font-semibold text-[var(--ink-strong)] pb-3 mb-4 border-b-2 border-[var(--gold-dim)]">dbt layers</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 stagger-children">
          {(data?.dbt_layers ?? []).map((l) => (
            <div key={l.layer} className="research-card p-4">
              <span className={`layer-chip ${l.layer === 'bronze' ? 'bronze' : l.layer === 'silver' ? 'silver' : 'gold'}`}>{l.layer}</span>
              <div className="mt-3 font-serif text-2xl font-semibold text-[var(--ink-strong)] tabular">{l.models}</div>
              <div className="text-[11px] text-[var(--ink-soft)] uppercase tracking-wider">models</div>
              <div className="mt-3 text-[12px] text-[var(--ink-muted)]">{l.tests} tests, all <span className="text-[var(--bull)] font-semibold">passing</span></div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-serif text-xl font-semibold text-[var(--ink-strong)] pb-3 mb-4 border-b-2 border-[var(--gold-dim)]">Failure simulator</h2>
        <p className="text-sm text-[var(--ink-muted)] mb-4 max-w-3xl">
          Click a scenario to preview what breaks downstream. The agents and dashboards only ever read
          gold, so a Fivetran failure manifests as stale or skipped scoring rather than a hard error.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          {(data?.failure_simulator ?? []).map((s) => (
            <button
              key={s.id}
              onClick={() => setSimulated(s.id === simulated ? null : s.id)}
              className={`research-card p-4 text-left transition-colors ${simulated === s.id ? 'border-[var(--alert)] bg-[var(--alert-bg)]' : 'hover:border-[var(--gold)]'}`}
            >
              <div className="ticker text-[10px] text-[var(--ink-soft)]">{s.id}</div>
              <div className="mt-1 font-semibold text-[var(--ink-strong)]">{s.label}</div>
            </button>
          ))}
        </div>
        {sim && (
          <div className="research-card p-5" style={{ borderColor: 'var(--alert)' }}>
            <div className="flex items-start gap-3">
              <span className="status-pill alert">Simulated</span>
              <div>
                <div className="font-serif text-lg font-semibold text-[var(--ink-strong)]">{sim.label}</div>
                <p className="mt-2 text-sm text-[var(--ink-muted)] leading-relaxed">
                  <strong className="text-[var(--ink-strong)]">Downstream impact: </strong>{sim.impact}
                </p>
                <p className="mt-2 text-xs text-[var(--ink-soft)]">
                  In production, Fivetran would page the data-platform on-call, auto-retry the sync, and
                  the gold tables would expose a freshness column the agents can read before they decide.
                </p>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
