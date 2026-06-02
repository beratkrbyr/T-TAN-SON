"use client";
import { useEffect, useState } from "react";

const API_URL = "";

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    company_name: "TITAN 360",
    phone: "",
    email: "",
    address: "",
    working_hours: "09:00 - 18:00",
    working_days: "Pazartesi - Cumartesi"
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`${API_URL}/api/admin/settings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (data) setSettings({ ...settings, ...data });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`${API_URL}/api/admin/settings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      });
      
      if (res.ok) {
        setMessage({ type: "success", text: "Ayarlar başarıyla kaydedildi!" });
      } else {
        setMessage({ type: "error", text: "Ayarlar kaydedilemedi." });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Bağlantı hatası" });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    }
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
    <div className="space-y-6 max-w-3xl" data-testid="settings-page">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Ayarlar</h1>
        <p className="text-slate-500 mt-1 text-sm">İşletme bilgilerinizi yapılandırın</p>
      </div>

      {/* Message */}
      {message.text && (
        <div className={`px-4 py-3 rounded-xl flex items-center gap-2 animate-fadeIn ${
          message.type === "success" ? "bg-emerald-50 border border-emerald-200 text-emerald-700" : "bg-red-50 border border-red-200 text-red-700"
        }`}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {message.type === "success" ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            )}
          </svg>
          {message.text}
        </div>
      )}

      {/* Settings Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Company Info */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-6 shadow-sm">
          <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
            <div className="p-3 rounded-xl bg-sky-50 border border-sky-100">
              <svg className="w-6 h-6 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-800">İşletme Bilgileri</h2>
              <p className="text-sm text-slate-500">Şirket ve iletişim bilgileri</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">Şirket Adı</label>
              <input
                type="text"
                value={settings.company_name}
                onChange={(e) => setSettings({ ...settings, company_name: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-slate-800 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none"
                placeholder="Şirket adı"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Telefon</label>
              <input
                type="tel"
                value={settings.phone}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-slate-800 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none"
                placeholder="05XX XXX XX XX"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">E-posta</label>
              <input
                type="email"
                value={settings.email}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-slate-800 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none"
                placeholder="info@sirket.com"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">Adres</label>
              <textarea
                value={settings.address}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-slate-800 min-h-[80px] resize-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none"
                placeholder="İşletme adresi"
              />
            </div>
          </div>
        </div>

        {/* Working Hours */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-6 shadow-sm">
          <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-100">
              <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-800">Çalışma Saatleri</h2>
              <p className="text-sm text-slate-500">Randevu kabul saatleri</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Çalışma Saatleri</label>
              <input
                type="text"
                value={settings.working_hours}
                onChange={(e) => setSettings({ ...settings, working_hours: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-slate-800 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none"
                placeholder="09:00 - 18:00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Çalışma Günleri</label>
              <input
                type="text"
                value={settings.working_days}
                onChange={(e) => setSettings({ ...settings, working_days: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-slate-800 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none"
                placeholder="Pazartesi - Cumartesi"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            data-testid="save-settings-btn"
            className="px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white rounded-xl flex items-center gap-2 min-w-[160px] justify-center disabled:opacity-50 shadow-sm transition-colors"
          >
            {saving ? (
              <>
                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Kaydediliyor...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Kaydet
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
