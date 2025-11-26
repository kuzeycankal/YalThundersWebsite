# 🚀 Vercel Deployment Guide

## Hızlı Başlangıç

### 1. Vercel'e Deploy Etmek

```bash
# Vercel CLI'yi global olarak yükle
npm install -g vercel

# Deploy et
vercel
```

### 2. Environment Variables Ayarla

Vercel Dashboard'da:
1. Projeye git
2. **Settings** → **Environment Variables**
3. Şu değişkeni ekle:

```
BLOB_READ_WRITE_TOKEN = vercel_blob_rw_xxxxxxxxxx
```

**Token'ı nereden alacaksın?**
1. Vercel Dashboard → Storage → Blob
2. "Create Database" tıkla
3. Token otomatik oluşur

### 3. Bitti! 🎉

Site şimdi canlı ve video yükleme çalışıyor.

## Sistem Mimarisi

### Video Upload Akışı:

```
User (Admin Panel)
    ↓
Frontend (upload.js) - FormData ile gönderir
    ↓
API Route (/api/upload) - Vercel Serverless Function
    ↓
Vercel Blob Storage - Public URL döner
    ↓
Frontend - URL'i Firestore'a kaydeder
    ↓
Firestore (metadata) - Başlık, açıklama, URL'ler
```

### Meeting Creation Akışı:

```
User (Admin Panel)
    ↓
Frontend (meetings.js) - Form data toplar
    ↓
Firestore - Direkt kayıt (dosya yok)
```

## Dosya Yapısı

```
project/
├── api/
│   └── upload.js              # Vercel Serverless Function
│
├── academy/
│   ├── js/
│   │   ├── upload.js          # Video upload frontend
│   │   ├── meetings.js        # Meeting creation
│   │   ├── firebase.js        # Firebase config
│   │   └── ...
│   │
│   ├── academy-admin.html     # Admin panel
│   └── ...
│
├── package.json               # Dependencies
├── vercel.json               # Vercel config
└── eleventy.config.js        # Static site generator
```

## API Endpoint

### POST /api/upload

**Request:**
```javascript
FormData {
  file: File,           // Video or thumbnail file
  type: 'video' | 'thumbnail'
}
```

**Response:**
```json
{
  "success": true,
  "url": "https://xxxxx.public.blob.vercel-storage.com/...",
  "filename": "academy/videos/1234567890_video.mp4"
}
```

## Test Etmek

### Local Development:

```bash
# 1. Dependencies yükle
npm install

# 2. .env dosyası oluştur
echo "BLOB_READ_WRITE_TOKEN=your_token_here" > .env

# 3. Dev server başlat
npm run dev

# 4. Vercel dev server (API routes test için)
vercel dev
```

### Production Test:

1. Deploy et: `vercel`
2. `/academy/academy-admin.html` sayfasına git
3. Admin olarak giriş yap: `kuzeycankal@gmail.com`
4. Video yükle

## Admin Kullanımı

### Video Yüklemek:

1. `/academy/academy-admin.html` → "Upload Video" bölümü
2. Başlık, açıklama, kategori gir
3. Video dosyası seç (MP4, WebM, vs.)
4. Thumbnail seç (JPG, PNG)
5. "Upload" tıkla
6. İlerleme mesajlarını izle:
   - ⏳ Uploading thumbnail...
   - ⏳ Uploading video...
   - ⏳ Saving video data...
   - ✅ Video uploaded successfully!

### Meeting Oluşturmak:

1. `/academy/academy-admin.html` → "Create Meeting" bölümü
2. Meeting başlığı, açıklama gir
3. Tarih ve saat seç
4. Join code oluştur
5. "Create Meeting" tıkla
6. ✅ Meeting created successfully!

## Dosya Boyutu Limitleri

- **Vercel Blob:** 500 MB/dosya (ücretsiz plan)
- **Vercel Function:** 50 MB response (Pro: 250 MB)
- **Önerilen video boyutu:** < 100 MB (daha hızlı upload)

Büyük videolar için:
- Videoyu sıkıştır (Handbrake, FFmpeg)
- Daha düşük resolution kullan
- H.264 codec kullan

## Troubleshooting

### "BLOB_READ_WRITE_TOKEN not found"
✅ **Çözüm:** Vercel Dashboard'da environment variable'ı ekle

### "Upload failed: Invalid content type"
✅ **Çözüm:** Form'un `enctype="multipart/form-data"` olduğundan emin ol

### "You do not have admin privileges"
✅ **Çözüm:** Email adresini `ADMIN_EMAILS` array'ine ekle:
```javascript
const ADMIN_EMAILS = [
    "kuzeycankal@gmail.com",
    "yeni_admin@gmail.com"  // Buraya ekle
];
```

### Video yüklendi ama görünmüyor
✅ **Çözüm:** 
- Firestore'da `videos` collection'ı kontrol et
- Console'da error var mı bak
- Sayfayı yenile

### Meeting oluşturulamıyor
✅ **Çözüm:**
- Admin olarak giriş yaptığından emin ol
- Tüm required field'ları doldur
- Console'da error mesajına bak

## Güvenlik

### Admin Kontrolü:
- Email-based (hardcoded list)
- Firestore-based (admin collection)
- Her iki yöntem de kontrol edilir

### File Validation:
- Frontend: File type kontrolü
- Backend: MIME type validation
- Vercel Blob: Public access (herkes görebilir)

### Rate Limiting:
- Vercel otomatik rate limiting yapar
- Pro plan: daha yüksek limitler

## Maliyet

### Vercel Blob Storage (Ücretsiz Plan):
- ✅ 100 GB storage
- ✅ 100 GB bandwidth/ay
- ✅ Unlimited requests

Ücretsiz plan çoğu küçük-orta proje için yeterli!

## Yedekleme

Videolar Vercel Blob'da, metadata Firestore'da:

```bash
# Firestore backup (Firebase Console'dan)
1. Firebase Console → Firestore → Export
2. Bucket seç
3. Export başlat

# Blob backup
# Vercel Blob otomatik backup yapar
# Manuel backup gerekirse Vercel support'a sor
```

## Monitoring

### Vercel Analytics:
- Dashboard → Analytics
- Request sayısı, latency, errors

### Firebase Console:
- Firestore document sayısı
- Auth kullanıcılar
- Storage usage (kullanılmıyor artık)

## Migration from Firebase Storage

Eğer eski Firebase Storage'dan Vercel Blob'a geçiyorsan:

```javascript
// Eski videolar için script
async function migrateOldVideos() {
  const videos = await getDocs(collection(db, "videos"));
  
  for (const doc of videos.docs) {
    const data = doc.data();
    // Eski videoUrl Firebase Storage URL'i
    // Yeniden upload et Vercel'e
    // URL'i güncelle
  }
}
```

## Support

Sorun mu yaşıyorsun?

1. **Console Logs:** Browser DevTools (F12) → Console
2. **Vercel Logs:** Dashboard → Deployments → Logs
3. **Firebase Logs:** Firebase Console → Analytics

## Checklist ✅

Deploy öncesi kontrol listesi:

- [ ] `npm install` çalıştırdın
- [ ] Vercel'de BLOB_READ_WRITE_TOKEN ayarlandı
- [ ] Firebase config doğru
- [ ] Admin email'leri güncellendi
- [ ] Local test yaptın
- [ ] Production test yaptın
- [ ] Video yükleme çalışıyor
- [ ] Meeting oluşturma çalışıyor
- [ ] Tema değiştirme çalışıyor
- [ ] Mobile responsive kontrol edildi

Hepsi ✅ ise ready to launch! 🚀

