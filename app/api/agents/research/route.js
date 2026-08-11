import { NextResponse } from 'next/server';
import { runResearchAgent } from '../../../../lib/agents/research';

export async function POST(request) {
  try {
    const body = await request.json();
    const result = await runResearchAgent({
      question: body.question,
      sources: Array.isArray(body.sources) ? body.sources : [],
    });

    return NextResponse.json({ ok: true, result });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Research agent failed.' },
      { status: 500 },
    );
  }
}
