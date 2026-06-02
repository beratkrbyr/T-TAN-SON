# Web Sitesi (Next.js 14)

## Dosya Yapısı
```
app/
├── page.tsx              # Ana sayfa (hero slider, hizmetler, fiyatlar, yorumlar)
├── layout.tsx            # Ana layout (GTM, meta tags)
├── globals.css           # Global stiller
├── hizmetler/page.tsx    # Hizmetler sayfası
├── hakkimizda/page.tsx   # Hakkımızda sayfası
├── iletisim/page.tsx     # İletişim sayfası (form + bilgiler)
├── nasil-calisir/page.tsx # Nasıl Çalışır sayfası
├── takvim/page.tsx       # Müsaitlik takvimi
├── gizlilik-politikasi/page.tsx
├── admin-login/page.tsx  # Admin giriş sayfası
├── admin/
│   ├── layout.tsx        # Admin panel layout
│   ├── dashboard/page.tsx
│   ├── services/page.tsx # Hizmet yönetimi (resim yükleme dahil)
│   ├── bookings/page.tsx # Randevu yönetimi
│   ├── customers/page.tsx # Müşteri yönetimi
│   ├── calendar/page.tsx  # Takvim yönetimi
│   ├── website/page.tsx   # CMS (içerik, galeri, testimonials)
│   └── settings/page.tsx
├── components/
│   ├── Navbar.tsx        # Navbar (logo + menü)
│   └── Footer.tsx        # Footer
public/
├── logo.jpeg             # TiTAN 360 logosu
├── favicon.ico           # Favicon
└── ...
```

## Kurulum
```bash
npm install
npm run build
npx next start -p 3000
```

## Admin Panel Girişi
- URL: /admin-login
- Kullanıcı: admin
- Şifre: admin123
