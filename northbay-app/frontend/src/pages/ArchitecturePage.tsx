import { useJson } from '../components/data';

type Iceberg = {
  catalog: string; bucket: string; destination: string;
  lineage: { tag: string; label: string; desc: string; accent: 'bronze' | 'silver' | 'gold' }[];
  tables: { table: string; rows: number; size_gb: number; format: string }[];
};

const SOURCES = [
  { tag: 'Core banking',     name: 'FIS Horizon',                          desc: 'System of record. Accounts, balances, posted transactions. CDC via Fivetran.' },
  { tag: 'CRM',              name: 'Salesforce Financial Services Cloud',  desc: 'Households, relationships, RM assignment, opportunity pipeline.' },
  { tag: 'Loan origination', name: 'nCino',                                 desc: 'Commercial loan applications, underwriting, covenants, approvals.' },
  { tag: 'Aggregation',      name: 'Plaid',                                 desc: 'External account balances, identity, transaction stream.' },
  { tag: 'AML',              name: 'AML Monitoring Vendor',                 desc: 'Transaction monitoring alerts, case state, SAR drafts.' },
  { tag: 'Cards',            name: 'Visa and Mastercard merchant feeds',    desc: 'Authorization, settlement, decline, dispute, chargeback.' },
  { tag: 'Watchlists',       name: 'OFAC and FinCEN',                       desc: 'SDN, SSI, 314(a) requests, geographic targeting orders.' },
  { tag: 'Branch ops',       name: 'Branch teller logs',                    desc: 'Cash deposits, withdrawals, monetary instruments. Structuring inputs.' },
];

export default function ArchitecturePage() {
  const { data } = useJson<Iceberg>('iceberg');

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-8 max-w-3xl">
        <div className="eyebrow mb-1">Open Data Infrastructure, Banking Reference</div>
        <h1 className="font-serif text-3xl font-semibold tracking-tight text-[var(--ink-strong)]">
          Eight sources. One Iceberg lake. Snowflake + Cortex on top.
        </h1>
        <p className="mt-3 text-[var(--ink-muted)] leading-relaxed">
          Northbay's architecture is deliberately flat. Fivetran lands every system into Apache Iceberg
          tables on S3. dbt builds bronze, silver, gold, and marts in place. Snowflake reads the gold
          tables as external tables; the Cortex fraud and AML agents read the same parquet files.
        </p>
      </header>

      <section className="mb-10">
        <h2 className="font-serif text-xl font-semibold text-[var(--ink-strong)] border-b border-[var(--hairline)] pb-2 mb-4">Sources, ingested by Fivetran</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {SOURCES.map((s) => (
            <div key={s.name} className="research-card p-4">
              <div className="layer-chip bronze inline-flex mb-2">{s.tag}</div>
              <div className="font-serif font-semibold text-[var(--ink-strong)]">{s.name}</div>
              <p className="text-xs text-[var(--ink-muted)] leading-relaxed mt-1">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-10">
        <h2 className="font-serif text-xl font-semibold text-[var(--ink-strong)] border-b border-[var(--hairline)] pb-2 mb-4">Lineage</h2>
        <ol className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {(data?.lineage ?? []).map((s) => (
            <li key={s.tag} className="research-card p-4 hover:border-[var(--gold)] transition-colors">
              <div className="text-[10px] font-mono font-bold text-[var(--gold-dim)] tracking-wider">{s.tag}</div>
              <div className="mt-1 font-serif text-base font-semibold text-[var(--ink-strong)]">{s.label}</div>
              <p className="mt-2 text-xs text-[var(--ink-muted)] leading-relaxed">{s.desc}</p>
              <div className="mt-3"><span className={`layer-chip ${s.accent}`}>{s.accent}</span></div>
            </li>
          ))}
        </ol>
      </section>

      <section className="mb-10">
        <h2 className="font-serif text-xl font-semibold text-[var(--ink-strong)] border-b border-[var(--hairline)] pb-2 mb-4">
          Iceberg tables, current
        </h2>
        <div className="research-card overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Table</th>
                <th className="num">Rows</th>
                <th className="num">Size</th>
                <th>Format</th>
              </tr>
            </thead>
            <tbody>
              {(data?.tables ?? []).map((t) => (
                <tr key={t.table}>
                  <td className="ticker text-[12.5px]">{t.table}</td>
                  <td className="num">{t.rows.toLocaleString()}</td>
                  <td className="num">{t.size_gb.toFixed(1)} GB</td>
                  <td className="text-[var(--ink-muted)]">{t.format}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="research-card p-5">
          <div className="eyebrow mb-2">Catalog</div>
          <h3 className="font-serif text-lg font-semibold text-[var(--ink-strong)]">{data?.catalog ?? 'AWS Glue Data Catalog'}</h3>
          <p className="mt-2 text-sm text-[var(--ink-muted)] leading-relaxed">
            Iceberg REST API. Table-level access control mapped to Northbay's LDAP. Every read is logged
            for examiner audit.
          </p>
        </div>
        <div className="research-card p-5">
          <div className="eyebrow mb-2">Destination</div>
          <h3 className="font-serif text-lg font-semibold text-[var(--ink-strong)]">{data?.destination ?? 'Snowflake + Iceberg'}</h3>
          <p className="mt-2 text-sm text-[var(--ink-muted)] leading-relaxed">
            Snowflake reads the gold tables as Iceberg external tables. No data copy. The Cortex fraud
            agent reads the same files through the Glue catalog.
          </p>
        </div>
      </section>
    </div>
  );
}
