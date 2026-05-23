import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';

const NAV_ITEMS: [string, string][] = [
  ['/', 'Home'],
  ['/deposits', 'Deposits'],
  ['/lending', 'Lending'],
  ['/fraud', 'Fraud'],
  ['/aml', 'AML'],
  ['/commercial', 'Commercial'],
  ['/dbt-wizard', 'dbt-wizard'],
  ['/architecture', 'Architecture'],
  ['/pipeline', 'Pipeline'],
  ['/policy', 'Policy'],
  ['/about', 'About'],
];

const DEMOS = [
  { key: 'tax-assessment',  name: 'Allegheny County Tax', industry: 'Public sector, property assessment', url: 'https://fivetran-jasonchletsos.github.io/tax-assessment-databricks-demo/', accent: '#dc2626' },
  { key: 'healthcare',      name: 'Epic Clarity',         industry: 'Healthcare, clinical analytics',     url: 'https://fivetran-jasonchletsos.github.io/Healthcare-EPIC-Snowflake-Demo/', accent: '#0d9488' },
  { key: 'finserv',         name: 'Meridian Capital',     industry: 'Buy-side research desk',             url: 'https://fivetran-jasonchletsos.github.io/FinServ-ODI-Demo/', accent: '#1d4ed8' },
  { key: 'banking',         name: 'Pediment Bank',        industry: 'Banking and capital markets',        url: 'https://fivetran-jasonchletsos.github.io/Banking-ODI-Demo/', accent: '#0c2a4a' },
  { key: 'insurance',       name: 'Atlas Risk',           industry: 'Insurance, policies and claims',     url: 'https://fivetran-jasonchletsos.github.io/Insurance-ODI-Demo/', accent: '#0369a1' },
  { key: 'media',           name: 'Lighthouse Media',     industry: 'Media, audience intelligence',       url: 'https://fivetran-jasonchletsos.github.io/Media-ODI-Demo/', accent: '#7c3aed' },
  { key: 'retail',          name: 'Storefront Analytics', industry: 'Retail and e-commerce',              url: 'https://fivetran-jasonchletsos.github.io/RetailEcom-ODI-Demo/', accent: '#ea580c' },
  { key: 'techsaas',        name: 'SaaS Pulse',           industry: 'Tech, SaaS analytics',               url: 'https://fivetran-jasonchletsos.github.io/TechSaaS-ODI-Demo/', accent: '#059669' },
  { key: 'supplychain',     name: 'Manifest',             industry: 'Supply chain, logistics',            url: 'https://fivetran-jasonchletsos.github.io/SupplyChain-ODI-Demo/', accent: '#0891b2' },
  { key: 'lifesci',         name: 'Cohort',               industry: 'Life sciences, clinical research',   url: 'https://fivetran-jasonchletsos.github.io/LifeSci-ODI-Demo/', accent: '#be185d' },
  { key: 'mission-control', name: 'Mission Control',      industry: 'Admin, governance and observability', url: 'https://fivetran-jasonchletsos.github.io/ODI-Mission-Control/', accent: '#22d3ee' },
];
const CURRENT_DEMO = 'banking';

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  return (
    <div className="min-h-full flex flex-col bg-[var(--paper)]">
      <div className="institutional-rail" />

      <header className="bg-[var(--navy-deep)]/95 backdrop-blur-sm text-white sticky top-0 z-30 border-b border-white/[0.06]">
        <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
          <div className="flex h-16 sm:h-20 items-center justify-between gap-2 sm:gap-6">
            <Link to="/" className="flex items-center gap-3 shrink-0 min-w-0 group">
              <div className="h-10 w-10 rounded-sm flex items-center justify-center" style={{ background: 'var(--gold)' }}>
                <PedimentMark className="h-6 w-6 text-[var(--navy-deep)]" />
              </div>
              <div className="leading-tight min-w-0">
                <div className="font-serif font-semibold text-lg sm:text-xl tracking-tight truncate">Pediment Bank</div>
                <div className="mt-0.5 text-[9.5px] sm:text-[10.5px] font-mono font-medium uppercase tracking-[0.22em] text-[var(--gold-bright)]/80">
                  Retail, Commercial and Wealth
                </div>
              </div>
            </Link>

            <nav className="hidden lg:flex items-center gap-0.5 text-sm">
              {NAV_ITEMS.map(([to, label]) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === '/'}
                  className={({ isActive }) =>
                    `relative px-2.5 py-2 font-semibold tracking-wide transition-colors text-[11.5px] uppercase font-mono ${
                      isActive ? 'text-[var(--gold-bright)]' : 'text-white/70 hover:text-white'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {label}
                      {isActive && (
                        <span className="absolute left-2.5 right-2.5 -bottom-[1px] h-[2px]" style={{ background: 'var(--gold)' }} />
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </nav>

            <div className="flex items-center gap-1 sm:gap-2">
              <DemoSwitcher />
              <button
                type="button"
                onClick={() => setMobileOpen((o) => !o)}
                aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
                className="lg:hidden h-9 w-9 inline-flex items-center justify-center rounded-sm text-white/80 hover:bg-white/10"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                  {mobileOpen ? <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" /> : <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />}
                </svg>
              </button>
            </div>
          </div>

          {mobileOpen && (
            <div className="lg:hidden pb-4 border-t border-white/10 pt-3 space-y-3">
              <nav className="grid grid-cols-2 gap-1 text-sm">
                {NAV_ITEMS.map(([to, label]) => (
                  <NavLink
                    key={to}
                    to={to}
                    end={to === '/'}
                    onClick={() => navigate(to)}
                    className={({ isActive }) =>
                      `px-3 py-2 rounded-sm text-center font-medium border ${
                        isActive
                          ? 'bg-[var(--gold)] text-[var(--navy-deep)] border-[var(--gold)]'
                          : 'border-white/15 text-white/80 hover:bg-white/10'
                      }`
                    }
                  >
                    {label}
                  </NavLink>
                ))}
              </nav>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 page-enter">
        <Outlet />
      </main>

      <footer className="border-t border-[var(--hairline)] bg-[var(--navy-deep)] text-white/80 mt-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 md:grid-cols-3 gap-8 text-sm">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="h-7 w-7 rounded-sm flex items-center justify-center" style={{ background: 'var(--gold)' }}>
                <PedimentMark className="h-4 w-4 text-[var(--navy-deep)]" />
              </div>
              <div className="font-serif font-semibold text-white">Pediment Bank</div>
            </div>
            <p className="leading-relaxed text-white/60">
              A fictional top-15 US bank: deposits, lending, cards, fraud, AML, and commercial relationships
              running on Fivetran Open Data Infrastructure. All data is synthetic.
            </p>
          </div>
          <div>
            <div className="eyebrow-light mb-2">Data pipeline</div>
            <p className="leading-relaxed text-white/70">
              FIS Horizon, Salesforce FSC, nCino, Plaid, AML vendor, Visa/Mastercard, OFAC/FinCEN
              landed by Fivetran into Apache Iceberg on S3. dbt builds bronze, silver, gold, marts.
              Snowflake and Cortex agents read the same files.
            </p>
          </div>
          <div>
            <div className="eyebrow-light mb-2">Open standards</div>
            <p className="leading-relaxed text-white/70">
              Apache Iceberg v2, AWS Glue Data Catalog, ANSI SQL, dbt semantic layer.
              Storage is customer-owned. Engines are pluggable.
            </p>
          </div>
        </div>
        <div className="border-t border-white/10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3 text-[11px] text-white/50 flex flex-col sm:flex-row gap-1 sm:items-center sm:justify-between">
            <div>© 2026 Pediment Bank ODI Demo, built on Fivetran Open Data Infrastructure.</div>
            <div>Synthetic data only. Not a real bank.</div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function DemoSwitcher() {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={wrapRef} className="relative hidden sm:block">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-1.5 rounded-sm px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider border bg-[var(--gold)]/20 text-[var(--gold-bright)] border-[var(--gold)]/40 hover:bg-[var(--gold)]/30 transition-colors"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-[var(--gold-bright)] animate-pulse" />
        Snapshot
        <svg viewBox="0 0 24 24" className={`h-3 w-3 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-[280px] rounded-sm border border-[var(--hairline)] bg-white shadow-xl z-40 overflow-hidden">
          <div className="px-3 pt-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--ink-muted)] border-b border-[var(--hairline)]">
            Switch demo
          </div>
          <div className="py-1">
            {DEMOS.map((d) => {
              const current = d.key === CURRENT_DEMO;
              const inner = (
                <div className="flex items-center gap-2.5 px-3 py-2">
                  <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: d.accent }} />
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-semibold text-[var(--ink-strong)] truncate">{d.name}</div>
                    <div className="text-[11px] text-slate-500 truncate">{d.industry}</div>
                  </div>
                  {current && (
                    <span className="text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-sm bg-slate-100 text-slate-600 border border-slate-200">
                      Current
                    </span>
                  )}
                </div>
              );
              return current ? (
                <div key={d.key} className="opacity-60 cursor-default">{inner}</div>
              ) : (
                <a key={d.key} href={d.url} className="block hover:bg-slate-50 transition-colors" onClick={() => setOpen(false)}>
                  {inner}
                </a>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// Pediment mark — stylized bank pediment with two columns and a horizon line.
function PedimentMark({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M3 9 L12 4 L21 9" />
      <path d="M5 10 L5 18 M9 10 L9 18 M15 10 L15 18 M19 10 L19 18" />
      <path d="M3 19 L21 19" />
      <path d="M2 21 L22 21" strokeWidth="2.2" />
    </svg>
  );
}
