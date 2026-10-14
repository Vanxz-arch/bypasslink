# ⚡ BypassLink

Bypass safelink — tampilan neon, backend Supabase, deploy Vercel.

## Deploy (5 menit)

### 1. Supabase
1. Buka [supabase.com](https://supabase.com) → New project
2. Buka **SQL Editor** → jalankan SQL ini:
```sql
CREATE TABLE bypasses (
  id BIGSERIAL PRIMARY KEY,
  original_url TEXT NOT NULL,
  result_url TEXT,
  source TEXT DEFAULT 'unknown',
  status TEXT DEFAULT 'success',
  ms INTEGER DEFAULT 0,
  ip TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_bypasses_created ON bypasses(created_at DESC);
CREATE INDEX idx_bypasses_source ON bypasses(source);
```
3. Catat dari **Settings > API**:
   - `Project URL`
   - `service_role` secret key

### 2. Vercel
1. Push ke GitHub → import di [vercel.com](https://vercel.com)
2. Tambah Environment Variables:
```
NEXT_PUBLIC_SUPABASE_URL  = https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY = eyJxxx...
```
3. Deploy → selesai!

## Local Dev
```bash
npm install
cp .env.example .env.local
# isi .env.local dengan nilai Supabase
npm run dev
```

## Fitur
- ⚡ Bypass single / bulk
- 📊 Statistik realtime
- 🕓 History 20 terakhir
- 🌐 Tampilan neon CRT aesthetic
