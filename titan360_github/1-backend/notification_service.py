"""
Bildirim Servisi - SMS ve E-posta
Mock olarak kuruldu. Gerçek API anahtarları eklendiğinde aktif edilecek.
"""
import os
import logging
from typing import Optional
from datetime import datetime

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configuration - Set these environment variables to activate
SMS_PROVIDER = os.environ.get("SMS_PROVIDER", "mock")  # "twilio", "netgsm", or "mock"
EMAIL_PROVIDER = os.environ.get("EMAIL_PROVIDER", "mock")  # "sendgrid", "gmail", or "mock"

# Twilio Config
TWILIO_ACCOUNT_SID = os.environ.get("TWILIO_ACCOUNT_SID", "")
TWILIO_AUTH_TOKEN = os.environ.get("TWILIO_AUTH_TOKEN", "")
TWILIO_PHONE_NUMBER = os.environ.get("TWILIO_PHONE_NUMBER", "")

# Netgsm Config
NETGSM_USERNAME = os.environ.get("NETGSM_USERNAME", "")
NETGSM_PASSWORD = os.environ.get("NETGSM_PASSWORD", "")
NETGSM_HEADER = os.environ.get("NETGSM_HEADER", "TITAN360")

# SendGrid Config
SENDGRID_API_KEY = os.environ.get("SENDGRID_API_KEY", "")
SENDGRID_FROM_EMAIL = os.environ.get("SENDGRID_FROM_EMAIL", "info@titan360.com.tr")

# Gmail Config
GMAIL_EMAIL = os.environ.get("GMAIL_EMAIL", "")
GMAIL_APP_PASSWORD = os.environ.get("GMAIL_APP_PASSWORD", "")


