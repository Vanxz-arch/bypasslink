import { getSupabase } from '@/lib/supabase'

export const runtime = 'edge'

export async function GET() {
  try {
    const sb = getSupabase()
    const [{ data: all }, { data: recent }] = await Promise.all([
      sb.from('bypasses').select('status, source, ms'),
      sb.from('bypasses').select('original_url,result_url,source,status,ms,created_at').order('created_at', { ascending: false }).limit(20),
    ])

    const total   = all?.length || 0
    const success = all?.filter(r => r.status === 'success').length || 0
    const failed  = total - success
    const avgMs   = total > 0 ? Math.round(all.filter(r=>r.status==='success').reduce((a,b)=>a+(b.ms||0),0) / (success||1)) : 0
    const bySource = Object.entries(
      (all||[]).reduce((acc, r) => { acc[r.source] = (acc[r.source]||0)+1; return acc }, {})
    ).map(([source, count]) => ({ source, count })).sort((a,b) => b.count - a.count)

    return Response.json({ ok: true, stats: { total, success, failed, successRate: total>0?Math.round(success/total*100):0, avgMs, bySource, recent: recent||[] } })
  } catch {
    return Response.json({ ok: true, stats: { total:0,success:0,failed:0,successRate:0,avgMs:0,bySource:[],recent:[] } })
  }
}
