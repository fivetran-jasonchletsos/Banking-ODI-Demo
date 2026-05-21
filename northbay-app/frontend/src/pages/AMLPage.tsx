import { useJson, fmtPct, fmtInt } from '../components/data';

type Aml = {
  queue: { open_alerts: number; median_age_days: number; sla_days: number; investigators: number; alerts_per_investigator: number };
  ytd: { alerts_generated: number; alerts_escalated: number; sars_filed: number; sar_acceptance_pct: number; ctrs_filed: number };
  typologies: { typology: string; alerts: number; sars: number; share_pct: number }[];
  model_perf: { champion: { model: string; precision_pct: number; recall_pct: number; alerts_per_day: number }; challenger: { model: string; precision_pct: number; recall_pct: number; alerts_per_day: number } };
  investigator_productivity: { team: string; headcount: number; closed_per_week: number; median_close_days: number }[];
  monthly_sar_filings: { month: string; sars: number }[];
};

export default function AMLPage() {
  const { data } = useJson<Aml>('aml');

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-8 max-w-3xl">
        <div className="eyebrow mb-1">BSA / AML investigations</div>
        <h1 className="font-serif text-3xl font-semibold tracking-tight text-[var(--ink-strong)]">
          One queue, five typologies, agent triage
        </h1>
        <p className="mt-3 text-[var(--ink-muted)] leading-relaxed">
          The AML investigator queue is backed by <span className="layer-chip gold ml-1">gold.fct_aml_alert_score</span>{' '}
          — a single dbt mart that joins vendor-generated alerts with the unified transaction history,
          customer KYC, and OFAC matches. The challenger graph model is shipping 2x the precision of the
          incumbent rules engine.
        </p>
      </header>

      <section className="mb-10 grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Kpi label="Open alerts" value={data ? fmtInt(data.queue.open_alerts) : '—'} sub={data ? `Median age ${data.queue.median_age_days}d, SLA ${data.queue.sla_days}d` : ''} tone={data && data.queue.median_age_days > data.queue.sla_days ? 'caution' : 'neutral'} />
        <Kpi label="SARs filed YTD" value={data ? fmtInt(data.ytd.sars_filed) : '—'} sub={data ? `${fmtPct(data.ytd.sar_acceptance_pct, 1)} accepted by FinCEN` : ''} />
        <Kpi label="CTRs filed YTD" value={data ? fmtInt(data.ytd.ctrs_filed) : '—'} sub="Currency Transaction Reports" />
        <Kpi label="Investigators" value={data ? fmtInt(data.queue.investigators) : '—'} sub={data ? `${data.queue.alerts_per_investigator.toFixed(1)} alerts each` : ''} />
      </section>

      <section className="mb-10">
        <h2 className="font-serif text-xl font-semibold text-[var(--ink-strong)] border-b border-[var(--hairline)] pb-2 mb-4">Top typologies</h2>
        <div className="research-card overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Typology</th>
                <th className="num">Alerts YTD</th>
                <th className="num">SARs filed</th>
                <th className="num">Share</th>
              </tr>
            </thead>
            <tbody>
              {(data?.typologies ?? []).map((t) => (
                <tr key={t.typology}>
                  <td className="font-semibold text-[var(--ink-strong)]">{t.typology}</td>
                  <td className="num">{t.alerts.toLocaleString()}</td>
                  <td className="num">{t.sars}</td>
                  <td className="num">{t.share_pct.toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="font-serif text-xl font-semibold text-[var(--ink-strong)] border-b border-[var(--hairline)] pb-2 mb-4">Champion vs Challenger</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ModelCard label="Champion" model={data?.model_perf.champion} />
          <ModelCard label="Challenger" model={data?.model_perf.challenger} highlight />
        </div>
      </section>

      <section>
        <h2 className="font-serif text-xl font-semibold text-[var(--ink-strong)] border-b border-[var(--hairline)] pb-2 mb-4">Investigator productivity</h2>
        <div className="research-card overflow-hidden">
          <table className="data-table">
            <thead>
              <tr>
                <th>Team</th>
                <th className="num">Headcount</th>
                <th className="num">Closed per week</th>
                <th className="num">Median close (days)</th>
              </tr>
            </thead>
            <tbody>
              {(data?.investigator_productivity ?? []).map((t) => (
                <tr key={t.team}>
                  <td className="font-semibold text-[var(--ink-strong)]">{t.team}</td>
                  <td className="num">{t.headcount}</td>
                  <td className="num">{t.closed_per_week}</td>
                  <td className="num">{t.median_close_days}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Kpi({ label, value, sub, tone }: { label: string; value: string; sub?: string; tone?: 'bull' | 'bear' | 'caution' | 'neutral' }) {
  const color = tone === 'bull' ? 'var(--bull)' : tone === 'bear' ? 'var(--bear)' : tone === 'caution' ? 'var(--caution)' : 'var(--ink-strong)';
  return (
    <div className="research-card px-5 py-4">
      <div className="text-[10.5px] font-semibold text-[var(--ink-soft)] uppercase tracking-[0.08em]">{label}</div>
      <div className="mt-1 font-serif text-2xl font-semibold leading-none tabular" style={{ color }}>{value}</div>
      {sub && <div className="mt-1.5 text-[11px] text-[var(--ink-soft)]">{sub}</div>}
    </div>
  );
}

function ModelCard({ label, model, highlight }: { label: string; model: { model: string; precision_pct: number; recall_pct: number; alerts_per_day: number } | undefined; highlight?: boolean }) {
  return (
    <div className="research-card p-5" style={highlight ? { borderColor: 'var(--gold)' } : undefined}>
      <div className="eyebrow mb-2">{label}</div>
      <div className="font-serif text-lg font-semibold text-[var(--ink-strong)]">{model?.model ?? '—'}</div>
      <div className="mt-3 grid grid-cols-3 gap-3">
        <Metric label="Precision" value={model ? `${model.precision_pct.toFixed(1)}%` : '—'} />
        <Metric label="Recall" value={model ? `${model.recall_pct.toFixed(1)}%` : '—'} />
        <Metric label="Alerts/day" value={model ? model.alerts_per_day.toLocaleString() : '—'} />
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-[var(--ink-soft)] font-semibold">{label}</div>
      <div className="mt-1 font-serif text-xl font-semibold text-[var(--ink-strong)] tabular">{value}</div>
    </div>
  );
}
