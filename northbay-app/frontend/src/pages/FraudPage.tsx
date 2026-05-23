import { useJson, fmtCurrencyM, fmtPct } from '../components/data';

type Fraud = {
  as_of: string;
  ytd: { cases_total: number; dollars_attempted_m: number; dollars_blocked_m: number; block_rate_pct: number; false_positive_rate_pct: number; median_decision_ms: number };
  by_channel: { channel: string; cases: number; blocked_m: number; fp_pct: number; trend: string }[];
  top_rings: { ring_id: string; type: string; geo: string; edges: number; '$_blocked_m': number; first_seen: string }[];
  active_queue: { case_id: string; channel: string; score: number; amount_usd: number; merchant: string; customer_tier: string; agent_recommendation: string }[];
};

export default function FraudPage() {
  const { data } = useJson<Fraud>('fraud');

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-8 max-w-3xl">
        <div className="eyebrow mb-1">Real-time fraud, agent-assisted decisioning</div>
        <h1 className="font-serif text-[2rem] sm:text-[2.4rem] font-semibold tracking-tight text-[var(--ink-strong)]">
          The fraud desk, powered by dbt-wizard and Cortex
        </h1>
        <p className="mt-3 text-[var(--ink-muted)] leading-relaxed">
          The Cortex fraud agent reads a single fraud-signal gold mart and joins it with customer history,
          merchant risk, and graph-derived ring membership in a single query. Block-or-allow is a sub-200ms
          decision against the open lake. But when the fraud desk asks a question the gold layer does not yet
          answer, dbt-wizard authors the missing model — tested, materialized, tagged — before the next
          morning briefing.
        </p>
      </header>

      <section className="mb-10 bg-[var(--paper-deep)] border border-[var(--hairline)] rounded-sm p-6">
        <div className="eyebrow mb-2">When the gold layer does not have the answer</div>
        <h2 className="font-serif text-xl font-semibold text-[var(--ink-strong)] mb-3">
          "Why did CNP fraud spike for tier-2 merchants in Texas last Tuesday?"
        </h2>
        <p className="text-sm text-[var(--ink-muted)] mb-5 max-w-3xl leading-relaxed">
          No <span className="ticker text-[11px]">gold.fct_cnp_fraud_by_merchant_tier_region_daily</span> table
          exists. Without dbt-wizard, the answer is three to five days away. With dbt-wizard's four
          sub-agents, the answer is ninety seconds away — and the model is production-grade by the time
          it lands.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { num: '01', name: 'Explorer', desc: 'Runs dbt status and dbt search. Maps the silver tables that cover CNP channel, merchant tier, and Texas geography.' },
            { num: '02', name: 'Summary', desc: 'Runs dbt describe and dbt lineage. Documents schema, confirms grain, flags a duplicate transaction edge case before SQL is written.' },
            { num: '03', name: 'Worker', desc: 'Writes the SQL, runs a dbt_show slice on an XS warehouse to validate the daily grain, edits the model file into the project.' },
            { num: '04', name: 'Verification', desc: 'Writes the schema YAML, adds column-level and uniqueness tests, runs the full test suite, tags the model ai_built. Done.' },
          ].map((a) => (
            <div key={a.num} className="research-card p-4" style={{ borderTop: '3px solid var(--gold-dim)' }}>
              <div className="font-mono text-[10px] text-[var(--ink-soft)] mb-1">{a.num}</div>
              <div className="font-serif text-base font-semibold text-[var(--ink-strong)] mb-1">{a.name}</div>
              <p className="text-xs text-[var(--ink-muted)] leading-relaxed">{a.desc}</p>
            </div>
          ))}
        </div>
        <p className="mt-5 text-sm text-[var(--ink-muted)] max-w-3xl">
          Once Verification confirms the materialization, the Cortex fraud agent reads the new gold table
          on its next pass. Build-time AI feeds run-time AI without an integration handoff or a second copy
          of the data.
        </p>
      </section>

      <section className="mb-10 grid grid-cols-2 lg:grid-cols-4 gap-3 stagger-children">
        <Kpi label="YTD attempted" value={data ? fmtCurrencyM(data.ytd.dollars_attempted_m, 1) : '—'} />
        <Kpi label="YTD blocked" value={data ? fmtCurrencyM(data.ytd.dollars_blocked_m, 1) : '—'} tone="bull" />
        <Kpi label="Block rate" value={data ? fmtPct(data.ytd.block_rate_pct, 2) : '—'} />
        <Kpi label="False positive rate" value={data ? fmtPct(data.ytd.false_positive_rate_pct, 2) : '—'} tone={data && data.ytd.false_positive_rate_pct > 5 ? 'caution' : 'neutral'} />
      </section>

      <section className="mb-10">
        <h2 className="font-serif text-xl font-semibold text-[var(--ink-strong)] pb-3 mb-4 border-b-2 border-[var(--gold-dim)]">By channel</h2>
        <div className="research-card overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Channel</th>
                <th className="num">Cases YTD</th>
                <th className="num">Blocked</th>
                <th className="num">False positive</th>
                <th>Trend</th>
              </tr>
            </thead>
            <tbody>
              {(data?.by_channel ?? []).map((c) => (
                <tr key={c.channel}>
                  <td className="font-semibold text-[var(--ink-strong)]">{c.channel}</td>
                  <td className="num">{c.cases.toLocaleString()}</td>
                  <td className="num">${c.blocked_m.toFixed(1)}M</td>
                  <td className="num">{c.fp_pct.toFixed(2)}%</td>
                  <td>
                    <span className={`status-pill ${c.trend === 'rising' ? 'alert' : c.trend === 'falling' ? 'bull' : 'neutral'}`}>{c.trend}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="font-serif text-xl font-semibold text-[var(--ink-strong)] pb-3 mb-4 border-b-2 border-[var(--gold-dim)]">
          Top fraud rings, graph model
        </h2>
        <p className="text-sm text-[var(--ink-muted)] mb-4 max-w-3xl">
          A graph model trained on the unified transaction layer surfaces clusters of accounts, devices,
          and merchants moving in coordinated ways. Each row below is a distinct ring with at least
          $1M in attempted fraud blocked.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 stagger-children">
          {(data?.top_rings ?? []).map((r) => (
            <div key={r.ring_id} className="research-card p-4">
              <div className="flex items-center justify-between">
                <span className="ticker text-[11px] text-[var(--gold-dim)]">{r.ring_id}</span>
                <span className="status-pill alert">{r.edges} edges</span>
              </div>
              <div className="mt-2 font-serif font-semibold text-[var(--ink-strong)]">{r.type}</div>
              <div className="text-[12px] text-[var(--ink-muted)] mt-0.5">{r.geo}</div>
              <div className="mt-3 flex items-center justify-between border-t border-[var(--hairline-soft)] pt-2">
                <div className="text-[11px] text-[var(--ink-soft)]">First seen {r.first_seen}</div>
                <div className="font-serif text-lg font-semibold text-[var(--bull)] tabular">${r['$_blocked_m'].toFixed(2)}M</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-serif text-xl font-semibold text-[var(--ink-strong)] pb-3 mb-4 border-b-2 border-[var(--gold-dim)]">
          Active queue, agent recommendations
        </h2>
        <p className="text-sm text-[var(--ink-muted)] mb-4 max-w-3xl">
          The Cortex agent reads inventory, risk rules, and customer history in one Iceberg read and
          returns a recommendation. The investigator either accepts the recommendation or overrides;
          the override becomes training data for the next model build.
        </p>
        <div className="research-card overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Case</th>
                <th>Channel</th>
                <th className="num">Score</th>
                <th className="num">Amount</th>
                <th>Context</th>
                <th>Agent recommends</th>
              </tr>
            </thead>
            <tbody>
              {(data?.active_queue ?? []).map((c) => (
                <tr key={c.case_id}>
                  <td className="ticker text-[11px]">{c.case_id}</td>
                  <td>{c.channel}</td>
                  <td className="num" style={{ color: c.score > 0.9 ? 'var(--alert)' : c.score > 0.8 ? 'var(--caution)' : 'var(--ink)' }}>
                    {c.score.toFixed(2)}
                  </td>
                  <td className="num">${c.amount_usd.toLocaleString()}</td>
                  <td className="text-[12px] text-[var(--ink-muted)]">{c.merchant}<div className="text-[10px] text-[var(--ink-soft)]">{c.customer_tier}</div></td>
                  <td className="text-[12px] font-semibold text-[var(--ink-strong)]">{c.agent_recommendation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Kpi({ label, value, tone }: { label: string; value: string; tone?: 'bull' | 'bear' | 'caution' | 'neutral' }) {
  const color = tone === 'bull' ? 'var(--bull)' : tone === 'bear' ? 'var(--bear)' : tone === 'caution' ? 'var(--caution)' : 'var(--ink-strong)';
  return (
    <div className="research-card px-5 py-4">
      <div className="eyebrow mb-1">{label}</div>
      <div className="mt-1 font-serif text-2xl font-semibold leading-none tabular kpi-num" style={{ color }}>{value}</div>
    </div>
  );
}
