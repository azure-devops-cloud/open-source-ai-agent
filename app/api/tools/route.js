import { NextResponse } from 'next/server';
import { createClient } from '../../../lib/supabase/server';
import { listTools } from '../../../lib/tools/registry';

export async function GET(request) {
  const authorization = request.headers.get('authorization');
  const token = authorization?.startsWith('Bearer ') ? authorization.slice(7) : null;
  const supabase = await createClient(token);
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return NextResponse.json({ ok: false, error: 'Authentication required.' }, { status: 401 });
  return NextResponse.json({ ok: true, tools: listTools() });
}
