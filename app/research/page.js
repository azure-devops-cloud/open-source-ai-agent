'use client';

import { useState } from 'react';

export default function ResearchPage() {
  const [question, setQuestion] = useState('');
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function runResearch(event) {
    event.preventDefault();
    setLoading(true);
    setResult('');
    setError('');

    try {
      const response = await fetch('/api/agents/research', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ question }),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.error || 'Research failed.');
      setResult(data.result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Research failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="container">
      <section className="hero">
        <p className="eyebrow">RESEARCH AGENT · V0.1</p>
        <h1>Research Agent</h1>
        <p className="subtitle">
          Ask a research question. The agent uses the configured open-source model and never invents sources.
        </p>
        <form onSubmit={runResearch} style={{ maxWidth: 760, margin: '24px auto 0' }}>
          <textarea
            aria-label="Research question"
            required
            rows={5}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Example: Explain the main benefits of Kubernetes Gateway API."
            style={{ width: '100%', padding: 16, borderRadius: 12, border: '1px solid #ccc', resize: 'vertical' }}
          />
          <button type="submit" disabled={loading} style={{ marginTop: 12, padding: '14px 20px', borderRadius: 10, border: 0, cursor: 'pointer' }}>
            {loading ? 'Researching…' : 'Run Research Agent'}
          </button>
        </form>
        {error && <p style={{ marginTop: 20 }}>{error}</p>}
        {result && (
          <article style={{ margin: '28px auto 0', maxWidth: 760, textAlign: 'left', whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>
            {result}
          </article>
        )}
      </section>
    </main>
  );
}
