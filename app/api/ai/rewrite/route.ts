import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { supabaseRoute } from '@/lib/supabaseRoute';

const DEMO = String(process.env.DEMO_MODE).toLowerCase() === 'true';
const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

export async function POST(req: Request) {
  try {
    const supabase = supabaseRoute();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Not signed in' }, { status: 401 });

    const body = await req.json();
    const text: string = body?.text ?? '';
    const tone: string = body?.tone ?? 'concise, clear, trustworthy';
    if (!text.trim()) return NextResponse.json({ error: 'Missing text' }, { status: 400 });

    if (DEMO || !openai) {
      const mock = text
        .replace(/\s+/g, ' ')
        .trim()
        .replace(/\b(cheap|best|urgent|!!!)\b/gi, '')
        .concat(' — well cared for, priced fairly.');
      return NextResponse.json({ result: mock, demo: true });
    }

    const prompt = [
      `Rewrite the marketplace text to be clear, honest, and scannable.`,
      `Remove hype and spammy wording. Tone: ${tone}.`,
      `Input: """${text}"""`,
      `Return only the improved text.`,
    ].join('\n');

    const resp = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.4,
    });

    const out = resp.choices[0]?.message?.content?.trim() || text;
    return NextResponse.json({ result: out });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'AI error' }, { status: 500 });
  }
}
