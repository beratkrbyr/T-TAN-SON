"use client";
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const API_URL = "";

export default function TakvimPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [monthData, setMonthData] = useState<Record<string, any>>({});
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const monthNames = ["Ocak","Subat","Mart","Nisan","Mayis","Haziran","Temmuz","Agustos","Eylul","Ekim","Kasim","Aralik"];
  const dayNames = ["Pzt","Sal","Car","Per","Cum","Cmt","Paz"];

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  useEffect(() => { fetchMonth(); }, [currentMonth]);

  const fetchMonth = async () => {
    setLoading(true);
    try {
      const y = currentMonth.getFullYear();
      const m = currentMonth.getMonth() + 1;
      const res = await fetch(`${API_URL}/api/availability/public?year=${y}&month=${m}`);
      if (res.ok) {
        const data = await res.json();
        const map: Record<string, any> = {};
        data.forEach((d: any) => { map[d.date] = d; });
        setMonthData(map);
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const formatDateStr = (day: number) => {
    const y = currentMonth.getFullYear();
    const m = String(currentMonth.getMonth() + 1).padStart(2, "0");
    return `${y}-${m}-${String(day).padStart(2, "0")}`;
  };

  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  let startDay = firstDay.getDay() - 1;
  if (startDay < 0) startDay = 6;

  const getDateInfo = (dateStr: string) => {
    const d = monthData[dateStr];
    if (!d || !d.available) return null;
    return d;
  };

  const prevMonth = () => { setCurrentMonth(new Date(year, month - 1)); setSelectedDate(null); };
  const nextMonth = () => { setCurrentMonth(new Date(year, month + 1)); setSelectedDate(null); };

  const selectedInfo = selectedDate ? getDateInfo(selectedDate) : null;

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 pt-20">
        {/* Hero */}
        <section className="bg-gradient-to-r from-sky-600 to-sky-700 text-white py-10 md:py-14">
          <div className="max-w-5xl mx-auto px-4 text-center">
            <h1 className="text-2xl md:text-4xl font-bold mb-2">Musaitlik Takvimi</h1>
            <p className="text-sky-100 text-sm md:text-base">Uygun gun ve saatleri gorun, hemen randevu alin</p>
          </div>
        </section>

        <div className="max-w-5xl mx-auto px-4 py-8">
          {/* Legend */}
          <div className="flex flex-wrap gap-4 mb-6 justify-center text-sm">
            <span className="flex items-center gap-2"><span className="w-4 h-4 rounded-full bg-emerald-500 inline-block"></span> Musait</span>
            <span className="flex items-center gap-2"><span className="w-4 h-4 rounded-full bg-amber-500 inline-block"></span> Kismi Dolu</span>
            <span className="flex items-center gap-2"><span className="w-4 h-4 rounded-full bg-red-500 inline-block"></span> Dolu</span>
            <span className="flex items-center gap-2"><span className="w-4 h-4 rounded-full bg-gray-300 inline-block"></span> Kapali</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Calendar */}
            <div className="md:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 p-4 md:p-6">
              <div className="flex items-center justify-between mb-5">
                <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-lg">
                  <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
                </button>
                <h2 className="text-lg md:text-xl font-bold text-slate-800">{monthNames[month]} {year}</h2>
                <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-lg">
                  <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
                </button>
              </div>

              <div className="grid grid-cols-7 gap-1 mb-1">
                {dayNames.map(d => <div key={d} className="text-center text-slate-500 text-xs font-medium py-1">{d}</div>)}
              </div>

              {loading ? (
                <div className="flex justify-center py-16">
                  <div className="w-8 h-8 border-4 border-sky-200 border-t-sky-600 rounded-full animate-spin"></div>
                </div>
              ) : (
                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: startDay }, (_, i) => <div key={`e-${i}`}></div>)}
                  {Array.from({ length: daysInMonth }, (_, i) => {
                    const day = i + 1;
                    const dateStr = formatDateStr(day);
                    const info = getDateInfo(dateStr);
                    const isSelected = dateStr === selectedDate;
                    const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();
                    const isPast = new Date(year, month, day) < new Date(new Date().setHours(0,0,0,0));

                    let bg = "bg-gray-50 border-gray-200";
                    let dot = "bg-gray-300";
                    if (info) {
                      const busyCount = (info.busy_slots || []).length;
                      const availCount = (info.available_slots || []).length;
                      const total = busyCount + availCount;
                      if (total > 0 && busyCount === total) { bg = "bg-red-50 border-red-200"; dot = "bg-red-500"; }
                      else if (busyCount > 0) { bg = "bg-amber-50 border-amber-200"; dot = "bg-amber-500"; }
                      else { bg = "bg-emerald-50 border-emerald-200"; dot = "bg-emerald-500"; }
                    }

                    return (
                      <button
                        key={day}
                        disabled={isPast}
                        onClick={() => setSelectedDate(dateStr)}
                        className={`aspect-square rounded-lg border-2 flex flex-col items-center justify-center transition-all text-xs md:text-sm
                          ${isPast ? "opacity-40 cursor-not-allowed" : "cursor-pointer hover:border-sky-400"}
                          ${isSelected ? "border-sky-500 ring-2 ring-sky-200 bg-sky-50" : bg}
                          ${isToday ? "font-bold" : ""}`}
                      >
                        <span className={isToday ? "text-sky-700" : "text-slate-700"}>{day}</span>
                        <span className={`w-2 h-2 rounded-full mt-0.5 ${dot}`}></span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Selected Date Detail */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 md:p-5">
              {!selectedDate ? (
                <div className="flex flex-col items-center justify-center h-full min-h-[250px] text-slate-400">
                  <svg className="w-10 h-10 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                  <p className="text-sm text-center">Musait saatleri gormek icin bir gun secin</p>
                </div>
              ) : (
                <div>
                  <h3 className="font-bold text-slate-800 text-lg mb-4">
                    {new Date(selectedDate).toLocaleDateString("tr-TR", { day: "numeric", month: "long", weekday: "long" })}
                  </h3>

                  {!selectedInfo ? (
                    <div className="text-center py-8">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
                      </div>
                      <p className="text-slate-500 text-sm">Bu gun icin henuz randevu acilmamistir.</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {(selectedInfo.available_slots || []).length > 0 && (
                        <>
                          <p className="text-emerald-700 font-medium text-sm mb-2">Musait Saatler:</p>
                          <div className="grid grid-cols-3 gap-2">
                            {(selectedInfo.available_slots || []).map((t: string) => (
                              <a
                                key={t}
                                href={`https://wa.me/905523637425?text=${encodeURIComponent(`Merhaba, ${new Date(selectedDate).toLocaleDateString("tr-TR", { day: "numeric", month: "long" })} saat ${t} icin randevu almak istiyorum.`)}`}
                                target="_blank"
                                className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-center py-2 rounded-lg text-sm font-medium hover:bg-emerald-100 transition-colors"
                              >
                                {t}
                              </a>
                            ))}
                          </div>
                        </>
                      )}

                      {(selectedInfo.busy_slots || []).length > 0 && (
                        <>
                          <p className="text-red-600 font-medium text-sm mt-4 mb-2">Dolu Saatler:</p>
                          <div className="grid grid-cols-3 gap-2">
                            {(selectedInfo.busy_slots || []).map((t: string) => (
                              <div key={t} className="bg-red-50 border border-red-200 text-red-400 text-center py-2 rounded-lg text-sm line-through">
                                {t}
                              </div>
                            ))}
                          </div>
                        </>
                      )}

                      <div className="mt-6 pt-4 border-t border-gray-100">
                        <a
                          href="tel:05523637425"
                          className="block w-full py-3 bg-sky-600 text-white text-center font-medium rounded-xl hover:bg-sky-700 transition-colors"
                        >
                          Hemen Ara: 0552 363 74 25
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
