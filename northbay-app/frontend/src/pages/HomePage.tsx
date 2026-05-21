import { useNavigate } from 'react-router-dom';
import { useJson, fmtCurrencyB, fmtPct, fmtInt } from '../components/data';

type Summary = {
  bank: {
    name: string; assets_usd: number; deposits_usd: number; loans_usd: number;
    branches: number; states: number; retail_customers: number; commercial_relationships: number;
  };
  kpis: {
    roa_pct: number; roe_pct: number; efficiency_ratio_pct: number; nim_pct: number;
    deposit_beta_cycle_pct: number; cet1_ratio_pct: number; lcr_pct: number; nps: number;
    active_digital_users_pct: number; ncl_ratio_pct: number;
  };
  deltas_yoy: {
    deposits_usd_pct: number; loans_usd_pct: number; nim_pct_bps: number;
    efficiency_ratio_pct_bps: number; nps: number;
  };
  top_cdo_issues: { id: string; headline: string; detail: string; owner: string; severity: string; '$_at_risk_m': number }[];
  regions: { region: string; branches: number; deposits_b: number; loans_b: number; nps: number }[];
};

export default function HomePage() {
  const { data } = useJson<Summary>('summary');
  const navigate = useNavigate();

  return (
    <>
      {/* Hero */}
      <section className="bg-[var(--navy-deep)] text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.06] pointer-events-none" aria-hidden style={{
          backgroundImage: 'repeating-linear-gradient(135deg, transparent 0 28px, rgba(212,175,55,0.5) 28px 29px)',
        }} />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24 relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-end">
            <div className="lg:col-span-7">
              <div className="eyebrow-light mb-4">Northbay Financial, Open Data Infrastructure</div>
              <h1 className="font-serif text-4xl sm:text-6xl font-semibold text-white leading-[0.98] tracking-tight">
                One bank.<br />
                <span className="text-[var(--gold-bright)]">Seven systems.</span><br />
                One lake.
              </h1>
              <p className="mt-6 text-base sm:text-lg text-white/75 max-w-2xl leading-relaxed">
                A top-15 US bank rebuilt on open data. Core banking, CRM, loan origination, fraud, AML,
                and card-network feeds all land in customer-owned Iceberg tables. Snowflake, Trino, and
                Cortex agents share the same gold layer, governed by dbt and Fivetran.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  onClick={() => navigate('/fraud')}
                  className="inline-flex items-center gap-2 rounded-sm font-semibold text-sm text-[var(--navy-deep)] px-5 py-3 shadow-lg hover:opacity-95 transition-opacity"
                  style={{ background: 'var(--gold)' }}
                >
                  Open the fraud desk <span aria-hidden>→</span>
                </button>
                <button
                  onClick={() => navigate('/architecture')}
                  className="inline-flex items-center gap-2 rounded-sm font-semibold text-sm text-white bg-white/5 border border-white/20 px-5 py-3 hover:bg-white/10 transition-colors"
                >
                  See the architecture <span aria-hidden>→</span>
                </button>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="bg-white text-[var(--ink)] rounded-sm border border-[var(--hairline)] shadow-xl overflow-hidden">
                <div className="px-5 py-3 border-b border-[var(--hairline)] flex items-center justify-between bg-[var(--paper-deep)]">
                  <div className="eyebrow">Balance Sheet, As of 2026-05-20</div>
                  <div className="text-[10px] font-semibold text-[var(--ink-soft)] uppercase tracking-wider">Iceberg gold</div>
                </div>
                <div className="grid grid-cols-2 divide-x divide-y divide-[var(--hairline-soft)] tabular">
                  <Stat label="Assets" value={data ? fmtCurrencyB(data.bank.assets_usd / 1e9, 0) : '—'} hint="Tier-1 disclosed" />
                  <Stat label="Deposits" value={data ? fmtCurrencyB(data.bank.deposits_usd / 1e9, 0) : '—'} hint={data ? `YoY ${data.deltas_yoy.deposits_usd_pct >= 0 ? '+' : ''}${data.deltas_yoy.deposits_usd_pct}%` : ''} delta={data?.deltas_yoy.deposits_usd_pct} />
                  <Stat label="Loans" value={data ? fmtCurrencyB(data.bank.loans_usd / 1e9, 0) : '—'} hint={data ? `YoY +${data.deltas_yoy.loans_usd_pct}%` : ''} delta={data?.deltas_yoy.loans_usd_pct} />
                  <Stat label="ROA" value={data ? fmtPct(data.kpis.roa_pct, 2) : '—'} hint={data ? `ROE ${data.kpis.roe_pct}%` : ''} />
                </div>
                <div className="px-5 py-3 border-t border-[var(--hairline)] flex items-center justify-between text-[11px] text-[var(--ink-soft)] bg-[var(--paper-deep)]">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-[var(--bull)] animate-pulse" />
                    {data ? fmtInt(data.bank.branches) : '—'} branches across {data?.bank.states ?? '—'} states
                  </span>
                  <button onClick={() => navigate('/pipeline')} className="font-semibold hover:text-[var(--ink-strong)] uppercase tracking-wider">
                    Inspect →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CDO desk, top issues */}
      <section className="mx-auto max-w-7xl px-4 pt-12 pb-2 sm:px-6 lg:px-8">
        <div className="mb-5 flex items-end justify-between border-b border-[var(--hairline)] pb-3">
          <div>
            <div className="eyebrow mb-1">On the CDO's desk this morning</div>
            <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[var(--ink-strong)] tracking-tight">
              Three issues already triaged by the gold layer
            </h2>
            <p className="text-sm text-[var(--ink-muted)] mt-1">
              Each item was flagged by an agent reading a single dbt mart, not by an analyst stitching seven systems.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          {(data?.top_cdo_issues ?? []).map((issue) => (
            <div key={issue.id} className="research-card p-5 hover:border-[var(--gold)] transition-colors">
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className={`status-pill ${issue.severity === 'high' ? 'alert' : issue.severity === 'elevated' ? 'caution' : 'neutral'}`}>{issue.severity}</span>
                <span className="ticker text-[10px] text-[var(--ink-soft)]">{issue.id}</span>
              </div>
              <h3 className="font-serif text-lg font-semibold text-[var(--ink-strong)] leading-snug">{issue.headline}</h3>
              <p className="mt-2 text-sm text-[var(--ink-muted)] leading-relaxed">{issue.detail}</p>
              <div className="mt-3 flex items-center justify-between text-[11px]">
                <span className="text-[var(--ink-soft)]">Owner: <span className="font-semibold text-[var(--ink)]">{issue.owner}</span></span>
                {issue['$_at_risk_m'] > 0 && (
                  <span className="font-semibold text-[var(--alert)] tabular">${issue['$_at_risk_m'].toLocaleString()}M at risk</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Regional table */}
      <section className="mx-auto max-w-7xl px-4 pt-12 pb-2 sm:px-6 lg:px-8">
        <div className="mb-4 flex items-end justify-between border-b border-[var(--hairline)] pb-3">
          <div>
            <div className="eyebrow mb-1">Regional Performance</div>
            <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[var(--ink-strong)] tracking-tight">
              Six regions, one gold table
            </h2>
          </div>
          <span className="layer-chip gold">gold.fct_region_performance</span>
        </div>
        <div className="research-card overflow-hidden">
          <table className="data-table">
            <thead>
              <tr>
                <th>Region</th>
                <th className="num">Branches</th>
                <th className="num">Deposits</th>
                <th className="num">Loans</th>
                <th className="num">NPS</th>
              </tr>
            </thead>
            <tbody>
              {(data?.regions ?? []).map((r) => (
                <tr key={r.region}>
                  <td className="font-semibold text-[var(--ink-strong)]">{r.region}</td>
                  <td className="num">{r.branches}</td>
                  <td className="num">${r.deposits_b.toFixed(1)}B</td>
                  <td className="num">${r.loans_b.toFixed(1)}B</td>
                  <td className="num">{r.nps}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* KPI tiles */}
      <section className="bg-[var(--paper)] border-y border-[var(--hairline)] mt-12">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-8">
            <div className="eyebrow mb-2">Risk and capital, snapshot</div>
            <h2 className="font-serif text-3xl font-semibold text-[var(--ink-strong)] tracking-tight">
              The numbers the CRO watches before coffee
            </h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            <KpiTile label="CET1 ratio" value={data ? fmtPct(data.kpis.cet1_ratio_pct) : '—'} sub="Regulatory min 7.0%" />
            <KpiTile label="LCR" value={data ? fmtPct(data.kpis.lcr_pct, 0) : '—'} sub="Regulatory min 100%" />
            <KpiTile label="Net interest margin" value={data ? fmtPct(data.kpis.nim_pct) : '—'} sub={data ? `YoY ${data.deltas_yoy.nim_pct_bps} bps` : ''} tone={data && data.deltas_yoy.nim_pct_bps < 0 ? 'bear' : 'neutral'} />
            <KpiTile label="Efficiency ratio" value={data ? fmtPct(data.kpis.efficiency_ratio_pct) : '—'} sub="Lower is better" tone={data && data.kpis.efficiency_ratio_pct > 60 ? 'caution' : 'neutral'} />
            <KpiTile label="Net charge-off ratio" value={data ? fmtPct(data.kpis.ncl_ratio_pct, 2) : '—'} sub="Tier-1 peer median 0.42%" />
          </div>
        </div>
      </section>

      {/* Closing */}
      <section className="bg-[var(--navy-deep)] text-white border-t border-[var(--hairline)]">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8 text-center">
          <div className="eyebrow-light mb-3">Design principle</div>
          <p className="font-serif text-2xl sm:text-3xl text-white leading-snug">
            "A bank has seven core systems.<br />
            <span className="text-[var(--gold-bright)]">It does not need seven copies of the truth.</span>"
          </p>
          <p className="mt-4 text-sm text-white/70 max-w-2xl mx-auto">
            Fivetran lands every source into open Iceberg tables. dbt builds the governed gold layer.
            Snowflake, Trino, and the Cortex fraud agent read the same files. No warehouse round-trip.
          </p>
        </div>
      </section>
    </>
  );
}

function Stat({ label, value, hint, delta }: { label: string; value: string; hint: string; delta?: number }) {
  const deltaColor = delta == null ? 'var(--ink-soft)' : delta >= 0 ? 'var(--bull)' : 'var(--bear)';
  return (
    <div className="px-5 py-4">
      <div className="text-[10.5px] font-semibold text-[var(--ink-soft)] uppercase tracking-[0.08em]">{label}</div>
      <div className="mt-1 flex items-baseline gap-2">
        <div className="font-serif text-2xl font-semibold text-[var(--ink-strong)] leading-none tabular">{value}</div>
        {delta != null && (
          <span className="text-[11px] font-semibold tabular" style={{ color: deltaColor }}>
            {delta >= 0 ? '+' : ''}{delta.toFixed(1)}%
          </span>
        )}
      </div>
      <div className="mt-1 text-[11px] text-[var(--ink-soft)]">{hint}</div>
    </div>
  );
}

function KpiTile({ label, value, sub, tone }: { label: string; value: string; sub?: string; tone?: 'bull' | 'bear' | 'caution' | 'neutral' }) {
  const color =
    tone === 'bull' ? 'var(--bull)' :
    tone === 'bear' ? 'var(--bear)' :
    tone === 'caution' ? 'var(--caution)' :
    'var(--ink-strong)';
  return (
    <div className="research-card px-5 py-4">
      <div className="text-[10.5px] font-semibold text-[var(--ink-soft)] uppercase tracking-[0.08em]">{label}</div>
      <div className="mt-1 font-serif text-3xl font-semibold leading-none tabular" style={{ color }}>{value}</div>
      {sub && <div className="mt-1.5 text-[11px] text-[var(--ink-soft)]">{sub}</div>}
    </div>
  );
}
