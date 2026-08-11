import { NextResponse } from 'next/server';
import { createClient } from '../../../../lib/supabase/server';

export async function GET(request, { params }) {
  const supabase = await createClient();
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  const { data: { user } } = token
    ? await supabase.auth.getUser(token)
    : await supabase.auth.getUser();
  if (!user) return NextResponse.json({ ok: false, error: 'Authentication required.' }, { status: 401 });

  const { id } = await params;
  if (!id) return NextResponse.json({ ok: false, error: 'Agent id is required.' }, { status: 400 });
  const { data, error } = await supabase.from('agents').select('id, name, description, config').eq('id', id).eq('owner_id', user.id).single();
  if (error || !data) return NextResponse.json({ ok: false, error: 'Agent not found.' }, { status: 404 });
  return NextResponse.json({ ok: true, agent: data });
}
