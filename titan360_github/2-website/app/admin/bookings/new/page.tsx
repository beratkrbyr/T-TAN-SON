"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";

const API_URL = "";

interface Customer {
  _id: string;
  name: string;
  phone: string;
}

interface Service {
  _id: string;
  name: string;
  price: number;
  duration: number;
}

export default function NewBookingPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    customer_id: "",
    service_id: "",
    date: "",
    time: "",
    notes: "",
  });
  
  const [photos, setPhotos] = useState<string[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("admin_token");
      const [customersRes, servicesRes] = await Promise.all([
        fetch(`${API_URL}/api/admin/customers`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/api/admin/services`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      
      if (customersRes.ok) setCustomers(await customersRes.json());
      if (servicesRes.ok) setServices(await servicesRes.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setPhotos((prev) => [...prev, event.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.customer_id || !formData.service_id || !formData.date || !formData.time) {
      alert("Lütfen tüm zorunlu alanları doldurun");
      return;
    }
    
    setSubmitting(true);
    
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`${API_URL}/api/admin/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          photos,
        }),
      });
      
      if (res.ok) {
        alert("Randevu başarıyla oluşturuldu!");
        router.push("/admin/bookings");
      } else {
        const data = await res.json();
        alert(data.detail || "Randevu oluşturulamadı");
      }
    } catch (err) {
      alert("Bir hata oluştu");
    } finally {
      setSubmitting(false);
    }
  };

  const selectedService = services.find((s) => s._id === formData.service_id);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[50vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-sky-200 border-t-sky-600 rounded-full animate-spin"></div>
          <p className="text-slate-500">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6" data-testid="new-booking-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Yeni Randevu</h1>
          <p className="text-slate-500 mt-1 text-sm">Yeni randevu oluşturun</p>
        </div>
        <button onClick={() => router.back()} className="px-4 py-2 bg-white text-slate-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
          Geri
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer Selection */}
        <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm space-y-4">
          <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <svg className="w-5 h-5 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Müşteri Seçin
          </h2>
          <select
            value={formData.customer_id}
            onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
            data-testid="customer-select"
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-slate-800 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none"
            required
          >
            <option value="">Müşteri seçin...</option>
            {customers.map((customer) => (
              <option key={customer._id} value={customer._id}>
                {customer.name} - {customer.phone}
              </option>
            ))}
          </select>
        </div>

        {/* Service Selection */}
        <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm space-y-4">
          <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <svg className="w-5 h-5 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            Hizmet Seçin
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {services.map((service) => (
              <div
                key={service._id}
                onClick={() => setFormData({ ...formData, service_id: service._id })}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  formData.service_id === service._id
                    ? "border-sky-500 bg-sky-50"
                    : "border-gray-200 hover:border-gray-300 bg-white"
                }`}
                data-testid={`service-option-${service._id}`}
              >
                <div className="font-medium text-slate-800">{service.name}</div>
                <div className="text-sm text-slate-500 mt-1">{service.duration} dakika</div>
                <div className="text-lg font-bold text-emerald-600 mt-2">{service.price} TL</div>
              </div>
            ))}
          </div>
        </div>

        {/* Date & Time */}
        <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm space-y-4">
          <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Tarih ve Saat
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-600 text-sm mb-2">Tarih</label>
              <input
                type="text"
                placeholder="GG/AA/YYYY"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                data-testid="booking-date"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-slate-800 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-slate-600 text-sm mb-2">Saat</label>
              <input
                type="text"
                placeholder="SS:DD"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                data-testid="booking-time"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-slate-800 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none"
                required
              />
            </div>
          </div>
        </div>

        {/* Photos */}
        <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm space-y-4">
          <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <svg className="w-5 h-5 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Fotoğraflar (Öncesi)
          </h2>
          
          <input type="file" ref={fileInputRef} onChange={handlePhotoUpload} accept="image/*" multiple className="hidden" />
          
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-sky-400 hover:bg-sky-50/50 transition-all"
          >
            <svg className="w-12 h-12 mx-auto text-slate-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <p className="text-slate-500">Fotoğraf yüklemek için tıklayın</p>
            <p className="text-slate-400 text-sm mt-1">veya sürükleyip bırakın</p>
          </button>
          
          {photos.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              {photos.map((photo, index) => (
                <div key={index} className="relative group">
                  <img src={photo} alt={`Photo ${index + 1}`} className="w-full h-32 object-cover rounded-xl border border-gray-200" />
                  <button
                    type="button"
                    onClick={() => removePhoto(index)}
                    className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Notes */}
        <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm space-y-4">
          <h2 className="text-lg font-semibold text-slate-800">Notlar</h2>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Ek notlar..."
            rows={3}
            data-testid="booking-notes"
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-slate-800 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none resize-none"
          />
        </div>

        {/* Summary & Submit */}
        {selectedService && (
          <div className="bg-sky-50 border border-sky-200 p-6 rounded-2xl">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Özet</h3>
            <div className="space-y-2 text-slate-600">
              <div className="flex justify-between">
                <span>Hizmet:</span>
                <span className="font-medium text-slate-800">{selectedService.name}</span>
              </div>
              <div className="flex justify-between">
                <span>Süre:</span>
                <span>{selectedService.duration} dakika</span>
              </div>
              <div className="flex justify-between text-lg font-bold mt-4 pt-4 border-t border-sky-200">
                <span className="text-slate-800">Toplam:</span>
                <span className="text-emerald-600">{selectedService.price} TL</span>
              </div>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          data-testid="create-booking-btn"
          className="w-full py-4 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
        >
          {submitting ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              Oluşturuluyor...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Randevu Oluştur
            </>
          )}
        </button>
      </form>
    </div>
  );
}
