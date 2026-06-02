"use client";
import { useEffect, useState } from "react";

const API_URL = "";

interface Stats {
  total_bookings: number;
  pending_bookings: number;
  total_customers: number;
  total_revenue: number;
  completed_bookings: number;
  total_services: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("admin_token");
        const res = await fetch(`${API_URL}/api/admin/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) setStats(await res.json());
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const statCards = [
    {
      title: "Toplam Randevu",
      value: stats?.total_bookings || 0,
      icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
      iconBg: "bg-sky-50",
      iconColor: "text-sky-600",
      valueColor: "text-sky-700",
      barColor: "from-sky-500 to-sky-600",
    },
    {
      title: "Bekleyen",
      value: stats?.pending_bookings || 0,
      icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
      iconBg: "bg-amber-50",
      iconColor: "text-amber-600",
      valueColor: "text-amber-700",
      barColor: "from-amber-500 to-orange-500",
    },
    {
      title: "Tamamlanan",
      value: stats?.completed_bookings || 0,
      icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
      valueColor: "text-emerald-700",
      barColor: "from-emerald-500 to-green-500",
    },
    {
      title: "Toplam Müşteri",
      value: stats?.total_customers || 0,
      icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z",
      iconBg: "bg-violet-50",
      iconColor: "text-violet-600",
      valueColor: "text-violet-700",
      barColor: "from-violet-500 to-purple-500",
    },
    {
      title: "Aktif Hizmet",
      value: stats?.total_services || 0,
      icon: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10",
      iconBg: "bg-cyan-50",
      iconColor: "text-cyan-600",
      valueColor: "text-cyan-700",
      barColor: "from-cyan-500 to-teal-500",
    },
    {
      title: "Toplam Gelir",
      value: `${stats?.total_revenue || 0} TL`,
      icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
      valueColor: "text-emerald-700",
      barColor: "from-emerald-500 to-green-500",
    },
  ];

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
    <div className="space-y-6 md:space-y-8" data-testid="dashboard-page">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Dashboard</h1>
          <p className="text-slate-500 text-sm md:text-base mt-1">Hoşgeldiniz! İşletmenizin genel durumu aşağıda.</p>
        </div>
        <div className="bg-white border border-gray-200 px-4 py-2 md:px-6 md:py-3 rounded-xl shadow-sm self-start">
          <p className="text-xs md:text-sm text-slate-500">Şimdiki Zaman</p>
          <p className="text-lg md:text-xl font-semibold text-slate-800">
            {currentTime.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
        {statCards.map((card, index) => (
          <div
            key={card.title}
            className="bg-white border border-gray-200 rounded-xl shadow-sm p-3 md:p-6 animate-fadeIn"
            style={{ animationDelay: `${index * 100}ms` }}
            data-testid={`stat-card-${index}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-slate-500 text-xs md:text-sm mb-1 md:mb-2 truncate">{card.title}</p>
                <p className={`text-xl md:text-4xl font-bold ${card.valueColor} truncate`}>{card.value}</p>
              </div>
              <div className={`${card.iconBg} p-2 md:p-3 rounded-lg md:rounded-xl flex-shrink-0 ml-2`}>
                <svg className={`w-4 h-4 md:w-6 md:h-6 ${card.iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={card.icon} />
                </svg>
              </div>
            </div>
            <div className={`mt-3 md:mt-4 h-1 rounded-full bg-gradient-to-r ${card.barColor} opacity-60`}></div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white border border-gray-200 p-4 md:p-6 rounded-2xl shadow-sm">
        <h2 className="text-lg md:text-xl font-semibold text-slate-800 mb-4">Hızlı İşlemler</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <a href="/admin/bookings" className="flex flex-col items-center gap-2 md:gap-3 p-3 md:p-4 rounded-xl bg-gray-50 border border-gray-100 hover:bg-sky-50 hover:border-sky-200 transition-colors group" data-testid="quick-action-bookings">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg className="w-5 h-5 md:w-6 md:h-6 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <span className="text-xs md:text-sm text-slate-600 text-center">Yeni Randevu</span>
          </a>
          <a href="/admin/customers" className="flex flex-col items-center gap-2 md:gap-3 p-3 md:p-4 rounded-xl bg-gray-50 border border-gray-100 hover:bg-violet-50 hover:border-violet-200 transition-colors group" data-testid="quick-action-customers">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg className="w-5 h-5 md:w-6 md:h-6 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <span className="text-xs md:text-sm text-slate-600 text-center">Yeni Müşteri</span>
          </a>
          <a href="/admin/services" className="flex flex-col items-center gap-2 md:gap-3 p-3 md:p-4 rounded-xl bg-gray-50 border border-gray-100 hover:bg-cyan-50 hover:border-cyan-200 transition-colors group" data-testid="quick-action-services">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-cyan-50 border border-cyan-100 flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg className="w-5 h-5 md:w-6 md:h-6 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <span className="text-xs md:text-sm text-slate-600 text-center">Hizmetler</span>
          </a>
          <a href="/admin/settings" className="flex flex-col items-center gap-2 md:gap-3 p-3 md:p-4 rounded-xl bg-gray-50 border border-gray-100 hover:bg-amber-50 hover:border-amber-200 transition-colors group" data-testid="quick-action-settings">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg className="w-5 h-5 md:w-6 md:h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <span className="text-xs md:text-sm text-slate-600 text-center">Ayarlar</span>
          </a>
        </div>
      </div>
    </div>
  );
}
