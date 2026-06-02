# Sunucu Ayarları

## Dosyalar
- `nginx-titan360.conf` - Nginx site yapılandırması (SSL, proxy, cache)
- `ecosystem.config.js` - PM2 process manager yapılandırması
- `static-services/` - Hizmet resimleri (koltuk, halı, perde, yatak)

## VPS Kurulum Adımları

### 1. Nginx Yapılandırma
```bash
cp nginx-titan360.conf /etc/nginx/sites-enabled/titan360
nginx -t && systemctl reload nginx
```

### 2. PM2 ile Servisleri Başlatma
```bash
cp ecosystem.config.js /var/www/titan360/
cd /var/www/titan360 && pm2 start ecosystem.config.js
pm2 save && pm2 startup
```

### 3. Statik Dosyalar
```bash
mkdir -p /var/www/titan360/static/services
cp static-services/* /var/www/titan360/static/services/
```

### 4. SSL Sertifikası (Let's Encrypt)
```bash
certbot --nginx -d titan360.com.tr -d www.titan360.com.tr
```

### 5. MongoDB
```bash
systemctl enable mongod && systemctl start mongod
```

## VPS Bilgileri
- IP: 76.13.61.47
- OS: Ubuntu/Debian
- Portlar: 80 (HTTP), 443 (HTTPS), 8000 (API), 3000 (Frontend)
