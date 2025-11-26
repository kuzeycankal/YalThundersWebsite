# 🎯 R2 + Vercel - En Basit Çözüm!

## ✅ Site Vercel'de Kalıyor, Sadece Storage R2!

**Avantajlar:**
- ✅ Pages'e gerek yok
- ✅ Vercel hosting (zaten var)
- ✅ Sadece R2 storage kullan
- ✅ 10GB ücretsiz
- ✅ Çok hızlı

## 📦 ADIM 1: R2 Setup (5 dakika)

### 1. Cloudflare Hesabı
**https://dash.cloudflare.com/sign-up**

### 2. R2 Aktif Et
1. Dashboard → **R2**
2. **Get Started** → Credit card ekle (ücretsiz!)
3. **Create bucket**: `yal-thunders-academy`

### 3. Public Access Aç
1. Bucket → **Settings** → **Public Access** → **Allow**
2. **R2.dev subdomain** kopyala: `https://pub-xxxxx.r2.dev`

### 4. CORS Ayarla
Bucket → **Settings** → **CORS Policy**:

```json
[
  {
    "AllowedOrigins": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3600
  }
]
```

### 5. API Token Al
1. **R2** → **Manage R2 API Tokens**
2. **Create API Token**:
   ```
   Name: academy-upload
   Permissions: Object Read & Write
   Bucket: yal-thunders-academy
   TTL: Forever
   ```
3. **KAYDET**:
   ```
   Access Key ID: xxxxxxxxxxxxxxxx
   Secret Access Key: yyyyyyyyyyyyyyyy
   Endpoint: https://xxxxx.r2.cloudflarestorage.com
   ```

## 🔧 ADIM 2: Vercel'e Token Ekle

**Vercel Dashboard** → **yal-thunders-website** → **Settings** → **Environment Variables**

Ekle:

```
R2_ACCESS_KEY_ID = (Access Key ID)
R2_SECRET_ACCESS_KEY = (Secret Access Key)
R2_ENDPOINT = (Endpoint URL)
R2_BUCKET_NAME = yal-thunders-academy
R2_PUBLIC_URL = (R2.dev subdomain, örn: https://pub-xxxxx.r2.dev)
```

**Tüm environment'lara** ekle:
- ✅ Production
- ✅ Preview
- ✅ Development

**Save!**

## 🚀 ADIM 3: Deploy

```bash
git add .
git commit -m "R2 storage integration"
git push origin main
```

Vercel otomatik deploy edecek!

## 🧪 ADIM 4: Test Et

1. Site aç
2. `/academy/academy-admin.html`
3. `kuzeycankal@gmail.com` ile giriş
4. Video + thumbnail yükle
5. ✅ **ÇALIŞIR!**

## 📊 Nasıl Çalışıyor?

```
Browser (admin.js)
    ↓
    FormData ile /api/r2-upload'a POST
    ↓
Vercel Function (api/r2-upload.js)
    ↓
    AWS S3 SDK (R2 S3-compatible!)
    ↓
Cloudflare R2 Bucket
    ↓
Public URL döner (https://pub-xxx.r2.dev/academy/...)
    ↓
Firestore'a metadata kaydedilir
```

## ✨ Neden Bu Daha İyi?

| Özellik | R2 + Vercel | Vercel Blob | Cloudflare Pages |
|---------|-------------|-------------|------------------|
| Setup | ✅ 10 dakika | ❌ Çalışmadı | ⚠️ 20 dakika |
| Storage | ✅ 10GB | ❌ 100MB | ✅ 10GB |
| API | ✅ S3 SDK | ❌ Sorunlu | ✅ Worker |
| Mevcut site | ✅ Değişmez | ✅ Aynı | ❌ Taşınmalı |
| Güvenilirlik | ✅ %99.9 | ❌ 404 | ✅ %99.9 |

## 🔍 Console'da Göreceklerin

```
Admin Panel JS Loaded - Cloudflare R2
📤 Uploading thumbnail to R2: academy/thumbnails/...
✅ thumbnail uploaded to R2: https://pub-xxx.r2.dev/academy/thumbnails/...
📤 Uploading video to R2: academy/videos/...
✅ video uploaded to R2: https://pub-xxx.r2.dev/academy/videos/...
✅ Video uploaded successfully!
```

## 💰 Maliyetler

**R2 Free Tier:**
- ✅ 10 GB storage
- ✅ 1M write operations/month
- ✅ 10M read operations/month

**Yeterli mi?**
- 100 video × 100MB = 10GB ✅
- 1000 upload/month = 2000 writes ✅
- 10,000 video view/month = 10,000 reads ✅

**TAMAMEN ÜCRETSIZ!** 🎉

## 🔧 Troubleshooting

### "R2 credentials error"
- Vercel'de token'ları kontrol et
- Environment variable isimleri doğru mu?
- Redeploy et

### "CORS error"
- R2 bucket → Settings → CORS Policy
- Yukarıdaki JSON'u yapıştır
- Save

### "404 Not Found"
- R2 public access açık mı?
- Public URL doğru mu?
- Bucket name doğru mu?

### Build hatası
```bash
npm install
npm run build
```

## ✅ Checklist

- [x] Kod R2'ye uyarlandı
- [x] AWS SDK kuruldu
- [x] Build başarılı
- [ ] **R2 bucket oluşturuldu** ← ŞİMDİ BU!
- [ ] **R2 public access açıldı**
- [ ] **API token alındı**
- [ ] **Vercel'e token eklendi**
- [ ] **Deploy edildi**
- [ ] **Test edildi**

## 🎊 SONUÇ

**En basit çözüm!**

- ✅ Vercel'de kal (site zaten orada)
- ✅ Sadece R2 kullan (storage için)
- ✅ 10GB ücretsiz
- ✅ S3-compatible (güvenilir SDK)
- ✅ 10 dakikada hazır

**R2 SETUP YAP → TOKEN EKLE → DEPLOY ET!** 🚀

