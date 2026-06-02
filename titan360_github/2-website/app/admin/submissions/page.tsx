"use client";
import { useEffect, useState } from "react";

const API_URL = "/api";

interface Submission {
  id: string;
  type: string; // "quote" or "contact"
  name: string;
  phone: string;
  email?: string;
  service?: string;
  message?: string;
  read: boolean;
  created_at: string;
}

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>("all"); // "all", "quote", "contact"
  const [filterRead, setFilterRead] = useState<string>("all"); // "all", "unread", "read"
  const [search, setSearch] = useState("");
  const [selectedSub, setSelectedSub] = useState<Submission | null>(null);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`${API_URL}/admin/submissions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSubmissions(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleReadStatus = async (sub: Submission) => {
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`${API_URL}/admin/submissions/${sub.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ read: !sub.read })
      });
      if (res.ok) {
        setSubmissions(prev =>
          prev.map(item => (item.id === sub.id ? { ...item, read: !item.read } : item))
        );
        if (selectedSub && selectedSub.id === sub.id) {
          setSelectedSub(p => p ? { ...p, read: !p.read } : null);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteSubmission = async (id: string) => {
    if (!confirm("Bu başvuruyu silmek istediğinize emin misiniz?")) return;
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`${API_URL}/admin/submissions/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setSubmissions(prev => prev.filter(item => item.id !== id));
        if (selectedSub && selectedSub.id === id) {
          setSelectedSub(null);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = submissions.filter(sub => {
    if (filterType !== "all" && sub.type !== filterType) return false;
    if (filterRead === "read" && !sub.read) return false;
    if (filterRead === "unread" && sub.read) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        sub.name.toLowerCase().includes(q) ||
        sub.phone.includes(q) ||
        sub.email?.toLowerCase().includes(q) ||
        (sub.message && sub.message.toLowerCase().includes(q)) ||
        (sub.service && sub.service.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Form Başvuruları</h1>
        <p className="text-sm text-gray-500">Müşterilerden gelen teklif talepleri ve iletişim formu mesajları</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Sol Liste Bölümü */}
        <div className="lg:col-span-2 space-y-4">
          {/* Arama ve Filtreler */}
          <div className="bg-white p-4 rounded-xl border border-gray-150 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative w-full md:w-72">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                <i className="fas fa-search text-xs"></i>
              </span>
              <input
                type="text"
                placeholder="Başvurularda ara..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <select
                value={filterType}
                onChange={e => setFilterType(e.target.value)}
                className="flex-1 md:flex-initial px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tüm Türler</option>
                <option value="quote">Teklif Talepleri</option>
                <option value="contact">İletişim Mesajları</option>
              </select>
              <select
                value={filterRead}
                onChange={e => setFilterRead(e.target.value)}
                className="flex-1 md:flex-initial px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Okunma Durumu (Tümü)</option>
                <option value="unread">Okunmayanlar</option>
                <option value="read">Okunanlar</option>
              </select>
            </div>
          </div>

          {/* Liste */}
          <div className="bg-white rounded-xl border border-gray-150 shadow-sm overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-gray-500">Yükleniyor...</div>
            ) : filtered.length === 0 ? (
              <div className="p-8 text-center text-gray-500">Başvuru bulunamadı.</div>
            ) : (
              <div className="divide-y divide-gray-150">
                {filtered.map(sub => (
                  <div
                    key={sub.id}
                    onClick={() => setSelectedSub(sub)}
                    className={`p-4 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer ${
                      selectedSub?.id === sub.id ? "bg-blue-50/50" : ""
                    } ${!sub.read ? "border-l-4 border-blue-500" : "border-l-4 border-transparent"}`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            sub.type === "quote" ? "bg-orange-100 text-orange-700" : "bg-emerald-100 text-emerald-700"
                          }`}
                        >
                          {sub.type === "quote" ? "Teklif" : "İletişim"}
                        </span>
                        <span className="text-xs text-gray-400">
                          {new Date(sub.created_at).toLocaleString("tr-TR")}
                        </span>
                      </div>
                      <h3 className={`text-sm truncate ${!sub.read ? "font-bold text-gray-800" : "text-gray-600"}`}>
                        {sub.name}
                      </h3>
                      {sub.type === "quote" && sub.service && (
                        <p className="text-xs text-slate-500 mt-0.5">
                          <i className="fas fa-broom mr-1"></i> {sub.service}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 truncate mt-0.5">
                        {sub.message || "(Mesaj yok)"}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          toggleReadStatus(sub);
                        }}
                        className={`p-1.5 rounded-lg text-xs transition-colors ${
                          sub.read ? "text-gray-400 hover:text-blue-600" : "text-blue-500 hover:text-gray-500"
                        }`}
                        title={sub.read ? "Okunmadı İşaretle" : "Okundu İşaretle"}
                      >
                        <i className={`fas ${sub.read ? "fa-envelope" : "fa-envelope-open"}`}></i>
                      </button>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          deleteSubmission(sub.id);
                        }}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 transition-colors"
                        title="Sil"
                      >
                        <i className="fas fa-trash-alt"></i>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sağ Detay Bölümü */}
        <div className="lg:col-span-1">
          {selectedSub ? (
            <div className="bg-white p-6 rounded-xl border border-gray-150 shadow-sm space-y-6 sticky top-24">
              <div className="border-b border-gray-100 pb-4">
                <div className="flex justify-between items-start mb-2">
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase ${
                      selectedSub.type === "quote" ? "bg-orange-100 text-orange-700" : "bg-emerald-100 text-emerald-700"
                    }`}
                  >
                    {selectedSub.type === "quote" ? "Teklif Talebi" : "İletişim Mesajı"}
                  </span>
                  <button
                    onClick={() => deleteSubmission(selectedSub.id)}
                    className="text-red-500 text-xs hover:text-red-700 font-medium"
                  >
                    <i className="fas fa-trash-alt mr-1"></i> Sil
                  </button>
                </div>
                <h2 className="text-lg font-bold text-gray-800">{selectedSub.name}</h2>
                <p className="text-xs text-gray-400">
                  {new Date(selectedSub.created_at).toLocaleString("tr-TR")}
                </p>
              </div>

              <div className="space-y-4 text-sm">
                <div>
                  <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Telefon</span>
                  <a href={`tel:${selectedSub.phone}`} className="text-blue-600 hover:underline font-medium">
                    {selectedSub.phone}
                  </a>
                </div>

                {selectedSub.email && (
                  <div>
                    <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-0.5">E-posta</span>
                    <a href={`mailto:${selectedSub.email}`} className="text-blue-600 hover:underline font-medium">
                      {selectedSub.email}
                    </a>
                  </div>
                )}

                {selectedSub.type === "quote" && selectedSub.service && (
                  <div>
                    <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Talep Edilen Hizmet</span>
                    <span className="font-semibold text-gray-700">{selectedSub.service}</span>
                  </div>
                )}

                <div>
                  <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Açıklama / Mesaj</span>
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 text-gray-600 leading-relaxed whitespace-pre-wrap">
                    {selectedSub.message || "(Mesaj bırakılmamış)"}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <button
                  onClick={() => toggleReadStatus(selectedSub)}
                  className={`w-full py-2 px-4 rounded-lg font-semibold text-sm transition-colors border ${
                    selectedSub.read
                      ? "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                      : "bg-blue-600 text-white border-transparent hover:bg-blue-700"
                  }`}
                >
                  {selectedSub.read ? "Okunmadı Olarak İşaretle" : "Okundu Olarak İşaretle"}
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 p-6 rounded-xl border border-dashed border-gray-300 text-center text-gray-500 sticky top-24">
              Detayları görmek için listeden bir başvuru seçin.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
