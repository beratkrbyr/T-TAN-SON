"use client";
import { useEffect, useState } from "react";

const API_URL = "";

interface CleaningPackage {
  _id?: string;
  id?: string;
  name: string;
  price: number;
  features: string[];
  is_popular: boolean;
  order: number;
  active: boolean;
}

export default function PackagesPage() {
  const [packages, setPackages] = useState<CleaningPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPkg, setEditingPkg] = useState<CleaningPackage | null>(null);
  const [reordering, setReordering] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    price: 0,
    features: [] as string[],
    is_popular: false,
    active: true,
  });
  const [featureInput, setFeatureInput] = useState("");

  useEffect(() => { fetchPackages(); }, []);

  const fetchPackages = async () => {
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`${API_URL}/api/admin/cleaning-packages`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setPackages(data);
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
      const id = editingPkg?._id || editingPkg?.id;
      const url = editingPkg
        ? `${API_URL}/api/admin/cleaning-packages/${id}`
        : `${API_URL}/api/admin/cleaning-packages`;
      const method = editingPkg ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const err = await res.text();
        alert("Hata: " + err);
        return;
      }

      setShowModal(false);
      setEditingPkg(null);
      resetForm();
      fetchPackages();
    } catch (err) {
      console.error(err);
      alert("Bağlantı hatası!");
    }
  };

  const resetForm = () => {
    setFormData({ name: "", price: 0, features: [], is_popular: false, active: true });
    setFeatureInput("");
  };

  const handleEdit = (pkg: CleaningPackage) => {
    setEditingPkg(pkg);
    setFormData({
      name: pkg.name,
      price: pkg.price,
      features: pkg.features || [],
      is_popular: pkg.is_popular,
      active: pkg.active,
    });
    setFeatureInput("");
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu paketi silmek istediğinizden emin misiniz?")) return;
    try {
      const token = localStorage.getItem("admin_token");
      await fetch(`${API_URL}/api/admin/cleaning-packages/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchPackages();
    } catch (err) {
      console.error(err);
    }
  };

  const addFeature = () => {
    const trimmed = featureInput.trim();
    if (!trimmed) return;
    setFormData({ ...formData, features: [...formData.features, trimmed] });
    setFeatureInput("");
  };

  const removeFeature = (index: number) => {
    setFormData({
      ...formData,
      features: formData.features.filter((_, i) => i !== index),
    });
  };

  const movePackage = async (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= packages.length) return;
    const newPkgs = [...packages];
    const temp = newPkgs[index];
    newPkgs[index] = newPkgs[newIndex];
    newPkgs[newIndex] = temp;
    setPackages(newPkgs);

    setReordering(true);
    try {
      const token = localStorage.getItem("admin_token");
      await fetch(`${API_URL}/api/admin/cleaning-packages-reorder`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ order: newPkgs.map(p => p._id || p.id) }),
      });
    } catch (err) { console.error(err); }
    finally { setReordering(false); }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[50vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
          <p className="text-slate-500">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Paket Yönetimi</h1>
          <p className="text-slate-500 text-sm mt-1">Karşılaştırmalı temizlik paketlerini yönetin (Standart, Detaylı, Premium vb.)</p>
        </div>
        <button
          onClick={() => { setEditingPkg(null); resetForm(); setShowModal(true); }}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl flex items-center gap-2 shadow-sm transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Yeni Paket
        </button>
      </div>

      {reordering && (
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 text-sm rounded-lg border border-emerald-200">
          <div className="w-4 h-4 border-2 border-emerald-300 border-t-emerald-600 rounded-full animate-spin"></div>
          Sıra kaydediliyor...
        </div>
      )}

      {packages.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
          <i className="fas fa-box-open text-5xl text-slate-300 mb-4"></i>
          <p className="text-slate-500 text-lg">Henüz paket eklenmemiş.</p>
          <p className="text-slate-400 text-sm mt-1">Yukarıdaki "Yeni Paket" butonuna tıklayarak başlayın.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {packages.map((pkg, index) => (
            <div key={pkg._id || pkg.id} className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow flex">
              {/* Sıra Butonları */}
              <div className="flex flex-col items-center justify-center bg-slate-50 border-r border-gray-200 px-2 gap-1 min-w-[48px]">
                <span className="text-xs font-bold text-slate-400 mb-1">{index + 1}</span>
                <button onClick={() => movePackage(index, "up")} disabled={index === 0}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${index === 0 ? "text-slate-200 cursor-not-allowed" : "text-slate-500 hover:bg-emerald-100 hover:text-emerald-700"}`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                </button>
                <button onClick={() => movePackage(index, "down")} disabled={index === packages.length - 1}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${index === packages.length - 1 ? "text-slate-200 cursor-not-allowed" : "text-slate-500 hover:bg-emerald-100 hover:text-emerald-700"}`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </button>
              </div>

              {/* Paket Bilgisi */}
              <div className="flex-1 p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold text-slate-800">{pkg.name}</h3>
                      {pkg.is_popular && (
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-full border border-emerald-200">
                          EN ÇOK TERCİH EDİLEN
                        </span>
                      )}
                    </div>
                    <p className="text-xl font-bold text-emerald-600 mt-1">{pkg.price.toLocaleString("tr-TR")} TL</p>
                  </div>
                  <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-semibold border ${pkg.active ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-700 border-red-200"}`}>
                    {pkg.active ? "Aktif" : "Pasif"}
                  </span>
                </div>

                {pkg.features && pkg.features.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs text-slate-400 mb-1">Özellikler ({pkg.features.length}):</p>
                    <div className="flex flex-wrap gap-1">
                      {pkg.features.slice(0, 8).map((f, i) => (
                        <span key={i} className="px-2 py-0.5 bg-gray-100 text-slate-600 text-xs rounded-lg border border-gray-200">
                          ✓ {f}
                        </span>
                      ))}
                      {pkg.features.length > 8 && (
                        <span className="px-2 py-0.5 bg-gray-100 text-slate-400 text-xs rounded-lg border border-gray-200">
                          +{pkg.features.length - 8} daha
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-2 border-t border-gray-100">
                  <button onClick={() => handleEdit(pkg)} className="flex-1 px-3 py-2 bg-gray-50 hover:bg-gray-100 text-slate-700 text-sm rounded-lg border border-gray-200 transition-colors">
                    Düzenle
                  </button>
                  <button onClick={() => handleDelete(pkg._id || pkg.id || "")} className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 text-sm rounded-lg border border-red-200 transition-colors">
                    Sil
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="p-5 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-800">{editingPkg ? "Paketi Düzenle" : "Yeni Paket"}</h2>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Paket Adı</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Örn: Premium Paket"
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Fiyat (TL)</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                  required
                />
              </div>

              {/* Özellikler */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Özellikler (Temizlik Kalemleri)</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={featureInput}
                    onChange={(e) => setFeatureInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addFeature(); } }}
                    placeholder="Örn: Zemin silme ve parlatma"
                    className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg text-slate-800 focus:border-emerald-500 outline-none text-sm"
                  />
                  <button type="button" onClick={addFeature} className="px-4 py-2 bg-emerald-50 text-emerald-700 text-sm rounded-lg border border-emerald-200 hover:bg-emerald-100 transition-colors whitespace-nowrap">
                    + Ekle
                  </button>
                </div>
                {formData.features.length === 0 ? (
                  <p className="text-slate-400 text-sm p-3 bg-gray-50 rounded-lg text-center border border-gray-100">Henüz özellik eklenmemiş.</p>
                ) : (
                  <div className="space-y-1 max-h-48 overflow-y-auto">
                    {formData.features.map((f, i) => (
                      <div key={i} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg border border-gray-100">
                        <span className="text-sm text-slate-700"><span className="text-emerald-500 mr-2">✓</span>{f}</span>
                        <button type="button" onClick={() => removeFeature(i)} className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_popular}
                    onChange={(e) => setFormData({ ...formData, is_popular: e.target.checked })}
                    className="w-4 h-4 accent-emerald-600"
                  />
                  <span className="text-sm text-slate-700">En Çok Tercih Edilen</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                    className="w-4 h-4 accent-emerald-600"
                  />
                  <span className="text-sm text-slate-700">Aktif</span>
                </label>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-slate-700 rounded-lg transition-colors">
                  İptal
                </button>
                <button type="submit" className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors">
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
