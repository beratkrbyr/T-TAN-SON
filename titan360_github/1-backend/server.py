from fastapi import FastAPI, APIRouter, HTTPException, Depends, UploadFile, File
from fastapi.staticfiles import StaticFiles
from notification_service import NotificationService, BookingNotifications, PasswordResetNotifications
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timedelta
from bson import ObjectId
import bcrypt
import jwt
import os
import random
import string
import shutil
import uuid

MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.environ.get("DB_NAME", "titan360")
JWT_SECRET = os.environ.get("JWT_SECRET", "titan360-secret-key-2024")

client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

app = FastAPI()

# Custom route for serving uploaded files with MongoDB fallback
@app.get("/static/uploads/{filename}")
async def get_uploaded_file(filename: str):
    # Check disk first
    prod_static = "/var/www/titan360/static"
    if os.path.exists(prod_static):
        local_path = os.path.join(prod_static, "uploads", filename)
    else:
        local_path = os.path.join(os.path.dirname(__file__), "static", "uploads", filename)
        
    if os.path.exists(local_path):
        from fastapi.responses import FileResponse
        return FileResponse(local_path)
        
    # Database fallback
    try:
        file_doc = await db.stored_files.find_one({"filename": filename})
        if file_doc:
            from fastapi.responses import Response
            return Response(
                content=file_doc["data"],
                media_type=file_doc.get("content_type", "application/octet-stream")
            )
    except Exception as e:
        print(f"Error reading file from DB: {str(e)}")
        
    raise HTTPException(status_code=404, detail="Dosya bulunamadi")

# Mount static files
static_dir = os.path.join(os.path.dirname(__file__), "static")
os.makedirs(static_dir, exist_ok=True)
os.makedirs(os.path.join(static_dir, "uploads"), exist_ok=True)
app.mount("/static", StaticFiles(directory=static_dir), name="static")

api_router = APIRouter(prefix="/api")
security = HTTPBearer()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def serialize_doc(doc):
    if doc and "_id" in doc:
        doc["_id"] = str(doc["_id"])
    return doc

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=["HS256"])
        return payload
    except:
        raise HTTPException(status_code=401, detail="Invalid token")

def generate_referral_code():
    return "TITAN" + "".join(random.choices(string.ascii_uppercase + string.digits, k=6))

class AdminLogin(BaseModel):
    username: str
    password: str

class Service(BaseModel):
    name: str
    description: str = ""
    price: float
    campaign_price: Optional[float] = 0
    campaign_active: Optional[bool] = False
    campaign_percent: Optional[int] = 0
    duration: int = 60
    active: bool = True
    order: int = 0
    image: Optional[str] = None
    options: Optional[list] = None
    slug: Optional[str] = ""
    seo_title: Optional[str] = ""
    seo_description: Optional[str] = ""

class BookingStatusUpdate(BaseModel):
    status: str

class BookingCompleteRequest(BaseModel):
    total_amount: float
    use_points: int = 0
    apply_discounts: bool = True

class SettingUpdate(BaseModel):
    key: str
    value: str

class TimeSlot(BaseModel):
    time: str
    busy: bool = False

class AvailabilityDate(BaseModel):
    date: str
    available: bool
    time_slots: List[dict] = []

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str

class CustomerUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    loyalty_points: Optional[int] = None

class PointsUpdate(BaseModel):
    points: int
    reason: str = ""

class ReferralSettings(BaseModel):
    referrer_points: int = 100
    referee_points: int = 50
    active: bool = True

@api_router.post("/admin/init")
async def init_admin():
    existing = await db.admins.find_one({})
    if existing:
        return {"message": "Admin zaten mevcut"}
    hashed = bcrypt.hashpw("admin123".encode(), bcrypt.gensalt())
    await db.admins.insert_one({
        "username": "admin",
        "password": hashed.decode(),
        "created_at": datetime.utcnow().isoformat()
    })
    # Referral settings
    await db.settings.update_one(
        {"key": "referral_settings"},
        {"$set": {"key": "referral_settings", "value": {"referrer_points": 100, "referee_points": 50, "active": True}}},
        upsert=True
    )
    return {"message": "Admin olusturuldu", "username": "admin", "password": "admin123"}

@api_router.post("/admin/login")
async def admin_login(login: AdminLogin):
    admin = await db.admins.find_one({"username": login.username})
    if not admin:
        raise HTTPException(status_code=401, detail="Gecersiz kullanici")
    if not bcrypt.checkpw(login.password.encode(), admin["password"].encode()):
        raise HTTPException(status_code=401, detail="Gecersiz sifre")
    token = jwt.encode(
        {"username": admin["username"], "exp": datetime.utcnow() + timedelta(days=30)},
        JWT_SECRET, algorithm="HS256"
    )
    return {"token": token, "username": admin["username"]}

@api_router.put("/admin/change-password")
async def change_password(req: ChangePasswordRequest, _=Depends(verify_token)):
    admin = await db.admins.find_one({"username": "admin"})
    if not admin:
        raise HTTPException(status_code=404, detail="Admin bulunamadi")
    if not bcrypt.checkpw(req.current_password.encode(), admin["password"].encode()):
        raise HTTPException(status_code=400, detail="Mevcut sifre yanlis")
    new_hashed = bcrypt.hashpw(req.new_password.encode(), bcrypt.gensalt())
    await db.admins.update_one({"username": "admin"}, {"$set": {"password": new_hashed.decode()}})
    return {"message": "Sifre degistirildi"}

@api_router.get("/admin/stats")
async def get_stats(_=Depends(verify_token)):
    total = await db.bookings.count_documents({})
    pending = await db.bookings.count_documents({"status": "pending"})
    confirmed = await db.bookings.count_documents({"status": "confirmed"})
    completed = await db.bookings.count_documents({"status": "completed"})
    customers = await db.customers.count_documents({})
    reviews = await db.reviews.count_documents({})
    services = await db.services.count_documents({"active": True})
    # Total points
    points_pipeline = [{"$group": {"_id": None, "total": {"$sum": "$loyalty_points"}}}]
    points_result = await db.customers.aggregate(points_pipeline).to_list(1)
    total_points = points_result[0]["total"] if points_result else 0
    # Revenue
    pipeline = [{"$match": {"status": {"$in": ["confirmed", "completed"]}}}, {"$group": {"_id": None, "total": {"$sum": "$total_price"}}}]
    result = await db.bookings.aggregate(pipeline).to_list(1)
    revenue = result[0]["total"] if result else 0
    # Referral stats
    referral_count = await db.referrals.count_documents({})
    return {
        "total_bookings": total,
        "pending_bookings": pending,
        "confirmed_bookings": confirmed,
        "completed_bookings": completed,
        "total_customers": customers,
        "total_reviews": reviews,
        "total_revenue": revenue,
        "total_services": services,
        "total_points_given": total_points,
        "total_referrals": referral_count
    }

@api_router.get("/admin/notifications")
async def get_notifications(_=Depends(verify_token)):
    notifs = await db.notifications.find({"type": "admin"}).sort("created_at", -1).to_list(50)
    return [{**serialize_doc(n), "id": str(n["_id"])} for n in notifs]

@api_router.get("/admin/bookings")
async def get_bookings(_=Depends(verify_token)):
    bookings = await db.bookings.find().sort("created_at", -1).to_list(1000)
    result = []
    for b in bookings:
        booking_id = str(b["_id"])
        # Get photos for this booking
        photos = await db.work_photos.find({"booking_id": booking_id}).to_list(10)
        photo_list = [{"id": str(p["_id"]), "photo_type": p.get("photo_type", "before"), "photo_base64": p.get("photo_base64", ""), "created_at": p.get("created_at", "")} for p in photos]
        # Get location
        loc = await db.booking_locations.find_one({"booking_id": booking_id})
        location = None
        if loc:
            location = {"latitude": loc.get("latitude"), "longitude": loc.get("longitude"), "status": loc.get("status", "not_started")}
        result.append({**serialize_doc(b), "id": booking_id, "photos": photo_list, "location": location})
    return result

