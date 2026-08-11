import { notFound, redirect } from 'next/navigation';
import { createClient } from '../../../lib/supabase/server';
import AgentRunner from './runner';

export default async function AgentPage({ params }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth');

  const { data: agent, error } = await supabase
    .from('agents')
    .select('id, name, description, config')
    .eq('id', id)
    .eq('owner_id', user.id)
    .single();

  if (error || !agent) notFound();
  return <AgentRunner agent={agent} />;
}