class NotificationService:
    """Bildirim servisi - SMS ve E-posta gönderimi"""
    
    @staticmethod
    async def send_sms(phone: str, message: str) -> dict:
        """SMS gönder"""
        # Normalize phone number
        phone = phone.replace(" ", "").replace("-", "")
        if not phone.startswith("+90"):
            if phone.startswith("0"):
                phone = "+90" + phone[1:]
            else:
                phone = "+90" + phone
        
        if SMS_PROVIDER == "twilio" and TWILIO_ACCOUNT_SID:
            return await NotificationService._send_twilio_sms(phone, message)
        elif SMS_PROVIDER == "netgsm" and NETGSM_USERNAME:
            return await NotificationService._send_netgsm_sms(phone, message)
        else:
            # Mock SMS - just log it
            logger.info(f"[MOCK SMS] To: {phone} | Message: {message}")
            return {"success": True, "provider": "mock", "message": "SMS mock olarak gonderildi"}
    
    @staticmethod
    async def _send_twilio_sms(phone: str, message: str) -> dict:
        """Twilio ile SMS gönder"""
        try:
            from twilio.rest import Client
            client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
            msg = client.messages.create(
                body=message,
                from_=TWILIO_PHONE_NUMBER,
                to=phone
            )
            logger.info(f"[TWILIO SMS] Sent to {phone}, SID: {msg.sid}")
            return {"success": True, "provider": "twilio", "sid": msg.sid}
        except Exception as e:
            logger.error(f"[TWILIO SMS ERROR] {str(e)}")
            return {"success": False, "provider": "twilio", "error": str(e)}
    
    @staticmethod
    async def _send_netgsm_sms(phone: str, message: str) -> dict:
        """Netgsm ile SMS gönder"""
        try:
            import httpx
            # Netgsm API
            url = "https://api.netgsm.com.tr/sms/send/get"
            params = {
                "usercode": NETGSM_USERNAME,
                "password": NETGSM_PASSWORD,
                "gsmno": phone.replace("+", ""),
                "message": message,
                "msgheader": NETGSM_HEADER
            }
            async with httpx.AsyncClient() as client:
                response = await client.get(url, params=params)
                logger.info(f"[NETGSM SMS] Sent to {phone}, Response: {response.text}")
                return {"success": True, "provider": "netgsm", "response": response.text}
        except Exception as e:
            logger.error(f"[NETGSM SMS ERROR] {str(e)}")
            return {"success": False, "provider": "netgsm", "error": str(e)}
    
    @staticmethod
    async def send_email(to_email: str, subject: str, body: str, html_body: Optional[str] = None) -> dict:
        """E-posta gönder"""
        if not to_email:
            return {"success": False, "error": "E-posta adresi bos"}
        
        if EMAIL_PROVIDER == "sendgrid" and SENDGRID_API_KEY:
            return await NotificationService._send_sendgrid_email(to_email, subject, body, html_body)
        elif EMAIL_PROVIDER == "gmail" and GMAIL_EMAIL:
            return await NotificationService._send_gmail_email(to_email, subject, body, html_body)
        else:
            # Mock Email - just log it
            logger.info(f"[MOCK EMAIL] To: {to_email} | Subject: {subject} | Body: {body[:100]}...")
            return {"success": True, "provider": "mock", "message": "E-posta mock olarak gonderildi"}
    
    @staticmethod
    async def _send_sendgrid_email(to_email: str, subject: str, body: str, html_body: Optional[str] = None) -> dict:
        """SendGrid ile e-posta gönder"""
        try:
            from sendgrid import SendGridAPIClient
            from sendgrid.helpers.mail import Mail
            
            message = Mail(
                from_email=SENDGRID_FROM_EMAIL,
                to_emails=to_email,
                subject=subject,
                plain_text_content=body,
                html_content=html_body or body
            )
            sg = SendGridAPIClient(SENDGRID_API_KEY)
            response = sg.send(message)
            logger.info(f"[SENDGRID EMAIL] Sent to {to_email}, Status: {response.status_code}")
            return {"success": True, "provider": "sendgrid", "status": response.status_code}
        except Exception as e:
            logger.error(f"[SENDGRID EMAIL ERROR] {str(e)}")
            return {"success": False, "provider": "sendgrid", "error": str(e)}
    
    @staticmethod
    async def _send_gmail_email(to_email: str, subject: str, body: str, html_body: Optional[str] = None) -> dict:
        """Gmail SMTP ile e-posta gönder"""
        try:
            import smtplib
            from email.mime.text import MIMEText
            from email.mime.multipart import MIMEMultipart
            
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = GMAIL_EMAIL
            msg["To"] = to_email
            
            msg.attach(MIMEText(body, "plain"))
            if html_body:
                msg.attach(MIMEText(html_body, "html"))
            
            with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
                server.login(GMAIL_EMAIL, GMAIL_APP_PASSWORD)
                server.sendmail(GMAIL_EMAIL, to_email, msg.as_string())
            
            logger.info(f"[GMAIL EMAIL] Sent to {to_email}")
            return {"success": True, "provider": "gmail"}
        except Exception as e:
            logger.error(f"[GMAIL EMAIL ERROR] {str(e)}")
            return {"success": False, "provider": "gmail", "error": str(e)}


