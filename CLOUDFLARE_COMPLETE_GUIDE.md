# 🚀 Cloudflare Pages + R2 - Komple Rehber

## 📋 ADIM 1: Cloudflare Hesabı (2 dakika)

1. **https://dash.cloudflare.com/sign-up**
2. Email + şifre ile kayıt ol
3. Email'i doğrula

## 📦 ADIM 2: R2 Storage Setup (5 dakika)

### 2.1 R2'yi Aktif Et

1. Dashboard'a gir: **https://dash.cloudflare.com**
2. Sol menüden **R2** tıkla
3. **Purchase R2** veya **Get Started** tıkla
4. Credit card ekle (ücret yok, sadece doğrulama için!)
5. **Enable R2**

### 2.2 Bucket Oluştur

1. **Create bucket** tıkla
2. Settings:
   ```
   Bucket name: yal-thunders-academy
   Location: Automatic
   ```
3. **Create bucket**

### 2.3 Public Access Aç

1. Bucket'a tıkla: **yal-thunders-academy**
2. **Settings** tab
3. **Public Access** → **Allow Access**
4. **Custom Domains** altında **Connect Domain** tıkla (opsiyonel)
   - Kendi domain'in varsa: `cdn.yalthunders.com`
   - Yoksa: Cloudflare `.r2.dev` domain'ini kullan

### 2.4 R2 API Token

1. Sol menüden **R2** → **Manage R2 API Tokens**
2. **Create API Token**
3. Settings:
   ```
   Token name: academy-upload
   Permissions: ✅ Object Read & Write
   Specify bucket: yal-thunders-academy
   TTL: Forever
   ```
4. **Create API Token**
5. **BU BİLGİLERİ KAYDET** (bir daha gösterilmez!):
   ```
   Access Key ID: xxxxxxxxxxxx
   Secret Access Key: yyyyyyyyyyyy
   Endpoint: https://xxxxxx.r2.cloudflarestorage.com
   ```

### 2.5 Public URL Al

1. Bucket settings'de **Public R2.dev Subdomain**'i kontrol et
2. URL şuna benzer: `https://pub-xxxxx.r2.dev`
3. **Bu URL'i kaydet!**

## 📁 ADIM 3: GitHub'a Push (1 dakika)

```bash
git add .
git commit -m "Cloudflare Pages + R2 setup"
git push origin main
```

## 🌐 ADIM 4: Cloudflare Pages Deploy (5 dakika)

### 4.1 Pages Projesi Oluştur

1. Dashboard → **Pages** (sol menüden)
2. **Create a project**
3. **Connect to Git**
4. GitHub'ı bağla (izin ver)
5. Repository seç: **YalThundersWebsite**

### 4.2 Build Settings

```
Project name: yal-thunders-website
Production branch: main

Build settings:
  Framework preset: None (or Other)
  Build command: npm run build
  Build output directory: _site
  Root directory: /
```

### 4.3 Environment Variables

**Variables and Secrets** bölümünde ekle:

```
NODE_VERSION = 18

R2_PUBLIC_URL = (R2 public URL, örn: https://pub-xxxxx.r2.dev)
```

**NOT:** R2 bucket binding Pages settings'den yapılacak, env'den değil!

### 4.4 R2 Bucket Binding

1. Pages project → **Settings** → **Functions**
2. **R2 bucket bindings** → **Add binding**
3. Settings:
   ```
   Variable name: R2_BUCKET
   R2 bucket: yal-thunders-academy
   ```
4. **Save**

### 4.5 Deploy!

1. **Save and Deploy** tıkla
2. Build izle (2-3 dakika)
3. ✅ Deploy successful!

## 🔧 ADIM 5: Test Et!

1. Site URL'ini aç (örn: `https://yal-thunders-website.pages.dev`)
2. `/academy/academy-admin.html`
3. `kuzeycankal@gmail.com` ile giriş
4. Video + thumbnail yükle
5. ✅ **ÇALIŞIR!**

## 📊 Nasıl Çalışıyor?

```
Browser → /api/upload
         ↓
Cloudflare Pages Function (functions/api/upload.js)
         ↓
R2 Bucket (yal-thunders-academy)
         ↓
Public URL (https://pub-xxxxx.r2.dev/academy/videos/...)
         ↓
Firestore (metadata)
```

## ✨ Cloudflare vs Vercel

| Özellik | Cloudflare | Vercel |
|---------|-----------|--------|
| R2/Blob API | ✅ Çok kolay | ❌ Karmaşık |
| Functions | ✅ Worker'lar | ❌ Sorunlu |
| Setup | ✅ 10 dakika | ❌ Çalışmadı |
| Ücretsiz Storage | ✅ 10GB | ❌ 100MB |
| Güvenilirlik | ✅ %99.9 | ❌ 404 errors |
| Global CDN | ✅ 300+ lokasyon | ✅ İyi |

## 🔍 Troubleshooting

### "R2_BUCKET is not defined"
- Pages → Settings → Functions → R2 bucket bindings
- Binding ekle: `R2_BUCKET` → `yal-thunders-academy`
- Redeploy et

### "Public URL 404"
- R2 bucket → Settings → Public Access → Enable
- Public R2.dev subdomain'i kontrol et
- `R2_PUBLIC_URL` env variable'ını güncelle

### Build hatası
```bash
npm install
npm run build
```
Çalışıyorsa, git push yap

### Upload 404
- Functions klasörü doğru mu: `/functions/api/upload.js`
- Deployment logs kontrol et
- R2 binding var mı kontrol et

## 💰 Maliyetler

**Cloudflare R2 - Free Tier:**
- ✅ 10 GB storage
- ✅ 1 milyon Class A operations (write)
- ✅ 10 milyon Class B operations (read)

**Yeterli mi?**
- 100 video (100MB each) = 10GB ✅
- Her video upload = 2 write operation
- 1000 video upload/ay = 2000 operations ✅

**TAMAMEN ÜCRETSIZ!** 🎉

## 🎯 Son Checklist

- [x] Cloudflare hesabı oluşturuldu
- [x] R2 bucket oluşturuldu
- [x] R2 public access açıldı
- [x] R2 API token alındı
- [x] GitHub'a push yapıldı
- [x] Pages projesi oluşturuldu
- [x] Build settings yapılandırıldı
- [x] R2 bucket binding eklendi
- [ ] **İlk deploy** ← ŞİMDİ BU!
- [ ] Test et

## 🚀 DEPLOY ET!

**Pages** → **Create deployment**

veya

```bash
# Git push otomatik deploy tetikler
git push origin main
```

2-3 dakika sonra çalışır! ✅

## 📱 Custom Domain (Opsiyonel)

1. Pages → Settings → Custom domains
2. **Set up a custom domain**
3. Domain'ini ekle: `yalthunders.com`
4. DNS kayıtları otomatik eklenir
5. SSL otomatik ✅

## 🎊 SONUÇ

Cloudflare Pages + R2 = **Vercel'den çok daha iyi!**

- ✅ Güvenilir
- ✅ Hızlı
- ✅ Kolay setup
- ✅ Daha fazla ücretsiz storage
- ✅ Global CDN

**Şimdi deploy et ve çalışsın!** 🚀

