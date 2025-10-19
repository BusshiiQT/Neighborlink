// app/api/ai/price/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import OpenAI from 'openai';
import { getSupabaseRoute } from '@/lib/supabaseRoute';

const DEMO =
  String(process.env.DEMO_MODE ?? process.env.NEXT_PUBLIC_DEMO_MODE ?? 'false')
    .toLowerCase() === 'true';

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

export async function POST(req: Request) {
  try {
    const supabase = await getSupabaseRoute(cookies());

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Not signed in' }, { status: 401 });
    }

    const body = await req.json();
    const title: string = body?.title ?? '';
    const description: string = body?.description ?? '';

    if (!title.trim() && !description.trim()) {
      return NextResponse.json(
        { error: 'Missing `title` or `description`' },
        { status: 400 }
      );
    }

    // Demo / no-OpenAI fallback
    if (DEMO || !openai) {
      return NextResponse.json({
        suggestedPrice: 300,
        reasoning: 'Example demo response (AI disabled or DEMO mode).',
        demo: true,
      });
    }

    const prompt = [
      'Estimate a fair local resale price for the following marketplace listing.',
      'Respond with JSON: { "suggestedPrice": number, "reasoning": string }',
      '',
      `Title: ${title}`,
      `Description: ${description}`,
    ].join('\n');

    const resp = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.4,
    });

    const content = resp.choices[0]?.message?.content ?? '{}';
    let parsed: any = {};
    try {
      parsed = JSON.parse(content);
    } catch {
      parsed = { suggestedPrice: null, reasoning: content };
    }

    return NextResponse.json(parsed);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'AI error' }, { status: 500 });
  }
}
