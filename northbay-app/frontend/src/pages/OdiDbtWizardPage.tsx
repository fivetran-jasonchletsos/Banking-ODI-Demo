import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

interface Pillar {
  layer: string;
  vendor: string;
  accent: string;
  what: string;
  inBuild: string;
  tag: string;
}

const PILLARS: Pillar[] = [
  {
    layer: 'Ingestion + MDLS',
    vendor: 'Fivetran',
    accent: '#0073EA',
    tag: 'connectors',
    what: '750+ managed connectors plus a custom Connector SDK for the long tail. Lands every source into Managed Data Lake Service as Apache Iceberg, in customer-owned S3.',
    inBuild: 'Eight sources feed Pediment Bank: FIS Horizon core banking, Salesforce FSC, nCino loan origination, Plaid aggregation, the AML monitoring vendor, Visa and Mastercard card feeds, OFAC/FinCEN watchlists, and branch teller logs. All land into the same lake, in the same open format, on the same continuous schedule.',
  },
  {
    layer: 'Open Lake',
    vendor: 'Iceberg on S3',
    accent: '#7C3AED',
    tag: 'storage',
    what: 'Open table format. Customer-owned storage. Snapshot isolation, schema evolution, time travel, multi-engine reads. The bytes belong to the bank, not the engine.',
    inBuild: 'When dbt-wizard\'s Worker sub-agent materializes the new gold.fct_cnp_fraud_by_merchant_tier_region_daily table, it writes Parquet files into the shared gold S3 prefix. No second copy. No publish step. Any downstream consumer — Snowflake, Trino, or an unbranded agent — resolves the new asset on its next read.',
  },
  {
    layer: 'Medallion + Build-time AI',
    vendor: 'dbt Labs + dbt-wizard',
    accent: '#FF694A',
    tag: 'transform',
    what: 'Bronze, silver, gold transformations with declarative SQL. Lineage, tests, freshness SLAs, semantic models. dbt-wizard adds four sub-agents that author new models into the project using the same tools an analytics engineer uses.',
    inBuild: 'The fraud desk asks why CNP fraud spiked for tier-2 merchants in Texas last Tuesday. No gold model covers that grain. dbt-wizard\'s Explorer runs status and search, Summary runs describe and lineage, Worker runs warehouse and dbt_show then authors the SQL, Verification writes the YAML and runs the tests. Ninety seconds end-to-end.',
  },
  {
    layer: 'Compute over Iceberg',
    vendor: 'Snowflake',
    accent: '#29B5E8',
    tag: 'engine',
    what: 'Reads Iceberg tables directly via external tables and Polaris catalog. Runs the dbt-wizard warehouse for dbt_show and the materialization step. Independently scaled micro-warehouses.',
    inBuild: 'Worker spins up an XS warehouse for the dbt_show slice, validates the proposed grain against the merchant and transaction silver tables, then materializes the new table to the gold prefix. Total compute footprint: a few seconds of XS warehouse time.',
  },
];

interface Property {
  title: string;
  claim: string;
  proof: string;
}

const PROPERTIES: Property[] = [
  {
    title: 'Speed',
    claim: 'Ninety seconds from question to production model.',
    proof: 'Manual build of the same model: three to five days. The bottleneck is not SQL — it is the round-trip from fraud-desk question to backlog to scope to author to test to PR. dbt-wizard collapses every step into a single sub-agent chain. The model exists before the next morning briefing.',
  },
  {
    title: 'Governance',
    claim: 'Every dbt-wizard model gets tests, lineage, and ownership.',
    proof: 'The output is not a SQL snippet pasted into a notebook. It is a dbt model with a schema contract, column-level tests, a combination uniqueness test, declared upstreams, an owner tag, and an ai_built tag. The new fraud table passes the same governance bar every other gold table in the medallion passes.',
  },
  {
    title: 'Reusability',
    claim: 'The new model is a first-class citizen for every downstream consumer.',
    proof: 'Downstream consumers read it on their next pass. AML analysts can join to it. BI dashboards can pin to it. Other dbt models can ref() it. Iceberg readers — Snowflake, Trino, Spark, DuckDB — can all query it. The model is not stuck inside the tool that built it.',
  },
  {
    title: 'Openness',
    claim: 'The model is Iceberg on S3, queryable by any engine.',
    proof: 'No lock-in on the build-time tool. No lock-in on the run-time engine. The bytes sit in the bank\'s S3 bucket in an open table format. Swap dbt-wizard tomorrow for a different build-time agent and the materialized table still works. Swap Snowflake for Trino and the table still works.',
  },
];

const CANNED_QUESTIONS = [
  'Why did CNP fraud spike for tier-2 merchants in Texas last Tuesday?',
  'Which counterparty clusters drove the most AML alerts in Q1, and how did amounts trend week-over-week?',
  'Show loan delinquency early-warning signals by region and vintage for the last three origination cohorts.',
];