@api_router.get("/admin/bookings/{booking_id}")
async def get_booking_detail(booking_id: str, _=Depends(verify_token)):
    booking = await db.bookings.find_one({"_id": ObjectId(booking_id)})
    if not booking:
        raise HTTPException(status_code=404, detail="Randevu bulunamadi")
    # Get photos
    photos = await db.work_photos.find({"booking_id": booking_id}).to_list(20)
    photo_list = [{"id": str(p["_id"]), "photo_type": p.get("photo_type", "before"), "photo_base64": p.get("photo_base64", ""), "created_at": p.get("created_at", "")} for p in photos]
    # Get location
    loc = await db.booking_locations.find_one({"booking_id": booking_id})
    location = None
    if loc:
        location = {"latitude": loc.get("latitude"), "longitude": loc.get("longitude"), "status": loc.get("status", "not_started"), "updated_at": loc.get("updated_at")}
    return {**serialize_doc(booking), "id": booking_id, "photos": photo_list, "location": location}

@api_router.put("/admin/bookings/{booking_id}")
async def update_booking(booking_id: str, update: BookingStatusUpdate, _=Depends(verify_token)):
    # Get booking details before update
    booking = await db.bookings.find_one({"_id": ObjectId(booking_id)})
    if not booking:
        raise HTTPException(status_code=404, detail="Randevu bulunamadi")
    
    old_status = booking.get("status", "")
    await db.bookings.update_one({"_id": ObjectId(booking_id)}, {"$set": {"status": update.status}})
    
    # Get customer for notification
    customer = await db.customers.find_one({"phone": booking.get("phone")})
    customer_email = customer.get("email") if customer else None
    
    # Send notification based on status change
    if update.status != old_status:
        if update.status == "confirmed":
            await BookingNotifications.send_booking_confirmed(
                customer_name=booking.get("customer_name", ""),
                phone=booking.get("phone", ""),
                email=customer_email,
                service_name=booking.get("service_name", ""),
                date=booking.get("date", ""),
                time=booking.get("time", "")
            )
        elif update.status == "cancelled":
            await BookingNotifications.send_booking_cancelled(
                customer_name=booking.get("customer_name", ""),
                phone=booking.get("phone", ""),
                email=customer_email,
                service_name=booking.get("service_name", ""),
                date=booking.get("date", ""),
                time=booking.get("time", "")
            )
        elif update.status == "completed":
            # Add points to customer
            if booking.get("phone"):
                points_to_add = int(booking.get("total_price", 0) * 0.1)
                await db.customers.update_one(
                    {"phone": booking["phone"]},
                    {"$inc": {"loyalty_points": points_to_add, "total_bookings": 1}}
                )
            # Send completion notification
            await BookingNotifications.send_booking_completed(
                customer_name=booking.get("customer_name", ""),
                phone=booking.get("phone", ""),
                email=customer_email,
                service_name=booking.get("service_name", "")
            )
    
    return {"message": "Guncellendi"}

@api_router.get("/admin/services")
async def get_services(_=Depends(verify_token)):
    services = await db.services.find().sort("order", 1).to_list(100)
    result = []
    for s in services:
        doc = serialize_doc(s)
        img = doc.get("image")
        if img and img.startswith("/static-services/"):
            doc["image"] = img.replace("/static-services/", "/static/services/")
        result.append({**doc, "id": str(s["_id"])})
    return result

@api_router.post("/admin/services")
async def create_service(service: Service, _=Depends(verify_token)):
    service_dict = service.dict()
    if service_dict.get("image") and service_dict["image"].startswith("/static-services/"):
        service_dict["image"] = service_dict["image"].replace("/static-services/", "/static/services/")
    result = await db.services.insert_one(service_dict)
    return {"id": str(result.inserted_id), **service_dict}

@api_router.put("/admin/services/{service_id}")
async def update_service(service_id: str, service: Service, _=Depends(verify_token)):
    service_dict = service.dict()
    if service_dict.get("image") and service_dict["image"].startswith("/static-services/"):
        service_dict["image"] = service_dict["image"].replace("/static-services/", "/static/services/")
    await db.services.update_one({"_id": ObjectId(service_id)}, {"$set": service_dict})
    return {"message": "Guncellendi"}

@api_router.delete("/admin/services/{service_id}")
async def delete_service(service_id: str, _=Depends(verify_token)):
    await db.services.delete_one({"_id": ObjectId(service_id)})
    return {"message": "Silindi"}

@api_router.get("/admin/customers")
async def get_customers(_=Depends(verify_token)):
    customers = await db.customers.find().sort("created_at", -1).to_list(1000)
    result = []
    for c in customers:
        customer_id = str(c["_id"])
        # Get referral info
        referral = await db.referrals.find_one({"referrer_id": customer_id})
        referred_count = await db.referrals.count_documents({"referrer_id": customer_id})
        result.append({
            **serialize_doc(c), 
            "id": customer_id,
            "referral_code": c.get("referral_code", ""),
            "referred_by": c.get("referred_by", ""),
            "referred_count": referred_count
        })
    return result

@api_router.get("/admin/customers/{customer_id}")
async def get_customer_detail(customer_id: str, _=Depends(verify_token)):
    customer = await db.customers.find_one({"_id": ObjectId(customer_id)})
    if not customer:
        raise HTTPException(status_code=404, detail="Musteri bulunamadi")
    # Get referral history
    referrals = await db.referrals.find({"referrer_id": customer_id}).to_list(100)
    # Get points history
    points_history = await db.points_history.find({"customer_id": customer_id}).sort("created_at", -1).to_list(50)
    return {
        **serialize_doc(customer),
        "id": customer_id,
        "referrals": [{**serialize_doc(r), "id": str(r["_id"])} for r in referrals],
        "points_history": [{**serialize_doc(p), "id": str(p["_id"])} for p in points_history]
    }

@api_router.put("/admin/customers/{customer_id}")
async def update_customer(customer_id: str, update: CustomerUpdate, _=Depends(verify_token)):
    update_data = {k: v for k, v in update.dict().items() if v is not None}
    if update_data:
        await db.customers.update_one({"_id": ObjectId(customer_id)}, {"$set": update_data})
    return {"message": "Guncellendi"}

@api_router.post("/admin/customers/{customer_id}/points")
async def add_points(customer_id: str, update: PointsUpdate, _=Depends(verify_token)):
    await db.customers.update_one(
        {"_id": ObjectId(customer_id)},
        {"$inc": {"loyalty_points": update.points}}
    )
    # Record history
    await db.points_history.insert_one({
        "customer_id": customer_id,
        "points": update.points,
        "reason": update.reason,
        "created_at": datetime.utcnow().isoformat()
    })
    return {"message": f"{update.points} puan eklendi"}

@api_router.post("/admin/customers/{customer_id}/generate-referral")
async def generate_customer_referral(customer_id: str, _=Depends(verify_token)):
    code = generate_referral_code()
    await db.customers.update_one(
        {"_id": ObjectId(customer_id)},
        {"$set": {"referral_code": code}}
    )
    return {"referral_code": code}

# Referral System Settings
@api_router.get("/admin/referral-settings")
async def get_referral_settings(_=Depends(verify_token)):
    settings = await db.settings.find_one({"key": "referral_settings"})
    if settings:
        return settings.get("value", {"referrer_points": 100, "referee_points": 50, "active": True})
    return {"referrer_points": 100, "referee_points": 50, "active": True}

@api_router.put("/admin/referral-settings")
async def update_referral_settings(settings: ReferralSettings, _=Depends(verify_token)):
    await db.settings.update_one(
        {"key": "referral_settings"},
        {"$set": {"key": "referral_settings", "value": settings.dict()}},
        upsert=True
    )
    return {"message": "Ayarlar kaydedildi"}

