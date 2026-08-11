'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { createSupabaseClient } from '../../../../lib/supabase';

const DEFAULT_PROMPT = 'You are a helpful AI agent. Be accurate, concise, and never invent facts or sources.';
const TOOLS = [{ id: 'rss', name: 'RSS Collector', description: 'Collect recent articles from configured RSS or Atom feeds.' }];

export default function AgentSettingsPage() {
  const { id } = useParams();
  const [form, setForm] = useState({ name: '', description: '', systemPrompt: DEFAULT_PROMPT, model: 'llama-3.3-70b-versatile', temperature: '0.2', tools: [] });
  const [message, setMessage] = useState('Loading…');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      const supabase = createSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { window.location.href = '/auth'; return; }
      const { data, error } = await supabase.from('agents').select('id,name,description,config').eq('id', id).eq('owner_id', user.id).single();
      if (error || !data) { setMessage('Agent not found.'); return; }
      const config = data.config || {};
      setForm({ name: data.name || '', description: data.description || '', systemPrompt: config.systemPrompt || DEFAULT_PROMPT, model: config.model || 'llama-3.3-70b-versatile', temperature: String(config.temperature ?? 0.2), tools: Array.isArray(config.tools) ? config.tools : [] });
      setMessage('');
    }
    if (id) load();
  }, [id]);

  function update(field, value) { setForm((current) => ({ ...current, [field]: value })); }
  function toggleTool(toolId) { setForm((current) => ({ ...current, tools: current.tools.includes(toolId) ? current.tools.filter((id) => id !== toolId) : [...current.tools, toolId] })); }

  async function save(event) {
    event.preventDefault(); setSaving(true); setMessage('');
    const supabase = createSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { window.location.href = '/auth'; return; }
    const temperature = Math.min(2, Math.max(0, Number(form.temperature) || 0));
    const config = { systemPrompt: form.systemPrompt.trim(), model: form.model.trim(), temperature, tools: form.tools };
    const { error } = await supabase.from('agents').update({ name: form.name.trim(), description: form.description.trim() || null, config }).eq('id', id).eq('owner_id', user.id);
    setSaving(false); setMessage(error ? error.message : 'Settings saved successfully.');
  }

  return <main className="container"><section className="hero"><p className="eyebrow">AGENT SETTINGS</p><h1>Configure your agent</h1><p className="subtitle">Control instructions, model, and enabled tools.</p></section><form onSubmit={save} style={{ maxWidth: 760, margin: '0 auto', display: 'grid', gap: 14 }}><label>Name<input value={form.name} onChange={(e) => update('name', e.target.value)} required style={{ display: 'block', width: '100%', marginTop: 6, padding: 14, borderRadius: 10, border: '1px solid #ccc' }} /></label><label>Description<input value={form.description} onChange={(e) => update('description', e.target.value)} style={{ display: 'block', width: '100%', marginTop: 6, padding: 14, borderRadius: 10, border: '1px solid #ccc' }} /></label><label>System instructions<textarea value={form.systemPrompt} onChange={(e) => update('systemPrompt', e.target.value)} rows={8} style={{ display: 'block', width: '100%', marginTop: 6, padding: 14, borderRadius: 10, border: '1px solid #ccc', resize: 'vertical' }} /></label><label>Model<input value={form.model} onChange={(e) => update('model', e.target.value)} required style={{ display: 'block', width: '100%', marginTop: 6, padding: 14, borderRadius: 10, border: '1px solid #ccc' }} /></label><label>Temperature<input type="number" min="0" max="2" step="0.1" value={form.temperature} onChange={(e) => update('temperature', e.target.value)} style={{ display: 'block', width: '100%', marginTop: 6, padding: 14, borderRadius: 10, border: '1px solid #ccc' }} /></label><fieldset style={{ border: '1px solid #ccc', borderRadius: 10, padding: 16 }}><legend>Enabled tools</legend>{TOOLS.map((tool) => <label key={tool.id} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', margin: '10px 0' }}><input type="checkbox" checked={form.tools.includes(tool.id)} onChange={() => toggleTool(tool.id)} /><span><strong>{tool.name}</strong><br /><small>{tool.description}</small></span></label>)}</fieldset><button type="submit" disabled={saving} style={{ padding: 14, borderRadius: 10, border: 0, cursor: 'pointer' }}>{saving ? 'Saving…' : 'Save settings'}</button>{message && <p>{message}</p>}<p><a href={`/agents/${id}`}>← Back to runner</a></p></form></main>;
}
