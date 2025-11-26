# 🚀 Cloudflare Pages + R2 Setup

## 📋 Adım 1: Cloudflare Hesabı

1. **https://dash.cloudflare.com/sign-up** → Ücretsiz hesap aç
2. Email doğrula

## 📦 Adım 2: R2 Storage Setup (5 dakika)

### R2 Aktif Et

1. Cloudflare Dashboard → **R2** (sol menüden)
2. **Get Started** tıkla
3. Credit card ekle (ücretsiz plan için gerekli, ücret yok!)
4. **Create Bucket** tıkla

### Bucket Oluştur

```
Bucket Name: yal-thunders-academy
Location: Automatic (en yakın)
```

**Create Bucket!**

### API Token Oluştur

1. **R2** → **Manage R2 API Tokens**
2. **Create API Token**
3. Settings:
   ```
   Token Name: academy-upload
   Permissions: Object Read & Write
   Specify bucket: yal-thunders-academy
   TTL: Forever
   ```
4. **Create API Token**
5. **Token bilgilerini kopyala** (bir daha gösterilmez!)

   ```
   Access Key ID: xxxxx
   Secret Access Key: xxxxx
   Endpoint: https://xxxxx.r2.cloudflarestorage.com
   ```

## 📁 Adım 3: Cloudflare Pages Setup

### GitHub'a Push

```bash
# Commit yap
git add .
git commit -m "Cloudflare Pages setup"
git push origin main
```

### Pages Oluştur

1. Dashboard → **Pages** (sol menüden)
2. **Create a project**
3. **Connect to Git** → GitHub'ı bağla
4. Repository seç: **YalThundersWebsite**
5. Build settings:

```
Framework preset: Eleventy
Build command: npm run build
Build output directory: _site
Node version: 18
```

6. **Environment Variables** ekle:

```
NODE_VERSION = 18
BLOB_READ_WRITE_TOKEN = (R2 Access Key ID)
R2_ACCESS_KEY_ID = (Access Key ID)
R2_SECRET_ACCESS_KEY = (Secret Access Key)
R2_BUCKET_NAME = yal-thunders-academy
R2_ENDPOINT = (R2 Endpoint URL)
```

7. **Save and Deploy**

## 🔧 Adım 4: Kodu R2'ye Uyarla

Şimdi upload API'sini R2 için güncelleyeceğim...

