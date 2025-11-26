# 🚀 Vercel Deployment - Adım Adım

## Hata: BLOB_READ_WRITE_TOKEN Secret Bulunamadı

Bu hata aldıysan, şu adımları takip et:

## 1️⃣ Vercel Blob Storage Oluştur

1. [Vercel Dashboard](https://vercel.com/dashboard)'a git
2. Storage sekmesine tıkla
3. **Create Database** → **Blob** seç
4. Database adı ver (örnek: `yal-thunders-blob`)
5. Create tıkla

## 2️⃣ Environment Variable Ekle

### Yöntem 1: Otomatik (Önerilen)

Vercel Blob oluşturduktan sonra:

1. Blob storage'a tıkla
2. **Connect** sekmesine git
3. Projenizi seçin
4. **Connect** butonuna tıklayın
5. ✅ `BLOB_READ_WRITE_TOKEN` otomatik eklenir!

### Yöntem 2: Manuel

1. Blob storage → **Settings** sekmesi
2. Token'ı kopyala (başında `vercel_blob_rw_` olan)
3. Proje Settings → Environment Variables
4. Yeni variable ekle:
   ```
   Name: BLOB_READ_WRITE_TOKEN
   Value: vercel_blob_rw_xxxxxxxxxxxxxxxxxx
   ```
5. **Save** tıkla

## 3️⃣ Tekrar Deploy Et

```bash
vercel --prod
```

veya GitHub'a push yap (otomatik deploy)

## 4️⃣ Kontrol Et

Deploy tamamlandıktan sonra:

1. `/academy/academy-admin.html` sayfasına git
2. Admin olarak giriş yap
3. Test videosu yükle
4. ✅ Çalışıyor mu?

## Alternatif: Local Development

Local'de test etmek için `.env` dosyası oluştur:

```bash
# .env dosyası oluştur (root directory'de)
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxxxxxxxxxxxxxxxxx
```

Sonra:

```bash
vercel dev
```

## Sorun Devam Ederse

### Seçenek 1: Build Command Ekle

`package.json` dosyasında:

```json
{
  "scripts": {
    "build": "eleventy",
    "vercel-build": "eleventy"
  }
}
```

### Seçenek 2: Framework Preset Değiştir

Vercel Dashboard → Project Settings → General:
- Framework Preset: `Other`
- Build Command: `npx @11ty/eleventy`
- Output Directory: `_site`

### Seçenek 3: Vercel CLI ile Secret Oluştur

```bash
# Terminal'de
vercel secrets add blob_read_write_token your_actual_token_here

# Sonra vercel.json'ı güncelle
# (eski haline döndür @ işaretli)
```

## Deployment Checklist ✅

Deploy öncesi kontrol:

- [ ] Vercel Blob Storage oluşturuldu
- [ ] BLOB_READ_WRITE_TOKEN environment variable eklendi
- [ ] package.json dependencies doğru
- [ ] vercel.json dosyası doğru
- [ ] .gitignore dosyasında .env var (local için)
- [ ] GitHub'a push edildi veya `vercel --prod` çalıştırıldı

## Environment Variables Nasıl Görünmeli

Vercel Dashboard → Settings → Environment Variables:

```
BLOB_READ_WRITE_TOKEN
Production: vercel_blob_rw_xxxxxxxxxx
Preview: vercel_blob_rw_xxxxxxxxxx (same)
Development: vercel_blob_rw_xxxxxxxxxx (same)
```

**Önemli:** Her environment (Production, Preview, Development) için aynı token'ı kullanabilirsin.

## Test Et

Deploy başarılı olduktan sonra:

```bash
# Production URL'ini aç
https://your-project.vercel.app/academy/academy-admin.html

# Admin giriş yap
# Video yükle
# Meeting oluştur
```

## Hala Çalışmıyor mu?

### Debug Adımları:

1. **Vercel Logs Kontrol:**
   - Dashboard → Deployments → Latest → Logs

2. **Environment Variables Kontrol:**
   - Settings → Environment Variables
   - BLOB_READ_WRITE_TOKEN var mı?

3. **Build Logs Kontrol:**
   - Deployment sırasında error var mı?

4. **Browser Console Kontrol:**
   - F12 → Console
   - Upload sırasında error mesajı

### Common Errors:

**Error:** "BLOB_READ_WRITE_TOKEN is not defined"
**Çözüm:** Environment variable ekle (yukarıdaki adımlar)

**Error:** "Cannot find module '@vercel/blob'"
**Çözüm:** `npm install` sonra tekrar deploy

**Error:** "Invalid token"
**Çözüm:** Token'ı yeniden kopyala ve yapıştır

**Error:** "403 Forbidden"
**Çözüm:** Token'ın read-write permissions olduğundan emin ol

## Başarı! 🎉

Everything çalışıyorsa:
- ✅ Video upload çalışıyor
- ✅ Meeting creation çalışıyor
- ✅ Admin panel erişilebilir
- ✅ Tema değiştirme çalışıyor

Ready to use! 🚀

## Destek

Hala sorun mu var? Kontrol et:

1. Token doğru kopyalandı mı? (başında/sonunda boşluk yok)
2. Environment variable tüm environment'lara eklendi mi?
3. Deploy sonrası yeni deployment yapıldı mı?
4. Browser cache temizlendi mi?

Hepsini yaptıysan ve hala çalışmıyorsa:
- Vercel logs'u detaylı incele
- Console errors'ı kontrol et
- Network tab'da API request'leri kontrol et

