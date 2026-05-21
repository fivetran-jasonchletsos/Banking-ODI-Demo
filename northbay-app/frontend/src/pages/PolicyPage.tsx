export default function PolicyPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-8">
        <div className="eyebrow mb-1">Policy brief</div>
        <h1 className="font-serif text-3xl font-semibold tracking-tight text-[var(--ink-strong)]">
          Why bank data is fragmented, and what ODI does about it
        </h1>
      </header>

      <section className="space-y-6 text-[var(--ink)] leading-relaxed">
        <p>
          A US bank of Northbay's size runs at least seven distinct systems of record. Core banking holds
          accounts and balances. CRM holds relationships. The loan-origination system holds underwriting.
          The fraud platform holds card decisioning. The AML monitoring vendor holds typology alerts. The
          card networks ship merchant authorization files. The general ledger holds the books. Each
          system has its own data model, its own refresh cadence, and its own access controls.
        </p>
        <p>
          The traditional answer is a warehouse: extract every system, transform into a star schema, load
          into a proprietary engine, and let analysts query. The pattern works for monthly board reporting.
          It does not work when the fraud agent needs sub-second access to customer history at the same
          time the deposit-pricing desk is running an ALM scenario. Two systems, two copies, two stale
          truths.
        </p>
        <h2 className="font-serif text-xl font-semibold text-[var(--ink-strong)] border-b border-[var(--hairline)] pb-2 mt-8">The ODI position</h2>
        <p>
          Open Data Infrastructure inverts the warehouse model. Storage is owned by the bank, in S3, in
          Apache Iceberg format. Fivetran lands every source there as bronze tables. dbt builds the gold
          layer. Snowflake, Trino, and AI agents read the gold layer through the Glue catalog. The same
          parquet bytes serve the fraud agent, the credit-risk team, and the board pack.
        </p>
        <p>
          The architectural payoff is operational, not theoretical. The fraud agent makes a decision in
          142ms because it reads gold directly, not through a warehouse hop. The AML investigator queue
          is freshness-aware because the gold table exposes a freshness column from the source-side
          Fivetran sync. When a connector breaks, the consequence is visible: the gold table shows the
          last-sync timestamp and the agents read the staleness signal before they decide.
        </p>
        <h2 className="font-serif text-xl font-semibold text-[var(--ink-strong)] border-b border-[var(--hairline)] pb-2 mt-8">Concretely, at Northbay</h2>
        <ul className="space-y-2 list-disc pl-6">
          <li>
            Fivetran lands eight sources into the <code className="ticker text-[12px]">northbay-odi-lake</code>{' '}
            S3 bucket. Three are CDC streams from databases; five are API or file feeds.
          </li>
          <li>
            dbt builds 168 models across bronze, silver, gold, and marts. 532 tests run on every build.
          </li>
          <li>
            Snowflake queries the gold layer as external Iceberg tables. No data copy, no replication
            lag, no double-pay for storage.
          </li>
          <li>
            The Cortex fraud and AML agents read the same parquet files. The agents and the warehouse
            see the same row at the same instant.
          </li>
        </ul>
        <h2 className="font-serif text-xl font-semibold text-[var(--ink-strong)] border-b border-[var(--hairline)] pb-2 mt-8">What the CRO gets</h2>
        <p>
          Regulatory exams ask the bank to demonstrate lineage. Fivetran is the named ingestion mechanism
          for every source on every gold table on every page of this site. dbt tests are the documented
          governance layer. The Iceberg time-travel feature provides audit-ready snapshots of the gold
          layer at any prior point in time. Examiners can be shown the same row as it appeared on the
          day of decision.
        </p>
      </section>
    </div>
  );
}
