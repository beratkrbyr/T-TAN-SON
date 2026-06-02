# TiTAN 360 - Profesyonel Koltuk Yıkama Platformu

Antalya'nın profesyonel koltuk yıkama hizmeti. Web sitesi, mobil uygulama ve admin paneli.

## Klasör Yapısı

| Klasör | İçerik |
|--------|--------|
| `1-backend/` | FastAPI backend API (Python) |
| `2-website/` | Next.js 14 web sitesi + admin paneli |
| `3-mobil-uygulama/` | React Native (Expo) Android uygulaması |
| `4-sunucu-ayarlari/` | Nginx config, PM2 config, servis resimleri |

## Hızlı Kurulum

### 1. Backend
```bash
cd 1-backend
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
uvicorn server:app --host 0.0.0.0 --port 8000
```

### 2. Web Sitesi
```bash
cd 2-website
npm install
npm run build
npx next start -p 3000
```

### 3. Mobil Uygulama
```bash
cd 3-mobil-uygulama
npm install
npx expo start
# Build: npx eas-cli build --platform android --profile production
```

### 4. Sunucu (VPS)
```bash
# Nginx config'i kopyala
cp 4-sunucu-ayarlari/nginx-titan360.conf /etc/nginx/sites-enabled/titan360
# PM2 ile başlat
pm2 start 4-sunucu-ayarlari/ecosystem.config.js
# Servis resimlerini kopyala
cp 4-sunucu-ayarlari/static-services/* /var/www/titan360/static/services/
```

## Gereksinimler
- **Backend:** Python 3.10+, MongoDB
- **Frontend:** Node.js 18+
- **Mobile:** Node.js 18+, Expo CLI, EAS CLI
- **Sunucu:** Ubuntu/Debian, Nginx, PM2, MongoDB, SSL (Let's Encrypt)

## Bilgiler
- **Domain:** titan360.com.tr
- **VPS:** Hostinger (76.13.61.47)
- **Admin Panel:** /admin-login (admin / admin123)
- **Play Store:** TiTAN 360 uygulaması

## Özellikler
- 4 hizmet: Koltuk Yıkama, Halı Yıkama, Perde, Yatak Yıkama
- Sepet sistemi (çoklu hizmet seçimi)
- Puan ve indirim sistemi (%10-%30)
- İlk kullanım %20 indirim
- Referans kodu paylaşma
- Müsaitlik takvimi
- Admin paneli (hizmet, takvim, randevu, müşteri yönetimi)
- Profil düzenleme
- Google Tag Manager entegrasyonu
