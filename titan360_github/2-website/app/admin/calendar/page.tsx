"use client";
import { useEffect, useState } from "react";

const API_URL = "";

const DEFAULT_SLOTS = [
  "08:00","08:30","09:00","09:30","10:00","10:30",
  "11:00","11:30","12:00","12:30","13:00","13:30",
  "14:00","14:30","15:00","15:30","16:00","16:30",
  "17:00","17:30","18:00","18:30","19:00","19:30","20:00"
];

interface SlotData {
  time: string;
  busy: boolean;
}

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [dateAvailable, setDateAvailable] = useState(false);
  const [slots, setSlots] = useState<SlotData[]>([]);
  const [monthData, setMonthData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;
  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

  const monthNames = ["Ocak","Subat","Mart","Nisan","Mayis","Haziran","Temmuz","Agustos","Eylul","Ekim","Kasim","Aralik"];
  const dayNames = ["Pzt","Sal","Car","Per","Cum","Cmt","Paz"];

  useEffect(() => { fetchMonth(); }, [currentMonth]);

  const fetchMonth = async () => {
    setLoading(true);
    try {
      const y = currentMonth.getFullYear();
      const m = currentMonth.getMonth() + 1;
      const res = await fetch(`${API_URL}/api/admin/availability?year=${y}&month=${m}`, { headers });
      if (res.ok) {
        const data = await res.json();
        const map: Record<string, any> = {};
        data.forEach((d: any) => { map[d.date] = d; });
        setMonthData(map);
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const selectDate = (dateStr: string) => {
    setSelectedDate(dateStr);
    setMsg("");
    const existing = monthData[dateStr];
    if (existing) {
      setDateAvailable(existing.available);
      const existingSlots = (existing.time_slots || []).map((s: any) =>
        typeof s === "string" ? { time: s, busy: false } : s
      );
      setSlots(existingSlots);
    } else {
      setDateAvailable(true);
      setSlots(DEFAULT_SLOTS.map(t => ({ time: t, busy: false })));
    }
  };

  const toggleSlotBusy = (time: string) => {
    setSlots(prev => prev.map(s => s.time === time ? { ...s, busy: !s.busy } : s));
  };

  const addAllSlots = () => {
    setSlots(DEFAULT_SLOTS.map(t => ({ time: t, busy: false })));
  };

  const removeSlot = (time: string) => {
    setSlots(prev => prev.filter(s => s.time !== time));
  };

  const markAllBusy = () => {
    setSlots(prev => prev.map(s => ({ ...s, busy: true })));
  };

  const markAllAvailable = () => {
    setSlots(prev => prev.map(s => ({ ...s, busy: false })));
  };

  const saveAvailability = async () => {
    if (!selectedDate) return;
    setSaving(true);
    try {
      const body = { date: selectedDate, available: dateAvailable, time_slots: slots };
      const res = await fetch(`${API_URL}/api/admin/availability`, {
        method: "POST", headers, body: JSON.stringify(body)
      });
      if (res.ok) {
        setMsg("Kaydedildi!");
        setMonthData(prev => ({ ...prev, [selectedDate]: body }));
        setTimeout(() => setMsg(""), 2000);
      }
    } catch (e) { console.error(e); }
    setSaving(false);
  };

  const formatDateStr = (day: number) => {
    const y = currentMonth.getFullYear();
    const m = String(currentMonth.getMonth() + 1).padStart(2, "0");
    return `${y}-${m}-${String(day).padStart(2, "0")}`;
  };

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  let startDay = firstDay.getDay() - 1;
  if (startDay < 0) startDay = 6;

  const getDateStatus = (dateStr: string) => {
    const d = monthData[dateStr];
    if (!d) return "empty";
    if (!d.available) return "closed";
    const slots = d.time_slots || [];
    const busyCount = slots.filter((s: any) => (typeof s === "object" ? s.busy : false)).length;
    if (busyCount === slots.length && slots.length > 0) return "full";
    if (busyCount > 0) return "partial";
    return "open";
  };

  const prevMonth = () => { setCurrentMonth(new Date(year, month - 1)); setSelectedDate(null); };
  const nextMonth = () => { setCurrentMonth(new Date(year, month + 1)); setSelectedDate(null); };

  return (
    <div className="space-y-4" data-testid="calendar-page">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-slate-800">Takvim Yonetimi</h1>
        <p className="text-slate-500 text-sm">Tarihlere tiklayin, saat ekleyin ve dolu/musait isaretleyin</p>
      </div>

      {/* Legend */}
      <div className="bg-white border border-gray-200 p-3 rounded-xl shadow-sm flex flex-wrap gap-3 text-xs">
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-emerald-500 inline-block"></span> Musait</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-amber-500 inline-block"></span> Kismi Dolu</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-500 inline-block"></span> Tamamen Dolu</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-gray-300 inline-block"></span> Ayarlanmamis</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Calendar Grid */}
        <div className="lg:col-span-2 bg-white border border-gray-200 p-3 md:p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-lg">
              <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
            </button>
            <h2 className="text-lg md:text-xl font-bold text-slate-800">
              {monthNames[month]} {year}
            </h2>
            <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-lg">
              <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-1">
            {dayNames.map(d => <div key={d} className="text-center text-slate-500 text-xs font-medium py-1">{d}</div>)}
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-3 border-sky-200 border-t-sky-600 rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: startDay }, (_, i) => <div key={`e-${i}`}></div>)}
              {Array.from({ length: daysInMonth }, (_, i) => {
                const day = i + 1;
                const dateStr = formatDateStr(day);
                const status = getDateStatus(dateStr);
                const isSelected = dateStr === selectedDate;
                const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();

                const statusColors: Record<string, string> = {
                  empty: "bg-gray-50 border-gray-200",
                  closed: "bg-gray-100 border-gray-300",
                  open: "bg-emerald-50 border-emerald-300",
                  partial: "bg-amber-50 border-amber-300",
                  full: "bg-red-50 border-red-300",
                };

                const dotColors: Record<string, string> = {
                  empty: "bg-gray-300",
                  closed: "bg-gray-400",
                  open: "bg-emerald-500",
                  partial: "bg-amber-500",
                  full: "bg-red-500",
                };

                return (
                  <button
                    key={day}
                    onClick={() => selectDate(dateStr)}
                    className={`aspect-square rounded-lg border-2 flex flex-col items-center justify-center transition-all text-sm
                      ${isSelected ? "border-sky-500 ring-2 ring-sky-200 bg-sky-50" : statusColors[status]}
                      ${isToday ? "font-bold" : ""}
                      hover:border-sky-400 hover:shadow-sm`}
                  >
                    <span className={`${isToday ? "text-sky-700" : "text-slate-700"} text-xs md:text-sm`}>{day}</span>
                    <span className={`w-2 h-2 rounded-full mt-0.5 ${dotColors[status]}`}></span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Slot Editor */}
        <div className="bg-white border border-gray-200 p-4 rounded-2xl shadow-sm">
          {!selectedDate ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-slate-400">
              <svg className="w-12 h-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
              <p className="text-sm">Duzenlemek icin bir tarih secin</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-800 text-lg">
                  {new Date(selectedDate).toLocaleDateString("tr-TR", { day: "numeric", month: "long" })}
                </h3>
                {msg && <span className="text-emerald-600 text-sm font-medium">{msg}</span>}
              </div>

              {/* Date Active Toggle */}
              <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                <span className="text-sm text-slate-600">Gun aktif mi?</span>
                <button
                  onClick={() => setDateAvailable(!dateAvailable)}
                  className={`w-12 h-6 rounded-full transition-colors relative ${dateAvailable ? "bg-emerald-500" : "bg-gray-300"}`}
                >
                  <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${dateAvailable ? "left-6" : "left-0.5"}`}></span>
                </button>
              </div>

              {dateAvailable && (
                <>
                  {/* Quick Actions */}
                  <div className="flex flex-wrap gap-2">
                    <button onClick={addAllSlots} className="text-xs px-3 py-1.5 bg-sky-100 text-sky-700 rounded-lg hover:bg-sky-200 transition-colors">Tum Saatleri Ekle</button>
                    <button onClick={markAllBusy} className="text-xs px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors">Hepsini Dolu Yap</button>
                    <button onClick={markAllAvailable} className="text-xs px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors">Hepsini Musait Yap</button>
                  </div>

                  {/* Slot Grid */}
                  <div className="max-h-[400px] overflow-y-auto space-y-1 pr-1">
                    {slots.length === 0 ? (
                      <p className="text-sm text-slate-400 text-center py-4">Saat slotu yok. "Tum Saatleri Ekle" butonuna tiklayin.</p>
                    ) : (
                      slots.map(slot => (
                        <div key={slot.time} className={`flex items-center justify-between p-2.5 rounded-lg border transition-all ${slot.busy ? "bg-red-50 border-red-200" : "bg-emerald-50 border-emerald-200"}`}>
                          <span className="font-mono font-medium text-slate-700">{slot.time}</span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => toggleSlotBusy(slot.time)}
                              className={`text-xs px-3 py-1 rounded-full font-medium transition-colors ${
                                slot.busy
                                  ? "bg-red-500 text-white hover:bg-red-600"
                                  : "bg-emerald-500 text-white hover:bg-emerald-600"
                              }`}
                            >
                              {slot.busy ? "DOLU" : "MUSAIT"}
                            </button>
                            <button
                              onClick={() => removeSlot(slot.time)}
                              className="text-slate-400 hover:text-red-500 transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </>
              )}

              {/* Save Button */}
              <button
                onClick={saveAvailability}
                disabled={saving}
                className="w-full py-3 bg-sky-600 text-white font-medium rounded-xl hover:bg-sky-700 transition-colors disabled:opacity-50"
              >
                {saving ? "Kaydediliyor..." : "Kaydet"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
