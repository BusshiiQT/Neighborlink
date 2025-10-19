import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { cookies } from 'next/headers';
import { getSupabaseRoute } from '@/lib/supabaseRoute';

const DEMO = String(process.env.DEMO_MODE).toLowerCase() === 'true';
const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

export async function POST(req: Request) {
  try {
    const supabase = await getSupabaseRoute(await cookies());

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Not signed in' }, { status: 401 });

    const body = await req.json();
    const history: { sender: 'me' | 'them'; text: string }[] = body?.history ?? [];

    if (DEMO || !openai) {
      return NextResponse.json({
        suggestions: [
          'Thanks for reaching out — are you available to meet at a public place this afternoon?',
          'Yes, it’s still available. Do you want any details or extra photos?',
          'Cash or secure digital payment works — what timing/location is best for you?',
        ],
        demo: true,
      });
    }

    const convo = history.map(m => `${m.sender === 'me' ? 'Me' : 'Them'}: ${m.text}`).join('\n');
    const prompt = [
      `Produce 3 short, friendly, safe reply suggestions for a marketplace chat.`,
      `Avoid sharing personal contact info or links. Encourage safe meetups and clarifying questions.`,
      `OUTPUT: one suggestion per line, no numbering.`,
      `Conversation:\n${convo}`,
    ].join('\n');

    const resp = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.5,
    });

    const raw = resp.choices[0]?.message?.content || '';
    const suggestions = raw.split('\n').map(s => s.trim()).filter(Boolean).slice(0, 3);
    return NextResponse.json({ suggestions });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'AI error' }, { status: 500 });
  }
}
