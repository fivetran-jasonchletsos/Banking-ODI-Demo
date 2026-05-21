import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-24 sm:px-6 lg:px-8 text-center">
      <div className="eyebrow mb-2">404</div>
      <h1 className="font-serif text-4xl font-semibold tracking-tight text-[var(--ink-strong)]">
        That page does not exist.
      </h1>
      <p className="mt-4 text-[var(--ink-muted)]">
        The link or URL you followed is not a recognized route on this demo.
      </p>
      <Link to="/" className="mt-6 inline-flex items-center gap-2 rounded-sm font-semibold text-sm text-[var(--navy-deep)] px-5 py-3 hover:opacity-95" style={{ background: 'var(--gold)' }}>
        Back to home
      </Link>
    </div>
  );
}
