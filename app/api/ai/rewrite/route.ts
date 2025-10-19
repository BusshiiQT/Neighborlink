// app/api/ai/rewrite/route.ts
import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getSupabaseRoute } from '@/lib/supabaseRoute';

const DEMO = String(process.env.DEMO_MODE).toLowerCase() === 'true';
const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

export async function POST(req: Request) {
  try {
    const supabase = await getSupabaseRoute();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Not signed in' }, { status: 401 });
    }

    const body = await req.json();
    const text: string = body?.text ?? '';
    const tone: string = body?.tone ?? 'clear and friendly';

    if (!text.trim()) {
      return NextResponse.json({ error: 'Missing `text`' }, { status: 400 });
    }

    // Demo / no-OpenAI fallback
    if (DEMO || !openai) {
      return NextResponse.json({
        rewritten: `[DEMO ${tone}] ${text}`,
        demo: true,
      });
    }

    const prompt = [
      `Rewrite the following message in a ${tone} tone.`,
      `Keep it concise, safe, and suitable for a buyer-seller marketplace chat.`,
      `Avoid sharing personal contact info or links.`,
      ``,
      `Message: """${text}"""`,
    ].join('\n');

    const resp = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.4,
    });

    const rewritten = resp.choices[0]?.message?.content?.trim() || text;
    return NextResponse.json({ rewritten });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'AI error' }, { status: 500 });
  }
}
