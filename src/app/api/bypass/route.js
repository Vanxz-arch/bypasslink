import { bypass } from '@/lib/bypass'
import { getSupabase } from '@/lib/supabase'

export const runtime = 'edge'

async function saveToDb(rows) {
  try {
    const sb = getSupabase()
    await sb.from('bypasses').insert(rows)
  } catch {}
}

export async function POST(req) {
  try {
    const body = await req.json()
    const ip = req.headers.get('x-forwarded-for') || 'unknown'

    // Bulk
    if (body.bulk && Array.isArray(body.bulk)) {
      const settled = await Promise.allSettled(body.bulk.map(u => bypass(u)))
      const results = settled.map((r, i) =>
        r.status === 'fulfilled' ? r.value : { ok: false, original: body.bulk[i], error: r.reason?.message }
      )
      await saveToDb(results.map(r => ({
        original_url: r.original, result_url: r.result || null,
        source: r.source || 'unknown', status: r.ok ? 'success' : 'failed',
        ms: r.ms || 0, ip,
      })))
      return Response.json({ ok: true, results })
    }

    // Single
    if (!body.url) return Response.json({ ok: false, error: 'URL diperlukan' }, { status: 400 })
    const result = await bypass(body.url)
    await saveToDb([{
      original_url: result.original, result_url: result.result || null,
      source: result.source, status: result.ok ? 'success' : 'failed',
      ms: result.ms, ip,
    }])
    return Response.json(result)
  } catch (e) {
    return Response.json({ ok: false, error: e.message }, { status: 500 })
  }
}