@api_router.get("/admin/referrals")
async def get_all_referrals(_=Depends(verify_token)):
    referrals = await db.referrals.find().sort("created_at", -1).to_list(500)
    return [{**serialize_doc(r), "id": str(r["_id"])} for r in referrals]

@api_router.get("/admin/reviews")
async def get_reviews(_=Depends(verify_token)):
    reviews = await db.reviews.find().sort("created_at", -1).to_list(1000)
    return [{**serialize_doc(r), "id": str(r["_id"])} for r in reviews]

@api_router.get("/reviews/stats")
async def get_review_stats():
    pipeline = [{"$group": {
        "_id": None,
        "average_rating": {"$avg": "$rating"},
        "total_reviews": {"$sum": 1},
        "five_star": {"$sum": {"$cond": [{"$eq": ["$rating", 5]}, 1, 0]}},
        "four_star": {"$sum": {"$cond": [{"$eq": ["$rating", 4]}, 1, 0]}},
        "three_star": {"$sum": {"$cond": [{"$eq": ["$rating", 3]}, 1, 0]}},
        "two_star": {"$sum": {"$cond": [{"$eq": ["$rating", 2]}, 1, 0]}},
        "one_star": {"$sum": {"$cond": [{"$eq": ["$rating", 1]}, 1, 0]}}
    }}]
    result = await db.reviews.aggregate(pipeline).to_list(1)
    if result:
        s = result[0]
        return {
            "average_rating": round(s.get("average_rating", 0) or 0, 1),
            "total_reviews": s.get("total_reviews", 0),
            "breakdown": {"5": s.get("five_star", 0), "4": s.get("four_star", 0), "3": s.get("three_star", 0), "2": s.get("two_star", 0), "1": s.get("one_star", 0)}
        }
    return {"average_rating": 0, "total_reviews": 0, "breakdown": {"5": 0, "4": 0, "3": 0, "2": 0, "1": 0}}

@api_router.delete("/admin/reviews/{review_id}")
async def delete_review(review_id: str, _=Depends(verify_token)):
    await db.reviews.delete_one({"_id": ObjectId(review_id)})
    return {"message": "Silindi"}

@api_router.get("/admin/settings")
async def get_settings(_=Depends(verify_token)):
    settings = await db.settings.find().to_list(100)
    result = {}
    for s in settings:
        if s.get("key") != "referral_settings":
            result[s.get("key", "")] = s.get("value", "")
    return result

@api_router.post("/admin/settings")
async def save_settings(settings: dict, _=Depends(verify_token)):
    for key, value in settings.items():
        await db.settings.update_one({"key": key}, {"$set": {"key": key, "value": value}}, upsert=True)
    return {"message": "Kaydedildi"}

@api_router.put("/admin/settings")
async def update_setting(setting: SettingUpdate, _=Depends(verify_token)):
    await db.settings.update_one({"key": setting.key}, {"$set": {"value": setting.value}}, upsert=True)
    return {"message": "Kaydedildi"}

@api_router.get("/admin/availability")
async def get_availability(year: int, month: int, _=Depends(verify_token)):
    start = f"{year}-{month:02d}-01"
    end = f"{year}-{month:02d}-31"
    docs = await db.availability.find({"date": {"$gte": start, "$lte": end}}).to_list(100)
    return [{**serialize_doc(a), "id": str(a["_id"])} for a in docs]

@api_router.get("/admin/availability/date")
async def get_availability_date(date: str, _=Depends(verify_token)):
    doc = await db.availability.find_one({"date": date})
    if doc:
        return {**serialize_doc(doc), "id": str(doc["_id"])}
    return {"date": date, "available": False, "time_slots": []}

@api_router.post("/admin/availability")
async def set_availability(avail: AvailabilityDate, _=Depends(verify_token)):
    await db.availability.update_one({"date": avail.date}, {"$set": avail.dict()}, upsert=True)
    return {"message": "Kaydedildi"}

@api_router.get("/work-photos/{booking_id}")
async def get_work_photos(booking_id: str):
    photos = await db.work_photos.find({"booking_id": booking_id}).to_list(20)
    return [{"id": str(p["_id"]), "photo_type": p.get("photo_type", "before"), "photo_base64": p.get("photo_base64", ""), "created_at": p.get("created_at", "")} for p in photos]

@api_router.get("/location/{booking_id}")
async def get_location(booking_id: str):
    loc = await db.booking_locations.find_one({"booking_id": booking_id})
    if loc:
        return {"latitude": loc.get("latitude"), "longitude": loc.get("longitude"), "status": loc.get("status"), "updated_at": loc.get("updated_at")}
    return {"status": "not_started", "latitude": None, "longitude": None}


# =============================================
# MOBILE APP API ENDPOINTS (Customer Side)
# =============================================

class CustomerLogin(BaseModel):
    phone: str
    password: str

class CustomerRegister(BaseModel):
    name: str
    phone: str
    password: str
    email: Optional[str] = None
    referral_code: Optional[str] = None

# Password Reset Models
class PasswordResetRequest(BaseModel):
    phone: str

class PasswordResetVerify(BaseModel):
    phone: str
    code: str
    new_password: str

class BookingCreate(BaseModel):
    service_id: str
    service_name: str
    date: str
    time: str
    address: str
    notes: Optional[str] = ""
    photos: Optional[List[str]] = []
    price: Optional[float] = 0
    discount_pct: Optional[int] = 0
    discount_amount: Optional[float] = 0
    final_price: Optional[float] = 0

class PhotoUpload(BaseModel):
    booking_id: str
    photo_type: str  # "before" or "after"
    photo_base64: str

class LocationUpdate(BaseModel):
    booking_id: str
    latitude: float
    longitude: float
    status: str  # "on_the_way", "arrived", "in_progress", "completed"

# Customer Registration
@api_router.post("/customers/register")
async def customer_register(data: CustomerRegister):
    existing = await db.customers.find_one({"phone": data.phone})
    if existing:
        raise HTTPException(status_code=400, detail="Bu telefon numarasi zaten kayitli")
    
    hashed = bcrypt.hashpw(data.password.encode(), bcrypt.gensalt())
    referral_code = generate_referral_code()
    
    customer_data = {
        "name": data.name,
        "phone": data.phone,
        "password": hashed.decode(),
        "email": data.email,
        "referral_code": referral_code,
        "referred_by": data.referral_code if data.referral_code else None,
        "loyalty_points": 0,
        "total_bookings": 0,
        "total_spent": 0,
        "discount_rights": [],
        "created_at": datetime.utcnow().isoformat()
    }
    
    # If referred by someone, record referral (bonus given on first 1200+ TL booking completion)
    if data.referral_code:
        referrer = await db.customers.find_one({"referral_code": data.referral_code})
        if referrer:
            # Record referral as pending
            await db.referrals.insert_one({
                "referrer_id": str(referrer["_id"]),
                "referee_phone": data.phone,
                "referee_name": data.name,
                "status": "pending",
                "created_at": datetime.utcnow().isoformat()
            })
    
    result = await db.customers.insert_one(customer_data)
    
    token = jwt.encode(
        {"customer_id": str(result.inserted_id), "phone": data.phone, "exp": datetime.utcnow() + timedelta(days=90)},
        JWT_SECRET, algorithm="HS256"
    )
    
    return {
        "token": token,
        "customer": {
            "id": str(result.inserted_id),
            "name": data.name,
            "phone": data.phone,
            "referral_code": referral_code,
            "loyalty_points": customer_data["loyalty_points"]
        }
    }

