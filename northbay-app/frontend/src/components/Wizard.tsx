// Wizard — inline visual treatment for every "dbt-wizard" mention.
// Bold + gold-bright + slight letter-spacing so the audience's eye
// catches it whenever it appears in body copy. Use anywhere prose
// references the build-time agent by name.
//
// Usage:
//   <p>... <Wizard /> authors it ...</p>
//
// If a darker (paper-background) surface needs a higher-contrast read,
// pass `tone="dark"` and the component swaps to gold-dim.

import type { CSSProperties } from 'react';

export interface WizardProps {
  /** "light" (default) = gold-bright for navy/dark surfaces.
   *  "dark" = gold-dim for cream/light surfaces. */
  tone?: 'light' | 'dark';
  /** Override the literal text — defaults to "dbt-wizard". */
  text?: string;
}

export function Wizard({ tone = 'light', text = 'dbt-wizard' }: WizardProps) {
  const color = tone === 'dark' ? 'var(--gold-dim)' : 'var(--gold-bright)';
  const style: CSSProperties = {
    color,
    fontWeight: 700,
    letterSpacing: '0.005em',
    fontVariantLigatures: 'none',
  };
  return <span style={style}>{text}</span>;
}
