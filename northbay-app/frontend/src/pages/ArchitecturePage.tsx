import { Link } from 'react-router-dom';
import { useJson } from '../components/data';
import {
  AliveMedallion,
  type SourceNode,
  type EngineNode,
  type ConsumerRole,
} from '../components/AliveMedallion';
import ProductStageRail from '../components/ProductStageRail';

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
        <ProductStageRail accent="#0e7490" />
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

      {/* ── Activations — NewCo native reverse-ETL, right after Transformations ── */}
      <ActivationsPanel />

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

// =============================================================================
// ActivationsPanel — NewCo Activations, the native reverse-ETL stage that sits
// directly after Transformations. TRIGGER / DESTINATION / OUTCOME below are
// vertical-specific to Pediment Bank's structured-deposit alert workflow.
// =============================================================================
function ActivationsPanel() {
  // TRIGGER — the gold-layer condition that fires the sync
  const TRIGGER = "gold.fct_structured_deposit_alerts flags a row when the composite structuring_score crosses 0.85 and ach_counterparty_id matches a counterparty already tied to at least one prior SAR filing (linked_to_prior_sar = true) — the same 21-account, 14-shared-counterparty pattern the dbt-wizard mart in this demo just built.";
  // DESTINATION — the downstream system NewCo Activations pushes into
  const DESTINATION = 'NICE Actimize Case Manager · Investigation_Case';
  // OUTCOME — the business payoff the SE narrates
  const OUTCOME = "BSA investigators get five pre-populated cases in NICE Actimize within seconds of the mart materializing, instead of the 4-6 hours a BSA analyst spends today exporting the alert query to CSV and keying it into Actimize by hand — protecting the 30-day SAR filing clock on the $11.6M exposure window the gold layer just sized.";

  return (
    <section className="mb-10 research-card overflow-hidden">
      <div className="p-6 sm:p-8 flex items-start justify-between gap-4 flex-wrap border-b border-[var(--hairline)]">
        <div>
          <div className="eyebrow mb-1" style={{ color: '#0e7490' }}>Activations · NewCo</div>
          <h2 className="font-serif text-xl font-semibold text-[var(--ink-strong)] mt-0.5">
            The gold layer doesn't just get queried. It gets acted on.
          </h2>
          <p className="text-sm text-[var(--ink-muted)] mt-2 max-w-3xl leading-relaxed">
            Activations is the fourth native stage in NewCo, immediately after Transformations. It
            reads straight from the same Iceberg gold tables dbt just built and syncs the result to
            an operational system of record &mdash; no separate reverse-ETL vendor, no second copy of the
            data, no second connector to maintain.
          </p>
        </div>
        <div className="inline-flex items-center gap-1.5 rounded-sm px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white shrink-0" style={{ background: '#0e7490' }}>
          Activations
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[var(--hairline-soft)]">
        <div className="p-5">
          <div className="text-[10px] uppercase tracking-[0.16em] text-[var(--ink-soft)] font-semibold mb-2">Trigger · gold layer</div>
          <p className="text-sm text-[var(--ink)] leading-relaxed">{TRIGGER}</p>
        </div>
        <div className="p-5">
          <div className="text-[10px] uppercase tracking-[0.16em] text-[var(--ink-soft)] font-semibold mb-2">Destination</div>
          <p className="text-sm text-[var(--ink)] leading-relaxed font-mono">{DESTINATION}</p>
        </div>
        <div className="p-5">
          <div className="text-[10px] uppercase tracking-[0.16em] text-[var(--ink-soft)] font-semibold mb-2">Outcome</div>
          <p className="text-sm text-[var(--ink)] leading-relaxed">{OUTCOME}</p>
        </div>
      </div>

      <div className="px-5 py-3 border-t border-[var(--hairline-soft)] flex items-center justify-between text-[11px] text-[var(--ink-soft)]" style={{ background: 'var(--paper-deep)' }}>
        <span>Connections &rarr; Destinations &rarr; Transformations &rarr; <strong style={{ color: '#0e7490' }}>Activations</strong> &middot; one platform, one lineage graph</span>
        <Link to="/activations-live" className="uppercase tracking-wider font-semibold hover:underline" style={{ color: '#0e7490' }}>
          Watch it sync &rarr;
        </Link>
      </div>
    </section>
  );
}
