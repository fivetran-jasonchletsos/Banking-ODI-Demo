import { useJson, fmtCurrencyB, fmtPct } from '../components/data';

type Lending = {
  as_of: string;
  loans_b_total: number;
  by_category: { category: string; balance_b: number; share_pct: number; yield_pct: number; ncl_bps: number }[];
  credit_quality: { bucket: string; share_pct: number; balance_b: number }[];
  nco_trend: { quarter: string; nco_bps: number }[];
  provision_for_credit_losses: { quarter: string; provision_m: number }[];
  watchlist: { segment: string; exposure_b: number; watch_pct: number; headline: string }[];
};

export default function LendingPage() {
  const { data } = useJson<Lending>('lending');

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-8 max-w-3xl">
        <div className="eyebrow mb-1">Lending portfolio, credit risk view</div>
        <h1 className="font-serif text-3xl font-semibold tracking-tight text-[var(--ink-strong)]">
          {data ? fmtCurrencyB(data.loans_b_total, 0) : '—'} in loans, eight categories, one truth
        </h1>
        <p className="mt-3 text-[var(--ink-muted)] leading-relaxed">
          The credit-risk team queries <span className="layer-chip gold ml-1">gold.fct_loan_portfolio</span>{' '}
          for every regulatory cut: CECL, stress test, capital planning, allowance reconciliation. The
          watchlist below is computed daily from the unified loan ledger.
        </p>
      </header>

      <section className="mb-10">
        <h2 className="font-serif text-xl font-semibold text-[var(--ink-strong)] border-b border-[var(--hairline)] pb-2 mb-4">Loans by category</h2>
        <div className="research-card overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Category</th>
                <th className="num">Balance</th>
                <th className="num">Share</th>
                <th className="num">Yield</th>
                <th className="num">NCL (bps)</th>
              </tr>
            </thead>
            <tbody>
              {(data?.by_category ?? []).map((c) => (
                <tr key={c.category}>
                  <td className="font-semibold text-[var(--ink-strong)]">{c.category}</td>
                  <td className="num">${c.balance_b.toFixed(1)}B</td>
                  <td className="num">{c.share_pct.toFixed(1)}%</td>
                  <td className="num">{c.yield_pct.toFixed(2)}%</td>
                  <td className="num" style={{ color: c.ncl_bps > 200 ? 'var(--alert)' : c.ncl_bps > 75 ? 'var(--caution)' : 'var(--ink)' }}>
                    {c.ncl_bps}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-10 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h2 className="font-serif text-xl font-semibold text-[var(--ink-strong)] border-b border-[var(--hairline)] pb-2 mb-4">Credit quality buckets</h2>
          <div className="research-card overflow-hidden">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Bucket</th>
                  <th className="num">Share</th>
                  <th className="num">Balance</th>
                </tr>
              </thead>
              <tbody>
                {(data?.credit_quality ?? []).map((q) => (
                  <tr key={q.bucket}>
                    <td className="font-semibold text-[var(--ink-strong)]">{q.bucket}</td>
                    <td className="num" style={{ color: q.bucket.startsWith('90') ? 'var(--alert)' : q.bucket.startsWith('60') ? 'var(--caution)' : 'var(--ink)' }}>
                      {fmtPct(q.share_pct, 2)}
                    </td>
                    <td className="num">${q.balance_b.toFixed(2)}B</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div>
          <h2 className="font-serif text-xl font-semibold text-[var(--ink-strong)] border-b border-[var(--hairline)] pb-2 mb-4">Provision for credit losses</h2>
          <div className="research-card overflow-hidden">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Quarter</th>
                  <th className="num">Provision</th>
                  <th className="num">NCO (bps)</th>
                </tr>
              </thead>
              <tbody>
                {(data?.provision_for_credit_losses ?? []).map((p, i) => {
                  const nco = data?.nco_trend[i];
                  return (
                    <tr key={p.quarter}>
                      <td className="font-semibold text-[var(--ink-strong)]">{p.quarter}</td>
                      <td className="num">${p.provision_m}M</td>
                      <td className="num">{nco?.nco_bps ?? '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section>
        <h2 className="font-serif text-xl font-semibold text-[var(--ink-strong)] border-b border-[var(--hairline)] pb-2 mb-4">Watchlist</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {(data?.watchlist ?? []).map((w) => (
            <div key={w.segment} className="research-card p-5" style={{ borderColor: 'var(--caution)' }}>
              <div className="flex items-center justify-between mb-2">
                <span className="status-pill caution">Watch {w.watch_pct.toFixed(1)}%</span>
                <span className="font-serif font-semibold text-[var(--ink-strong)] tabular">${w.exposure_b.toFixed(1)}B</span>
              </div>
              <div className="font-serif font-semibold text-[var(--ink-strong)]">{w.segment}</div>
              <p className="text-[12px] text-[var(--ink-muted)] mt-2 leading-relaxed">{w.headline}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
