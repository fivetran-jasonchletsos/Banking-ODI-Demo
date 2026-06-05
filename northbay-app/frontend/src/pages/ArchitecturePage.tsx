import { useJson } from '../components/data';
import {
  AliveMedallion,
  type SourceNode,
  type EngineNode,
  type ConsumerRole,
} from '../components/AliveMedallion';

type Iceberg = {
  catalog: string; bucket: string; destination: string;
  lineage: { tag: string; label: string; desc: string; accent: 'bronze' | 'silver' | 'gold' }[];
  tables: { table: string; rows: number; size_gb: number; format: string }[];
};

const BANKING_SOURCES: SourceNode[] = [
  { id: 'core',   label: 'Core Deposits System', sub: 'SQL Server log-CDC',   logo: 'sqlserver', freshness: '41s lag',  status: 'healthy', pipelineUrl: 'https://fivetran.com/dashboard/connectors/humble_hardware' },
  { id: 'loans',  label: 'Lending Platform',     sub: 'Oracle Binary Log Reader', logo: 'oracle', freshness: '2 min lag', status: 'healthy', pipelineUrl: 'https://fivetran.com/dashboard/connectors/hose_creatable' },
  { id: 'txn',    label: 'Real-Time Transactions', sub: 'Kafka event stream', logo: 'hl7',       freshness: 'live',      status: 'healthy', streaming: true },
  { id: 'occ',    label: 'OCC Call Reports',     sub: 'Quarterly regulatory', logo: 'cms',       freshness: '7d lag',   status: 'healthy' },
];
const BANKING_ENGINES: EngineNode[] = [
  { name: 'Snowflake', active: true,  logo: 'snowflake' },
  { name: 'Athena',                   logo: 'athena' },
  { name: 'DuckDB',                   logo: 'duckdb' },
  { name: 'Trino',                    logo: 'trino' },
  { name: 'Spark',                    logo: 'spark' },
];
const BANKING_ROLES: ConsumerRole[] = [
  { label: 'Retail Banking', sub: 'deposits & branches' },
  { label: 'Lending',        sub: 'credit & risk' },
  { label: 'Fraud / AML',    sub: 'real-time detection' },
  { label: 'Compliance',     sub: 'BSA & OCC reporting' },
];

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

  // Aggregate Iceberg table stats per medallion layer for the AliveMedallion.
  // Falls back to representative defaults until the iceberg snapshot resolves.
  const tables = data?.tables ?? [];
  const isLayer = (t: { table: string }, layer: 'bronze' | 'silver' | 'gold') =>
    t.table.toLowerCase().startsWith(`${layer}.`) || t.table.toLowerCase().includes(`_${layer}_`);
  const layerStats = (layer: 'bronze' | 'silver' | 'gold') => {
    const rows = tables.filter((t) => isLayer(t, layer));
    if (rows.length === 0) {
      const fallback = { bronze: { tables: 8, rows: 42_180_000, bytes: 14_200_000_000 },
                        silver: { tables: 6, rows: 18_420_000, bytes:  6_400_000_000 },
                        gold:   { tables: 7, rows:  3_842_000, bytes:  1_180_000_000 } } as const;
      return fallback[layer];
    }
    return {
      tables: rows.length,
      rows:   rows.reduce((s, r) => s + r.rows, 0),
      bytes:  rows.reduce((s, r) => s + r.size_gb * 1_000_000_000, 0),
    };
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-8 max-w-3xl">
        <div className="eyebrow mb-1">Open Data Infrastructure, Banking Reference</div>
        <h1 className="font-serif text-[2rem] sm:text-[2.4rem] font-semibold tracking-tight text-[var(--ink-strong)]">
          Eight sources. One Iceberg lake. dbt-wizard builds it. Snowflake reads it.
        </h1>
        <p className="mt-3 text-[var(--ink-muted)] leading-relaxed">
          The bank's architecture is deliberately flat. Fivetran lands every system into Apache Iceberg
          tables on S3. dbt builds bronze, silver, gold, and marts in place. dbt-wizard's four sub-agents
          author new gold models in ninety seconds when the fraud or AML desk asks a question the gold
          layer does not yet answer. Snowflake reads the gold tables as external tables — no data copy,
          no replication lag.
        </p>
      </header>

      <section className="mb-10 research-card p-6 sm:p-8">
        <div className="eyebrow mb-1">Data Flow</div>
        <h2 className="font-serif text-xl font-semibold text-[var(--ink-strong)] mb-2">
          Source → Fivetran → Iceberg (MDLS) → Snowflake / Athena / Trino → dbt Labs → React
        </h2>
        <p className="text-sm text-[var(--ink-muted)] leading-relaxed mb-6 max-w-4xl">
          Fivetran lands every CDC row into Iceberg (MDLS) on S3 in open Apache Iceberg format — one
          copy of the bytes. Snowflake, Athena, and Trino read the same Iceberg bytes via external
          catalogs (no copies, no extracts). Fivetran Transformations triggers dbt Labs the moment the
          source sync finishes, so bronze → silver → gold stays in Iceberg end-to-end.
        </p>
        <AliveMedallion
          sources={BANKING_SOURCES}
          bronze={{ ...layerStats('bronze'), trend: [180, 195, 210, 222, 240, 255, 270] }}
          silver={{ ...layerStats('silver'), trend: [120, 130, 142, 155, 168, 180, 192] }}
          gold={{   ...layerStats('gold'),   trend: [80, 88, 95, 104, 112, 124, 138] }}
          engines={BANKING_ENGINES}
          roles={BANKING_ROLES}
          enginesCaption="All five read the same data — no copies, no rebuilds per tool."
          accent="#b8975c"
        />
      </section>

      <section className="mb-10">
        <h2 className="font-serif text-xl font-semibold text-[var(--ink-strong)] pb-3 mb-4 border-b-2 border-[var(--gold-dim)]">Sources, ingested by Fivetran</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 stagger-children">
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
        <h2 className="font-serif text-xl font-semibold text-[var(--ink-strong)] pb-3 mb-4 border-b-2 border-[var(--gold-dim)]">Lineage</h2>
        <ol className="grid grid-cols-1 md:grid-cols-5 gap-3 stagger-children">
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

      <section className="mb-10 bg-[var(--paper-deep)] border border-[var(--hairline)] rounded-sm p-6">
        <div className="eyebrow mb-2">Build-time AI</div>
        <h2 className="font-serif text-xl font-semibold text-[var(--ink-strong)] mb-3">
          dbt-wizard: four sub-agents between dbt Labs and Snowflake
        </h2>
        <p className="text-sm text-[var(--ink-muted)] mb-5 max-w-3xl leading-relaxed">
          dbt-wizard sits between the dbt medallion layer and Snowflake compute. When the fraud desk or AML
          desk asks a question with no existing gold model, dbt-wizard's Explorer, Summary, Worker, and
          Verification sub-agents author, test, and materialize the missing table — using the same dbt tools
          an analytics engineer uses, against the same Snowflake warehouse. The materialized table lands in
          the gold S3 prefix tagged ai_built. Any downstream reader picks it up on its next pass.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="research-card p-4" style={{ borderTop: '3px solid #FF694A' }}>
            <div className="font-serif font-semibold text-[var(--ink-strong)] mb-1">Inputs</div>
            <p className="text-xs text-[var(--ink-muted)] leading-relaxed">
              A natural language question from the fraud or AML desk. The existing dbt project with bronze,
              silver, and gold models already in place.
            </p>
          </div>
          <div className="research-card p-4" style={{ borderTop: '3px solid #FF694A' }}>
            <div className="font-serif font-semibold text-[var(--ink-strong)] mb-1">Process</div>
            <p className="text-xs text-[var(--ink-muted)] leading-relaxed">
              Explorer maps candidate tables. Summary validates grain and lineage. Worker writes SQL and runs
              dbt_show on an XS warehouse. Verification writes the schema YAML, runs tests, materializes.
            </p>
          </div>
          <div className="research-card p-4" style={{ borderTop: '3px solid #FF694A' }}>
            <div className="font-serif font-semibold text-[var(--ink-strong)] mb-1">Output</div>
            <p className="text-xs text-[var(--ink-muted)] leading-relaxed">
              A production dbt model: tested, lineage-tracked, tagged ai_built, materialized as Iceberg in
              the customer's S3 bucket. Queryable by Snowflake and any Iceberg-compatible engine immediately.
            </p>
          </div>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="font-serif text-xl font-semibold text-[var(--ink-strong)] pb-3 mb-4 border-b-2 border-[var(--gold-dim)]">
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
            Iceberg REST API. Table-level access control mapped to the bank's LDAP. Every read is logged
            for examiner audit.
          </p>
        </div>
        <div className="research-card p-5">
          <div className="eyebrow mb-2">Destination</div>
          <h3 className="font-serif text-lg font-semibold text-[var(--ink-strong)]">{data?.destination ?? 'Snowflake + Iceberg'}</h3>
          <p className="mt-2 text-sm text-[var(--ink-muted)] leading-relaxed">
            Snowflake reads the gold tables as Iceberg external tables. No data copy. Every engine that
            speaks Iceberg reads the same files through the Glue catalog.
          </p>
        </div>
      </section>
    </div>
  );
}