# Customer Login
@api_router.post("/customers/login")
async def customer_login(data: CustomerLogin):
    customer = await db.customers.find_one({"phone": data.phone})
    if not customer:
        raise HTTPException(status_code=401, detail="Kullanici bulunamadi")
    
    if "password" not in customer:
        raise HTTPException(status_code=401, detail="Sifre henuz belirlenmemis, lutfen kayit olun")
    
    if not bcrypt.checkpw(data.password.encode(), customer["password"].encode()):
        raise HTTPException(status_code=401, detail="Gecersiz sifre")
    
    token = jwt.encode(
        {"customer_id": str(customer["_id"]), "phone": data.phone, "exp": datetime.utcnow() + timedelta(days=90)},
        JWT_SECRET, algorithm="HS256"
    )
    
    return {
        "token": token,
        "customer": {
            "id": str(customer["_id"]),
            "name": customer.get("name", ""),
            "phone": customer["phone"],
            "email": customer.get("email", ""),
            "referral_code": customer.get("referral_code", ""),
            "loyalty_points": customer.get("loyalty_points", 0),
            "total_bookings": customer.get("total_bookings", 0)
        }
    }

# Get customer bookings
@api_router.get("/customers/{customer_id}/bookings")
async def get_customer_bookings(customer_id: str):
    try:
        bookings_collection = db["bookings"]
        services_collection = db["services"]
        bookings = await bookings_collection.find({"customer_id": customer_id}).to_list(100)
        result = []
        for b in bookings:
            service = await services_collection.find_one({"_id": ObjectId(b.get("service_id"))}) if b.get("service_id") else None
            result.append({
                "_id": str(b["_id"]),
                "service_name": service.get("name", "Hizmet") if service else "Hizmet",
                "date": b.get("date", ""),
                "time": b.get("time", ""),
                "status": b.get("status", "pending"),
                "address": b.get("address", ""),
                "price": service.get("price", 0) if service else 0
            })
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Get customer profile
@api_router.get("/customers/profile")
async def get_customer_profile(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=["HS256"])
        customer_id = payload.get("customer_id")
    except:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    customer = await db.customers.find_one({"_id": ObjectId(customer_id)})
    if not customer:
        raise HTTPException(status_code=404, detail="Musteri bulunamadi")
    
    return {
        "id": str(customer["_id"]),
        "name": customer.get("name", ""),
        "phone": customer["phone"],
        "email": customer.get("email", ""),
        "address": customer.get("address", ""),
        "referral_code": customer.get("referral_code", ""),
        "loyalty_points": customer.get("loyalty_points", 0),
        "total_bookings": customer.get("total_bookings", 0)
    }

# Get services (public)
@api_router.get("/services")
async def get_public_services():
    services = await db.services.find({"active": True}).sort("order", 1).to_list(100)
    base_url = "https://titan360.com.tr"
    
    # Load campaign percentage from website_content setting (default 20%)
    global_campaign_percent = 20
    try:
        content = await db.website_content.find_one({"type": "main"})
        if content and "campaign_percent" in content:
            global_campaign_percent = int(content["campaign_percent"])
    except Exception as e:
        print(f"Error loading campaign_percent: {str(e)}")
        
    global_multiplier = (100 - global_campaign_percent) / 100
    
    result = []
    for s in services:
        img = s.get("image")
        if img:
            if img.startswith("/static-services/"):
                img = img.replace("/static-services/", "/static/services/")
            if img.startswith("/"):
                img = base_url + img
        price = s["price"]
        
        # Check if campaign is active for this service
        campaign_active = s.get("campaign_active", False)
        campaign_percent = s.get("campaign_percent", 0)
        
        campaign_price = 0
        service_options = []
        
        if campaign_active:
            # Determine discount multiplier
            if campaign_percent and campaign_percent > 0:
                multiplier = (100 - campaign_percent) / 100
            else:
                multiplier = global_multiplier
                campaign_percent = global_campaign_percent
                
            campaign_price = s.get("campaign_price", 0)
            if not campaign_price or campaign_price <= 0:
                campaign_price = round(price * multiplier)
                
            for opt in s.get("options", []):
                opt_price = opt.get("price", 0)
                if opt_price > 0:
                    opt["campaign_price"] = round(opt_price * multiplier)
                else:
                    opt["campaign_price"] = 0
                service_options.append(opt)
        else:
            # Campaign not active
            campaign_price = 0
            campaign_percent = 0
            for opt in s.get("options", []):
                opt["campaign_price"] = 0
                service_options.append(opt)
                
        result.append({
            "id": str(s["_id"]),
            "name": s["name"],
            "description": s.get("description", ""),
            "price": price,
            "campaign_price": campaign_price,
            "campaign_active": campaign_active,
            "campaign_percent": campaign_percent,
            "duration": s.get("duration", 60),
            "image": img,
            "options": service_options,
            "slug": s.get("slug", ""),
            "seo_title": s.get("seo_title", ""),
            "seo_description": s.get("seo_description", "")
        })
    return result

# Create booking (customer)
@api_router.post("/bookings")
async def create_booking(data: BookingCreate, credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=["HS256"])
        customer_id = payload.get("customer_id")
        phone = payload.get("phone")
    except:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    customer = await db.customers.find_one({"_id": ObjectId(customer_id)})
    if not customer:
        raise HTTPException(status_code=404, detail="Musteri bulunamadi")
    
    # Use price from app (cart total), fallback to DB service price
    if data.price and data.price > 0:
        total_price = data.price
    else:
        sid = data.service_id.split(",")[0] if "," in data.service_id else data.service_id
        try:
            service = await db.services.find_one({"_id": ObjectId(sid)})
        except:
            service = None
        total_price = service["price"] if service else 0
    
    # Calculate discount on backend for security
    base_discount = 10  # Default %10
    customer_bookings = await db.bookings.count_documents({"customer_id": customer_id, "status": {"$ne": "cancelled"}})
    if customer_bookings == 0:
        base_discount = 20  # First booking %20
    
    # Check extra discount rights
    extra_discount = 0
    discount_rights = customer.get("discount_rights", [])
    for dr in discount_rights:
        if not dr.get("used", False):
            extra_discount += dr.get("pct", 0)
    
    total_discount_pct = min(base_discount + extra_discount, 30)  # Max %30
    discount_amount = round(total_price * total_discount_pct / 100)
    final_price = total_price - discount_amount
    
    booking_data = {
        "customer_id": customer_id,
        "customer_name": customer.get("name", ""),
        "phone": phone,
        "service_id": data.service_id,
        "service_name": data.service_name,
        "date": data.date,
        "time": data.time,
        "address": data.address,
        "notes": data.notes,
        "total_price": total_price,
        "discount_pct": total_discount_pct,
        "discount_amount": discount_amount,
        "final_price": final_price,
        "status": "pending",
        "created_at": datetime.utcnow().isoformat()
    }
    
    result = await db.bookings.insert_one(booking_data)
    booking_id = str(result.inserted_id)
    
    # Save photos if provided
    if data.photos:
        for i, photo in enumerate(data.photos):
            await db.work_photos.insert_one({
                "booking_id": booking_id,
                "photo_type": "before",
                "photo_base64": photo,
                "created_at": datetime.utcnow().isoformat()
            })
    
    # Create notification for admin
    await db.notifications.insert_one({
        "type": "admin",
        "title": "Yeni Randevu",
        "message": f"{customer.get("name", "")} yeni randevu olusturdu - {data.service_name}",
        "read": False,
        "created_at": datetime.utcnow().isoformat()
    })
    
    
    # Send notification to customer
    await BookingNotifications.send_booking_created(
        customer_name=customer.get("name", ""),
        phone=phone,
        email=customer.get("email"),
        service_name=data.service_name,
        date=data.date,
        time=data.time
    )

    return {"id": booking_id, "message": "Randevu olusturuldu", "status": "pending"}

