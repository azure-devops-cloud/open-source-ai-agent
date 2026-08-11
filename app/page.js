import './globals.css';

export default function Home() {
  return (
    <main className="container">
      <section className="hero">
        <p className="eyebrow">OPEN SOURCE • $0 FIRST</p>
        <h1>Open Source AI Agent</h1>
        <p className="subtitle">
          A free-first AI platform built with Next.js, GitHub, Vercel,
          Supabase, and open-source models.
        </p>
        <div className="status">Foundation ready ✓</div>
      </section>

      <section className="grid">
        <article><strong>GitHub</strong><span>Source & automation</span></article>
        <article><strong>Vercel</strong><span>Web deployment</span></article>
        <article><strong>Supabase</strong><span>Database & auth</span></article>
        <article><strong>Open-source AI</strong><span>Agent intelligence</span></article>
      </section>
    </main>
  );
}
