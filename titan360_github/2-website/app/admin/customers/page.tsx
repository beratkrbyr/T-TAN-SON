"use client";
import { useEffect, useState } from "react";

const API_URL = "";

interface Customer {
  _id?: string;
  id?: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  total_bookings?: number;
  loyalty_points?: number;
  referral_code?: string;
  referred_by?: string;
  referred_count?: number;
  created_at?: string;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showPointsModal, setShowPointsModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState({ name: "", phone: "", email: "", address: "" });
  const [pointsData, setPointsData] = useState({ points: 0, reason: "" });

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`${API_URL}/api/admin/customers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setCustomers(data || []);
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
      await fetch(`${API_URL}/api/admin/customers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      setShowModal(false);
      setFormData({ name: "", phone: "", email: "", address: "" });
      fetchCustomers();
    } catch (err) {
      console.error(err);
    }
  };

  const generateReferralCode = async (customerId: string) => {
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`${API_URL}/api/admin/customers/${customerId}/generate-referral`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) fetchCustomers();
    } catch (err) {
      console.error(err);
    }
  };

  const openPointsModal = (customer: Customer) => {
    setSelectedCustomer(customer);
    setPointsData({ points: 0, reason: "" });
    setShowPointsModal(true);
  };

  const addPoints = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;
    try {
      const token = localStorage.getItem("admin_token");
      await fetch(`${API_URL}/api/admin/customers/${selectedCustomer.id}/points`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(pointsData),
      });
      setShowPointsModal(false);
      fetchCustomers();
    } catch (err) {
      console.error(err);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm) ||
    (c.referral_code && c.referral_code.includes(searchTerm.toUpperCase()))
  );

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
    <div className="space-y-6" data-testid="customers-page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Müşteriler</h1>
          <p className="text-slate-500 mt-1 text-sm">Müşteri veritabanınızı yönetin</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          data-testid="add-customer-btn"
          className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl flex items-center gap-2 shadow-sm transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
          Yeni Müşteri
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 text-center">
          <p className="text-3xl font-bold text-sky-600">{customers.length}</p>
          <p className="text-slate-500 text-sm">Toplam Müşteri</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 text-center">
          <p className="text-3xl font-bold text-amber-600">{customers.reduce((a, c) => a + (c.loyalty_points || 0), 0)}</p>
          <p className="text-slate-500 text-sm">Toplam Puan</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 text-center">
          <p className="text-3xl font-bold text-emerald-600">{customers.filter(c => c.referral_code).length}</p>
          <p className="text-slate-500 text-sm">Referans Kodu Olan</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 text-center">
          <p className="text-3xl font-bold text-violet-600">{customers.reduce((a, c) => a + (c.referred_count || 0), 0)}</p>
          <p className="text-slate-500 text-sm">Toplam Referans</p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Müşteri ara (isim, telefon veya referans kodu)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            data-testid="customer-search"
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-slate-800 placeholder-slate-400 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none"
          />
        </div>
      </div>

      {/* Customers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCustomers.length === 0 ? (
          <div className="col-span-full bg-white border border-gray-200 rounded-2xl p-12 text-center shadow-sm">
            <svg className="w-16 h-16 mx-auto text-slate-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <p className="text-slate-500 text-lg">
              {searchTerm ? "Arama sonucu bulunamadı" : "Henüz müşteri bulunmuyor"}
            </p>
          </div>
        ) : (
          filteredCustomers.map((customer, index) => (
            <div
              key={customer._id || customer.id || index}
              className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 hover:shadow-md transition-shadow animate-fadeIn"
              style={{ animationDelay: `${index * 50}ms` }}
              data-testid={`customer-card-${index}`}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-500 to-emerald-400 flex items-center justify-center text-white text-lg font-bold shadow-sm">
                  {customer.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-slate-800 truncate">{customer.name}</h3>
                  <p className="text-slate-500 text-sm">{customer.phone}</p>
                </div>
              </div>

              {customer.email && (
                <div className="mt-3 flex items-center gap-2 text-sm text-slate-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="truncate">{customer.email}</span>
                </div>
              )}

              {customer.address && (
                <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="truncate">{customer.address}</span>
                </div>
              )}

              {/* Referral Code */}
              <div className="mt-4 p-3 bg-gray-50 rounded-xl border border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Referans Kodu</span>
                  {customer.referral_code ? (
                    <button onClick={() => copyToClipboard(customer.referral_code || "")} className="flex items-center gap-1 text-xs text-sky-600 hover:text-sky-700">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Kopyala
                    </button>
                  ) : (
                    <button onClick={() => generateReferralCode(customer.id || "")} className="text-xs text-sky-600 hover:text-sky-700">
                      Oluştur
                    </button>
                  )}
                </div>
                <p className="text-lg font-mono font-bold text-sky-600 mt-1">
                  {customer.referral_code || "-"}
                </p>
                {customer.referred_count && customer.referred_count > 0 && (
                  <p className="text-xs text-emerald-600 mt-1">{customer.referred_count} kişi davet etti</p>
                )}
              </div>

              {/* Stats */}
              <div className="mt-4 pt-3 border-t border-gray-100 grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-sky-600">{customer.total_bookings || 0}</p>
                  <p className="text-xs text-slate-400">Randevu</p>
                </div>
                <div className="text-center">
                  <button onClick={() => openPointsModal(customer)} className="hover:scale-105 transition-transform">
                    <p className="text-2xl font-bold text-amber-600">{customer.loyalty_points || 0}</p>
                    <p className="text-xs text-slate-400">Puan</p>
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-3">
                <button
                  onClick={() => openPointsModal(customer)}
                  className="w-full px-3 py-2 bg-amber-50 text-amber-700 border border-amber-200 rounded-xl text-sm hover:bg-amber-100 transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Puan Ekle
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* New Customer Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-lg p-6 rounded-2xl shadow-xl animate-fadeIn" data-testid="customer-modal">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-800">Yeni Müşteri</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                <svg className="w-6 h-6 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Ad Soyad</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-slate-800 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none" placeholder="Müşteri adı" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Telefon</label>
                <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-slate-800 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none" placeholder="05XX XXX XX XX" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">E-posta (Opsiyonel)</label>
                <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-slate-800 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none" placeholder="ornek@email.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Adres (Opsiyonel)</label>
                <textarea value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-slate-800 min-h-[80px] resize-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none" placeholder="Müşteri adresi..." />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-3 bg-gray-100 text-slate-700 rounded-xl hover:bg-gray-200 transition-colors">İptal</button>
                <button type="submit" className="flex-1 px-4 py-3 bg-sky-600 text-white rounded-xl hover:bg-sky-700 transition-colors">Kaydet</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Points Modal */}
      {showPointsModal && selectedCustomer && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md p-6 rounded-2xl shadow-xl animate-fadeIn" data-testid="points-modal">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">Puan Ekle/Çıkar</h2>
                <p className="text-slate-500">{selectedCustomer.name}</p>
              </div>
              <button onClick={() => setShowPointsModal(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                <svg className="w-6 h-6 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="text-center mb-6 p-4 bg-amber-50 rounded-xl border border-amber-100">
              <p className="text-sm text-slate-500">Mevcut Puan</p>
              <p className="text-4xl font-bold text-amber-600">{selectedCustomer.loyalty_points || 0}</p>
            </div>

            <form onSubmit={addPoints} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Puan Miktarı</label>
                <input type="number" value={pointsData.points} onChange={(e) => setPointsData({ ...pointsData, points: parseInt(e.target.value) || 0 })} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-slate-800 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none" placeholder="Pozitif: ekle, Negatif: çıkar" />
                <p className="text-xs text-slate-400 mt-1">Negatif değer girerek puan çıkarabilirsiniz</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Açıklama</label>
                <input type="text" value={pointsData.reason} onChange={(e) => setPointsData({ ...pointsData, reason: e.target.value })} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-slate-800 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none" placeholder="Örneğin: Referans bonusu, Kampanya..." />
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => setPointsData({ ...pointsData, points: 50 })} className="px-3 py-2 bg-gray-100 text-slate-700 rounded-lg text-sm hover:bg-gray-200 border border-gray-200">+50</button>
                <button type="button" onClick={() => setPointsData({ ...pointsData, points: 100 })} className="px-3 py-2 bg-gray-100 text-slate-700 rounded-lg text-sm hover:bg-gray-200 border border-gray-200">+100</button>
                <button type="button" onClick={() => setPointsData({ ...pointsData, points: 200 })} className="px-3 py-2 bg-gray-100 text-slate-700 rounded-lg text-sm hover:bg-gray-200 border border-gray-200">+200</button>
                <button type="button" onClick={() => setPointsData({ ...pointsData, points: -50 })} className="px-3 py-2 bg-red-50 text-red-600 rounded-lg text-sm hover:bg-red-100 border border-red-200">-50</button>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowPointsModal(false)} className="flex-1 px-4 py-3 bg-gray-100 text-slate-700 rounded-xl hover:bg-gray-200 transition-colors">İptal</button>
                <button type="submit" className="flex-1 px-4 py-3 bg-sky-600 text-white rounded-xl hover:bg-sky-700 transition-colors">Kaydet</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
