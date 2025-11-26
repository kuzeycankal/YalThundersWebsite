# 🎯 Sadece R2 - Vercel'de Kal!

## En Basit Çözüm

Site Vercel'de kalır, sadece file storage için R2 kullanırız!

## 📦 ADIM 1: R2 Setup (5 dakika)

### 1.1 Cloudflare Hesabı

**https://dash.cloudflare.com/sign-up**
- Ücretsiz hesap aç
- Email doğrula

### 1.2 R2 Bucket

1. Dashboard → **R2**
2. **Get Started** (credit card gerekli ama ücretsiz!)
3. **Create bucket**:
   ```
   Name: yal-thunders-academy
   Location: Automatic
   ```

### 1.3 Public Access

1. Bucket'a tıkla
2. **Settings** → **Public Access**
3. **Allow Access** aktif et
4. **R2.dev subdomain**'i kopyala:
   ```
   https://pub-xxxxxxxxxxxxx.r2.dev
   ```

### 1.4 CORS Ayarları

1. Bucket → **Settings** → **CORS Policy**
2. Ekle:

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

### 1.5 API Token

1. **R2** → **Manage R2 API Tokens**
2. **Create API Token**:
   ```
   Name: academy-upload
   Permissions: Object Read & Write
   Bucket: yal-thunders-academy
   ```
3. **KAYDET**:
   ```
   Access Key ID: xxxxxxxxxxxxxxxx
   Secret Access Key: yyyyyyyyyyyyyyyy
   Endpoint: https://xxxxx.r2.cloudflarestorage.com
   ```

## 🔧 ADIM 2: Kod Güncellemesi

Şimdi direkt R2'ye upload yapacak kodu yazıyorum...

