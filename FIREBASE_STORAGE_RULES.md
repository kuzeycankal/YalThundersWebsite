# Firebase Storage Kuralları

## ⚠️ ÖNEMLİ: Firebase Storage Kurallarını Ayarla

Video upload çalışması için Firebase Console'da Storage kurallarını güncellemelisin.

## 1. Firebase Console'a Git

https://console.firebase.google.com/

## 2. Projeyi Seç

- **yalthundersauth** projesini aç

## 3. Storage Sekmesi

- Sol menüden **Build** → **Storage**
- **Rules** sekmesine tıkla

## 4. Kuralları Güncelle

Aşağıdaki kuralları kopyala ve yapıştır:

```javascript
rules_version = '2';

service firebase.storage {
  match /b/{bucket}/o {
    
    // Academy videos and thumbnails - Only admins can upload
    match /academy/{folder}/{fileName} {
      // Allow read for everyone
      allow read: if true;
      
      // Allow write only for authenticated admin users
      allow write: if request.auth != null 
                   && request.auth.token.email == "kuzeycankal@gmail.com";
    }
    
    // Default rule for other paths - deny all
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```

## 5. Publish Butonuna Tıkla

Kuralları kaydet ve yayınla.

## 6. Test Et

Artık video upload çalışmalı! 🎉

## Alternatif: Geliştirme İçin Geçici Kural

Sadece test için (GÜVENLİ DEĞİL, sadece development için):

```javascript
rules_version = '2';

service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## Admin Email Ekleme

Başka adminler eklemek için kuralda email listesi kullan:

```javascript
function isAdmin() {
  return request.auth != null && (
    request.auth.token.email == "kuzeycankal@gmail.com" ||
    request.auth.token.email == "yeni_admin@gmail.com"
  );
}

match /academy/{folder}/{fileName} {
  allow read: if true;
  allow write: if isAdmin();
}
```

## Sorun Giderme

### "Permission denied" hatası alıyorsan:

1. Firebase Console → Storage → Rules kontrol et
2. Kurallar published mi?
3. Admin email doğru mu?
4. Login olmuş musun?
5. Browser console'da auth token var mı?

### Storage bucket henüz oluşturulmadıysa:

1. Firebase Console → Storage
2. **Get Started** tıkla
3. Location seç (europe-west)
4. Kuralları yukarıdaki gibi ayarla

## Deployment Checklist

Vercel'e deploy ederken:

- [x] Firebase SDK kullanıyoruz (browser'dan direkt)
- [x] API route'lara gerek yok
- [x] Vercel Blob token'a gerek yok (artık)
- [x] Sadece Firebase kuralları doğru olmalı
- [x] Deploy edince direkt çalışır

## Avantajlar

✅ **Firebase Storage:**
- Doğrudan browser'dan çalışır
- API route'a gerek yok
- Progress tracking built-in
- Güvenilir ve hızlı
- Ücretsiz quota: 5GB storage, 1GB/day download
- Detaylı error messages
- Resume upload support

❌ **Vercel Blob (eski yöntem):**
- API route gerekli
- Token management karmaşık
- Debugging zor
- Cold start delays

Firebase Storage daha basit ve güvenilir! 🎯

