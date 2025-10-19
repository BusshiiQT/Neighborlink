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
    const title: string = body?.title ?? '';
    const description: string = body?.description ?? '';
    const city: string = body?.city ?? 'Chicagoland';
    const category: string = body?.category ?? 'general';
    if (!title.trim()) return NextResponse.json({ error: 'Missing title' }, { status: 400 });

    if (DEMO || !openai) {
      let base = 50;
      if (/honda|toyota|ford|chevy|bmw|mercedes|nissan/i.test(title)) base = 4500;
      if (/iphone|samsung|pixel/i.test(title)) base = 300;
      if (/sofa|couch|sectional/i.test(title)) base = 250;
      if (/laptop|macbook|thinkpad/i.test(title)) base = 700;
      if (/tv|television/i.test(title)) base = 200;
      if (/like new|mint/i.test(title + description)) base = Math.round(base * 1.2);
      if (/parts|broken|as-is/i.test(title + description)) base = Math.round(base * 0.5);
      return NextResponse.json({ price: base, demo: true });
    }

    const prompt = [
      `Estimate a fair USD asking price for a local classified listing.`,
      `Return ONLY a number (integer).`,
      `Location: ${city}; Category: ${category}`,
      `Title: "${title}"`,
      `Description: """${description}"""`,
    ].join('\n');

    const resp = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2,
    });

    let num = parseInt(resp.choices[0]?.message?.content?.match(/\d+/)?.[0] || '0', 10);
    if (!Number.isFinite(num) || num <= 0) num = 50;
    return NextResponse.json({ price: num });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'AI error' }, { status: 500 });
  }
}
