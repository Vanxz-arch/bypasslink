'use client'
import { useState, useEffect } from 'react'

function TimeAgo({ date }) {
  const s = Math.floor((Date.now() - new Date(date)) / 1000)
  if (s < 60)   return `${s}d lalu`
  if (s < 3600) return `${Math.floor(s/60)}m lalu`
  if (s < 86400)return `${Math.floor(s/3600)}j lalu`
  return `${Math.floor(s/86400)}hr lalu`
}

const NEON = {
  green:  '#39ff14',
  cyan:   '#00f5ff',
  pink:   '#ff2d78',
  purple: '#bf5fff',
  yellow: '#ffe600',
}

export default function Home() {
  const [url, setUrl]         = useState('')
  const [bulk, setBulk]       = useState('')
  const [mode, setMode]       = useState('single')
  const [tab, setTab]         = useState('bypass')
  const [loading, setLoading] = useState(false)
  const [result, setResult]   = useState(null)
  const [bulkRes, setBulkRes] = useState([])
  const [stats, setStats]     = useState(null)
  const [history, setHistory] = useState([])
  const [copied, setCopied]   = useState('')
  const [scanLine, setScanLine] = useState(0)

  // Animasi scan line saat loading
  useEffect(() => {
    if (!loading) return
    const t = setInterval(() => setScanLine(p => (p + 3) % 100), 16)
    return () => clearInterval(t)
  }, [loading])

  useEffect(() => {
    if (tab !== 'bypass') fetchStats()
  }, [tab])

  async function fetchStats() {
    try {
      const r = await fetch('/api/stats')
      const d = await r.json()
      if (d.ok) { setStats(d.stats); setHistory(d.stats.recent || []) }
    } catch {}
  }

  async function doSingle(e) {
    e.preventDefault()
    if (!url.trim()) return
    setLoading(true); setResult(null)
    try {
      const r = await fetch('/api/bypass', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ url: url.trim() }) })
      setResult(await r.json())
    } catch(e) { setResult({ ok:false, error:e.message }) }
    finally { setLoading(false) }
  }

  async function doBulk(e) {
    e.preventDefault()
    const urls = bulk.split('\n').map(u=>u.trim()).filter(Boolean)
    if (!urls.length) return
    setLoading(true); setBulkRes([])
    try {
      const r = await fetch('/api/bypass', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ bulk: urls }) })
      const d = await r.json()
      if (d.results) setBulkRes(d.results)
    } catch(e) { setBulkRes([{ok:false,error:e.message}]) }
    finally { setLoading(false) }
  }

  function copy(text, key='main') {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(''), 2000)
  }

  const glowStyle = (color, size=20) => ({
    textShadow: `0 0 ${size}px ${color}, 0 0 ${size*2}px ${color}`,
    color,
  })

  const boxGlow = (color) => ({
    boxShadow: `0 0 12px ${color}33, inset 0 0 12px ${color}11`,
    border: `1px solid ${color}66`,
  })

  return (
    <div style={{ minHeight:'100vh', background:'#050508', color:'#c8c8e0', fontFamily:"'JetBrains Mono','Courier New',monospace", position:'relative', overflow:'hidden' }}>

      {/* Global styles */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:3px}
        ::-webkit-scrollbar-track{background:#050508}
        ::-webkit-scrollbar-thumb{background:#39ff1444;border-radius:2px}
        ::-webkit-scrollbar-thumb:hover{background:#39ff1488}

        .neon-input {
          width:100%; background:#08080f;
          border:1px solid #39ff1433; border-radius:6px;
          padding:14px 18px; color:#e0ffe8;
          font-family:inherit; font-size:14px; outline:none;
          transition:all .2s; caret-color:#39ff14;
        }
        .neon-input:focus {
          border-color:#39ff14;
          box-shadow:0 0 20px #39ff1422, inset 0 0 10px #39ff1408;
        }
        .neon-input::placeholder{color:#39ff1430}
        textarea.neon-input{resize:vertical;min-height:130px}

        .btn-neon {
          background:transparent; border:1px solid #39ff14;
          border-radius:6px; padding:13px 28px;
          color:#39ff14; font-family:inherit; font-size:13px;
          font-weight:700; cursor:pointer; letter-spacing:.1em;
          text-transform:uppercase;
          transition:all .15s;
          text-shadow:0 0 10px #39ff14;
          box-shadow:0 0 15px #39ff1433;
        }
        .btn-neon:hover{
          background:#39ff1415;
          box-shadow:0 0 25px #39ff1466, inset 0 0 15px #39ff1411;
        }
        .btn-neon:active{transform:scale(.97)}
        .btn-neon:disabled{opacity:.3;cursor:not-allowed;transform:none}

        .btn-sm {
          background:transparent; border:1px solid #39ff1433;
          border-radius:4px; padding:6px 14px;
          color:#39ff1488; font-family:inherit; font-size:11px;
          cursor:pointer; transition:all .15s; letter-spacing:.05em;
        }
        .btn-sm:hover{border-color:#39ff14;color:#39ff14;box-shadow:0 0 10px #39ff1433}

        .tab {
          background:transparent; border:none; border-bottom:2px solid transparent;
          padding:10px 22px; color:#39ff1444;
          font-family:inherit; font-size:12px; letter-spacing:.1em;
          text-transform:uppercase; cursor:pointer; transition:all .2s;
        }
        .tab.active{color:#39ff14;border-bottom-color:#39ff14;text-shadow:0 0 10px #39ff14}
        .tab:hover:not(.active){color:#39ff1488}

        .mode-pill {
          border:none; border-radius:4px; padding:7px 18px;
          font-family:inherit; font-size:11px; letter-spacing:.08em;
          text-transform:uppercase; cursor:pointer; transition:all .15s;
        }
        .mode-pill.active{background:#39ff1420;color:#39ff14;box-shadow:0 0 10px #39ff1433}
        .mode-pill:not(.active){background:transparent;color:#39ff1444}

        .card{
          background:#08080f;
          border:1px solid #39ff1420;
          border-radius:8px; padding:20px;
        }

        .result-ok{
          background:#021a08;
          border:1px solid #39ff14;
          border-radius:8px; padding:20px;
          box-shadow:0 0 30px #39ff1420, inset 0 0 20px #39ff1408;
          animation:fadeIn .3s ease;
        }
        .result-err{
          background:#1a0208;
          border:1px solid #ff2d78;
          border-radius:8px; padding:20px;
          box-shadow:0 0 20px #ff2d7820;
          animation:fadeIn .3s ease;
        }

        @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}

        .history-row{
          display:flex;align-items:center;gap:10px;
          padding:10px 0;border-bottom:1px solid #39ff1410;
          font-size:11px;
        }
        .history-row:last-child{border-bottom:none}

        .badge{
          display:inline-block; padding:2px 8px;
          border-radius:3px; font-size:10px; letter-spacing:.05em;
          border:1px solid #39ff1433; color:#39ff1488;
          background:#39ff1408; flex-shrink:0;
        }

        .stat-box{
          background:#08080f; border:1px solid #39ff1420;
          border-radius:8px; padding:18px; text-align:center;
          transition:all .2s;
        }
        .stat-box:hover{border-color:#39ff1466;box-shadow:0 0 20px #39ff1415}

        .truncate{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}

        .grid-4{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}
        @media(max-width:600px){.grid-4{grid-template-columns:repeat(2,1fr)}}

        /* CRT scanline overlay */
        .crt::before{
          content:'';position:fixed;inset:0;pointer-events:none;z-index:100;
          background:repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,.08) 2px,rgba(0,0,0,.08) 4px);
        }

        /* Corner decorations */
        .corner-tl,.corner-tr,.corner-bl,.corner-br{
          position:fixed;width:40px;height:40px;pointer-events:none;z-index:50;
          border-color:#39ff1444;border-style:solid;
        }
        .corner-tl{top:12px;left:12px;border-width:2px 0 0 2px}
        .corner-tr{top:12px;right:12px;border-width:2px 2px 0 0}
        .corner-bl{bottom:12px;left:12px;border-width:0 0 2px 2px}
        .corner-br{bottom:12px;right:12px;border-width:0 2px 2px 0}

        .flicker{animation:flicker 6s infinite}
        @keyframes flicker{0%,95%,97%,99%,100%{opacity:1}96%,98%{opacity:.85}}

        .blink{animation:blink 1s step-end infinite}
        @keyframes blink{50%{opacity:0}}
      `}</style>

      {/* CRT & corners */}
      <div className="crt" />
      <div className="corner-tl" /><div className="corner-tr" />
      <div className="corner-bl" /><div className="corner-br" />

      {/* Grid background */}
      <div style={{
        position:'fixed', inset:0, pointerEvents:'none', zIndex:0,
        backgroundImage:`linear-gradient(#39ff1406 1px,transparent 1px),linear-gradient(90deg,#39ff1406 1px,transparent 1px)`,
        backgroundSize:'40px 40px',
      }} />

      {/* Scan line animation saat loading */}
      {loading && (
        <div style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:99 }}>
          <div style={{
            position:'absolute', left:0, right:0, top:`${scanLine}%`,
            height:'2px', background:'linear-gradient(90deg,transparent,#39ff14,transparent)',
            boxShadow:'0 0 10px #39ff14', transition:'none',
          }} />
        </div>
      )}

      {/* Header */}
      <header style={{ position:'relative', zIndex:10, borderBottom:'1px solid #39ff1420', padding:'14px 0', backdropFilter:'blur(10px)', background:'#05050888' }}>
        <div style={{ maxWidth:720, margin:'0 auto', padding:'0 20px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div className="flicker" style={{ display:'flex', alignItems:'center', gap:10 }}>
            <span style={{ fontSize:18, ...glowStyle(NEON.green) }}>⚡</span>
            <span style={{ fontSize:15, fontWeight:700, letterSpacing:'.15em', ...glowStyle(NEON.green) }}>BYPASSLINK</span>
            <span style={{ fontSize:9, color:'#39ff1444', border:'1px solid #39ff1422', borderRadius:3, padding:'1px 5px' }}>v1.0</span>
          </div>
          <div style={{ fontSize:10, color:'#39ff1444', letterSpacing:'.05em' }}>
            STATUS: <span style={{ color:NEON.green, textShadow:`0 0 8px ${NEON.green}` }}>ONLINE</span>
            <span className="blink" style={{ color:NEON.green }}> █</span>
          </div>
        </div>
      </header>

      <main style={{ position:'relative', zIndex:10, maxWidth:720, margin:'0 auto', padding:'36px 20px' }}>

        {/* Hero */}
        <div style={{ textAlign:'center', marginBottom:40 }}>
          <div style={{ fontSize:11, color:'#39ff1466', letterSpacing:'.2em', marginBottom:14 }}>
            // SAFELINK BYPASS SYSTEM
          </div>
          <h1 style={{ fontSize:'clamp(26px,6vw,44px)', fontWeight:700, lineHeight:1.15, marginBottom:10, ...glowStyle(NEON.green,30) }}>
            BYPASS SAFELINK
          </h1>
          <p style={{ fontSize:12, color:'#39ff1466', letterSpacing:'.08em' }}>
            sfl.gl · besargaji.com · bahasteknologi.com · safelinkku
          </p>
        </div>

        {/* Tabs */}
        <div style={{ display:'flex', borderBottom:'1px solid #39ff1420', marginBottom:28, gap:2 }}>
          {[['bypass','[ BYPASS ]'],['history','[ HISTORY ]'],['stats','[ STATS ]']].map(([k,l])=>(
            <button key={k} className={`tab ${tab===k?'active':''}`} onClick={()=>setTab(k)}>{l}</button>
          ))}
        </div>

        {/* ═══ TAB BYPASS ═══ */}
        {tab==='bypass' && (
          <div style={{ display:'flex', flexDirection:'column', gap:18 }}>

            {/* Mode */}
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <span style={{ fontSize:11, color:'#39ff1444' }}>MODE:</span>
              <div style={{ display:'flex', background:'#08080f', border:'1px solid #39ff1420', borderRadius:5, padding:3, gap:2 }}>
                {[['single','SINGLE'],['bulk','BULK']].map(([k,l])=>(
                  <button key={k} className={`mode-pill ${mode===k?'active':''}`} onClick={()=>setMode(k)}>{l}</button>
                ))}
              </div>
            </div>

            {/* Single */}
            {mode==='single' && (
              <form onSubmit={doSingle} style={{ display:'flex', gap:10 }}>
                <input className="neon-input" value={url} onChange={e=>setUrl(e.target.value)}
                  placeholder="https://besargaji.com/0GTSZ" type="url" required />
                <button className="btn-neon" type="submit" disabled={loading}>
                  {loading ? '...' : 'RUN'}
                </button>
              </form>
            )}

            {/* Bulk */}
            {mode==='bulk' && (
              <form onSubmit={doBulk} style={{ display:'flex', flexDirection:'column', gap:10 }}>
                <textarea className="neon-input" value={bulk} onChange={e=>setBulk(e.target.value)}
                  placeholder={"https://sfl.gl/xxx\nhttps://besargaji.com/yyy\nhttps://sfl.gl/zzz"} />
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <span style={{ fontSize:11, color:'#39ff1444' }}>
                    {bulk.split('\n').filter(Boolean).length} URL terdeteksi
                  </span>
                  <button className="btn-neon" type="submit" disabled={loading}>
                    {loading ? 'PROCESSING...' : 'RUN ALL'}
                  </button>
                </div>
              </form>
            )}

            {/* Loading state */}
            {loading && (
              <div style={{ textAlign:'center', padding:'20px', color:'#39ff1488', fontSize:12, letterSpacing:'.1em' }}>
                <div style={{ marginBottom:8 }}>BYPASSING<span className="blink">...</span></div>
                <div style={{ height:1, background:'linear-gradient(90deg,transparent,#39ff14,transparent)', boxShadow:'0 0 8px #39ff14' }} />
              </div>
            )}

            {/* Single result */}
            {result && mode==='single' && !loading && (
              <div className={result.ok ? 'result-ok' : 'result-err'}>
                {result.ok ? (
                  <>
                    <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14 }}>
                      <span style={{ ...glowStyle(NEON.green), fontSize:16 }}>✓</span>
                      <span style={{ ...glowStyle(NEON.green), fontSize:12, fontWeight:700, letterSpacing:'.1em' }}>SUCCESS</span>
                      <span className="badge">{result.source}</span>
                      <span style={{ marginLeft:'auto', fontSize:11, color:'#39ff1466' }}>{result.ms}ms</span>
                    </div>
                    <div style={{ background:'#000d04', border:'1px solid #39ff1433', borderRadius:5, padding:'12px 14px', marginBottom:14, wordBreak:'break-all', fontSize:13, color:'#a0ffb8', lineHeight:1.7 }}>
                      <span style={{ color:'#39ff1444', marginRight:8 }}>&gt;</span>{result.result}
                    </div>
                    <div style={{ display:'flex', gap:8 }}>
                      <button className="btn-sm" onClick={()=>copy(result.result,'main')}>
                        {copied==='main' ? '✓ COPIED' : '⎘ COPY URL'}
                      </button>
                      <a href={result.result} target="_blank" rel="noopener noreferrer" style={{ textDecoration:'none' }}>
                        <button className="btn-sm">↗ OPEN</button>
                      </a>
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
                      <span style={{ ...glowStyle(NEON.pink), fontSize:16 }}>✗</span>
                      <span style={{ ...glowStyle(NEON.pink), fontSize:12, fontWeight:700, letterSpacing:'.1em' }}>FAILED</span>
                    </div>
                    <div style={{ color:'#ff2d7888', fontSize:12 }}>{result.error}</div>
                  </>
                )}
              </div>
            )}

            {/* Bulk results */}
            {bulkRes.length > 0 && mode==='bulk' && !loading && (
              <div className="card">
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
                  <span style={{ fontSize:12, color:'#39ff1488', letterSpacing:'.05em' }}>
                    {bulkRes.filter(r=>r.ok).length}/{bulkRes.length} <span style={{ color:'#39ff14' }}>SUCCESS</span>
                  </span>
                  <button className="btn-sm" onClick={()=>copy(bulkRes.filter(r=>r.ok).map(r=>r.result).join('\n'),'bulk')}>
                    {copied==='bulk'?'✓ COPIED':'⎘ COPY ALL'}
                  </button>
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:6, maxHeight:360, overflowY:'auto' }}>
                  {bulkRes.map((r,i)=>(
                    <div key={i} style={{
                      background: r.ok?'#021208':'#120208',
                      border:`1px solid ${r.ok?'#39ff1433':'#ff2d7833'}`,
                      borderRadius:5, padding:'8px 12px', fontSize:11,
                    }}>
                      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:r.ok?5:0 }}>
                        <span style={{ color:r.ok?NEON.green:NEON.pink, fontSize:12 }}>{r.ok?'✓':'✗'}</span>
                        <span style={{ color:'#39ff1444', flex:1 }} className="truncate">{r.original}</span>
                        {r.ms && <span style={{ color:'#39ff1433', flexShrink:0 }}>{r.ms}ms</span>}
                      </div>
                      {r.ok && <div style={{ color:'#a0ffb8', paddingLeft:18, wordBreak:'break-all' }}>{r.result}</div>}
                      {!r.ok && <div style={{ color:'#ff2d7866', paddingLeft:18 }}>{r.error}</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═══ TAB HISTORY ═══ */}
        {tab==='history' && (
          <div className="card">
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
              <span style={{ fontSize:11, color:'#39ff1466', letterSpacing:'.08em' }}>// 20 BYPASS TERAKHIR</span>
              <button className="btn-sm" onClick={fetchStats}>↻ REFRESH</button>
            </div>
            {history.length===0 ? (
              <div style={{ textAlign:'center', padding:'40px 0', color:'#39ff1433', fontSize:12 }}>
                NO DATA FOUND<span className="blink">_</span>
              </div>
            ) : history.map((h,i)=>(
              <div key={i} className="history-row">
                <span style={{ color:h.status==='success'?NEON.green:NEON.pink, fontSize:12, flexShrink:0 }}>
                  {h.status==='success'?'✓':'✗'}
                </span>
                <span className="badge">{h.source}</span>
                <span style={{ flex:1, color:'#39ff1444', minWidth:0 }} className="truncate">{h.original_url}</span>
                {h.result_url && (
                  <a href={h.result_url} target="_blank" rel="noopener noreferrer"
                    style={{ color:NEON.cyan, textDecoration:'none', flexShrink:0, ...glowStyle(NEON.cyan,5) }}>
                    ↗
                  </a>
                )}
                <span style={{ color:'#39ff1433', flexShrink:0 }}>{h.ms}ms</span>
                <span style={{ color:'#39ff1422', flexShrink:0 }}><TimeAgo date={h.created_at}/></span>
              </div>
            ))}
          </div>
        )}

        {/* ═══ TAB STATS ═══ */}
        {tab==='stats' && (
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <div className="grid-4">
              {[
                { label:'TOTAL',   val:stats?.total??'—',            color:NEON.cyan },
                { label:'SUCCESS', val:stats?.success??'—',          color:NEON.green },
                { label:'FAILED',  val:stats?.failed??'—',           color:NEON.pink },
                { label:'RATE',    val:stats?`${stats.successRate}%`:'—', color:NEON.purple },
              ].map(({label,val,color})=>(
                <div key={label} className="stat-box">
                  <div style={{ fontSize:'clamp(22px,5vw,36px)', fontWeight:700, ...glowStyle(color,25), marginBottom:5 }}>{val}</div>
                  <div style={{ fontSize:10, color:'#39ff1444', letterSpacing:'.1em' }}>{label}</div>
                </div>
              ))}
            </div>

            {/* Avg speed */}
            <div className="card" style={{ display:'flex', alignItems:'center', gap:16 }}>
              <div>
                <div style={{ fontSize:26, fontWeight:700, ...glowStyle(NEON.yellow) }}>
                  {stats?.avgMs??'—'}<span style={{ fontSize:13, color:'#ffe60066' }}>ms</span>
                </div>
                <div style={{ fontSize:11, color:'#39ff1444', letterSpacing:'.05em' }}>AVG SPEED</div>
              </div>
              <div style={{ flex:1, height:3, background:'#39ff1410', borderRadius:2, overflow:'hidden' }}>
                <div style={{
                  height:'100%',
                  width:`${Math.min((stats?.avgMs||0)/3000*100,100)}%`,
                  background:`linear-gradient(90deg,${NEON.green},${NEON.yellow})`,
                  boxShadow:`0 0 8px ${NEON.green}`,
                  borderRadius:2,
                  transition:'width .5s ease',
                }} />
              </div>
            </div>

            {/* By source */}
            {stats?.bySource?.length > 0 && (
              <div className="card">
                <div style={{ fontSize:11, color:'#39ff1444', letterSpacing:'.1em', marginBottom:14 }}>// PER SOURCE</div>
                <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                  {stats.bySource.map((s,i)=>{
                    const pct = stats.total>0 ? Math.round(s.count/stats.total*100) : 0
                    const colors = [NEON.green,NEON.cyan,NEON.purple,NEON.pink,NEON.yellow]
                    const c = colors[i % colors.length]
                    return (
                      <div key={i} style={{ display:'flex', alignItems:'center', gap:10, fontSize:11 }}>
                        <span style={{ minWidth:120, color:c, letterSpacing:'.05em' }}>{s.source}</span>
                        <div style={{ flex:1, height:3, background:'#39ff1410', borderRadius:2 }}>
                          <div style={{ height:'100%', width:`${pct}%`, background:c, boxShadow:`0 0 6px ${c}`, borderRadius:2, transition:'width .5s' }} />
                        </div>
                        <span style={{ color:'#39ff1444', minWidth:40, textAlign:'right' }}>{s.count}x</span>
                        <span style={{ color:'#39ff1422', minWidth:30, textAlign:'right' }}>{pct}%</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {!stats && (
              <div style={{ textAlign:'center', padding:'40px 0', color:'#39ff1433', fontSize:12 }}>
                LOADING DATA<span className="blink">...</span>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div style={{ marginTop:60, textAlign:'center', fontSize:10, color:'#39ff1422', letterSpacing:'.1em' }}>
          // BYPASSLINK · USE RESPONSIBLY · {new Date().getFullYear()}
        </div>
      </main>
    </div>
  )
}
