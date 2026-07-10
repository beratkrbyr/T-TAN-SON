"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

const API_URL = "https://titan-api-gcuw.onrender.com";

interface Employee {
  _id?: string;
  id?: string;
  name: string;
  tc?: string;
  phone?: string;
  position?: string;
  salary?: number;
  start_date?: string;
  notes?: string;
  active?: boolean;
  total_borc?: number;
  total_alacak?: number;
  bakiye?: number;
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: "", tc: "", phone: "", position: "", salary: 0, start_date: "", notes: "", active: true
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`${API_URL}/api/admin/employees`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setEmployees(data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData({ name: "", tc: "", phone: "", position: "", salary: 0, start_date: "", notes: "", active: true });
    setShowModal(true);
  };

  const openEditModal = (emp: Employee) => {
    setEditingId(emp.id || emp._id || null);
    setFormData({
      name: emp.name,
      tc: emp.tc || "",
      phone: emp.phone || "",
      position: emp.position || "",
      salary: emp.salary || 0,
      start_date: emp.start_date || "",
      notes: emp.notes || "",
      active: emp.active !== false
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("admin_token");
      const url = editingId ? `${API_URL}/api/admin/employees/${editingId}` : `${API_URL}/api/admin/employees`;
      const method = editingId ? "PUT" : "POST";

      await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      
      setShowModal(false);
      fetchEmployees();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu personeli ve tüm cari işlemlerini silmek istediğinize emin misiniz?")) return;
    try {
      const token = localStorage.getItem("admin_token");
      await fetch(`${API_URL}/api/admin/employees/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchEmployees();
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = employees.filter(e =>
    e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (e.position && e.position.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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

  const totalBakiye = employees.reduce((acc, e) => acc + (e.bakiye || 0), 0);
  const activeCount = employees.filter(e => e.active !== false).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Personel Yönetimi</h1>
          <p className="text-slate-500 mt-1 text-sm">Çalışan bilgileri ve cari hesap durumu</p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin/ledger" className="px-4 py-2 bg-white border border-gray-200 text-slate-700 hover:bg-gray-50 rounded-xl flex items-center gap-2 shadow-sm transition-colors">
            <i className="fas fa-wallet text-sky-500"></i> Cari Hesaplar
          </Link>
          <button
            onClick={openAddModal}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl flex items-center gap-2 shadow-sm transition-colors"
          >
            <i className="fas fa-plus"></i> Yeni Personel
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 text-center">
          <p className="text-3xl font-bold text-emerald-600">{employees.length}</p>
          <p className="text-slate-500 text-sm">Toplam Personel</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 text-center">
          <p className="text-3xl font-bold text-sky-600">{activeCount}</p>
          <p className="text-slate-500 text-sm">Aktif Çalışan</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 text-center">
          <p className="text-3xl font-bold text-amber-600">{employees.reduce((a, e) => a + (e.salary || 0), 0).toLocaleString('tr-TR')} TL</p>
          <p className="text-slate-500 text-sm">Toplam Maaş Yükü</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 text-center">
          <p className={`text-3xl font-bold ${totalBakiye < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
            {Math.abs(totalBakiye).toLocaleString('tr-TR')} TL
          </p>
          <p className="text-slate-500 text-sm">Net Bakiye Durumu</p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
        <div className="relative">
          <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
          <input
            type="text"
            placeholder="Personel ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-slate-800 placeholder-slate-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-slate-500 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 font-medium">Ad Soyad</th>
                <th className="px-6 py-4 font-medium">Pozisyon</th>
                <th className="px-6 py-4 font-medium">İletişim</th>
                <th className="px-6 py-4 font-medium">Aylık Maaş</th>
                <th className="px-6 py-4 font-medium">Bakiye</th>
                <th className="px-6 py-4 font-medium">Durum</th>
                <th className="px-6 py-4 font-medium text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">Kayıt bulunamadı.</td>
                </tr>
              ) : (
                filtered.map(emp => {
                  const bal = emp.bakiye || 0;
                  const balColor = bal > 0 ? "text-emerald-600" : bal < 0 ? "text-red-600" : "text-slate-500";
                  const balSign = bal > 0 ? "+" : "";
                  return (
                    <tr key={emp.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-800">{emp.name}</div>
                        {emp.start_date && <div className="text-xs text-slate-400 mt-0.5">Başlangıç: {new Date(emp.start_date).toLocaleDateString('tr-TR')}</div>}
                      </td>
                      <td className="px-6 py-4 text-slate-600">{emp.position || "—"}</td>
                      <td className="px-6 py-4 text-slate-600">
                        {emp.phone}<br/>
                        <span className="text-xs text-slate-400">{emp.tc}</span>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-700">{emp.salary ? emp.salary.toLocaleString('tr-TR') + " TL" : "—"}</td>
                      <td className={`px-6 py-4 font-bold ${balColor}`}>
                        {balSign}{Math.abs(bal).toLocaleString('tr-TR')} TL
                      </td>
                      <td className="px-6 py-4">
                        {emp.active !== false ? (
                          <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-semibold">Aktif</span>
                        ) : (
                          <span className="px-2 py-1 bg-red-100 text-red-700 rounded-lg text-xs font-semibold">Pasif</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/admin/ledger?personel=${emp.id}`} className="p-2 text-sky-500 hover:bg-sky-50 rounded-lg transition-colors" title="Cari Detay">
                            <i className="fas fa-book"></i>
                          </Link>
                          <button onClick={() => openEditModal(emp)} className="p-2 text-amber-500 hover:bg-amber-50 rounded-lg transition-colors" title="Düzenle">
                            <i className="fas fa-edit"></i>
                          </button>
                          <button onClick={() => handleDelete(emp.id!)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Sil">
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-2xl p-6 rounded-3xl shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-800">
                {editingId ? "Personel Düzenle" : "Yeni Personel Ekle"}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                <i className="fas fa-times text-slate-500 text-lg"></i>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Ad Soyad *</label>
                  <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-emerald-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Pozisyon</label>
                  <input type="text" value={formData.position} onChange={e => setFormData({...formData, position: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-emerald-500" placeholder="Örn: Teknisyen" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">TC Kimlik No</label>
                  <input type="text" value={formData.tc} onChange={e => setFormData({...formData, tc: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-emerald-500" maxLength={11} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Telefon</label>
                  <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-emerald-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Aylık Maaş (TL)</label>
                  <input type="number" value={formData.salary || ""} onChange={e => setFormData({...formData, salary: parseFloat(e.target.value) || 0})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-emerald-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">İşe Başlama Tarihi</label>
                  <input type="date" value={formData.start_date} onChange={e => setFormData({...formData, start_date: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-emerald-500" />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Notlar</label>
                <textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-emerald-500 min-h-[80px]" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Durum</label>
                <select value={formData.active ? "true" : "false"} onChange={e => setFormData({...formData, active: e.target.value === "true"})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-emerald-500">
                  <option value="true">Aktif</option>
                  <option value="false">Pasif (Ayrıldı)</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-3 bg-gray-100 text-slate-700 rounded-xl hover:bg-gray-200 transition-colors font-medium">İptal</button>
                <button type="submit" className="flex-1 px-4 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-medium">Kaydet</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
