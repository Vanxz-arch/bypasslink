// Jalankan sekali: GET /api/init
// Atau buat tabel manual di Supabase SQL editor pakai SQL di bawah
export async function GET() {
  const sql = `
-- Jalankan di Supabase SQL Editor:
CREATE TABLE IF NOT EXISTS bypasses (
  id BIGSERIAL PRIMARY KEY,
  original_url TEXT NOT NULL,
  result_url TEXT,
  source TEXT DEFAULT 'unknown',
  status TEXT DEFAULT 'success',
  ms INTEGER DEFAULT 0,
  ip TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_bypasses_created ON bypasses(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bypasses_source ON bypasses(source);
  `.trim()

  return Response.json({
    ok: true,
    message: 'Salin SQL ini ke Supabase SQL Editor lalu jalankan',
    sql,
  })
}