@api_router.put("/customers/profile")
async def update_customer_profile(credentials: HTTPAuthorizationCredentials = Depends(security), data: dict = {}):
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=["HS256"])
        customer_id = payload.get("customer_id")
    except:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    customer = await db.customers.find_one({"_id": ObjectId(customer_id)})
    if not customer:
        raise HTTPException(status_code=404, detail="Musteri bulunamadi")
    
    update_fields = {}
    if "name" in data and data["name"].strip():
        update_fields["name"] = data["name"].strip()
    if "email" in data:
        update_fields["email"] = data["email"].strip()
    if "address" in data:
        update_fields["address"] = data["address"].strip()
    
    if update_fields:
        await db.customers.update_one({"_id": ObjectId(customer_id)}, {"$set": update_fields})
    
    updated = await db.customers.find_one({"_id": ObjectId(customer_id)})
    return {
        "name": updated.get("name", ""),
        "phone": updated.get("phone", ""),
        "email": updated.get("email", ""),
        "address": updated.get("address", ""),
        "loyalty_points": updated.get("loyalty_points", 0),
        "referral_code": updated.get("referral_code", ""),
        "message": "Profil guncellendi"
    }

# Get customer bookings
@api_router.get("/bookings/my")
async def get_my_bookings(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=["HS256"])
        customer_id = payload.get("customer_id")
    except:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    bookings = await db.bookings.find({"customer_id": customer_id}).sort("created_at", -1).to_list(100)
    
    result = []
    for b in bookings:
        booking_id = str(b["_id"])
        photos = await db.work_photos.find({"booking_id": booking_id}).to_list(10)
        loc = await db.booking_locations.find_one({"booking_id": booking_id})
        
        result.append({
            "id": booking_id,
            "service_name": b["service_name"],
            "date": b["date"],
            "time": b["time"],
            "status": b["status"],
            "total_price": b["total_price"],
            "address": b.get("address", ""),
            "notes": b.get("notes", ""),
            "photos": [{"id": str(p["_id"]), "type": p["photo_type"], "url": p["photo_base64"]} for p in photos],
            "location": {"lat": loc["latitude"], "lng": loc["longitude"], "status": loc["status"]} if loc else None,
            "created_at": b.get("created_at", "")
        })
    
    return result

# Upload photo
@api_router.post("/bookings/photo")
async def upload_booking_photo(data: PhotoUpload, credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=["HS256"])
    except:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    await db.work_photos.insert_one({
        "booking_id": data.booking_id,
        "photo_type": data.photo_type,
        "photo_base64": data.photo_base64,
        "created_at": datetime.utcnow().isoformat()
    })
    
    return {"message": "Fotograf yuklendi"}

# Update location (for tracking)
@api_router.post("/bookings/location")
async def update_booking_location(data: LocationUpdate, credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=["HS256"])
    except:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    await db.booking_locations.update_one(
        {"booking_id": data.booking_id},
        {"$set": {
            "booking_id": data.booking_id,
            "latitude": data.latitude,
            "longitude": data.longitude,
            "status": data.status,
            "updated_at": datetime.utcnow().isoformat()
        }},
        upsert=True
    )
    
    return {"message": "Konum guncellendi"}

# Get booking location
@api_router.get("/bookings/{booking_id}/location")
async def get_booking_location(booking_id: str):
    loc = await db.booking_locations.find_one({"booking_id": booking_id})
    if loc:
        return {
            "latitude": loc["latitude"],
            "longitude": loc["longitude"],
            "status": loc["status"],
            "updated_at": loc.get("updated_at")
        }
    return {"status": "not_started", "latitude": None, "longitude": None}

# Submit review
@api_router.post("/reviews")
async def submit_review(rating: int, comment: str, booking_id: str, credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=["HS256"])
        customer_id = payload.get("customer_id")
    except:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    customer = await db.customers.find_one({"_id": ObjectId(customer_id)})
    booking = await db.bookings.find_one({"_id": ObjectId(booking_id)})
    
    if not customer or not booking:
        raise HTTPException(status_code=404, detail="Bulunamadi")
    
    await db.reviews.insert_one({
        "customer_id": customer_id,
        "customer_name": customer.get("name", ""),
        "booking_id": booking_id,
        "service_name": booking["service_name"],
        "rating": rating,
        "comment": comment,
        "created_at": datetime.utcnow().isoformat()
    })
    
    # Add bonus points for review
    await db.customers.update_one(
        {"_id": ObjectId(customer_id)},
        {"$inc": {"loyalty_points": 10}}
    )
    
    return {"message": "Degerlendirme gonderildi, 10 puan kazandiniz!"}

# Use referral code
@api_router.post("/referral/use")
async def use_referral_code(code: str, credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=["HS256"])
        customer_id = payload.get("customer_id")
    except:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    # Find referrer
    referrer = await db.customers.find_one({"referral_code": code})
    if not referrer:
        raise HTTPException(status_code=404, detail="Gecersiz referans kodu")
    
    if str(referrer["_id"]) == customer_id:
        raise HTTPException(status_code=400, detail="Kendi kodunuzu kullanamazsiniz")
    
    customer = await db.customers.find_one({"_id": ObjectId(customer_id)})
    if customer.get("referred_by"):
        raise HTTPException(status_code=400, detail="Zaten bir referans kodu kullandiniz")
    
    # Get settings
    settings = await db.settings.find_one({"key": "referral_settings"})
    ref_settings = settings.get("value", {}) if settings else {}
    referrer_points = ref_settings.get("referrer_points", 100)
    referee_points = ref_settings.get("referee_points", 50)
    
    # Update both customers
    await db.customers.update_one(
        {"_id": referrer["_id"]},
        {"$inc": {"loyalty_points": referrer_points}}
    )
    await db.customers.update_one(
        {"_id": ObjectId(customer_id)},
        {"$inc": {"loyalty_points": referee_points}, "$set": {"referred_by": code}}
    )
    
    # Record referral
    await db.referrals.insert_one({
        "referrer_id": str(referrer["_id"]),
        "referee_id": customer_id,
        "referee_name": customer.get("name", ""),
        "points_earned": referrer_points,
        "created_at": datetime.utcnow().isoformat()
    })
    
    return {"message": f"Referans kodu kullanildi! {referee_points} puan kazandiniz!"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)

# Admin create booking
class AdminBookingCreate(BaseModel):
    customer_id: str
    service_id: str
    date: str
    time: str
    notes: Optional[str] = ""
    photos: Optional[List[str]] = []

@api_router.post("/admin/bookings")
async def admin_create_booking(data: AdminBookingCreate, _=Depends(verify_token)):
    # Get customer
    customer = await db.customers.find_one({"_id": ObjectId(data.customer_id)})
    if not customer:
        raise HTTPException(status_code=404, detail="Musteri bulunamadi")
    
    # Get service
    service = await db.services.find_one({"_id": ObjectId(data.service_id)})
    if not service:
        raise HTTPException(status_code=404, detail="Hizmet bulunamadi")
    
    booking_data = {
        "customer_id": data.customer_id,
        "customer_name": customer.get("name", ""),
        "phone": customer.get("phone", ""),
        "service_id": data.service_id,
        "service_name": service["name"],
        "date": data.date,
        "time": data.time,
        "notes": data.notes,
        "total_price": service["price"],
        "status": "pending",
        "created_at": datetime.utcnow().isoformat()
    }
    
    result = await db.bookings.insert_one(booking_data)
    booking_id = str(result.inserted_id)
    
    # Save photos if provided
    if data.photos:
        for photo in data.photos:
            await db.work_photos.insert_one({
                "booking_id": booking_id,
                "photo_type": "before",
                "photo_base64": photo,
                "created_at": datetime.utcnow().isoformat()
            })
    
    return {"id": booking_id, "message": "Randevu olusturuldu"}

# Get calendar data
@api_router.get("/admin/calendar")
async def get_calendar_data(_=Depends(verify_token)):
    bookings = await db.bookings.find({}).to_list(1000)
    calendar_data = {}
    
    for booking in bookings:
        date = booking.get("date", "")
        if date:
            if date not in calendar_data:
                calendar_data[date] = {"total": 0, "pending": 0, "confirmed": 0, "completed": 0, "cancelled": 0}
            calendar_data[date]["total"] += 1
            status = booking.get("status", "pending")
            if status in calendar_data[date]:
                calendar_data[date][status] += 1
    
    return calendar_data

