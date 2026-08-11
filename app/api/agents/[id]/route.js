import { NextResponse } from 'next/server';
import { createClient } from '../../../../lib/supabase/server';

export async function GET(request, { params }) {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  const supabase = await createClient(token);
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ ok: false, error: 'Authentication required.' }, { status: 401 });
  }

  const { id } = await params;
  if (!id) return NextResponse.json({ ok: false, error: 'Agent id is required.' }, { status: 400 });

  const { data, error } = await supabase
    .from('agents')
    .select('id, name, description, config')
    .eq('id', id)
    .eq('owner_id', user.id)
    .single();

  if (error) {
    console.error('Agent lookup failed:', error.message);
    return NextResponse.json({ ok: false, error: 'Agent not found.' }, { status: 404 });
  }

  return NextResponse.json({ ok: true, agent: data });
}
