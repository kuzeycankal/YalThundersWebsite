# 🧪 Localhost Test

## 1. .env.local Dosyasını Doldur

`.env.local` dosyasını aç ve Cloudflare R2 bilgilerini yapıştır:

```
R2_ACCESS_KEY_ID=xxxxx (Cloudflare'den aldığın)
R2_SECRET_ACCESS_KEY=yyyyy
R2_ENDPOINT=https://xxxxx.r2.cloudflarestorage.com
R2_BUCKET_NAME=yal-thunders-academy
R2_PUBLIC_URL=https://pub-xxxxx.r2.dev
```

## 2. Vercel Dev'i Çalıştır

```bash
npm install -g vercel
vercel dev
```

Site localhost'ta açılacak!

## 3. Test Et

- `/academy/academy-admin.html`
- Login yap
- Video yükle
- Console'a bak

## 4. Sonuç

- ✅ Çalışırsa → Vercel'de env variables yanlış
- ❌ Çalışmazsa → API kodunda sorun var

