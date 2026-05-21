import { useJson, fmtCurrencyB, fmtCurrencyM, fmtPct, fmtInt } from '../components/data';

type Commercial = {
  kpis: { relationships: number; credit_exposure_b: number; deposit_balances_b: number; treasury_revenue_m_annualized: number; revenue_per_relationship_k: number; treasury_penetration_pct: number };
  top_relationships: { rank: number; name: string; industry: string; credit_exposure_m: number; deposit_balance_m: number; treasury_products: number; revenue_m: number }[];
};

export default function CommercialPage() {
  const { data } = useJson<Commercial>('commercial');

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-8 max-w-3xl">
        <div className="eyebrow mb-1">Commercial bank, relationship view</div>
        <h1 className="font-serif text-3xl font-semibold tracking-tight text-[var(--ink-strong)]">
          {data ? fmtInt(data.kpis.relationships) : '—'} commercial relationships, ranked by revenue
        </h1>
        <p className="mt-3 text-[var(--ink-muted)] leading-relaxed">
          Relationship managers query <span className="layer-chip gold ml-1">gold.fct_commercial_relationship_revenue</span>{' '}
          for next-best-action prompts. Treasury services penetration is the leading indicator of
          relationship stickiness and three-year customer lifetime value.
        </p>
      </header>

      <section className="mb-10 grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Kpi label="Credit exposure" value={data ? fmtCurrencyB(data.kpis.credit_exposure_b, 1) : '—'} />
        <Kpi label="Deposit balances" value={data ? fmtCurrencyB(data.kpis.deposit_balances_b, 1) : '—'} />
        <Kpi label="Treasury revenue, annualized" value={data ? fmtCurrencyM(data.kpis.treasury_revenue_m_annualized, 0) : '—'} />
        <Kpi label="Treasury penetration" value={data ? fmtPct(data.kpis.treasury_penetration_pct) : '—'} />
      </section>

      <section>
        <h2 className="font-serif text-xl font-semibold text-[var(--ink-strong)] border-b border-[var(--hairline)] pb-2 mb-4">
          Top 20 commercial relationships
        </h2>
        <div className="research-card overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th className="num">Rank</th>
                <th>Relationship</th>
                <th>Industry</th>
                <th className="num">Credit exposure</th>
                <th className="num">Deposits</th>
                <th className="num">Treasury</th>
                <th className="num">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {(data?.top_relationships ?? []).map((r) => (
                <tr key={r.rank}>
                  <td className="num">{r.rank}</td>
                  <td className="font-semibold text-[var(--ink-strong)]">{r.name}</td>
                  <td className="text-[12px] text-[var(--ink-muted)]">{r.industry}</td>
                  <td className="num">${r.credit_exposure_m.toFixed(1)}M</td>
                  <td className="num">${r.deposit_balance_m.toFixed(1)}M</td>
                  <td className="num">{r.treasury_products}</td>
                  <td className="num font-semibold text-[var(--bull)]">${r.revenue_m.toFixed(1)}M</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="research-card px-5 py-4">
      <div className="text-[10.5px] font-semibold text-[var(--ink-soft)] uppercase tracking-[0.08em]">{label}</div>
      <div className="mt-1 font-serif text-2xl font-semibold leading-none tabular text-[var(--ink-strong)]">{value}</div>
    </div>
  );
}
