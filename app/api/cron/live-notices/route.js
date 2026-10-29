import { NextResponse } from 'next/server';
import { readFresh, writeCollection } from '@/lib/store';
import { liveNoticeRecipient, sendLiveNotice } from '@/lib/live-notice';

// GET /api/cron/live-notices — run daily by Vercel Cron (vercel.json). Early
// access parks go public on their date with nobody clicking anything, so this
// finds parks that are now public and emails their seller or broker.
export const dynamic = 'force-dynamic';

export async function GET(req) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get('authorization') !== `Bearer ${secret}`) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const [list, brokers] = await Promise.all([readFresh('listings'), readFresh('brokers')]);
  const sent = [];
  for (const l of list.filter((x) => liveNoticeRecipient(x, brokers))) {
    try {
      if (await sendLiveNotice(l, brokers)) { l.liveNotifiedAt = new Date().toISOString(); sent.push(l.id); }
    } catch (e) {
      console.error('live notice', l.id, e?.message);
    }
  }
  if (sent.length) await writeCollection('listings', list);
  return NextResponse.json({ ok: true, sent });
}
