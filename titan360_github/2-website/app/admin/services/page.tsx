"use client";
import { useEffect, useState } from "react";

const API_URL = "";

interface ServiceOption {
  id: string;
  name: string;
  price: number;
}

interface Service {
  _id?: string;
  id?: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  active: boolean;
  image?: string;
  options?: ServiceOption[];
  slug?: string;
  seo_title?: string;
  seo_description?: string;
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    price: number;
    duration: number;
    active: boolean;
    image: string;
    options: ServiceOption[];
    slug: string;
    seo_title: string;
    seo_description: string;
  }>({ name: "", description: "", price: 0, duration: 60, active: true, image: "", options: [], slug: "", seo_title: "", seo_description: "" });

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`${API_URL}/api/admin/services`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setServices(data.services || data || []);
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

      await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      setShowModal(false);
      setEditingService(null);
      setFormData({ name: "", description: "", price: 0, duration: 60, active: true, image: "", options: [], slug: "", seo_title: "", seo_description: "" });
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
      duration: service.duration || 60,
      active: service.active,
      image: service.image || "",
      options: service.options || [],
      slug: service.slug || "",
      seo_title: service.seo_title || "",
      seo_description: service.seo_description || "",
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

  const [uploadingImage, setUploadingImage] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const token = localStorage.getItem("admin_token");
      const formDataUpload = new FormData();
      formDataUpload.append("file", file);

      const res = await fetch(`/api/admin/upload`, {
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
          <p className="text-slate-500 text-sm mt-1">Hizmet kataloğunuzu yönetin</p>
        </div>
        <button
          onClick={() => {
            setEditingService(null);
            setFormData({ name: "", description: "", price: 0, duration: 60, active: true, image: "", options: [], slug: "", seo_title: "", seo_description: "" });
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map((service) => (
          <div
            key={service._id || service.id}
            className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
            data-testid={`service-card-${service._id || service.id}`}
          >
            {service.image && (
              <div className="h-36 overflow-hidden">
                <img src={service.image} alt={service.name} className="w-full h-full object-cover" />
              </div>
            )}
            <div className="p-5">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="text-lg font-semibold text-slate-800">{service.name}</h3>
                  <p className="text-xl font-bold text-sky-600 mt-1">{service.price} TL</p>
                </div>
                <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-semibold border ${service.active ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-700 border-red-200"}`}>
                  {service.active ? "Aktif" : "Pasif"}
                </span>
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
                  <label className="block text-sm font-medium text-slate-700 mb-1">Başlangıç Fiyat (TL)</label>
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

              {/* Options Section */}
              <div>
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
