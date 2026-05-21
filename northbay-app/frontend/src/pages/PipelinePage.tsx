import { useState } from 'react';
import { useJson } from '../components/data';

type Pipeline = {
  as_of: string;
  connectors: { id: string; name: string; type: string; status: string; rows_today: number; last_sync: string; lag_seconds: number; freshness: string; issue?: string }[];
  dbt_layers: { layer: string; models: number; tests: number; last_run: string; status: string }[];
  failure_simulator: { id: string; label: string; impact: string }[];
};

export default function PipelinePage() {
  const { data } = useJson<Pipeline>('pipeline');
  const [simulated, setSimulated] = useState<string | null>(null);

  const sim = data?.failure_simulator.find((s) => s.id === simulated);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-8 max-w-3xl">
        <div className="eyebrow mb-1">Fivetran lineage and freshness</div>
        <h1 className="font-serif text-3xl font-semibold tracking-tight text-[var(--ink-strong)]">
          Eight connectors, four dbt layers, one gold view
        </h1>
        <p className="mt-3 text-[var(--ink-muted)] leading-relaxed">
          Every page on this site reads from the gold layer. The gold layer is rebuilt every five minutes
          from silver. Silver is rebuilt from bronze every two minutes. Bronze is landed by Fivetran as
          rows arrive at the source.
        </p>
      </header>

      <section className="mb-10">
        <h2 className="font-serif text-xl font-semibold text-[var(--ink-strong)] border-b border-[var(--hairline)] pb-2 mb-4">Connectors, Fivetran-managed</h2>
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
                    <div className="font-semibold text-[var(--ink-strong)]">{c.name}</div>
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
        <h2 className="font-serif text-xl font-semibold text-[var(--ink-strong)] border-b border-[var(--hairline)] pb-2 mb-4">dbt layers</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
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
        <h2 className="font-serif text-xl font-semibold text-[var(--ink-strong)] border-b border-[var(--hairline)] pb-2 mb-4">Failure simulator</h2>
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
