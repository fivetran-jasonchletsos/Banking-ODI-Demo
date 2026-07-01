// AgentSchemaPage.tsx — installed by /install-feature

import { Link } from 'react-router-dom';

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
    what:
      'Managed connectors land every source into an Iceberg lake on customer-owned S3. Schema drift, retries, and freshness SLAs are handled automatically — no custom pipelines.',
    inBuild:
      'Eight sources feed Pediment Bank: FIS Horizon core banking, Salesforce FSC, nCino loan origination, Plaid aggregation, the AML monitoring vendor, Visa and Mastercard card feeds, OFAC/FinCEN watchlists, and branch teller logs. Every byte lands in the same open lake on the same continuous schedule. This is the raw material that dbt shapes into governed gold.',
  },
  {
    layer: 'Medallion Transform',
    vendor: 'dbt Labs',
    accent: '#FF694A',
    tag: 'transform',
    what:
      'dbt models move data through bronze, silver, and gold layers with declarative SQL, lineage tracking, and schema tests. Semantic models define business metrics once at the gold layer — not in dashboards, not in agent prompts.',
    inBuild:
      'Pediment Bank\'s gold layer includes fct_regulatory_capital_ratios, fct_credit_loss_provisions, fct_aml_transaction_flags, and agg_deposit_concentration. Each model carries a semantic definition: what the metric means, how it is calculated, and who owns it. These definitions are the input to the Agent Schema publish step.',
  },
  {
    layer: 'Agent Schema',
    vendor: 'Fivetran + dbt Labs Open Standard',
    accent: '#06b6d4',
    tag: 'open standard',
    what:
      'A dedicated schema in the warehouse — three SQL tables — that any AI agent can query before acting. Metric definitions, dbt model lineage, and a business glossary. Published automatically on every dbt run. No proprietary API, no bespoke format.',
    inBuild:
      'pediment_agents.metric_definitions holds 60+ bank metrics: CET1 ratio, LCR, NPL rate, NIM, deposit beta. pediment_agents.model_lineage exposes the full dbt DAG so agents understand upstream dependencies before writing queries. pediment_agents.business_glossary resolves ambiguous terms — "non-performing" means past 90 days per Pediment policy, not 60. Every agent reads from here before answering a question.',
  },
  {
    layer: 'Govern',
    vendor: 'Great Expectations + dbt State',
    accent: '#10b981',
    tag: 'trust',
    what:
      'Great Expectations validates data at every promotion boundary. dbt State ensures only changed models republish — the agent schema stays current without re-running the full DAG. Agents always read from tested, up-to-date context.',
    inBuild:
      'Before the CET1 ratio definition publishes to pediment_agents, Great Expectations confirms the underlying fct_regulatory_capital_ratios table passes 14 expectations: non-null keys, ratio bounds, freshness, and referential integrity against the entity master. dbt State means only the models that changed in that run republish their definitions — incremental by default.',
  },
  {
    layer: 'AI Agents',
    vendor: 'LLM Agents (any framework)',
    accent: '#8b5cf6',
    tag: 'agents',
    what:
      'AI agents query the Agent Schema before acting — resolving metric definitions, lineage, and business terminology from a governed SQL source rather than from training data or prompt instructions. Framework-agnostic: any agent that can run SQL can use it.',
    inBuild:
      'Pediment Bank\'s compliance agent asks "What is our CET1 ratio this quarter?" It queries pediment_agents.metric_definitions first, reads the canonical formula and source model, then queries fct_regulatory_capital_ratios. The credit risk agent asking the same question reads the same definition. No conflicting answers. No agent inventing its own denominator. One metric. One answer.',
  },
];

interface Property {
  title: string;
  claim: string;
  proof: string;
}

const PROPERTIES: Property[] = [
  {
    title: 'Framework-agnostic',
    claim:
      'Agent Schema is plain SQL. Any agent — Claude, GPT, LangChain, an internal model — queries it with a standard SELECT. No proprietary SDK to install or maintain.',
    proof:
      'Open standard co-developed by Fivetran and dbt Labs. Published spec. Reference implementation on GitHub.',
  },
  {
    title: 'Governed at the pipeline layer',
    claim:
      'Definitions are owned by the team that owns the model. When the Finance team updates the NIM calculation in dbt, the agent schema updates automatically on the next run. No prompt engineering needed.',
    proof:
      'Published via GitHub Actions on every successful dbt run. dbt State limits republication to changed definitions only.',
  },
  {
    title: 'Regulatory-grade consistency',
    claim:
      'In banking, one agent answering CET1 differently than another is a compliance exposure, not just a UX problem. Agent Schema eliminates that class of inconsistency by design.',
    proof:
      'Every agent reads the same row from pediment_agents.metric_definitions. The source of truth is in the warehouse, not in the model weights.',
  },
];

export default function AgentSchemaPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-12">
      {/* Header */}
      <div className="space-y-3">
        <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--gold)]">
          Agent Schema · Open Standard
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
          Every agent reads the same definition.
        </h1>
        <p className="text-base text-white/60 max-w-2xl leading-relaxed">
          Agent Schema is an open standard from Fivetran and dbt Labs. A dedicated schema in
          Pediment Bank's warehouse — metric definitions, model lineage, business glossary — that
          every AI agent queries before acting. One source of truth. Consistent answers across
          compliance, credit risk, fraud, and AML.
        </p>
      </div>

      {/* Pillars */}
      <div className="space-y-4">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-white/40">
          How it works in this build
        </h2>
        <div className="grid gap-4">
          {PILLARS.map((p) => (
            <div key={p.layer} className="research-card p-5 sm:p-6 space-y-3">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="space-y-0.5">
                  <div
                    className="text-[10px] font-semibold uppercase tracking-[0.12em]"
                    style={{ color: p.accent }}
                  >
                    {p.layer}
                  </div>
                  <div className="text-base font-semibold text-white">{p.vendor}</div>
                </div>
                <span
                  className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-sm"
                  style={{ color: p.accent, border: `1px solid ${p.accent}`, background: 'transparent' }}
                >
                  {p.tag}
                </span>
              </div>
              <p className="text-sm text-white/60 leading-relaxed">{p.what}</p>
              <div className="border-t border-white/10 pt-3">
                <div className="text-[10px] font-semibold uppercase tracking-[0.1em] text-white/30 mb-1">
                  In this build
                </div>
                <p className="text-sm text-white/50 leading-relaxed">{p.inBuild}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Properties */}
      <div className="space-y-4">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-white/40">
          Key properties
        </h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {PROPERTIES.map((prop) => (
            <div key={prop.title} className="research-card p-4 space-y-2">
              <div className="text-sm font-semibold text-white">{prop.title}</div>
              <p className="text-xs text-white/50 leading-relaxed">{prop.claim}</p>
              <p className="text-xs text-[var(--gold)] leading-relaxed">{prop.proof}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Back link */}
      <div className="pt-4 border-t border-white/10">
        <Link
          to="/architecture"
          className="text-[11px] uppercase tracking-wider text-white/40 hover:text-white/70 transition-colors"
        >
          ← Architecture overview
        </Link>
      </div>
    </div>
  );
}
