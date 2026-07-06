"use client";
import { useEffect, useState } from "react";

const API_URL = "";

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
  is_popular?: boolean;
  optional_addons?: string[];
}

interface Service {
  _id?: string;
  id?: string;
  name: string;
  extras: ServiceOption[];
  packages: ServicePackage[];
}

export default function PackagesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const fetchServices = async () => {
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`${API_URL}/api/admin/services`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setServices(data);
      if (data.length > 0 && !selectedService) {
        setSelectedService(data[0]);
      } else if (selectedService) {
        const updated = data.find((s: Service) => s.id === selectedService.id);
        if (updated) setSelectedService(updated);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleSave = async () => {
    if (!selectedService) return;
    setIsSaving(true);
    try {
      const token = localStorage.getItem("admin_token");
      
      // Orijinal service nesnesini bul
      const serviceToUpdate = services.find(s => s.id === selectedService.id);
      if(!serviceToUpdate) return;
      
      // Backend'in kabul etmediği id/_id alanlarını çıkar
      const { id, _id, ...cleanService } = serviceToUpdate as any;
      
      const updatedService = {
        ...cleanService,
        packages: selectedService.packages || [],
        extras: selectedService.extras || []
      };

      const res = await fetch(`${API_URL}/api/admin/services/${selectedService.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedService),
      });

      if (!res.ok) {
        const errText = await res.text();
        console.error("API Hatası:", res.status, errText);
        alert("Kaydetme hatası: " + res.status + " - " + errText);
        return;
      }

      alert("Paketler ve Ekstralar başarıyla kaydedildi!");
      fetchServices();
    } catch (err) {
      console.error(err);
      alert("Kaydedilirken bir hata oluştu: " + (err as Error).message);
    } finally {
      setIsSaving(false);
    }
  };

  const addPackage = () => {
    if (!selectedService) return;
    setSelectedService({
      ...selectedService,
      packages: [...(selectedService.packages || []), { id: Date.now().toString(), name: "", price: 0, features: [], optional_addons: [], is_popular: false }],
    });
  };

  const updatePackage = (pkgId: string, field: string, value: any) => {
    if (!selectedService) return;
    setSelectedService({
      ...selectedService,
      packages: (selectedService.packages || []).map(p => p.id === pkgId ? { ...p, [field]: value } : p)
    });
  };

  const removePackage = (pkgId: string) => {
    if (!selectedService) return;
    setSelectedService({
      ...selectedService,
      packages: (selectedService.packages || []).filter(p => p.id !== pkgId)
    });
  };

  const addExtra = () => {
    if (!selectedService) return;
    setSelectedService({
      ...selectedService,
      extras: [...(selectedService.extras || []), { id: Date.now().toString(), name: "", price: 0 }],
    });
  };

  const updateExtra = (extId: string, field: string, value: any) => {
    if (!selectedService) return;
    setSelectedService({
      ...selectedService,
      extras: (selectedService.extras || []).map(e => e.id === extId ? { ...e, [field]: value } : e)
    });
  };

  const removeExtra = (extId: string) => {
    if (!selectedService) return;
    setSelectedService({
      ...selectedService,
      extras: (selectedService.extras || []).filter(e => e.id !== extId)
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Hizmet ve Paket Yönetimi</h1>
          <p className="text-slate-500 text-sm mt-1">Hizmetlerinize özel fiyatlandırma paketlerini ve ek hizmetleri yönetin.</p>
        </div>
        {selectedService && (
          <button 
            onClick={handleSave} 
            disabled={isSaving}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2"
          >
            {isSaving ? (
              <><i className="fas fa-spinner fa-spin"></i> Kaydediliyor...</>
            ) : (
              <><i className="fas fa-save"></i> Değişiklikleri Kaydet</>
            )}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Hizmet Seçimi Sidebar */}
        <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col h-fit">
          <div className="p-4 bg-slate-50 border-b border-slate-200 font-semibold text-slate-700">
            Hizmet Seçin
          </div>
          <div className="flex-1 overflow-y-auto max-h-[600px]">
            {services.map(service => (
              <button
                key={service.id}
                onClick={() => setSelectedService(service)}
                className={`w-full text-left px-4 py-3 border-b border-slate-100 transition-colors ${selectedService?.id === service.id ? 'bg-emerald-50 border-l-4 border-l-emerald-500 text-emerald-800 font-medium' : 'hover:bg-slate-50 text-slate-600'}`}
              >
                {service.name}
              </button>
            ))}
            {services.length === 0 && (
              <div className="p-4 text-sm text-slate-500 text-center">Henüz hizmet bulunmuyor. Önce hizmet ekleyin.</div>
            )}
          </div>
        </div>

        {/* Paket ve Ekstra Yönetimi */}
        {selectedService && (
          <div className="lg:col-span-3 space-y-6">
            
            {/* Ekstralar (Opsiyonel Ek Hizmetler) */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-800">Opsiyonel Ek Hizmetler</h3>
                  <p className="text-xs text-slate-500">Müşterilerin pakete ek olarak satın alabileceği hizmetler.</p>
                </div>
                <button onClick={addExtra} className="px-4 py-2 bg-sky-50 text-sky-700 text-sm font-medium rounded-lg hover:bg-sky-100 transition-colors flex items-center gap-2">
                  <i className="fas fa-plus"></i> Ekstra Ekle
                </button>
              </div>

              {(!selectedService.extras || selectedService.extras.length === 0) ? (
                <div className="text-center py-8 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <i className="fas fa-box-open text-3xl mb-2"></i>
                  <p>Henüz ek hizmet tanımlanmamış.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedService.extras.map((ext) => (
                    <div key={ext.id} className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <div className="flex-1 space-y-2">
                        <input
                          type="text"
                          value={ext.name}
                          onChange={(e) => updateExtra(ext.id, "name", e.target.value)}
                          placeholder="Hizmet Adı (Örn: İnşaat Sonrası)"
                          className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded focus:border-emerald-500 outline-none text-sm"
                        />
                        <input
                          type="number"
                          value={ext.price}
                          onChange={(e) => updateExtra(ext.id, "price", Number(e.target.value))}
                          placeholder="Fiyat (TL)"
                          className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded focus:border-emerald-500 outline-none text-sm"
                        />
                      </div>
                      <button onClick={() => removeExtra(ext.id)} className="w-8 h-8 flex items-center justify-center bg-red-100 text-red-600 rounded-lg hover:bg-red-200 shrink-0">
                        <i className="fas fa-trash-alt text-xs"></i>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Paketler */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-800">Paketler</h3>
                  <p className="text-xs text-slate-500">Müşterilere sunulacak standart, VIP vb. paketleri buradan oluşturun.</p>
                </div>
                <button onClick={addPackage} className="px-4 py-2 bg-emerald-50 text-emerald-700 text-sm font-medium rounded-lg hover:bg-emerald-100 transition-colors flex items-center gap-2">
                  <i className="fas fa-plus"></i> Paket Ekle
                </button>
              </div>

              {(!selectedService.packages || selectedService.packages.length === 0) ? (
                <div className="text-center py-10 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <i className="fas fa-layer-group text-4xl mb-3"></i>
                  <p>Bu hizmet için henüz paket tanımlanmamış.</p>
                  <p className="text-sm mt-1">Hemen sağ üstten yeni bir paket ekleyerek başlayın.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedService.packages.map((pkg) => (
                    <div key={pkg.id} className="border border-slate-200 rounded-xl p-5 bg-slate-50 relative group">
                      <button 
                        onClick={() => removePackage(pkg.id)} 
                        className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                        title="Paketi Sil"
                      >
                        <i className="fas fa-trash-alt text-sm"></i>
                      </button>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 pr-10">
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 mb-1">Paket Adı</label>
                          <input
                            type="text"
                            value={pkg.name}
                            onChange={(e) => updatePackage(pkg.id, "name", e.target.value)}
                            placeholder="Örn: VIP Paket"
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:border-emerald-500 outline-none text-sm font-medium text-slate-800"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 mb-1">Fiyat (TL)</label>
                          <input
                            type="number"
                            value={pkg.price}
                            onChange={(e) => updatePackage(pkg.id, "price", Number(e.target.value))}
                            placeholder="Örn: 1500"
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:border-emerald-500 outline-none text-sm text-slate-800 font-bold"
                          />
                        </div>
                      </div>

                      <div className="mb-4">
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Özellikler (Virgülle Ayırın)</label>
                        <textarea
                          value={pkg.features.join(", ")}
                          onChange={(e) => {
                            const features = e.target.value.split(',').map(f => f.trim()).filter(f => f);
                            updatePackage(pkg.id, "features", features);
                          }}
                          placeholder="Toz alma, Zemin silme, Cam temizliği..."
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:border-emerald-500 outline-none text-sm text-slate-700"
                          rows={2}
                        />
                        <p className="text-[11px] text-slate-500 mt-1">Örn: "Mutfak Temizliği, Banyo Temizliği" şeklinde yazarsanız, akıllı sistem otomatik ikon atayacaktır.</p>
                      </div>

                      {/* Seçilebilir Ekstralar */}
                      {selectedService.extras && selectedService.extras.length > 0 && (
                        <div className="mb-4 p-4 bg-white border border-slate-200 rounded-xl">
                          <label className="block text-xs font-bold text-slate-700 mb-3">Bu pakette seçilebilecek Opsiyonel Ek Hizmetleri İşaretleyin:</label>
                          <div className="flex flex-wrap gap-3">
                            {selectedService.extras.map((ext) => (
                              <label key={ext.id} className="flex items-center gap-2 cursor-pointer bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors">
                                <input 
                                  type="checkbox" 
                                  className="accent-emerald-600 w-4 h-4"
                                  checked={(pkg.optional_addons || []).includes(ext.id)}
                                  onChange={(e) => {
                                    const currentAddons = pkg.optional_addons || [];
                                    const newAddons = e.target.checked 
                                      ? [...currentAddons, ext.id]
                                      : currentAddons.filter(id => id !== ext.id);
                                    updatePackage(pkg.id, "optional_addons", newAddons);
                                  }}
                                />
                                <span className="text-sm text-slate-700 font-medium">{ext.name} <span className="text-slate-400 font-normal">({ext.price} TL)</span></span>
                              </label>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-2 mt-2">
                        <input
                          type="checkbox"
                          id={`popular-${pkg.id}`}
                          checked={pkg.is_popular}
                          onChange={(e) => updatePackage(pkg.id, "is_popular", e.target.checked)}
                          className="w-4 h-4 accent-emerald-600"
                        />
                        <label htmlFor={`popular-${pkg.id}`} className="text-sm font-medium text-slate-700 cursor-pointer">
                          ⭐ En Çok Tercih Edilen Paket Olarak İşaretle
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