# =============================================
# PASSWORD RESET ENDPOINTS
# =============================================

@api_router.post("/customers/forgot-password")
async def forgot_password(data: PasswordResetRequest):
    """Şifre sıfırlama kodu gönder"""
    customer = await db.customers.find_one({"phone": data.phone})
    if not customer:
        raise HTTPException(status_code=404, detail="Bu telefon numarasina kayitli kullanici bulunamadi")
    
    # Generate 6 digit code
    code = "".join(random.choices(string.digits, k=6))
    
    # Store code in database with expiry (10 minutes)
    await db.password_resets.delete_many({"phone": data.phone})  # Remove old codes
    await db.password_resets.insert_one({
        "phone": data.phone,
        "code": code,
        "created_at": datetime.utcnow(),
        "expires_at": datetime.utcnow() + timedelta(minutes=10)
    })
    
    # Send code via SMS and Email
    await PasswordResetNotifications.send_reset_code(
        phone=data.phone,
        email=customer.get("email"),
        code=code
    )
    
    return {"message": "Sifirlama kodu gonderildi", "phone": data.phone}

@api_router.post("/customers/reset-password")
async def reset_password(data: PasswordResetVerify):
    """Şifre sıfırlama kodunu doğrula ve şifreyi değiştir"""
    # Find reset code
    reset_record = await db.password_resets.find_one({
        "phone": data.phone,
        "code": data.code
    })
    
    if not reset_record:
        raise HTTPException(status_code=400, detail="Gecersiz kod")
    
    # Check if expired
    if datetime.utcnow() > reset_record["expires_at"]:
        await db.password_resets.delete_one({"_id": reset_record["_id"]})
        raise HTTPException(status_code=400, detail="Kodun suresi dolmus, yeni kod talep edin")
    
    # Validate new password
    if len(data.new_password) < 6:
        raise HTTPException(status_code=400, detail="Sifre en az 6 karakter olmali")
    
    # Update password
    hashed = bcrypt.hashpw(data.new_password.encode(), bcrypt.gensalt())
    await db.customers.update_one(
        {"phone": data.phone},
        {"$set": {"password": hashed.decode()}}
    )
    
    # Delete used code
    await db.password_resets.delete_one({"_id": reset_record["_id"]})
    
    return {"message": "Sifreniz basariyla degistirildi"}
# =============================================
# WEBSITE CONTENT MANAGEMENT
# =============================================

@api_router.get("/admin/website-content")
async def get_website_content(_=Depends(verify_token)):
    """Web sitesi icerigini getir"""
    content = await db.website_content.find_one({"type": "main"})
    if content:
        content.pop("_id", None)
        content.pop("type", None)
    return content or {}

@api_router.post("/admin/website-content")
async def save_website_content(content: dict, _=Depends(verify_token)):
    """Web sitesi icerigini kaydet"""
    content["type"] = "main"
    content["updated_at"] = datetime.utcnow()
    
    await db.website_content.update_one(
        {"type": "main"},
        {"$set": content},
        upsert=True
    )
    return {"message": "Icerik kaydedildi"}

@api_router.post("/admin/upload")
async def upload_file(file: UploadFile = File(...), _=Depends(verify_token)):
    """Medya dosyasini ImgBB'ye veya sunucuya/MongoDB'ye yukle"""
    imgbb_api_key = os.environ.get("IMGBB_API_KEY")
    
    # Generate unique filename
    ext = os.path.splitext(file.filename)[1]
    filename = f"{uuid.uuid4()}{ext}"
    
    # Read file content once
    try:
        contents = await file.read()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Dosya okunamadi: {str(e)}")
        
    is_image = (file.content_type or "").startswith("image/") or filename.lower().endswith(('.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp', '.svg'))
    
    # Upload images to ImgBB if key is present
    if imgbb_api_key and is_image:
        try:
            import base64
            import urllib.request
            import urllib.parse
            import json
            
            b64_image = base64.b64encode(contents)
            url = "https://api.imgbb.com/1/upload"
            payload = {
                "key": imgbb_api_key,
                "image": b64_image
            }
            data = urllib.parse.urlencode(payload).encode("utf-8")
            
            req = urllib.request.Request(url, data=data, method="POST")
            with urllib.request.urlopen(req, timeout=15) as response:
                resp_data = json.loads(response.read().decode("utf-8"))
                
            if resp_data.get("success") and "data" in resp_data:
                img_url = resp_data["data"]["url"]
                return {"url": img_url}
            else:
                raise Exception(f"ImgBB upload unsuccessful: {resp_data}")
        except Exception as e:
            print(f"ImgBB upload failed, falling back to MongoDB/Local storage: {str(e)}")
            
    # Fallback logic: Store file in MongoDB Atlas and local disk
    try:
        if len(contents) > 15 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="Dosya boyutu cok buyuk (Maksimum 15MB)")
            
        # Save to DB
        await db.stored_files.update_one(
            {"filename": filename},
            {
                "$set": {
                    "filename": filename,
                    "content_type": file.content_type,
                    "data": contents,
                    "created_at": datetime.utcnow()
                }
            },
            upsert=True
        )
        
        # Save locally
        prod_static = "/var/www/titan360/static"
        if os.path.exists(prod_static):
            upload_dir = os.path.join(prod_static, "uploads")
        else:
            upload_dir = os.path.join(os.path.dirname(__file__), "static", "uploads")
            
        os.makedirs(upload_dir, exist_ok=True)
        file_path = os.path.join(upload_dir, filename)
        
        with open(file_path, "wb") as buffer:
            buffer.write(contents)
            
        return {"url": f"/static/uploads/{filename}"}
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Beklenmeyen yukleme hatasi: {str(e)}")


@api_router.get("/website-content")
async def get_public_website_content():
    """Public - Web sitesi icerigini getir"""
    content = await db.website_content.find_one({"type": "main"})
    if content:
        content.pop("_id", None)
        content.pop("type", None)
        content.pop("updated_at", None)
    return content or {}


# =============================================
# Mask customer name for privacy
def mask_name(name):
    if not name:
        return "Musteri"
    parts = name.strip().split()
    masked = []
    for part in parts:
        if len(part) > 0:
            masked.append(part[0] + "***")
    return " ".join(masked) if masked else "Musteri"

# MOBILE CALENDAR ENDPOINT
# =============================================
@api_router.get("/calendar/all")
async def get_all_calendar_bookings(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=["HS256"])
    except:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    bookings = await db.bookings.find({}).sort("date", 1).to_list(1000)
    
    result = []
    for b in bookings:
        result.append({
            "id": str(b["_id"]),
            "service_name": b.get("service_name", ""),
            "date": b.get("date", ""),
            "time": b.get("time", ""),
            "status": b.get("status", "pending"),
            "customer_name": mask_name(b.get("customer_name", "")),
        })
    
    return {"bookings": result}

# PUBLIC AVAILABILITY ENDPOINT (No auth required - for customers)
@api_router.get("/availability/public")
async def get_public_availability(year: int, month: int):
    start = f"{year}-{month:02d}-01"
    end = f"{year}-{month:02d}-31"
    docs = await db.availability.find({"date": {"$gte": start, "$lte": end}}).to_list(100)
    
    result = []
    for doc in docs:
        slots = doc.get("time_slots", [])
        available_slots = []
        busy_slots = []
        for slot in slots:
            if isinstance(slot, dict):
                if slot.get("busy", False):
                    busy_slots.append(slot["time"])
                else:
                    available_slots.append(slot["time"])
            else:
                available_slots.append(slot)
        
        result.append({
            "date": doc["date"],
            "available": doc.get("available", False),
            "available_slots": sorted(available_slots),
            "busy_slots": sorted(busy_slots)
        })
    
    return result

# =============================================
# PUAN + INDIRIM SISTEMI
# =============================================

