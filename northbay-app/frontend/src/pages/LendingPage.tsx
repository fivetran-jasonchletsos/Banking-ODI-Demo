import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
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
        <h1 className="font-serif text-[2rem] sm:text-[2.4rem] font-semibold tracking-tight text-[var(--ink-strong)]">
          {data ? fmtCurrencyB(data.loans_b_total, 0) : '—'} in loans, eight categories, one truth
        </h1>
        <p className="mt-3 text-[var(--ink-muted)] leading-relaxed">
          The credit-risk team queries the unified loan-portfolio gold mart
          for every regulatory cut: CECL, stress test, capital planning, allowance reconciliation. The
          watchlist below is computed daily from the unified loan ledger.
        </p>
      </header>

      <section className="mb-10">
        <h2 className="font-serif text-xl font-semibold text-[var(--ink-strong)] pb-3 mb-4 border-b-2 border-[var(--gold-dim)]">Loans by category</h2>
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
          <h2 className="font-serif text-xl font-semibold text-[var(--ink-strong)] pb-3 mb-4 border-b-2 border-[var(--gold-dim)]">Credit quality buckets</h2>
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
          <div className="flex items-baseline justify-between pb-3 mb-4 border-b-2 border-[var(--gold-dim)]">
            <h2 className="font-serif text-xl font-semibold text-[var(--ink-strong)]">Provision for credit losses</h2>
            <span className="ticker text-[10px] text-[var(--ink-soft)] uppercase tracking-wider">
              NCO bps · Provision $M
            </span>
          </div>
          <div className="research-card p-4">
            <NcoProvisionChart
              data={(data?.provision_for_credit_losses ?? []).map((p, i) => ({
                quarter: p.quarter,
                provision_m: p.provision_m,
                nco_bps: data?.nco_trend[i]?.nco_bps ?? 0,
              }))}
            />
            <p className="mt-3 text-[11px] text-[var(--ink-muted)] leading-relaxed">
              Provisions track net charge-offs with a single-quarter lead. CECL bumps when
              NCOs accelerate; the chart shows whether the reserve build is keeping pace.
            </p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="font-serif text-xl font-semibold text-[var(--ink-strong)] pb-3 mb-4 border-b-2 border-[var(--gold-dim)]">Watchlist</h2>
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

type NcoProvisionRow = { quarter: string; provision_m: number; nco_bps: number };

function NcoProvisionChart({ data }: { data: NcoProvisionRow[] }) {
  if (data.length === 0) {
    return <div className="h-[260px] flex items-center justify-center text-[var(--ink-soft)] text-sm">Loading...</div>;
  }
  return (
    <div style={{ width: '100%', height: 260 }}>
      <ResponsiveContainer>
        <ComposedChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="var(--hairline-soft)" vertical={false} />
          <XAxis
            dataKey="quarter"
            tick={{ fill: 'var(--ink-soft)', fontSize: 11, fontFamily: 'inherit' }}
            tickLine={false}
            axisLine={{ stroke: 'var(--hairline)' }}
          />
          <YAxis
            yAxisId="left"
            tick={{ fill: 'var(--ink-soft)', fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: 'var(--hairline)' }}
            label={{ value: 'Provision ($M)', angle: -90, position: 'insideLeft', offset: 14, style: { fontSize: 10, fill: 'var(--ink-soft)', textAnchor: 'middle' } }}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tick={{ fill: 'var(--ink-soft)', fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: 'var(--hairline)' }}
            label={{ value: 'NCO (bps)', angle: 90, position: 'insideRight', offset: 12, style: { fontSize: 10, fill: 'var(--ink-soft)', textAnchor: 'middle' } }}
          />
          <Tooltip
            cursor={{ fill: 'rgba(212,175,55,0.06)' }}
            contentStyle={{
              background: 'var(--paper)',
              border: '1px solid var(--hairline)',
              borderRadius: 2,
              fontSize: 12,
              padding: '8px 10px',
            }}
            labelStyle={{ color: 'var(--ink-strong)', fontWeight: 600 }}
            formatter={(value, name) => {
              const v = typeof value === 'number' ? value : Number(value ?? 0);
              const n = String(name ?? '');
              if (n === 'Provision') return [`$${v}M`, n];
              return [`${v} bps`, n];
            }}
          />
          <Legend
            wrapperStyle={{ fontSize: 11, paddingTop: 4 }}
            iconType="square"
          />
          <Bar
            yAxisId="left"
            dataKey="provision_m"
            name="Provision"
            fill="var(--navy-deep)"
            radius={[2, 2, 0, 0]}
            barSize={22}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="nco_bps"
            name="NCO (bps)"
            stroke="var(--gold)"
            strokeWidth={2.25}
            dot={{ r: 3, fill: 'var(--gold)', strokeWidth: 0 }}
            activeDot={{ r: 5 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
