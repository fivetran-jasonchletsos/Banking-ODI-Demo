export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Canonical ODI Story block — verbatim from the cross-demo standard. */}
      <section className="research-card p-6 mb-10" style={{ borderColor: 'var(--gold)' }}>
        <div className="eyebrow mb-2" style={{ color: 'var(--gold-dim)' }}>The ODI Story</div>
        <h2 className="font-serif text-2xl font-semibold tracking-tight text-[var(--ink-strong)]">
          Data infrastructure for agents you trust.
        </h2>
        <p className="mt-3 text-[var(--ink-muted)] leading-relaxed">
          <em>"MDS was optimized for humans. ODI is designed for a future with humans and
          production agents at scale."</em> This demo is one instance of that architecture:
          Fivetran's 750+ connectors and Managed Data Lake Service (MDLS) land data into open
          table formats; dbt transformations build the governed semantic layer; multiple compute
          engines and AI agents read the same gold tables.
        </p>
        <a
          href="https://fivetran-jasonchletsos.github.io/Fivetran-Demo-Repository/story/"
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[var(--ink-strong)] hover:underline"
          style={{ color: 'var(--gold-dim)' }}
        >
          Read the full ODI Story →
        </a>
      </section>

      <header className="mb-8">
        <div className="eyebrow mb-1">ODI Reference Architecture, Banking</div>
        <h1 className="font-serif text-3xl font-semibold tracking-tight text-[var(--ink-strong)]">About Northbay Financial</h1>
        <p className="mt-3 text-[var(--ink-muted)] leading-relaxed">
          Northbay Financial is a fictional top-15 US bank with $680B in assets, 14.2M retail customers,
          28K commercial relationships, and 2,103 branches across 31 states. The demo shows what happens
          when seven banking systems land in one Iceberg lake and dbt builds a single gold layer that
          the fraud team, the AML team, the deposit-pricing desk, and the commercial relationship
          managers all read at the same time.
        </p>
      </header>

      <section className="mt-10">
        <h2 className="font-serif text-2xl font-semibold text-[var(--ink-strong)] border-b border-[var(--hairline)] pb-2 mb-4">What this demo shows</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PILLARS.map((p) => (
            <div key={p.title} className="research-card p-5">
              <div className="layer-chip gold inline-flex mb-3">{p.tag}</div>
              <h3 className="font-serif text-lg font-semibold text-[var(--ink-strong)]">{p.title}</h3>
              <p className="mt-1 text-sm text-[var(--ink-muted)] leading-relaxed">{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-serif text-2xl font-semibold text-[var(--ink-strong)] border-b border-[var(--hairline)] pb-2 mb-4">Tech stack</h2>
        <div className="research-card p-5">
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
            {STACK.map((s) => (
              <li key={s.name} className="flex items-start gap-3">
                <div className="layer-chip silver shrink-0 mt-0.5">{s.layer}</div>
                <div className="min-w-0">
                  <div className="font-serif font-semibold text-[var(--ink-strong)]">{s.name}</div>
                  <div className="text-xs text-[var(--ink-muted)]">{s.note}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-serif text-2xl font-semibold text-[var(--ink-strong)] border-b border-[var(--hairline)] pb-2 mb-4">Data sources</h2>
        <div className="space-y-3">
          {DATA_SOURCES.map((s) => (
            <article key={s.title} className="research-card p-5">
              <div className="flex items-start gap-3">
                <span className="layer-chip bronze shrink-0">Source</span>
                <div className="min-w-0">
                  <h3 className="font-serif text-lg font-semibold text-[var(--ink-strong)]">{s.title}</h3>
                  <p className="mt-1 text-sm text-[var(--ink-muted)] leading-relaxed">{s.description}</p>
                  <div className="mt-2 text-xs text-[var(--ink-soft)]">
                    <span className="font-semibold uppercase tracking-wider text-[10px]">Provides:</span> {s.provides}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-10 rounded-sm bg-[var(--paper-deep)] border border-[var(--hairline)] p-5 text-sm text-[var(--ink)]">
        <div className="eyebrow mb-2" style={{ color: 'var(--caution)' }}>Disclaimer</div>
        <p className="text-[var(--ink-muted)] leading-relaxed">
          <strong className="text-[var(--ink-strong)]">All data shown is synthetic.</strong>{' '}
          Northbay Financial is a fictional bank built to illustrate ODI architecture for banking and
          capital markets. Vendor names referenced in the source list are either real public products
          used generically or invented for the demo. No portion of this site is a recommendation,
          forecast, or risk disclosure.
        </p>
      </section>
    </div>
  );
}

const PILLARS = [
  {
    tag: 'Pillar 1',
    title: 'Customer-owned storage',
    body: 'Core banking, CRM, fraud, AML, cards, and aggregator feeds all land in the customer\'s S3 bucket as Apache Iceberg tables. Fivetran writes; the bank reads with any engine.',
  },
  {
    tag: 'Pillar 2',
    title: 'Open table format',
    body: 'Iceberg v2 provides ACID transactions, schema evolution, time-travel queries, and partition evolution — no vendor lock-in on table layout.',
  },
  {
    tag: 'Pillar 3',
    title: 'Any compute engine',
    body: 'Snowflake serves the credit-risk team. Trino serves analysts. The Cortex fraud agent reads the same parquet through Glue. One source, many readers.',
  },
];

const STACK = [
  { layer: 'Ingest',     name: 'Fivetran',                    note: '750+ pre-built connectors; eight active for Northbay: FIS Horizon, Salesforce FSC, nCino, Plaid, AML vendor, Visa/Mastercard, OFAC/FinCEN, branch teller logs.' },
  { layer: 'Storage',    name: 'Amazon S3',                   note: 'northbay-odi-lake bucket holds bronze, silver, gold, marts prefixes. Customer-owned and customer-controlled.' },
  { layer: 'Format',     name: 'Apache Iceberg v2',           note: 'Parquet files, ZSTD-compressed, partitioned by transaction date. Schema evolution is vendor-neutral.' },
  { layer: 'Catalog',    name: 'AWS Glue Data Catalog',       note: 'Iceberg REST API. Table-level access control mapped to Northbay\'s LDAP groups.' },
  { layer: 'Transform',  name: 'dbt',                         note: '168 models across bronze, silver, gold, marts. 532 tests on every run.' },
  { layer: 'Warehouse',  name: 'Snowflake (external tables)', note: 'Credit-risk, treasury, and finance teams query the gold layer via Snowflake. No data copy.' },
  { layer: 'Agents',     name: 'Snowflake Cortex agents',     note: 'Fraud and AML agents read gold.fct_fraud_signal and gold.fct_aml_alert_score directly. No warehouse round-trip.' },
  { layer: 'Frontend',   name: 'React 19, Vite, Tailwind v4', note: 'Static SPA on GitHub Pages, reads pre-computed JSON snapshots of the gold layer.' },
];

const DATA_SOURCES = [
  {
    title: 'FIS Horizon (core banking)',
    description: 'The system of record for accounts, balances, and posted transactions. Fivetran reads the Oracle change-data-capture stream and lands every account event in bronze with sub-minute lag.',
    provides: 'Account master, balance daily, transaction posted, branch and teller activity.',
  },
  {
    title: 'Salesforce Financial Services Cloud (CRM)',
    description: 'Customer relationships, household groupings, financial accounts, opportunity pipeline. Drives the relationship-manager assignment for commercial and wealth customers.',
    provides: 'Account, contact, household, financial account, opportunity, case.',
  },
  {
    title: 'nCino (commercial loan origination)',
    description: 'The deal flow and credit decisioning system for commercial banking. Loan applications, underwriting attributes, covenant tracking, and credit committee outcomes.',
    provides: 'Loan application, underwriting model output, covenant test, exception, approval audit.',
  },
  {
    title: 'Plaid (data aggregation)',
    description: 'External account aggregation for retail customers consenting to share balances at other institutions. Powers external-account verification, deposit-outflow forecasting, and net-new-money tracking.',
    provides: 'External account, balance refresh, transaction stream, identity verification.',
  },
  {
    title: 'AML monitoring vendor',
    description: 'The transaction-monitoring system that runs typology rules over the unified transaction layer. Northbay reads its alerts and case management state back into the lake.',
    provides: 'Alert event, case, disposition, SAR draft, typology score.',
  },
  {
    title: 'Visa and Mastercard merchant feeds',
    description: 'Authorization, settlement, and decline files from the card networks. Drives card-not-present fraud detection and merchant-category risk scoring.',
    provides: 'Authorization, settlement, decline, dispute, chargeback.',
  },
  {
    title: 'OFAC + FinCEN watchlists',
    description: 'Sanctions and law-enforcement watchlists. Northbay matches every wire and ACH against the current lists at transaction time and at end-of-day batch.',
    provides: 'SDN list, SSI list, 314(a) request, geographic targeting order.',
  },
  {
    title: 'Branch teller logs',
    description: 'Cash deposit and withdrawal events with structured customer, amount, denomination, and teller identifiers. Drives structuring detection and CTR filing.',
    provides: 'Cash deposit, cash withdrawal, monetary instrument sale, teller identifier.',
  },
];