export default function OdiDbtWizardPage() {
  const navigate = useNavigate();
  const [question, setQuestion] = useState(CANNED_QUESTIONS[0]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-10 max-w-3xl">
        <div className="eyebrow mb-1">Build-time AI, Banking Reference</div>
        <h1 className="font-serif text-[2rem] sm:text-[2.4rem] font-semibold tracking-tight text-[var(--ink-strong)]">
          dbt-wizard: the build-time layer
        </h1>
        <p className="mt-3 text-[var(--ink-muted)] leading-relaxed">
          Any downstream consumer can only read gold models that already exist. When the fraud desk asks
          a question the gold layer does not yet answer, dbt-wizard's four sub-agents author the missing
          model — tested, lineage-tracked, materialized — in ninety seconds. Every downstream reader
          picks it up on its next pass.
        </p>
      </header>

      <section className="mb-12 research-card p-6 border-l-4" style={{ borderLeftColor: 'var(--gold)' }}>
        <div className="eyebrow mb-2">The scenario that motivates this page</div>
        <p className="text-[var(--ink)] leading-relaxed">
          The fraud desk asks: "Why did CNP fraud spike for tier-2 merchants in Texas last Tuesday?" There
          is no <span className="ticker text-[12px]">gold.fct_cnp_fraud_by_merchant_tier_region_daily</span> table.
          Without dbt-wizard, the answer is three to five days away. With dbt-wizard, the answer is ninety
          seconds away — and the model is production-grade by the time it exists.
        </p>
      </section>

      <section className="mb-12">
        <div className="eyebrow mb-2">Four layers. One loop.</div>
        <h2 className="font-serif text-2xl font-semibold text-[var(--ink-strong)] pb-3 mb-6 border-b-2 border-[var(--gold-dim)]">
          What each layer contributes
        </h2>
        <p className="text-sm text-[var(--ink-muted)] mb-6 max-w-3xl">
          Each layer has a clear job. Pull dbt-wizard out and the fraud desk's question does not get
          answered in time. Pull Iceberg out and dbt-wizard's output is just text. Pull Snowflake out
          and the materialization step has no warehouse. The loop only closes when all four hold.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {PILLARS.map((p, i) => (
            <div key={p.vendor} className="research-card relative flex flex-col" style={{ minHeight: '420px', borderTop: `3px solid ${p.accent}` }}>
              <div className="p-5 flex-1 flex flex-col">
                <div className="text-[11px] font-mono uppercase tracking-wider mb-2" style={{ color: 'var(--ink-soft)' }}>
                  0{i + 1} · {p.tag}
                </div>
                <div className="eyebrow mb-1" style={{ color: 'var(--ink-muted)' }}>{p.layer}</div>
                <div className="font-serif text-xl font-semibold mb-4" style={{ color: p.accent }}>{p.vendor}</div>

                <div className="text-[11px] font-mono uppercase tracking-wider mb-1" style={{ color: 'var(--ink-soft)' }}>What it does</div>
                <p className="text-xs leading-relaxed mb-4" style={{ color: 'var(--ink)' }}>{p.what}</p>

                <div className="text-[11px] font-mono uppercase tracking-wider mb-1" style={{ color: 'var(--ink-soft)' }}>At Pediment Bank</div>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--ink-muted)' }}>{p.inBuild}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-12 bg-[var(--paper-deep)] border border-[var(--hairline)] rounded-sm p-6">
        <div className="eyebrow mb-2">The four sub-agents</div>
        <h2 className="font-serif text-xl font-semibold text-[var(--ink-strong)] mb-4">
          How dbt-wizard authors a model in ninety seconds
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { num: '01', name: 'Explorer', tools: 'dbt status, dbt search', job: 'Maps what already exists in the project. Finds upstream tables that cover merchant tier, CNP channel, and Texas geography. Returns a list of candidate silver tables the Worker can join.' },
            { num: '02', name: 'Summary', tools: 'dbt describe, dbt lineage', job: 'Documents the schema and lineage of the candidate tables. Confirms grain, null rates, and join keys. Catches a duplicate transaction edge case before the Worker writes a single line of SQL.' },
            { num: '03', name: 'Worker', tools: 'dbt warehouse, dbt_show, file edit', job: 'Writes the SQL and runs a dbt_show slice against a live XS warehouse. Validates the proposed daily grain, checks row counts, and edits the model file into the project.' },
            { num: '04', name: 'Verification', tools: 'dbt test, dbt docs generate', job: 'Writes the schema YAML, adds uniqueness and not-null tests, runs the full test suite, and confirms the materialized table is queryable. Tags the model ai_built and assigns ownership.' },
          ].map((a) => (
            <div key={a.num} className="research-card p-4" style={{ borderTop: '3px solid var(--gold-dim)' }}>
              <div className="font-mono text-xs text-[var(--ink-soft)] mb-1">{a.num}</div>
              <div className="font-serif text-lg font-semibold text-[var(--ink-strong)] mb-1">{a.name}</div>
              <div className="text-[11px] font-mono uppercase tracking-wider text-[var(--gold-dim)] mb-2">{a.tools}</div>
              <p className="text-xs text-[var(--ink-muted)] leading-relaxed">{a.job}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <div className="eyebrow mb-2">Four properties</div>
        <h2 className="font-serif text-xl font-semibold text-[var(--ink-strong)] pb-3 mb-6 border-b-2 border-[var(--gold-dim)]">
          What dbt-wizard gives the lake that no other build-time tool can
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {PROPERTIES.map((c, i) => (
            <div key={c.title} className="research-card p-5 border-l-4" style={{ borderLeftColor: 'var(--gold)' }}>
              <div className="flex items-baseline gap-3 mb-2">
                <div className="font-mono text-xs text-[var(--ink-soft)]">0{i + 1}</div>
                <div className="font-serif text-lg font-semibold text-[var(--ink-strong)]">{c.title}</div>
              </div>
              <div className="text-sm font-semibold mb-2" style={{ color: 'var(--gold-dim)' }}>{c.claim}</div>
              <p className="text-sm leading-relaxed text-[var(--ink-muted)]">{c.proof}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Try the live build ── */}
      <section className="mb-12 research-card p-6 border-l-4" style={{ borderLeftColor: 'var(--gold)' }}>
        <div className="eyebrow mb-2">Try the live build</div>
        <h2 className="font-serif text-xl font-semibold text-[var(--ink-strong)] mb-3">
          Watch dbt-wizard author the model in real time
        </h2>
        <p className="text-sm text-[var(--ink-muted)] mb-5 max-w-2xl leading-relaxed">
          Select a question below or write your own, then submit to watch Explorer, Summary,
          Worker, and Verification play out — narration, SQL, YAML, and all tool calls — live.
        </p>

        <div className="flex flex-col gap-2 mb-4">
          {CANNED_QUESTIONS.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => setQuestion(q)}
              className="text-left rounded-sm px-4 py-3 text-sm border transition-colors"
              style={{
                background: question === q ? 'var(--gold-bg)' : 'var(--paper-deep)',
                borderColor: question === q ? 'var(--gold)' : 'var(--hairline)',
                color: question === q ? 'var(--gold-dim)' : 'var(--ink-muted)',
                fontFamily: '"Crimson Pro", Georgia, serif',
              }}
            >
              {q}
            </button>
          ))}
        </div>

        <div className="mb-4">
          <label className="eyebrow block mb-1.5">Or write your own question</label>
          <textarea
            rows={3}
            value={question}
            onChange={e => setQuestion(e.target.value)}
            className="w-full rounded-sm px-3 py-2 text-sm border resize-none"
            style={{
              background: 'var(--card)',
              borderColor: 'var(--hairline)',
              color: 'var(--ink)',
              fontFamily: '"Crimson Pro", Georgia, serif',
              outline: 'none',
            }}
          />
        </div>

        <button
          type="button"
          disabled={!question.trim()}
          onClick={() => navigate('/wizard-live', { state: { question } })}
          className="inline-flex items-center gap-2 rounded-sm font-semibold text-sm px-5 py-2.5 transition-opacity disabled:opacity-40"
          style={{ background: 'var(--gold)', color: 'var(--navy-deep)' }}
        >
          Watch live build
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M5 12h14M13 5l7 7-7 7" />
          </svg>
        </button>
      </section>

      <section className="bg-[var(--navy-deep)] text-white rounded-sm p-8">
        <div className="eyebrow-light mb-3">The loop, in one sentence</div>
        <p className="font-serif text-xl sm:text-2xl leading-snug mb-6">
          <span style={{ color: '#0073EA' }}>Fivetran lands it.</span>{' '}
          <span style={{ color: '#FF694A' }}>dbt governs it.</span>{' '}
          <span style={{ color: '#FF694A' }}>dbt-wizard authors it.</span>{' '}
          <span style={{ color: '#7C3AED' }}>Iceberg owns it.</span>{' '}
          <span style={{ color: '#29B5E8' }}>Snowflake reads it.</span>
        </p>
        <p className="text-sm text-white/70 max-w-2xl mb-6">
          Build-time AI on the same lake as every downstream reader. dbt-wizard authors the model.
          Any engine that speaks Iceberg reads it. No integration handoff. No second copy of the data.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link to="/fraud" className="inline-flex items-center gap-2 rounded-sm font-semibold text-sm text-[var(--navy-deep)] px-5 py-3 shadow-lg hover:opacity-95 transition-opacity" style={{ background: 'var(--gold)' }}>
            See the fraud desk <span aria-hidden>→</span>
          </Link>
          <Link to="/architecture" className="inline-flex items-center gap-2 rounded-sm font-semibold text-sm text-white bg-white/5 border border-white/20 px-5 py-3 hover:bg-white/10 transition-colors">
            Architecture overview
          </Link>
        </div>
      </section>
    </div>
  );
}
