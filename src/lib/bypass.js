const UA = 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36'
const HEADERS = { 'User-Agent': UA, 'Accept': 'text/html,*/*', 'Accept-Language': 'id-ID,id;q=0.9' }

export function detectSource(url) {
  const u = url.toLowerCase()
  if (u.includes('sfl.gl'))             return 'sfl.gl'
  if (u.includes('safelinkku.com'))     return 'safelinkku'
  if (u.includes('safelinku.net'))      return 'safelinku'
  if (u.includes('tutwuri.id'))         return 'tutwuri'
  if (u.includes('besargaji.com'))      return 'besargaji'
  if (u.includes('bahasteknologi.com')) return 'bahasteknologi'
  return 'unknown'
}

async function bypassSfl(url) {
  const res = await fetch('https://safebypass.vercel.app/api/bypass', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Origin': 'https://safebypass.vercel.app' },
    body: JSON.stringify({ url }),
  })
  const d = await res.json()
  if (d.ok) return { ok: true, url: d.url, steps: d.steps, ms: d.ms }
  throw new Error(d.message || 'Gagal bypass sfl.gl')
}

async function bypassBesargaji(url) {
  // Step 1: follow redirect besargaji → bahasteknologi
  const s1 = await fetch(url, { headers: HEADERS, redirect: 'manual' })
  let target = url
  if ([301,302].includes(s1.status)) target = s1.headers.get('location') || url

  // Step 2: extract code & hit redirect.php
  const code = target.split('/').filter(Boolean).pop()
  const base = new URL(target).origin
  const s2 = await fetch(`${base}/redirect.php?id=${code}`, { headers: HEADERS, redirect: 'manual' })

  if ([301,302,307].includes(s2.status)) {
    const loc = s2.headers.get('location')
    if (loc) return { ok: true, url: loc.startsWith('/') ? `${base}${loc}` : loc }
  }
  throw new Error('redirect.php tidak return URL')
}

async function bypassGeneric(url) {
  const res = await fetch(url, { headers: HEADERS })
  const html = await res.text()
  const base = new URL(url).origin
  const code = url.split('/').filter(Boolean).pop()

  // Coba redirect.php
  const s2 = await fetch(`${base}/redirect.php?id=${code}`, { headers: HEADERS, redirect: 'manual' })
  if ([301,302,307].includes(s2.status)) {
    const loc = s2.headers.get('location')
    if (loc) return { ok: true, url: loc.startsWith('/') ? `${base}${loc}` : loc }
  }

  // Coba admin-ajax.php
  const nonce = html.match(/["']nonce["']\s*:\s*["']([^"']+)["']/)
  const pid   = html.match(/["']post_id["']\s*:\s*["']?(\d+)["']?/)
  if (nonce && pid) {
    const r2 = await fetch(`${base}/wp-admin/admin-ajax.php`, {
      method: 'POST',
      headers: { ...HEADERS, 'Content-Type': 'application/x-www-form-urlencoded', 'X-Requested-With': 'XMLHttpRequest', Referer: url },
      body: new URLSearchParams({ action: 'wpsafelink', _wpnonce: nonce[1], post_id: pid[1] }),
    })
    const d = await r2.json()
    const result = d.url || d.data || d.link
    if (result) return { ok: true, url: result }
  }

  throw new Error('Tidak dapat menemukan endpoint bypass')
}

export async function bypass(url) {
  const t = Date.now()
  const source = detectSource(url)
  try {
    let r
    if (['sfl.gl','safelinkku','safelinku','tutwuri'].includes(source)) r = await bypassSfl(url)
    else if (['besargaji','bahasteknologi'].includes(source))            r = await bypassBesargaji(url)
    else                                                                  r = await bypassGeneric(url)
    return { ok: true, original: url, result: r.url, source, ms: r.ms || (Date.now()-t) }
  } catch(e) {
    return { ok: false, original: url, source, error: e.message, ms: Date.now()-t }
  }
}
