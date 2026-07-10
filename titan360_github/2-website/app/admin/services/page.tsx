"use client";
import { useEffect, useState } from "react";

const API_URL = "https://titan-api-gcuw.onrender.com";

interface ServiceOption {
  id: string;
  name: string;
  price: number;
}

interface ServicePackage {
  id: string;
  name: string;
  price: number;
  features: string[];
  is_popular: boolean;
  badge_label?: string;
}

interface Service {
  _id?: string;
  id?: string;
  name: string;
  description: string;
  price: number;
  campaign_price?: number;
  campaign_active?: boolean;
  campaign_percent?: number;
  duration: number;
  active: boolean;
  order?: number;
  image?: string;
  options?: ServiceOption[];
  packages?: ServicePackage[];
  slug?: string;
  seo_title?: string;
  seo_description?: string;
  extras?: ServiceOption[];
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [reordering, setReordering] = useState(false);
  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    price: number;
    campaign_price: number;
    campaign_active: boolean;
    campaign_percent: number;
    duration: number;
    active: boolean;
    image: string;
    options: ServiceOption[];
    packages: ServicePackage[];
    slug: string;
    seo_title: string;
    seo_description: string;
    extras: ServiceOption[];
  }>({ name: "", description: "", price: 0, campaign_price: 0, campaign_active: false, campaign_percent: 0, duration: 60, active: true, image: "", options: [], packages: [], slug: "", seo_title: "", seo_description: "", extras: [] });

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`${API_URL}/api/admin/services?t=${Date.now()}`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json();
        const list = data.services || data || [];
        list.sort((a: Service, b: Service) => (a.order ?? 999) - (b.order ?? 999));
        // Çözüm: packages alanını seo_description'dan çöz
        const parsedData = list.map((s: any) => {
          let pkgs = s.packages || [];
          let cleanSeo = s.seo_description || "";
          if (cleanSeo.includes("|||PACKAGES:")) {
            const parts = cleanSeo.split("|||PACKAGES:");
            cleanSeo = parts[0];
            try { pkgs = JSON.parse(parts[1]); } catch(e) {}
          }
          return { ...s, seo_description: cleanSeo, packages: pkgs };
        });
        setServices(parsedData);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("admin_token");
      const url = editingService
        ? `${API_URL}/api/admin/services/${editingService._id || editingService.id}`
        : `${API_URL}/api/admin/services`;
      const method = editingService ? "PUT" : "POST";

      // Çözüm: packages alanını seo_description içerisine gizle (Backend güncellemesi gelene kadar)
      const payload = { ...formData };
      payload.seo_description = (payload.seo_description || "").split("|||PACKAGES:")[0] + "|||PACKAGES:" + JSON.stringify(payload.packages || []);

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        alert("Hata oluştu: " + (errorData.detail ? JSON.stringify(errorData.detail) : res.statusText));
        return; // İşlemi durdur, modalı kapatma
      }

      setShowModal(false);
      setEditingService(null);
      setFormData({ name: "", description: "", price: 0, campaign_price: 0, campaign_active: false, campaign_percent: 0, duration: 60, active: true, image: "", options: [], packages: [], slug: "", seo_title: "", seo_description: "", extras: [] });
      fetchServices();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      description: service.description,
      price: service.price,
      campaign_price: service.campaign_price || 0,
      campaign_active: !!service.campaign_active,
      campaign_percent: service.campaign_percent || 0,
      duration: service.duration || 60,
      active: service.active,
      image: service.image || "",
      options: service.options || [],
      packages: service.packages || [],
      slug: service.slug || "",
      seo_title: service.seo_title || "",
      seo_description: service.seo_description || "",
      extras: service.extras || [],
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu hizmeti silmek istediğinizden emin misiniz?")) return;
    try {
      const token = localStorage.getItem("admin_token");
      await fetch(`${API_URL}/api/admin/services/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchServices();
    } catch (err) {
      console.error(err);
    }
  };

  // Sıra değiştirme
  const moveService = async (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= services.length) return;

    const newServices = [...services];
    const temp = newServices[index];
    newServices[index] = newServices[newIndex];
    newServices[newIndex] = temp;
    setServices(newServices);

    // API'ye yeni sırayı kaydet
    setReordering(true);
    try {
      const token = localStorage.getItem("admin_token");
      const orderList = newServices.map(s => s._id || s.id).filter(id => id); // filter out undefined
      const res = await fetch(`${API_URL}/api/admin/services-reorder`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ order: orderList }),
      });
      if (!res.ok) {
        const errText = await res.text();
        console.error("Sıra kaydedilemedi:", errText);
        alert("Sıralama güncellenemedi! Hata: " + res.status);
      }
    } catch (err) {
      console.error("Sıra kaydedilemedi:", err);
      alert("Sıralama güncellenemedi! Ağ hatası.");
    } finally {
      setReordering(false);
    }
  };

  const [uploadingImage, setUploadingImage] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const token = localStorage.getItem("admin_token");
      const formDataUpload = new FormData();
      formDataUpload.append("file", file);

      const res = await fetch(`https://titan-api-gcuw.onrender.com/api/admin/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formDataUpload,
      });

      if (res.ok) {
        const data = await res.json();
        setFormData(prev => ({ ...prev, image: data.url }));
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(`Görsel yükleme hatası: ${errData.detail || res.statusText || "Bilinmeyen hata"}`);
      }
    } catch (err) {
      alert("Bağlantı hatası!");
    } finally {
      setUploadingImage(false);
    }
  };

  // --- Package Handlers ---
  const addPackage = () => {
    setFormData({
      ...formData,
      packages: [...(formData.packages || []), { id: Date.now().toString(), name: "", price: 0, features: [], is_popular: false, badge_label: "" }],
    });
  };

  const updatePackage = (id: string, field: string, value: any) => {
    setFormData({
      ...formData,
      packages: (formData.packages || []).map((pkg) => (pkg.id === id ? { ...pkg, [field]: value } : pkg)),
    });
  };

  const removePackage = (id: string) => {
    setFormData({
      ...formData,
      packages: (formData.packages || []).filter((pkg) => pkg.id !== id),
    });
  };

  const addPackageFeature = (pkgId: string, feature: string) => {
    if (!feature.trim()) return;
    setFormData({
      ...formData,
      packages: (formData.packages || []).map((pkg) => 
        pkg.id === pkgId ? { ...pkg, features: [...pkg.features, feature.trim()] } : pkg
      ),
    });
  };

  const removePackageFeature = (pkgId: string, featureIndex: number) => {
    setFormData({
      ...formData,
      packages: (formData.packages || []).map((pkg) => 
        pkg.id === pkgId ? { ...pkg, features: pkg.features.filter((_, i) => i !== featureIndex) } : pkg
      ),
    });
  };
  // -------------------------

  const addOption = () => {
    setFormData({
      ...formData,
      options: [...formData.options, { id: Date.now().toString(), name: "", price: formData.price }],
    });
  };

  const updateOption = (id: string, field: string, value: string | number) => {
    setFormData({
      ...formData,
      options: formData.options.map((opt) => (opt.id === id ? { ...opt, [field]: value } : opt)),
    });
  };

  const removeOption = (id: string) => {
    setFormData({
      ...formData,
      options: formData.options.filter((opt) => opt.id !== id),
    });
  };

  const addExtra = () => {
    setFormData({
      ...formData,
      extras: [...(formData.extras || []), { id: Date.now().toString(), name: "", price: 0 }],
    });
  };

  const updateExtra = (id: string, field: string, value: string | number) => {
    setFormData({
      ...formData,
      extras: (formData.extras || []).map((ext) => (ext.id === id ? { ...ext, [field]: value } : ext)),
    });
  };

  const removeExtra = (id: string) => {
    setFormData({
      ...formData,
      extras: (formData.extras || []).filter((ext) => ext.id !== id),
    });
  };

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
    <div className="space-y-6" data-testid="services-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Hizmetler</h1>
          <p className="text-slate-500 text-sm mt-1">Hizmet kataloğunuzu yönetin. Yukarı/aşağı oklarla sırayı değiştirin.</p>
        </div>
        <button
          onClick={() => {
            setEditingService(null);
            setFormData({ name: "", description: "", price: 0, campaign_price: 0, campaign_active: false, campaign_percent: 0, duration: 60, active: true, image: "", options: [], packages: [], slug: "", seo_title: "", seo_description: "", extras: [] });
            setShowModal(true);
          }}
          data-testid="add-service-btn"
          className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl flex items-center gap-2 shadow-sm transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Yeni Hizmet
        </button>
      </div>

      {reordering && (
        <div className="flex items-center gap-2 px-4 py-2 bg-sky-50 text-sky-700 text-sm rounded-lg border border-sky-200">
          <div className="w-4 h-4 border-2 border-sky-300 border-t-sky-600 rounded-full animate-spin"></div>
          Sıra kaydediliyor...
        </div>
      )}

      <div className="space-y-3">
        {services.map((service, index) => (
          <div
            key={service._id || service.id}
            className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow flex"
            data-testid={`service-card-${service._id || service.id}`}
          >
            {/* Sıra Değiştirme Butonları */}
            <div className="flex flex-col items-center justify-center bg-slate-50 border-r border-gray-200 px-2 gap-1 min-w-[48px]">
              <span className="text-xs font-bold text-slate-400 mb-1">{index + 1}</span>
              <button
                onClick={() => moveService(index, "up")}
                disabled={index === 0 || reordering}
                className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${
                  index === 0 ? "text-slate-200 cursor-not-allowed" : "text-slate-500 hover:bg-sky-100 hover:text-sky-700"
                }`}
                title="Yukarı Taşı"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              </button>
              <button
                onClick={() => moveService(index, "down")}
                disabled={index === services.length - 1 || reordering}
                className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${
                  index === services.length - 1 ? "text-slate-200 cursor-not-allowed" : "text-slate-500 hover:bg-sky-100 hover:text-sky-700"
                }`}
                title="Aşağı Taşı"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>

            {/* Hizmet İçeriği */}
            <div className="flex-1 flex flex-col md:flex-row">
              {service.image && (
                <div className="w-full md:w-36 h-28 md:h-auto overflow-hidden shrink-0">
                  <img src={service.image} alt={service.name} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="flex-1 p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-800">{service.name}</h3>
                    {service.campaign_price && service.campaign_price > 0 ? (
                      <div className="mt-1 flex items-center gap-2">
                        <span className="text-sm line-through text-slate-400">{service.price} TL</span>
                        <span className="text-lg font-bold text-red-600">{service.campaign_price} TL</span>
                      </div>
                    ) : (
                      <p className="text-xl font-bold text-sky-600 mt-1">{service.price} TL</p>
                    )}
                  </div>
                  <div className="flex flex-col gap-1 items-end">
                    <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-semibold border ${service.active ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-700 border-red-200"}`}>
                      {service.active ? "Aktif" : "Pasif"}
                    </span>
                    {service.campaign_active && (
                      <span className="inline-flex px-2 py-0.5 rounded-lg text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                        {service.campaign_percent && service.campaign_percent > 0 ? `-%${service.campaign_percent}` : "Genel Kampanya"}
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-slate-500 text-sm mb-3 line-clamp-2">{service.description}</p>
                
                {service.options && service.options.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs text-slate-400 mb-1">Seçenekler:</p>
                    <div className="flex flex-wrap gap-1">
                      {service.options.map((opt) => (
                        <span key={opt.id} className="px-2 py-0.5 bg-gray-100 text-slate-600 text-xs rounded-lg border border-gray-200">
                          {opt.name}: {opt.price} TL
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-2 border-t border-gray-100">
                  <button
                    onClick={() => handleEdit(service)}
                    className="flex-1 px-3 py-2 bg-gray-50 hover:bg-gray-100 text-slate-700 text-sm rounded-lg border border-gray-200 transition-colors"
                  >
                    Düzenle
                  </button>
                  <button
                    onClick={() => handleDelete(service._id || service.id || "")}
                    className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 text-sm rounded-lg border border-red-200 transition-colors"
                  >
                    Sil
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl" data-testid="service-modal">
            <div className="p-5 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-800">{editingService ? "Hizmeti Düzenle" : "Yeni Hizmet"}</h2>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Arka Plan Resmi</label>
                <div className="relative">
                  {formData.image ? (
                    <div className="relative w-full h-32 rounded-lg overflow-hidden border border-gray-200">
                      <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, image: "" })}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-sky-400 hover:bg-sky-50/50 transition-colors">
                      {uploadingImage ? (
                        <>
                          <div className="w-8 h-8 border-4 border-sky-100 border-t-sky-600 rounded-full animate-spin"></div>
                          <span className="text-sm text-slate-500 mt-2">Yükleniyor...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="text-sm text-slate-500 mt-1">Resim Yükle</span>
                        </>
                      )}
                      <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploadingImage} className="hidden" />
                    </label>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Hizmet Adı</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-slate-800 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">URL Slug (örn: koltuk-yikama)</label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="koltuk-yikama"
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-slate-800 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">SEO Sayfa Başlığı</label>
                <input
                  type="text"
                  value={formData.seo_title}
                  onChange={(e) => setFormData({ ...formData, seo_title: e.target.value })}
                  placeholder="Antalya Koltuk Yıkama | Titan 360"
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-slate-800 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">SEO Sayfa Açıklaması</label>
                <textarea
                  value={formData.seo_description}
                  onChange={(e) => setFormData({ ...formData, seo_description: e.target.value })}
                  placeholder="Antalya'nın en güvenilir koltuk yıkama hizmeti..."
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-slate-800 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none"
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Açıklama</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-slate-800 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Normal Fiyat (TL)</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-slate-800 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Süre (dk)</label>
                  <input
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-slate-800 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none"
                  />
                </div>
              </div>

              <div className="p-4 bg-sky-50/50 rounded-xl border border-sky-100 space-y-3">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="campaign_active"
                    checked={formData.campaign_active}
                    onChange={(e) => setFormData({ ...formData, campaign_active: e.target.checked })}
                    className="w-4 h-4 accent-sky-600 cursor-pointer"
                  />
                  <label htmlFor="campaign_active" className="text-sm font-medium text-slate-700 cursor-pointer select-none">Bu Hizmet İçin Kampanya Aktif</label>
                </div>
                
                {formData.campaign_active && (
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Kampanya Fiyatı (TL)</label>
                      <input
                        type="number"
                        value={formData.campaign_price}
                        onChange={(e) => setFormData({ ...formData, campaign_price: Number(e.target.value) })}
                        placeholder="Boş = Otomatik Hesapla"
                        className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg text-slate-800 text-sm focus:border-sky-500 outline-none"
                      />
                      <p className="text-[9px] text-slate-400 mt-1">Özel bir kampanya fiyatı girmek isterseniz doldurun.</p>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">İndirim Yüzdesi (%)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={formData.campaign_percent}
                        onChange={(e) => setFormData({ ...formData, campaign_percent: Number(e.target.value) })}
                        placeholder="Örn: 25"
                        className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg text-slate-800 text-sm focus:border-sky-500 outline-none"
                      />
                      <p className="text-[9px] text-slate-400 mt-1">Hizmete özel indirim yüzdesi (boş/0 ise genel indirim kullanılır).</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Packages Section */}
              <div className="border-t border-slate-100 pt-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-slate-700">Hizmet Paketleri (Standart, Detaylı vb.)</label>
                  <button type="button" onClick={addPackage} className="px-3 py-1 bg-emerald-50 text-emerald-600 text-xs rounded-lg border border-emerald-200 hover:bg-emerald-100 transition-colors">
                    + Paket Ekle
                  </button>
                </div>
                <p className="text-slate-400 text-xs mb-3">Bu hizmete özel paketler oluşturun. Müşterileriniz paketleri karşılaştırabilir.</p>
                {formData.packages.length === 0 ? (
                  <p className="text-slate-400 text-sm p-3 bg-gray-50 rounded-lg text-center border border-gray-100">Henüz paket eklenmemiş.</p>
                ) : (
                  <div className="space-y-4">
                    {formData.packages.map((pkg, index) => (
                      <div key={pkg.id} className="bg-gray-50 p-4 rounded-xl border border-gray-200 shadow-sm relative">
                        <button type="button" onClick={() => removePackage(pkg.id)} className="absolute top-3 right-3 text-red-400 hover:text-red-600">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                        
                        <div className="grid grid-cols-2 gap-3 mb-3 pr-8">
                          <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1">Paket Adı</label>
                            <input type="text" value={pkg.name} onChange={(e) => updatePackage(pkg.id, "name", e.target.value)} placeholder="Örn: Standart Paket" className="w-full px-2 py-1.5 bg-white border border-gray-300 rounded text-sm focus:border-emerald-500 outline-none" />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1">Fiyat (TL)</label>
                            <input type="number" value={pkg.price} onChange={(e) => updatePackage(pkg.id, "price", Number(e.target.value))} className="w-full px-2 py-1.5 bg-white border border-gray-300 rounded text-sm focus:border-emerald-500 outline-none" />
                          </div>
                        </div>

                        <div className="mb-3 p-3 bg-white border border-gray-200 rounded-lg shadow-sm">
                          <label className="flex items-center gap-2 cursor-pointer mb-3">
                            <input type="checkbox" checked={pkg.is_popular} onChange={(e) => updatePackage(pkg.id, "is_popular", e.target.checked)} className="w-4 h-4 accent-emerald-600" />
                            <span className="text-sm font-medium text-slate-700">En Çok Tercih Edilen Paket (Yeşil Vurgu)</span>
                          </label>
                          <div className="border-t border-gray-100 pt-3">
                            <label className="block text-xs font-semibold text-slate-600 mb-1">Paket Etiketi (Badge)</label>
                            <input 
                              type="text" 
                              value={pkg.badge_label || ""}
                              onChange={(e) => updatePackage(pkg.id, "badge_label", e.target.value)}
                              placeholder="Örn: Fiyat/Performans, Ekonomik, En Kapsamlı..." 
                              className="w-full px-2 py-1.5 bg-white border border-gray-300 rounded text-sm focus:border-emerald-500 outline-none"
                              list={`badge-suggestions-${pkg.id}`}
                            />
                            <datalist id={`badge-suggestions-${pkg.id}`}>
                              <option value="Fiyat/Performans" />
                              <option value="Ekonomik" />
                              <option value="En Kapsamlı" />
                              <option value="Yeni Paket" />
                            </datalist>
                            <p className="text-[10px] text-slate-400 mt-1">Paket üzerinde görünecek vurgu metni.</p>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-600 mb-1">Paket Özellikleri</label>
                          <div className="flex gap-2 mb-2">
                            <input 
                              type="text" 
                              placeholder="Örn: Zemin silme" 
                              className="flex-1 px-2 py-1 bg-white border border-gray-300 rounded text-xs focus:border-emerald-500 outline-none"
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  addPackageFeature(pkg.id, e.currentTarget.value);
                                  e.currentTarget.value = "";
                                }
                              }}
                            />
                            <button type="button" onClick={(e) => {
                                const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                                addPackageFeature(pkg.id, input.value);
                                input.value = "";
                              }} 
                              className="px-2 py-1 bg-emerald-50 text-emerald-700 text-xs rounded border border-emerald-200">
                              Ekle
                            </button>
                          </div>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {pkg.features.map((feature, fIndex) => (
                              <span key={fIndex} className="inline-flex items-center gap-1 px-2 py-0.5 bg-white border border-gray-200 text-xs text-slate-600 rounded">
                                {feature}
                                <button type="button" onClick={() => removePackageFeature(pkg.id, fIndex)} className="text-red-400 hover:text-red-600 ml-1">×</button>
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Options Section */}
              <div className="border-t border-slate-100 pt-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-slate-700">Fiyat Seçenekleri</label>
                  <button type="button" onClick={addOption} className="px-3 py-1 bg-sky-50 text-sky-600 text-xs rounded-lg border border-sky-200 hover:bg-sky-100 transition-colors">
                    + Seçenek Ekle
                  </button>
                </div>
                <p className="text-slate-400 text-xs mb-2">Örnek: 1+1 = 400 TL, 2+1 = 500 TL, 3+1 = 600 TL</p>
                {formData.options.length === 0 ? (
                  <p className="text-slate-400 text-sm p-3 bg-gray-50 rounded-lg text-center border border-gray-100">Seçenek eklenmemiş. Seçenek eklerseniz müşteriler seçim yapabilir.</p>
                ) : (
                  <div className="space-y-2">
                    {formData.options.map((opt, index) => (
                      <div key={opt.id} className="flex gap-2 items-center bg-gray-50 p-2 rounded-lg border border-gray-100">
                        <span className="text-slate-400 text-sm w-6">{index + 1}.</span>
                        <input
                          type="text"
                          value={opt.name}
                          onChange={(e) => updateOption(opt.id, "name", e.target.value)}
                          placeholder="Seçenek (örn: 2+1)"
                          className="flex-1 px-2 py-1.5 bg-white border border-gray-300 rounded text-slate-800 text-sm focus:border-sky-500 outline-none"
                        />
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            value={opt.price}
                            onChange={(e) => updateOption(opt.id, "price", Number(e.target.value))}
                            placeholder="Fiyat"
                            className="w-20 px-2 py-1.5 bg-white border border-gray-300 rounded text-slate-800 text-sm text-right focus:border-sky-500 outline-none"
                          />
                          <span className="text-slate-500 text-sm">TL</span>
                        </div>
                        <button type="button" onClick={() => removeOption(opt.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Extras Section */}
              <div className="border-t border-slate-100 pt-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-slate-700">Ekstra Hizmetler (Ekstralar)</label>
                  <button type="button" onClick={addExtra} className="px-3 py-1 bg-amber-50 text-amber-700 text-xs rounded-lg border border-amber-200 hover:bg-amber-100 transition-colors">
                    + Ekstra Ekle
                  </button>
                </div>
                <p className="text-slate-400 text-xs mb-2">Örnek: Minder Temizliği = 50 TL, Ekstra Yastık = 80 TL</p>
                {(!formData.extras || formData.extras.length === 0) ? (
                  <p className="text-slate-400 text-sm p-3 bg-gray-50 rounded-lg text-center border border-gray-100">Ekstra seçeneği eklenmemiş.</p>
                ) : (
                  <div className="space-y-2">
                    {formData.extras.map((ext, index) => (
                      <div key={ext.id} className="flex gap-2 items-center bg-gray-50 p-2 rounded-lg border border-gray-100">
                        <span className="text-slate-400 text-sm w-6">{index + 1}.</span>
                        <input
                          type="text"
                          value={ext.name}
                          onChange={(e) => updateExtra(ext.id, "name", e.target.value)}
                          placeholder="Ekstra Adı (örn: Yastık Yıkama)"
                          className="flex-1 px-2 py-1.5 bg-white border border-gray-300 rounded text-slate-800 text-sm focus:border-sky-500 outline-none"
                        />
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            value={ext.price}
                            onChange={(e) => updateExtra(ext.id, "price", Number(e.target.value))}
                            placeholder="Fiyat"
                            className="w-20 px-2 py-1.5 bg-white border border-gray-300 rounded text-slate-800 text-sm text-right focus:border-sky-500 outline-none"
                          />
                          <span className="text-slate-500 text-sm">TL</span>
                        </div>
                        <button type="button" onClick={() => removeExtra(ext.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="active"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="w-4 h-4 accent-sky-600"
                />
                <label htmlFor="active" className="text-sm text-slate-700">Aktif</label>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-slate-700 rounded-lg transition-colors">
                  İptal
                </button>
                <button type="submit" className="flex-1 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg transition-colors">
                  Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
