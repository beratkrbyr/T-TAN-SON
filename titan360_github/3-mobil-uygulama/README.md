# Mobil Uygulama (React Native / Expo)

## Dosya Yapısı
```
App.tsx                   # Ana uygulama + navigation
app.json                  # Expo yapılandırma (versionCode, package name)
eas.json                  # EAS build profilleri (preview=APK, production=AAB)
src/
├── config.ts             # API URL ayarı
├── screens/
│   ├── HomeScreen.tsx    # Ana ekran (istatistikler, referans kodu, banner)
│   ├── ServicesScreen.tsx # Hizmetler + sepet sistemi + m2 girişi
│   ├── NewBookingScreen.tsx # Randevu oluşturma (indirim hesaplama)
│   ├── BookingsScreen.tsx # Randevu geçmişi
│   ├── CalendarScreen.tsx # Müsaitlik takvimi
│   ├── PointsScreen.tsx  # Puan ve indirim bilgisi
│   ├── ProfileScreen.tsx # Profil düzenleme
│   ├── ReviewScreen.tsx  # Değerlendirme
│   ├── LoginScreen.tsx   # Giriş + kayıt (referans kodu alanı)
│   └── ForgotPasswordScreen.tsx
```

## Kurulum
```bash
npm install
npx expo start
```

## Build (Play Store)
```bash
# APK (test)
npx eas-cli build --platform android --profile preview

# AAB (Play Store)
npx eas-cli build --platform android --profile production
```

## Özellikler
- Sepet sistemi (birden fazla hizmet)
- İlk kullanım %20 indirim
- Halı/Perde m2 girişi
- Puan sistemi
- Referans kodu kopyalama/paylaşma
- Profil düzenleme
- Takvim müsaitlik kontrolü

## Expo Hesabı
- Kullanıcı: beratkrbyr
- Proje: titan360-app
