"use client";
import { useEffect, useState } from "react";

const API_URL = "";

interface Booking {
  _id?: string;
  id?: string;
  customer_name: string;
  customer_id?: string;
  service_name: string;
  date: string;
  time: string;
  status: string;
  total_price: number;
  phone?: string;
  notes?: string;
  total_amount?: number;
  discount_pct?: number;
  discount_amount?: number;
  points_earned?: number;
  points_used?: number;
  final_amount?: number;
  photos?: any[];
  location?: any;
}

interface CompletionPreview {
  total_amount: number;
  base_discount: number;
  extra_discount: number;
  total_discount_pct: number;
  discount_amount: number;
  discount_details: { type: string; pct: number }[];
  available_points: number;
  points_to_use: number;
  final_amount: number;
  points_earned: number;
  big_job_bonus: boolean;
  customer_name: string;
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [completeModal, setCompleteModal] = useState<Booking | null>(null);
  const [amount, setAmount] = useState("");
  const [usePoints, setUsePoints] = useState(0);
  const [preview, setPreview] = useState<CompletionPreview | null>(null);
  const [completing, setCompleting] = useState(false);
  const [msg, setMsg] = useState("");

  const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;
  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

  useEffect(() => { fetchBookings(); }, []);

  const fetchBookings = async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/bookings`, { headers });
      if (res.ok) setBookings(await res.json());
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const updateStatus = async (id: string, newStatus: string) => {
    await fetch(`${API_URL}/api/admin/bookings/${id}`, { method: "PUT", headers, body: JSON.stringify({ status: newStatus }) });
    fetchBookings();
  };

  const openCompleteModal = (booking: Booking) => {
    setCompleteModal(booking);
    setAmount(String(booking.total_price || ""));
    setUsePoints(0);
    setPreview(null);
    setMsg("");
  };

  const fetchPreview = async () => {
    if (!completeModal || !amount) return;
    const id = completeModal._id || completeModal.id;
    const res = await fetch(`${API_URL}/api/admin/bookings/${id}/preview-completion`, {
      method: "POST", headers, body: JSON.stringify({ total_amount: parseFloat(amount), use_points: usePoints })
    });
    if (res.ok) setPreview(await res.json());
  };

  useEffect(() => { if (completeModal && amount) fetchPreview(); }, [amount, usePoints]);

  const handleComplete = async () => {
    if (!completeModal || !amount) return;
    setCompleting(true);
    const id = completeModal._id || completeModal.id;
    const res = await fetch(`${API_URL}/api/admin/bookings/${id}/complete`, {
      method: "POST", headers, body: JSON.stringify({ total_amount: parseFloat(amount), use_points: usePoints, apply_discounts: true })
    });
    if (res.ok) {
      const data = await res.json();
      setMsg(`Tamamlandi! Puan: +${data.points_earned}, Indirim: %${data.discount_pct}, Odenen: ${data.final_amount} TL`);
      setTimeout(() => { setCompleteModal(null); fetchBookings(); }, 2000);
    } else {
      const err = await res.json();
      setMsg(err.detail || "Hata olustu");
    }
    setCompleting(false);
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
      pending: "bg-amber-50 text-amber-700 border-amber-200",
      cancelled: "bg-red-50 text-red-700 border-red-200",
      confirmed: "bg-sky-50 text-sky-700 border-sky-200",
      in_progress: "bg-blue-50 text-blue-700 border-blue-200",
    };
    const labels: Record<string, string> = {
      completed: "Tamamlandi", pending: "Bekliyor", cancelled: "Iptal", confirmed: "Onaylandi", in_progress: "Devam Ediyor",
    };
    return <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-semibold border ${styles[status] || "bg-gray-50 text-gray-700 border-gray-200"}`}>{labels[status] || status}</span>;
  };

  const filtered = bookings.filter(b => filter === "all" || b.status === filter);

  if (loading) return <div className="flex items-center justify-center h-full min-h-[50vh]"><div className="w-12 h-12 border-4 border-sky-200 border-t-sky-600 rounded-full animate-spin"></div></div>;

  return (
    <div className="space-y-6" data-testid="bookings-page">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Randevular</h1>
          <p className="text-slate-500 mt-1 text-sm">Randevulari yonetin, tamamlayin ve puan verin</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            { key: "all", label: "Tumu" }, { key: "pending", label: "Bekleyen" },
            { key: "confirmed", label: "Onaylanan" }, { key: "completed", label: "Tamamlanan" },
            { key: "cancelled", label: "Iptal" },
          ].map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filter === f.key ? "bg-sky-600 text-white" : "bg-white text-slate-600 border border-gray-200 hover:bg-gray-50"}`}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-500">Randevu bulunmuyor</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/80">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Musteri</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Hizmet</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Tarih</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Fiyat</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Durum</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Islemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((b, i) => (
                  <tr key={b._id || b.id || i} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-800">{b.customer_name}</p>
                      {b.phone && <p className="text-sm text-slate-500">{b.phone}</p>}
                    </td>
                    <td className="px-4 py-3 text-slate-700">{b.service_name}</td>
                    <td className="px-4 py-3 text-slate-700">{b.date} {b.time}</td>
                    <td className="px-4 py-3">
                      <span className="font-semibold text-emerald-600">{b.total_price} TL</span>
                      {b.final_amount != null && b.final_amount !== b.total_price && (
                        <span className="block text-xs text-sky-600">Odenen: {b.final_amount} TL</span>
                      )}
                    </td>
                    <td className="px-4 py-3">{getStatusBadge(b.status)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 flex-wrap">
                        {b.status === "pending" && (
                          <>
                            <button onClick={() => updateStatus(b._id || b.id || "", "confirmed")}
                              className="px-3 py-1.5 bg-sky-50 text-sky-700 border border-sky-200 rounded-lg text-sm hover:bg-sky-100">Onayla</button>
                            <button onClick={() => updateStatus(b._id || b.id || "", "cancelled")}
                              className="px-3 py-1.5 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm hover:bg-red-100">Iptal</button>
                          </>
                        )}
                        {(b.status === "confirmed" || b.status === "in_progress") && (
                          <button onClick={() => openCompleteModal(b)}
                            className="px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-sm hover:bg-emerald-100 font-medium">
                            Tamamla + Puan Ver
                          </button>
                        )}
                        {b.status === "completed" && b.points_earned != null && (
                          <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">+{b.points_earned} puan</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Completion Modal */}
      {completeModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 p-5 text-white">
              <h2 className="text-xl font-bold">Randevu Tamamla</h2>
              <p className="text-emerald-100 text-sm">{completeModal.customer_name} - {completeModal.service_name}</p>
            </div>

            <div className="p-5 space-y-4">
              {msg && (
                <div className={`p-3 rounded-lg text-sm font-medium ${msg.includes("Tamamlandi") ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
                  {msg}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Gercek Tutar (TL)</label>
                <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-lg font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Ornegin: 1500" />
              </div>

              {preview && (
                <div className="space-y-3 bg-gray-50 p-4 rounded-xl">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Tutar:</span>
                    <span className="font-bold text-slate-800">{preview.total_amount.toLocaleString()} TL</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Temel Indirim (%{preview.base_discount}):</span>
                    <span className="text-emerald-600">-{(preview.total_amount * preview.base_discount / 100).toFixed(0)} TL</span>
                  </div>
                  {preview.discount_details.map((d, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-slate-600">{d.type} (%{d.pct}):</span>
                      <span className="text-emerald-600">-{(preview.total_amount * d.pct / 100).toFixed(0)} TL</span>
                    </div>
                  ))}
                  <div className="flex justify-between text-sm font-medium">
                    <span className="text-slate-600">Toplam Indirim (%{preview.total_discount_pct}):</span>
                    <span className="text-emerald-600">-{preview.discount_amount.toFixed(0)} TL</span>
                  </div>

                  {preview.available_points > 0 && (
                    <div className="pt-2 border-t border-gray-200">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-600">Musait Puan: <strong>{preview.available_points}</strong></span>
                        <div className="flex items-center gap-2">
                          <input type="number" value={usePoints} onChange={e => setUsePoints(Math.min(Number(e.target.value), preview.available_points))}
                            className="w-20 px-2 py-1 border border-gray-300 rounded-lg text-sm" placeholder="0" max={preview.available_points} />
                          <span className="text-xs text-slate-500">puan kullan</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="pt-2 border-t-2 border-gray-300 flex justify-between">
                    <span className="font-bold text-slate-800">Odenecek Tutar:</span>
                    <span className="font-bold text-xl text-emerald-600">{preview.final_amount.toLocaleString()} TL</span>
                  </div>

                  <div className="flex justify-between text-sm bg-sky-50 p-2 rounded-lg">
                    <span className="text-sky-700">Kazanilacak Puan:</span>
                    <span className="font-bold text-sky-700">+{preview.points_earned}</span>
                  </div>

                  {preview.big_job_bonus && (
                    <div className="bg-amber-50 border border-amber-200 p-2 rounded-lg text-sm text-amber-700 font-medium text-center">
                      10.000 TL+ Buyuk Is Bonusu: +%10 Ekstra Indirim Hakki!
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button onClick={() => setCompleteModal(null)}
                  className="flex-1 py-3 bg-gray-100 text-slate-700 rounded-xl font-medium hover:bg-gray-200">Iptal</button>
                <button onClick={handleComplete} disabled={completing || !amount || parseFloat(amount) <= 0}
                  className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 disabled:opacity-50">
                  {completing ? "Isleniyor..." : "Tamamla ve Puan Ver"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