# Admin: Randevu tamamla ve tutar gir
@api_router.post("/admin/bookings/{booking_id}/complete")
async def complete_booking_with_amount(booking_id: str, req: BookingCompleteRequest, _=Depends(verify_token)):
    booking = await db.bookings.find_one({"_id": ObjectId(booking_id)})
    if not booking:
        raise HTTPException(status_code=404, detail="Randevu bulunamadi")
    if booking.get("status") == "completed":
        raise HTTPException(status_code=400, detail="Bu randevu zaten tamamlanmis")
    
    total_amount = req.total_amount
    customer = None
    if booking.get("customer_id"):
        customer = await db.customers.find_one({"_id": ObjectId(booking["customer_id"])})
    
    # Calculate discounts
    base_discount_pct = 10  # Her zaman %10
    extra_discount_pct = 0
    discount_details = []
    
    if customer and req.apply_discounts:
        discount_rights = customer.get("discount_rights", [])
        
        # Check referral discount right
        for dr in discount_rights:
            if dr.get("type") == "referral" and not dr.get("used"):
                extra_discount_pct += 10
                discount_details.append({"type": "referral", "pct": 10})
                break
        
        # Check big job discount right
        for dr in discount_rights:
            if dr.get("type") == "big_job" and not dr.get("used"):
                extra_discount_pct += 10
                discount_details.append({"type": "big_job", "pct": 10})
                break
    
    total_discount_pct = min(base_discount_pct + extra_discount_pct, 30)
    discount_amount = total_amount * total_discount_pct / 100
    
    # Points usage
    points_used = 0
    if customer and req.use_points > 0:
        available_points = customer.get("loyalty_points", 0)
        points_used = min(req.use_points, available_points)
    
    final_amount = total_amount - discount_amount - points_used
    if final_amount < 0:
        final_amount = 0
    
    # Points earned (10% of original amount)
    points_earned = int(total_amount * 0.1)
    
    # Big job bonus check (10.000 TL+)
    new_big_job_bonus = total_amount >= 10000
    
    # Update booking
    completion_data = {
        "status": "completed",
        "total_amount": total_amount,
        "discount_pct": total_discount_pct,
        "discount_amount": round(discount_amount, 2),
        "points_used": points_used,
        "points_earned": points_earned,
        "final_amount": round(final_amount, 2),
        "discount_details": discount_details,
        "completed_at": datetime.utcnow().isoformat()
    }
    await db.bookings.update_one({"_id": ObjectId(booking_id)}, {"$set": completion_data})
    
    if customer:
        customer_id = str(customer["_id"])
        
        # Mark used discount rights as used
        updated_rights = customer.get("discount_rights", [])
        for detail in discount_details:
            for dr in updated_rights:
                if dr.get("type") == detail["type"] and not dr.get("used"):
                    dr["used"] = True
                    dr["used_at"] = datetime.utcnow().isoformat()
                    dr["used_on_booking"] = booking_id
                    break
        
        # Add big job bonus if applicable
        if new_big_job_bonus:
            updated_rights.append({
                "type": "big_job",
                "pct": 10,
                "used": False,
                "earned_at": datetime.utcnow().isoformat(),
                "from_booking": booking_id
            })
        
        # Update customer: add points, subtract used points, update rights
        net_points = points_earned - points_used
        await db.customers.update_one(
            {"_id": customer["_id"]},
            {
                "$inc": {"loyalty_points": net_points, "total_bookings": 1, "total_spent": total_amount},
                "$set": {"discount_rights": updated_rights}
            }
        )
        
        # Record points history
        if points_earned > 0:
            await db.points_history.insert_one({
                "customer_id": customer_id,
                "points": points_earned,
                "type": "earned",
                "reason": f"Randevu tamamlandi - {booking.get('service_name', '')}",
                "booking_id": booking_id,
                "created_at": datetime.utcnow().isoformat()
            })
        if points_used > 0:
            await db.points_history.insert_one({
                "customer_id": customer_id,
                "points": -points_used,
                "type": "used",
                "reason": f"Randevuda kullanildi - {booking.get('service_name', '')}",
                "booking_id": booking_id,
                "created_at": datetime.utcnow().isoformat()
            })
        
        # Check referral: if this is customer's first 1200+ TL booking
        if total_amount >= 1200 and customer.get("referred_by") and customer.get("total_bookings", 0) == 0:
            referrer = await db.customers.find_one({"referral_code": customer["referred_by"]})
            if referrer:
                referrer_rights = referrer.get("discount_rights", [])
                referrer_rights.append({
                    "type": "referral",
                    "pct": 10,
                    "used": False,
                    "earned_at": datetime.utcnow().isoformat(),
                    "from_customer": customer.get("name", "")
                })
                await db.customers.update_one(
                    {"_id": referrer["_id"]},
                    {"$set": {"discount_rights": referrer_rights}}
                )
                await db.referrals.update_one(
                    {"referee_phone": customer["phone"]},
                    {"$set": {"status": "completed", "completed_at": datetime.utcnow().isoformat()}}
                )
    
    return {
        "message": "Randevu tamamlandi",
        "total_amount": total_amount,
        "discount_pct": total_discount_pct,
        "discount_amount": round(discount_amount, 2),
        "points_used": points_used,
        "points_earned": points_earned,
        "final_amount": round(final_amount, 2),
        "big_job_bonus": new_big_job_bonus
    }

# Customer: Get my points and discount info
@api_router.get("/customers/my-points")
async def get_my_points(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=["HS256"])
        customer_id = payload.get("customer_id")
    except:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    customer = await db.customers.find_one({"_id": ObjectId(customer_id)})
    if not customer:
        raise HTTPException(status_code=404, detail="Musteri bulunamadi")
    
    # Get available discount rights
    discount_rights = customer.get("discount_rights", [])
    available_discounts = [dr for dr in discount_rights if not dr.get("used")]
    
    extra_discount = sum(dr.get("pct", 0) for dr in available_discounts)
    
    # Count completed bookings for first-time detection
    total_bookings = await db.bookings.count_documents({"customer_id": str(customer["_id"]), "status": {"$ne": "cancelled"}})
    base_discount = 20 if total_bookings == 0 else 10
    total_discount = min(base_discount + extra_discount, 30)
    
    # Get points history
    history = await db.points_history.find({"customer_id": str(customer["_id"])}).sort("created_at", -1).to_list(50)
    points_history = [{
        "points": h["points"],
        "type": h.get("type", "earned"),
        "reason": h.get("reason", ""),
        "created_at": h.get("created_at", "")
    } for h in history]
    
    # Get referral stats
    referrals = await db.referrals.find({"referrer_id": str(customer["_id"])}).to_list(50)
    
    return {
        "points": customer.get("loyalty_points", 0),
        "total_spent": customer.get("total_spent", 0),
        "total_bookings": customer.get("total_bookings", 0),
        "referral_code": customer.get("referral_code", ""),
        "total_bookings": total_bookings,
        "base_discount": base_discount,
        "extra_discount": extra_discount,
        "total_discount": total_discount,
        "available_discounts": [{
            "type": dr.get("type", ""),
            "pct": dr.get("pct", 0),
            "earned_at": dr.get("earned_at", ""),
            "from_customer": dr.get("from_customer", "")
        } for dr in available_discounts],
        "points_history": points_history,
        "referrals": [{
            "referee_name": r.get("referee_name", ""),
            "status": r.get("status", "pending"),
            "created_at": r.get("created_at", "")
        } for r in referrals]
    }

