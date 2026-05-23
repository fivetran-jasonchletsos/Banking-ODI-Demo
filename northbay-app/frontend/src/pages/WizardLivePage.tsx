/*
 * WizardLivePage — dbt-wizard live-build playback for Pediment Bank.
 *
 * Architecture: step rail + sub-agent narration panel + SQL panel + YAML panel
 * + Play/Pause/Speed controls. Adapted from Build-Room-ODI-Demo/BuildRoomPage.tsx.
 *
 * Aesthetic: Pediment Bank navy/gold on a light paper background. Code panels
 * use a dark surface so SQL remains readable.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import AgentAvatar from '../components/AgentAvatar';
import { wizardDataUrl } from '../components/wizardTypes';
import type { WizardAgent, AgentId, BuildEvent, WizardScenario } from '../components/wizardTypes';

// Timing constants — scale by speed control.
const NARR_TYPE_MS = 14;
const CODE_TYPE_MS = 4;
const POST_NARR_DELAY_MS = 550;
const POST_CODE_DELAY_MS = 350;
const SPEEDS = [1, 2, 4] as const;

interface RevealState {
  cursor: number;
  narrTyped: number;
  codeTyped: number;
  sqlSoFar: string;
  yamlSoFar: string;
  sideEffects: string[];
}

const INITIAL: RevealState = {
  cursor: 0,
  narrTyped: 0,
  codeTyped: 0,
  sqlSoFar: '',
  yamlSoFar: '',
  sideEffects: [],
};

const STEP_DEFS = [
  { label: 'Discovery',            who: 'Explorer',     tools: 'status, search' },
  { label: 'Schema Understanding', who: 'Summary',      tools: 'describe, lineage' },
  { label: 'Data Inspection',      who: 'Worker',       tools: 'warehouse, dbt_show' },
  { label: 'Model Creation',       who: 'Worker',       tools: 'file edits, model gen' },
  { label: 'Test Authoring',       who: 'Verification', tools: 'describe, dbt_show' },
  { label: 'Materialization',      who: 'Worker + Ver', tools: 'dbt_run, lineage' },
];

// Agent accent colors aligned with Pediment Bank palette
const AGENT_STEP_COLOR: Record<string, string> = {
  explorer:     '#0073EA',
  summary:      '#c9a227',
  worker:       '#be185d',
  verification: '#145e36',
  system:       '#7d6519',
};

export default function WizardLivePage() {
  const location = useLocation();
  const questionFromNav: string | undefined = (location.state as { question?: string } | null)?.question;

  const [agents, setAgents]     = useState<WizardAgent[]>([]);
  const [scenario, setScenario] = useState<WizardScenario | null>(null);
  const [events, setEvents]     = useState<BuildEvent[]>([]);
  const [state, setState]       = useState<RevealState>(INITIAL);
  const [playing, setPlaying]   = useState(true);
  const [speed, setSpeed]       = useState<typeof SPEEDS[number]>(1);
  const [complete, setComplete] = useState(false);

  const narrBottomRef = useRef<HTMLDivElement | null>(null);
  const codeBottomRef  = useRef<HTMLDivElement | null>(null);
  const yamlBottomRef  = useRef<HTMLDivElement | null>(null);

  // Load playback data
  useEffect(() => {
    Promise.all([
      fetch(wizardDataUrl('agents.json')).then(r => r.json()),
      fetch(wizardDataUrl('scenario.json')).then(r => r.json()),
      fetch(wizardDataUrl('build_script.json')).then(r => r.json()),
    ]).then(([a, s, b]) => {
      setAgents(a.agents);
      setScenario(s);
      setEvents(b.events);
    });
  }, []);

  const agentById = useMemo(() => {
    const m: Record<string, WizardAgent> = {};
    for (const a of agents) m[a.id] = a;
    return m;
  }, [agents]);

  const currentEvent: BuildEvent | undefined = events[state.cursor];
  const totalSteps = useMemo(() => {
    if (events.length === 0) return 6;
    return Math.max(...events.map(e => e.step));
  }, [events]);

  // Phase machine: type narration → type code (if any) → advance
  useEffect(() => {
    if (!playing || !currentEvent) {
      if (events.length > 0 && state.cursor >= events.length && !complete) {
        setComplete(true);
      }
      return;
    }
    // Phase 1: type narration
    if (state.narrTyped < currentEvent.body.length) {
      const id = setTimeout(() => {
        setState(s => ({ ...s, narrTyped: s.narrTyped + 1 }));
      }, Math.max(2, Math.floor(NARR_TYPE_MS / speed)));
      return () => clearTimeout(id);
    }
    // Phase 2: type code if any
    const code = currentEvent.code_append ?? '';
    if (code.length > 0 && state.codeTyped < code.length) {
      const id = setTimeout(() => {
        setState(s => {
          const nextTyped = s.codeTyped + 1;
          const charsToAdd = code.slice(s.codeTyped, nextTyped);
          if (currentEvent.code_target === 'yaml') {
            return { ...s, codeTyped: nextTyped, yamlSoFar: s.yamlSoFar + charsToAdd };
          }
          return { ...s, codeTyped: nextTyped, sqlSoFar: s.sqlSoFar + charsToAdd };
        });
      }, Math.max(1, Math.floor(CODE_TYPE_MS / speed)));
      return () => clearTimeout(id);
    }
    // Phase 3: commit side effect + advance cursor
    const postDelay = code.length > 0 ? POST_CODE_DELAY_MS : POST_NARR_DELAY_MS;
    const id = setTimeout(() => {
      setState(s => {
        const next: RevealState = { ...s, cursor: s.cursor + 1, narrTyped: 0, codeTyped: 0 };
        if (currentEvent.side_effect) {
          next.sideEffects = [currentEvent.side_effect, ...s.sideEffects].slice(0, 8);
        }
        return next;
      });
    }, Math.max(80, Math.floor(postDelay / speed)));
    return () => clearTimeout(id);
  }, [playing, speed, currentEvent, state.narrTyped, state.codeTyped, state.cursor, events.length, complete]);

  // Autoscroll narration and code panels
  useEffect(() => {
    narrBottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [state.cursor, state.narrTyped]);
  useEffect(() => {
    codeBottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [state.sqlSoFar]);
  useEffect(() => {
    yamlBottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [state.yamlSoFar]);

  const reset = () => { setState(INITIAL); setComplete(false); setPlaying(true); };
  const cycleSpeed = () => { const i = SPEEDS.indexOf(speed); setSpeed(SPEEDS[(i + 1) % SPEEDS.length]); };

  if (!scenario || agents.length === 0 || events.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="eyebrow">dbt-wizard live build</div>
        <p className="text-[var(--ink-muted)] mt-2 font-mono text-sm">Loading build playback...</p>
      </div>
    );
  }

  const currentStep      = currentEvent?.step ?? totalSteps;
  const currentStepLabel = currentEvent?.step_label ?? 'Materialization';
  const activeAgentId: AgentId | undefined =
    currentEvent && state.narrTyped < currentEvent.body.length ? currentEvent.from : undefined;

  const visibleNarr = events.slice(0, Math.min(state.cursor + 1, events.length)).map((e, idx) => {
    const isCurrent = idx === state.cursor;
    const body = isCurrent ? e.body.slice(0, state.narrTyped) : e.body;
    return { e, body, isCurrent };
  });

  // The question shown in the header: prefer what was navigated with, else scenario default
  const displayQuestion = questionFromNav ?? scenario.question;

  return (
    <div className="mx-auto max-w-[1480px] px-4 py-6 sm:px-6 lg:px-8">

      {/* ── Control bar ── */}
      <div
        className="mb-4 p-3 flex flex-wrap items-center justify-between gap-3 sticky top-20 z-20"
        style={{
          background: 'var(--card)',
          border: '1px solid var(--hairline)',
          borderLeft: '4px solid var(--gold)',
          borderRadius: '0.25rem',
          boxShadow: '0 2px 8px rgba(11,39,68,0.08)',
        }}
      >
        <div className="flex items-center gap-3 flex-wrap">
          <span
            className="status-pill gold"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <span
              style={{
                display: 'inline-block',
                width: 7,
                height: 7,
                borderRadius: 999,
                background: 'var(--gold)',
                animation: complete ? 'none' : 'signal-pulse 1.8s ease-in-out infinite',
              }}
            />
            {complete ? 'Build Complete' : 'Build Active'}
          </span>
          <span className="eyebrow">{scenario.request_id}</span>
          <span className="font-mono text-xs" style={{ color: 'var(--ink-muted)' }}>
            Step{' '}
            <span style={{ color: 'var(--gold-dim)', fontWeight: 700 }}>{currentStep}/{totalSteps}</span>
            <span className="mx-2" style={{ color: 'var(--ink-soft)' }}>·</span>
            <span style={{ color: 'var(--ink)' }}>{currentStepLabel}</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="inline-flex items-center gap-1.5 rounded-sm px-3 py-1.5 text-xs font-semibold border transition-colors"
            style={{ background: 'var(--paper-deep)', borderColor: 'var(--hairline)', color: 'var(--ink-muted)' }}
            onClick={() => setPlaying(p => !p)}
            disabled={complete}
          >
            {playing ? 'Pause' : 'Play'}
          </button>
          <button
            className="inline-flex items-center gap-1.5 rounded-sm px-3 py-1.5 text-xs font-semibold border transition-colors"
            style={{ background: 'var(--paper-deep)', borderColor: 'var(--hairline)', color: 'var(--ink-muted)' }}
            onClick={cycleSpeed}
          >
            {speed}x
          </button>
          <button
            className="inline-flex items-center gap-1.5 rounded-sm px-3 py-1.5 text-xs font-semibold border transition-colors"
            style={{ background: 'var(--paper-deep)', borderColor: 'var(--hairline)', color: 'var(--ink-muted)' }}
            onClick={reset}
          >
            Restart
          </button>
          <Link
            to="/dbt-wizard"
            className="inline-flex items-center gap-1.5 rounded-sm px-3 py-1.5 text-xs font-semibold border transition-colors"
            style={{ background: 'var(--paper-deep)', borderColor: 'var(--hairline)', color: 'var(--ink-muted)' }}
          >
            Back
          </Link>
        </div>
      </div>

      {/* ── Question banner ── */}
      <div
        className="mb-4 p-4 research-card border-l-4"
        style={{ borderLeftColor: 'var(--gold)' }}
      >
        <div className="eyebrow mb-1">Fraud desk question · {scenario.timezone_label}</div>
        <p className="font-serif text-lg font-medium text-[var(--ink-strong)] leading-snug">
          "{displayQuestion}"
        </p>
        <div className="mt-1 font-mono text-xs text-[var(--ink-muted)]">
          Requested by {scenario.requested_by}
          <span className="mx-2 text-[var(--ink-soft)]">·</span>
          Target model: <span className="text-[var(--gold-dim)]">{scenario.metric_code}</span>
        </div>
      </div>

      {/* ── Step rail ── */}
      <div className="mb-4 research-card p-3">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
          {STEP_DEFS.map((s, idx) => {
            const num   = idx + 1;
            const done  = currentStep > num || (currentStep === num && complete);
            const active = currentStep === num && !complete;
            const accentColor = active
              ? 'var(--gold)'
              : done
              ? 'var(--bull)'
              : 'var(--hairline)';
            return (
              <div
                key={s.label}
                className="research-card p-2.5"
                style={{
                  borderLeft: `3px solid ${accentColor}`,
                  background: active
                    ? 'var(--gold-bg)'
                    : done
                    ? 'var(--bull-bg)'
                    : 'var(--paper-deep)',
                }}
              >
                <div
                  className="font-mono text-[10px]"
                  style={{
                    color: active ? 'var(--gold-dim)' : done ? 'var(--bull)' : 'var(--ink-soft)',
                  }}
                >
                  STEP {String(num).padStart(2, '0')} · {done ? 'DONE' : active ? 'NOW' : 'WAITING'}
                </div>
                <div className="font-semibold text-sm mt-0.5 text-[var(--ink-strong)]">{s.label}</div>
                <div className="font-mono text-[10px] text-[var(--ink-soft)]">
                  {s.who} · {s.tools}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

        {/* ── LEFT: Sub-agent narration ── */}
        <section
          className="lg:col-span-5 research-card"
          style={{ minHeight: 600 }}
        >
          <header
            className="px-5 py-3 border-b flex items-center justify-between"
            style={{ borderColor: 'var(--hairline)' }}
          >
            <div>
              <div className="eyebrow">Sub-agent narration</div>
              <div className="font-mono text-xs mt-0.5 text-[var(--ink-muted)]">
                {scenario.company} · dbt-wizard live build
              </div>
            </div>
            <div className="flex items-center gap-2">
              {agents.map(a => (
                <AgentAvatar key={a.id} agent={a} active={activeAgentId === a.id} size={32} />
              ))}
            </div>
          </header>

          <div
            className="px-5 py-4 overflow-y-auto"
            style={{ maxHeight: '68vh', background: 'var(--paper)' }}
          >
            {visibleNarr.map((m, idx) => {
              const a     = agentById[m.e.from];
              const color = a?.color ?? AGENT_STEP_COLOR[m.e.from] ?? '#0073EA';
              const isTyping = m.isCurrent && playing && state.narrTyped < m.e.body.length;
              return (
                <div
                  key={idx}
                  style={{
                    borderLeft: `3px solid ${color}`,
                    paddingLeft: 12,
                    background: 'var(--card)',
                    borderTopRightRadius: 4,
                    borderBottomRightRadius: 4,
                    marginBottom: 10,
                    border: `1px solid var(--hairline-soft)`,
                    borderLeftColor: color,
                    borderLeftWidth: 3,
                  }}
                >
                  <div style={{ display: 'flex', gap: 10, padding: '10px 12px 10px 0' }}>
                    <div style={{ paddingTop: 2, flexShrink: 0 }}>
                      <AgentAvatar agent={a} active={isTyping} size={34} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span
                          className="font-mono text-xs font-semibold"
                          style={{ color }}
                        >
                          {a?.name ?? m.e.from}
                        </span>
                        <span
                          className="status-pill gold"
                          style={{ fontSize: 9, padding: '1px 5px' }}
                        >
                          STEP {m.e.step}
                        </span>
                        <span className="font-mono text-[10px] text-[var(--ink-soft)]">
                          {m.e.step_label}
                        </span>
                      </div>
                      <div
                        className={isTyping ? 'wizard-chat-bubble wizard-chat-cursor' : 'wizard-chat-bubble'}
                        style={{ color: 'var(--ink)' }}
                      >
                        {m.body}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={narrBottomRef} />
          </div>
        </section>

        {/* ── RIGHT: Live code panels ── */}
        <section className="lg:col-span-7 space-y-4">

          {/* SQL panel */}
          <div className="research-card">
            <header
              className="px-5 py-3 border-b flex items-center justify-between"
              style={{ borderColor: 'var(--hairline)' }}
            >
              <div className="flex items-center gap-3 flex-wrap">
                <div className="eyebrow">
                  models/gold/fct_cnp_fraud_by_merchant_tier_region_daily.sql
                </div>
                <span
                  className="layer-chip"
                  style={{
                    color: '#be185d',
                    background: 'rgba(190,24,93,0.07)',
                    border: '1px solid rgba(190,24,93,0.3)',
                    fontSize: 9,
                  }}
                >
                  Worker authoring
                </span>
              </div>
              <span className="font-mono text-[11px] text-[var(--ink-soft)]">
                {state.sqlSoFar.length.toLocaleString()} chars
              </span>
            </header>
            <pre
              style={{
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: 12.5,
                lineHeight: 1.55,
                background: '#0b1829',
                color: '#e8edf8',
                border: 'none',
                margin: 0,
                padding: '1.25rem',
                overflowX: 'auto',
                overflowY: 'auto',
                minHeight: 340,
                maxHeight: '48vh',
                whiteSpace: 'pre',
                tabSize: 2,
                borderBottomLeftRadius: '0.25rem',
                borderBottomRightRadius: '0.25rem',
              }}
            >
              {state.sqlSoFar.length === 0 ? (
                <span style={{ color: '#5a7099' }}>{'-- waiting for Worker to begin authoring...'}</span>
              ) : (
                <SyntaxSql
                  text={state.sqlSoFar}
                  cursor={
                    currentEvent?.code_target === 'sql' &&
                    state.codeTyped > 0 &&
                    state.codeTyped < (currentEvent.code_append?.length ?? 0)
                  }
                />
              )}
              <div ref={codeBottomRef} />
            </pre>
          </div>

          {/* YAML panel */}
          <div className="research-card">
            <header
              className="px-5 py-3 border-b flex items-center justify-between"
              style={{ borderColor: 'var(--hairline)' }}
            >
              <div className="flex items-center gap-3 flex-wrap">
                <div className="eyebrow">
                  models/gold/fct_cnp_fraud_by_merchant_tier_region_daily.yml
                </div>
                <span
                  className="layer-chip"
                  style={{
                    color: '#145e36',
                    background: 'rgba(20,94,54,0.07)',
                    border: '1px solid rgba(20,94,54,0.3)',
                    fontSize: 9,
                  }}
                >
                  Verification authoring
                </span>
              </div>
              <span className="font-mono text-[11px] text-[var(--ink-soft)]">
                {state.yamlSoFar.length.toLocaleString()} chars
              </span>
            </header>
            <pre
              style={{
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: 12.5,
                lineHeight: 1.55,
                background: '#0b1829',
                color: '#e8edf8',
                border: 'none',
                margin: 0,
                padding: '1.25rem',
                overflowX: 'auto',
                overflowY: 'auto',
                minHeight: 180,
                maxHeight: '38vh',
                whiteSpace: 'pre',
                tabSize: 2,
                borderBottomLeftRadius: '0.25rem',
                borderBottomRightRadius: '0.25rem',
              }}
            >
              {state.yamlSoFar.length === 0 ? (
                <span style={{ color: '#5a7099' }}>{'# waiting for Verification (step 5)...'}</span>
              ) : (
                <SyntaxYaml
                  text={state.yamlSoFar}
                  cursor={
                    currentEvent?.code_target === 'yaml' &&
                    state.codeTyped > 0 &&
                    state.codeTyped < (currentEvent.code_append?.length ?? 0)
                  }
                />
              )}
              <div ref={yamlBottomRef} />
            </pre>
          </div>

          {/* Tool side effects ticker */}
          <div className="research-card p-4">
            <div className="eyebrow mb-2">dbt-wizard tool calls · live</div>
            {state.sideEffects.length === 0 ? (
              <div className="font-mono text-xs text-[var(--ink-soft)]">Awaiting first tool call...</div>
            ) : (
              <ul className="space-y-1.5">
                {state.sideEffects.map((s, i) => (
                  <li
                    key={`${s}-${i}`}
                    className="flex items-start gap-2 font-mono text-[11px] text-[var(--ink)]"
                  >
                    <span
                      style={{
                        display: 'inline-block',
                        width: 7,
                        height: 7,
                        borderRadius: 999,
                        marginTop: 4,
                        flexShrink: 0,
                        background: i === 0 ? 'var(--gold)' : 'var(--ink-soft)',
                        animation: i === 0 ? 'signal-pulse 1.8s ease-in-out infinite' : 'none',
                      }}
                    />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>

      {/* ── Build complete panel ── */}
      {complete && (
        <div
          className="mt-6 research-card p-6"
          style={{
            borderLeft: '5px solid var(--bull)',
            background: 'var(--bull-bg)',
          }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-center">
            <div className="lg:col-span-1">
              <div className="status-pill bull mb-2" style={{ display: 'inline-flex' }}>
                Build Complete
              </div>
              <div className="font-serif text-3xl font-semibold text-[var(--bull)]">
                {scenario.build_room_seconds}s
              </div>
              <div className="font-mono text-xs mt-1 text-[var(--ink-muted)]">
                question to materialized model
              </div>
            </div>
            <div className="lg:col-span-2">
              <div className="eyebrow mb-1">New gold asset</div>
              <div className="font-mono text-sm font-semibold text-[var(--ink-strong)]">
                {scenario.metric_code}
              </div>
              <div className="font-mono text-xs mt-1 text-[var(--ink-muted)]">
                312 rows · 7 column tests · 1 combination uniqueness test · schema contract enforced · lineage updated
              </div>
            </div>
            <div className="lg:col-span-1 flex justify-start lg:justify-end">
              <Link
                to="/fraud"
                className="inline-flex items-center gap-2 rounded-sm font-semibold text-sm px-5 py-3 transition-colors"
                style={{
                  background: 'var(--bull)',
                  color: '#fff',
                }}
              >
                Back to Fraud desk
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M5 12h14M13 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Inline styles for wizard-specific primitives that don't exist in Banking's CSS */}
      <style>{`
        @keyframes signal-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.28; }
        }
        .wizard-chat-bubble {
          font-family: "JetBrains Mono", monospace;
          font-size: 12.5px;
          line-height: 1.65;
          white-space: pre-wrap;
          word-break: break-word;
          color: var(--ink);
        }
        .wizard-chat-cursor::after {
          content: '▌';
          display: inline-block;
          margin-left: 2px;
          color: var(--gold);
          animation: cursor-blink 0.9s steps(2, start) infinite;
        }
        @keyframes cursor-blink {
          to { visibility: hidden; }
        }
        .wizard-code-cursor::after {
          content: '▌';
          color: var(--gold);
          animation: cursor-blink 0.9s steps(2, start) infinite;
        }
        .wtok-kw    { color: #79b8ff; font-weight: 600; }
        .wtok-str   { color: #4ade80; }
        .wtok-com   { color: #7a8fa8; font-style: italic; }
        .wtok-num   { color: #f59e0b; }
        .wtok-jinja { color: #e879b8; font-weight: 600; }
      `}</style>
    </div>
  );
}

// ─── Syntax highlighting (regex-based, dark panel) ───────────────────────────

const SQL_KEYWORDS = new Set([
  'with', 'as', 'select', 'from', 'where', 'and', 'or', 'on', 'left', 'right',
  'inner', 'outer', 'join', 'group', 'by', 'order', 'desc', 'asc', 'when', 'then',
  'else', 'end', 'case', 'true', 'false', 'null', 'distinct', 'nullif', 'count',
  'sum', 'max', 'min', 'avg', 'dateadd', 'current_date', 'is', 'not',
]);

function SyntaxSql({ text, cursor }: { text: string; cursor: boolean }) {
  const lines = text.split('\n');
  return (
    <>
      {lines.map((line, li) => (
        <span key={li}>{tokenizeSqlLine(line)}{li < lines.length - 1 && '\n'}</span>
      ))}
      {cursor && <span className="wizard-code-cursor" />}
    </>
  );
}

function tokenizeSqlLine(line: string): React.ReactNode[] {
  const trimmed = line.trimStart();
  if (trimmed.startsWith('--')) {
    return [<span key="c" className="wtok-com">{line}</span>];
  }
  const parts: React.ReactNode[] = [];
  const re = /(\{\{[^}]*\}\})|('[^']*')|(\b\d+(?:\.\d+)?\b)|(\b[a-zA-Z_][a-zA-Z0-9_]*\b)|(\s+)|([^\s'\w{]+)/g;
  let m: RegExpExecArray | null;
  let idx = 0;
  let key = 0;
  while ((m = re.exec(line)) !== null) {
    if (m.index > idx) parts.push(line.slice(idx, m.index));
    if (m[1]) {
      parts.push(<span key={key++} className="wtok-jinja">{m[1]}</span>);
    } else if (m[2]) {
      parts.push(<span key={key++} className="wtok-str">{m[2]}</span>);
    } else if (m[3]) {
      parts.push(<span key={key++} className="wtok-num">{m[3]}</span>);
    } else if (m[4]) {
      const word = m[4];
      if (SQL_KEYWORDS.has(word.toLowerCase())) {
        parts.push(<span key={key++} className="wtok-kw">{word}</span>);
      } else {
        parts.push(word);
      }
    } else if (m[5]) {
      parts.push(m[5]);
    } else {
      parts.push(m[6] ?? '');
    }
    idx = re.lastIndex;
  }
  if (idx < line.length) parts.push(line.slice(idx));
  return parts;
}

function SyntaxYaml({ text, cursor }: { text: string; cursor: boolean }) {
  const lines = text.split('\n');
  return (
    <>
      {lines.map((line, i) => {
        const isComment = line.trimStart().startsWith('#');
        if (isComment) {
          return <span key={i} className="wtok-com">{line}{i < lines.length - 1 && '\n'}</span>;
        }
        const colonIdx = line.indexOf(':');
        if (colonIdx > 0 && !line.trimStart().startsWith('-')) {
          const indent = line.slice(0, line.length - line.trimStart().length);
          const keyPart = line.slice(indent.length, colonIdx);
          const rest = line.slice(colonIdx);
          return (
            <span key={i}>
              {indent}
              <span className="wtok-kw">{keyPart}</span>
              {rest}
              {i < lines.length - 1 && '\n'}
            </span>
          );
        }
        return <span key={i}>{line}{i < lines.length - 1 && '\n'}</span>;
      })}
      {cursor && <span className="wizard-code-cursor" />}
    </>
  );
}

// Need React in scope for JSX
import React from 'react';