class BookingNotifications:
    """Randevu bildirimleri"""
    
    @staticmethod
    async def send_booking_created(customer_name: str, phone: str, email: Optional[str], 
                                   service_name: str, date: str, time: str):
        """Yeni randevu oluşturulduğunda bildirim"""
        sms_message = f"""TITAN 360
Sayin {customer_name},
Randevunuz olusturuldu.
Hizmet: {service_name}
Tarih: {date}
Saat: {time}
Onay bekleniyor."""
        
        email_subject = "Randevunuz Oluşturuldu - TITAN 360"
        email_body = f"""
Sayın {customer_name},

Randevunuz başarıyla oluşturuldu ve onay bekliyor.

Hizmet: {service_name}
Tarih: {date}
Saat: {time}

Randevunuz onaylandığında size bilgi verilecektir.

Bizi tercih ettiğiniz için teşekkür ederiz.

TITAN 360
Profesyonel Temizlik Hizmetleri
"""
        
        # Send notifications
        await NotificationService.send_sms(phone, sms_message)
        if email:
            await NotificationService.send_email(email, email_subject, email_body)
    
    @staticmethod
    async def send_booking_confirmed(customer_name: str, phone: str, email: Optional[str],
                                     service_name: str, date: str, time: str):
        """Randevu onaylandığında bildirim"""
        sms_message = f"""TITAN 360
Sayin {customer_name},
Randevunuz ONAYLANDI!
Hizmet: {service_name}
Tarih: {date}
Saat: {time}
Sizi bekliyoruz!"""
        
        email_subject = "Randevunuz Onaylandı - TITAN 360"
        email_body = f"""
Sayın {customer_name},

Randevunuz onaylanmıştır.

Hizmet: {service_name}
Tarih: {date}
Saat: {time}

Belirtilen tarih ve saatte sizinle görüşmek üzere!

TITAN 360
Profesyonel Temizlik Hizmetleri
"""
        
        await NotificationService.send_sms(phone, sms_message)
        if email:
            await NotificationService.send_email(email, email_subject, email_body)
    
    @staticmethod
    async def send_booking_cancelled(customer_name: str, phone: str, email: Optional[str],
                                     service_name: str, date: str, time: str):
        """Randevu iptal edildiğinde bildirim"""
        sms_message = f"""TITAN 360
Sayin {customer_name},
Randevunuz iptal edildi.
Hizmet: {service_name}
Tarih: {date}
Yeni randevu icin bizi arayin."""
        
        email_subject = "Randevunuz İptal Edildi - TITAN 360"
        email_body = f"""
Sayın {customer_name},

Aşağıdaki randevunuz iptal edilmiştir.

Hizmet: {service_name}
Tarih: {date}
Saat: {time}

Yeni bir randevu oluşturmak için uygulamamızı kullanabilir veya bizi arayabilirsiniz.

TITAN 360
Profesyonel Temizlik Hizmetleri
"""
        
        await NotificationService.send_sms(phone, sms_message)
        if email:
            await NotificationService.send_email(email, email_subject, email_body)
    
    @staticmethod
    async def send_booking_reminder(customer_name: str, phone: str, email: Optional[str],
                                    service_name: str, date: str, time: str):
        """Randevu hatırlatması (1 gün önce)"""
        sms_message = f"""TITAN 360
Sayin {customer_name},
HATIRLATMA: Yarin randevunuz var!
Hizmet: {service_name}
Tarih: {date}
Saat: {time}"""
        
        email_subject = "Randevu Hatırlatması - TITAN 360"
        email_body = f"""
Sayın {customer_name},

Yarın için bir randevunuz bulunmaktadır.

Hizmet: {service_name}
Tarih: {date}
Saat: {time}

Sizi bekliyoruz!

TITAN 360
Profesyonel Temizlik Hizmetleri
"""
        
        await NotificationService.send_sms(phone, sms_message)
        if email:
            await NotificationService.send_email(email, email_subject, email_body)
    
    @staticmethod
    async def send_booking_completed(customer_name: str, phone: str, email: Optional[str],
                                     service_name: str):
        """Randevu tamamlandığında bildirim"""
        sms_message = f"""TITAN 360
Sayin {customer_name},
Hizmetiniz tamamlandi!
Bizi degerlendirmeyi unutmayin.
10 puan kazanin!"""
        
        email_subject = "Hizmetiniz Tamamlandı - TITAN 360"
        email_body = f"""
Sayın {customer_name},

{service_name} hizmetiniz başarıyla tamamlanmıştır.

Bizi değerlendirerek 10 puan kazanabilirsiniz!

Bizi tercih ettiğiniz için teşekkür ederiz.

TITAN 360
Profesyonel Temizlik Hizmetleri
"""
        
        await NotificationService.send_sms(phone, sms_message)
        if email:
            await NotificationService.send_email(email, email_subject, email_body)


class PasswordResetNotifications:
    """Şifre sıfırlama bildirimleri"""
    
    @staticmethod
    async def send_reset_code(phone: str, email: Optional[str], code: str):
        """Şifre sıfırlama kodu gönder"""
        sms_message = f"""TITAN 360
Sifre sifirlama kodunuz: {code}
Bu kod 10 dakika gecerlidir.
Kodu kimseyle paylasmayın."""
        
        email_subject = "Şifre Sıfırlama Kodu - TITAN 360"
        email_body = f"""
Şifre sıfırlama talebiniz alındı.

Sıfırlama Kodunuz: {code}

Bu kod 10 dakika geçerlidir.
Kodu kimseyle paylaşmayın.

Bu talebi siz yapmadıysanız, bu e-postayı görmezden gelebilirsiniz.

TITAN 360
"""
        
        await NotificationService.send_sms(phone, sms_message)
        if email:
            await NotificationService.send_email(email, email_subject, email_body)