# Admin: Get customer points detail
@api_router.get("/admin/customers/{customer_id}/points-detail")
async def get_customer_points_detail(customer_id: str, _=Depends(verify_token)):
    customer = await db.customers.find_one({"_id": ObjectId(customer_id)})
    if not customer:
        raise HTTPException(status_code=404, detail="Musteri bulunamadi")
    
    discount_rights = customer.get("discount_rights", [])
    history = await db.points_history.find({"customer_id": customer_id}).sort("created_at", -1).to_list(100)
    referrals = await db.referrals.find({"referrer_id": customer_id}).to_list(50)
    
    return {
        "points": customer.get("loyalty_points", 0),
        "total_spent": customer.get("total_spent", 0),
        "total_bookings": customer.get("total_bookings", 0),
        "referral_code": customer.get("referral_code", ""),
        "discount_rights": discount_rights,
        "points_history": [{
            "points": h["points"],
            "type": h.get("type", "earned"),
            "reason": h.get("reason", ""),
            "created_at": h.get("created_at", "")
        } for h in history],
        "referrals": [{
            "referee_name": r.get("referee_name", ""),
            "referee_phone": r.get("referee_phone", ""),
            "status": r.get("status", "pending"),
            "points_earned": r.get("points_earned", 0),
            "created_at": r.get("created_at", "")
        } for r in referrals]
    }

# Admin: Preview discount calculation before completing
@api_router.post("/admin/bookings/{booking_id}/preview-completion")
async def preview_booking_completion(booking_id: str, req: BookingCompleteRequest, _=Depends(verify_token)):
    booking = await db.bookings.find_one({"_id": ObjectId(booking_id)})
    if not booking:
        raise HTTPException(status_code=404, detail="Randevu bulunamadi")
    
    customer = None
    if booking.get("customer_id"):
        customer = await db.customers.find_one({"_id": ObjectId(booking["customer_id"])})
    
    total_amount = req.total_amount
    base_discount = 10
    extra_discount = 0
    discount_details = []
    
    if customer:
        discount_rights = customer.get("discount_rights", [])
        for dr in discount_rights:
            if dr.get("type") == "referral" and not dr.get("used"):
                extra_discount += 10
                discount_details.append({"type": "Referans indirimi", "pct": 10})
                break
        for dr in discount_rights:
            if dr.get("type") == "big_job" and not dr.get("used"):
                extra_discount += 10
                discount_details.append({"type": "Buyuk is bonusu", "pct": 10})
                break
    
    total_pct = min(base_discount + extra_discount, 30)
    discount_amount = total_amount * total_pct / 100
    available_points = customer.get("loyalty_points", 0) if customer else 0
    points_to_use = min(req.use_points, available_points)
    final_amount = max(total_amount - discount_amount - points_to_use, 0)
    points_earned = int(total_amount * 0.1)
    big_job = total_amount >= 10000
    
    return {
        "total_amount": total_amount,
        "base_discount": base_discount,
        "extra_discount": extra_discount,
        "total_discount_pct": total_pct,
        "discount_amount": round(discount_amount, 2),
        "discount_details": discount_details,
        "available_points": available_points,
        "points_to_use": points_to_use,
        "final_amount": round(final_amount, 2),
        "points_earned": points_earned,
        "big_job_bonus": big_job,
        "customer_name": customer.get("name", "") if customer else ""
    }

# =============================================
# BLOG API ENDPOINTS
# =============================================

class BlogPostCreate(BaseModel):
    title: str
    content: str
    summary: Optional[str] = ""
    image: Optional[str] = ""
    slug: str
    active: bool = True

@api_router.get("/admin/blog")
async def admin_get_blog_posts(_=Depends(verify_token)):
    posts = await db.blog_posts.find().sort("created_at", -1).to_list(1000)
    return [{**serialize_doc(p), "id": str(p["_id"])} for p in posts]

@api_router.post("/admin/blog")
async def admin_create_blog_post(post: BlogPostCreate, _=Depends(verify_token)):
    post_dict = post.dict()
    post_dict["created_at"] = datetime.utcnow().isoformat()
    result = await db.blog_posts.insert_one(post_dict)
    return {"id": str(result.inserted_id), **post_dict}

@api_router.put("/admin/blog/{post_id}")
async def admin_update_blog_post(post_id: str, post: BlogPostCreate, _=Depends(verify_token)):
    post_dict = post.dict()
    post_dict["updated_at"] = datetime.utcnow().isoformat()
    await db.blog_posts.update_one({"_id": ObjectId(post_id)}, {"$set": post_dict})
    return {"message": "Blog yazisi guncellendi"}

@api_router.delete("/admin/blog/{post_id}")
async def admin_delete_blog_post(post_id: str, _=Depends(verify_token)):
    await db.blog_posts.delete_one({"_id": ObjectId(post_id)})
    return {"message": "Blog yazisi silindi"}

@api_router.get("/blog")
async def get_public_blog_posts():
    posts = await db.blog_posts.find({"active": True}).sort("created_at", -1).to_list(1000)
    return [{**serialize_doc(p), "id": str(p["_id"])} for p in posts]

@api_router.get("/blog/{slug}")
async def get_public_blog_post(slug: str):
    post = await db.blog_posts.find_one({"slug": slug, "active": True})
    if not post:
        raise HTTPException(status_code=404, detail="Blog yazisi bulunamadi")
    return {**serialize_doc(post), "id": str(post["_id"])}

# =============================================
# CUSTOMER NOTIFICATIONS API ENDPOINTS
# =============================================

class SendNotificationRequest(BaseModel):
    customer_id: Optional[str] = None
    title: str
    message: str

@api_router.post("/admin/notifications")
async def admin_send_notification(req: SendNotificationRequest, _=Depends(verify_token)):
    notif = {
        "type": "customer",
        "customer_id": req.customer_id,
        "title": req.title,
        "message": req.message,
        "read": False,
        "created_at": datetime.utcnow().isoformat()
    }
    result = await db.notifications.insert_one(notif)
    return {"id": str(result.inserted_id), "message": "Bildirim gonderildi"}

@api_router.get("/notifications/my")
async def get_customer_notifications(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=["HS256"])
        customer_id = payload.get("customer_id")
    except:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    notifs = await db.notifications.find({
        "type": "customer",
        "$or": [{"customer_id": customer_id}, {"customer_id": None}]
    }).sort("created_at", -1).to_list(50)
    
    return [{**serialize_doc(n), "id": str(n["_id"])} for n in notifs]

@api_router.post("/notifications/read")
async def mark_notifications_read(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=["HS256"])
        customer_id = payload.get("customer_id")
    except:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    await db.notifications.update_many(
        {"type": "customer", "$or": [{"customer_id": customer_id}, {"customer_id": None}]},
        {"$set": {"read": True}}
    )
    return {"message": "Bildirimler okundu olarak isaretlendi"}

# =============================================
# FORM SUBMISSIONS (LEADS/CONTACT) API
# =============================================

class SubmissionCreate(BaseModel):
    type: str  # "quote" or "contact"
    name: str
    phone: str
    email: Optional[str] = ""
    service: Optional[str] = ""
    message: Optional[str] = ""

class SubmissionUpdate(BaseModel):
    read: bool

@api_router.post("/submissions/public")
async def create_public_submission(sub: SubmissionCreate):
    sub_dict = sub.dict()
    sub_dict["read"] = False
    sub_dict["created_at"] = datetime.utcnow().isoformat()
    result = await db.submissions.insert_one(sub_dict)
    return {"id": str(result.inserted_id), "message": "Basvuru alindi"}

@api_router.get("/admin/submissions")
async def get_admin_submissions(_=Depends(verify_token)):
    subs = await db.submissions.find().sort("created_at", -1).to_list(1000)
    return [{**serialize_doc(s), "id": str(s["_id"])} for s in subs]

@api_router.put("/admin/submissions/{sub_id}")
async def update_admin_submission(sub_id: str, update: SubmissionUpdate, _=Depends(verify_token)):
    await db.submissions.update_one({"_id": ObjectId(sub_id)}, {"$set": {"read": update.read}})
    return {"message": "Basvuru guncellendi"}

@api_router.delete("/admin/submissions/{sub_id}")
async def delete_admin_submission(sub_id: str, _=Depends(verify_token)):
    await db.submissions.delete_one({"_id": ObjectId(sub_id)})
    return {"message": "Basvuru silindi"}

app.include_router(api_router)

