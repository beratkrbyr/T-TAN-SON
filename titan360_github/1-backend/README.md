# Backend API (FastAPI + Python)

## Dosyalar
- `server.py` - Ana API dosyası (tüm endpoint'ler)
- `notification_service.py` - Bildirim servisi
- `requirements.txt` - Python bağımlılıkları

## Kurulum
```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

## Çalıştırma
```bash
uvicorn server:app --host 0.0.0.0 --port 8000
```

## Gereksinimler
- Python 3.10+
- MongoDB (localhost:27017, database: titan360)

## Ana Bağımlılıklar
- FastAPI - Web framework
- Motor - MongoDB async driver
- PyJWT - JWT token
- Bcrypt - Şifre hashleme
- Uvicorn - ASGI server

## API Endpoint'leri
| Method | URL | Açıklama |
|--------|-----|----------|
| GET | /api/services | Hizmetler listesi |
| GET | /api/website-content | CMS içerik |
| POST | /api/admin/login | Admin girişi |
| POST | /api/customers/register | Müşteri kaydı |
| POST | /api/customers/login | Müşteri girişi |
| GET | /api/customers/my-points | Puan bilgisi |
| PUT | /api/customers/profile | Profil güncelleme |
| POST | /api/bookings | Randevu oluşturma |
| GET | /api/availability/public | Müsaitlik takvimi |
| GET | /api/admin/bookings | Admin randevu listesi |
| POST | /api/admin/bookings/{id}/complete | Randevu tamamlama |
