import { useJson, fmtPct } from '../components/data';

type Deposits = {
  by_product: { product: string; balance_b: number; accounts_m: number; avg_rate_pct: number; share_pct: number }[];
  tier_mix: { tier: string; share_pct: number; avg_balance_usd: number }[];
  top_growth_markets: { msa: string; net_new_b: number; yoy_pct: number }[];
  deposit_beta: {
    definition: string; current_pct: number; peer_median_pct: number;
    by_tier_pct: { tier: string; beta_pct: number }[];
    sensitivity_table: { scenario: string; annual_nii_delta_m: number }[];
  };
  monthly_balance_b: { month: string; balance: number }[];
};

export default function DepositsPage() {
  const { data } = useJson<Deposits>('deposits');

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-8 max-w-3xl">
        <div className="eyebrow mb-1">Deposit franchise</div>
        <h1 className="font-serif text-[2rem] sm:text-[2.4rem] font-semibold tracking-tight text-[var(--ink-strong)]">
          Four products, four tiers, one deposit-beta model
        </h1>
        <p className="mt-3 text-[var(--ink-muted)] leading-relaxed">
          The treasury team queries the deposit-beta gold mart
          to size sensitivity to Fed funds. Per-tier beta drives the next-best-rate offer to retail
          customers and the funding-curve assumption for the ALM committee.
        </p>
      </header>

      <section className="mb-10">
        <h2 className="font-serif text-xl font-semibold text-[var(--ink-strong)] pb-3 mb-4 border-b-2 border-[var(--gold-dim)]">By product</h2>
        <div className="research-card overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Product</th>
                <th className="num">Balance</th>
                <th className="num">Accounts</th>
                <th className="num">Avg rate</th>
                <th className="num">Share</th>
              </tr>
            </thead>
            <tbody>
              {(data?.by_product ?? []).map((p) => (
                <tr key={p.product}>
                  <td className="font-semibold text-[var(--ink-strong)]">{p.product}</td>
                  <td className="num">${p.balance_b.toFixed(1)}B</td>
                  <td className="num">{p.accounts_m.toFixed(1)}M</td>
                  <td className="num">{p.avg_rate_pct.toFixed(2)}%</td>
                  <td className="num">{p.share_pct.toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-10 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h2 className="font-serif text-xl font-semibold text-[var(--ink-strong)] pb-3 mb-4 border-b-2 border-[var(--gold-dim)]">Tier mix</h2>
          <div className="research-card overflow-hidden">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Tier</th>
                  <th className="num">Share</th>
                  <th className="num">Avg balance</th>
                </tr>
              </thead>
              <tbody>
                {(data?.tier_mix ?? []).map((t) => (
                  <tr key={t.tier}>
                    <td className="font-semibold text-[var(--ink-strong)]">{t.tier}</td>
                    <td className="num">{t.share_pct.toFixed(1)}%</td>
                    <td className="num">${t.avg_balance_usd.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div>
          <h2 className="font-serif text-xl font-semibold text-[var(--ink-strong)] pb-3 mb-4 border-b-2 border-[var(--gold-dim)]">Deposit beta by product</h2>
          <div className="research-card p-5">
            <div className="text-[12px] text-[var(--ink-muted)] mb-4 leading-relaxed">{data?.deposit_beta.definition}</div>
            <div className="flex items-baseline gap-3 mb-4">
              <div className="font-serif text-3xl font-semibold tabular text-[var(--ink-strong)]">{data ? fmtPct(data.deposit_beta.current_pct, 1) : '—'}</div>
              <div className="text-[12px] text-[var(--ink-soft)]">Bank cycle beta</div>
              <div className="text-[12px] text-[var(--ink-muted)] ml-auto">Peer median: {data ? fmtPct(data.deposit_beta.peer_median_pct, 1) : '—'}</div>
            </div>
            <div className="space-y-2">
              {(data?.deposit_beta.by_tier_pct ?? []).map((b) => (
                <div key={b.tier}>
                  <div className="flex justify-between text-[12px] mb-1">
                    <span className="font-semibold text-[var(--ink-strong)]">{b.tier}</span>
                    <span className="tabular">{b.beta_pct.toFixed(1)}%</span>
                  </div>
                  <div className="h-2 bg-[var(--paper-deep)] rounded-sm overflow-hidden">
                    <div className="h-full" style={{ width: `${Math.min(b.beta_pct, 100)}%`, background: 'var(--gold)' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="font-serif text-xl font-semibold text-[var(--ink-strong)] pb-3 mb-4 border-b-2 border-[var(--gold-dim)]">
          NII sensitivity to Fed rate moves
        </h2>
        <div className="research-card overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Scenario</th>
                <th className="num">12-month NII delta</th>
              </tr>
            </thead>
            <tbody>
              {(data?.deposit_beta.sensitivity_table ?? []).map((s) => (
                <tr key={s.scenario}>
                  <td className="font-semibold text-[var(--ink-strong)]">{s.scenario}</td>
                  <td className="num" style={{ color: s.annual_nii_delta_m < 0 ? 'var(--alert)' : s.annual_nii_delta_m > 0 ? 'var(--bull)' : 'var(--ink)' }}>
                    {s.annual_nii_delta_m >= 0 ? '+' : ''}${s.annual_nii_delta_m}M
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="font-serif text-xl font-semibold text-[var(--ink-strong)] pb-3 mb-4 border-b-2 border-[var(--gold-dim)]">Top 20 deposit-growth markets</h2>
        <div className="research-card overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th className="num">Rank</th>
                <th>MSA</th>
                <th className="num">Net new deposits</th>
                <th className="num">YoY growth</th>
              </tr>
            </thead>
            <tbody>
              {(data?.top_growth_markets ?? []).map((m, i) => (
                <tr key={m.msa}>
                  <td className="num">{i + 1}</td>
                  <td className="font-semibold text-[var(--ink-strong)]">{m.msa}</td>
                  <td className="num">${m.net_new_b.toFixed(2)}B</td>
                  <td className="num text-[var(--bull)]">+{m.yoy_pct.toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
