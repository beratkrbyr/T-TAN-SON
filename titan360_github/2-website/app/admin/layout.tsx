"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

const menuItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: "fa-home" },
  { href: "/admin/bookings", label: "Randevular", icon: "fa-calendar-alt" },
  { href: "/admin/calendar", label: "Takvim", icon: "fa-calendar-days" },
  { href: "/admin/services", label: "Hizmetler", icon: "fa-broom" },
  { href: "/admin/blog", label: "Blog Yönetimi", icon: "fa-newspaper" },
  { href: "/admin/customers", label: "Müşteriler", icon: "fa-users" },
  { href: "/admin/website", label: "Web Sitesi", icon: "fa-globe" },
  { href: "/admin/submissions", label: "Başvurular", icon: "fa-envelope-open-text" },
  { href: "/admin/settings", label: "Ayarlar", icon: "fa-gear" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [username, setUsername] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    const name = localStorage.getItem("admin_username");
    if (!token) router.push("/admin-login");
    if (name) setUsername(name);
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) setSidebarOpen(false);
      else setSidebarOpen(true);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, [router]);

  const handleLogout = () => { localStorage.removeItem("admin_token"); localStorage.removeItem("admin_username"); router.push("/admin-login"); };
  const closeSidebar = () => { if (isMobile) setSidebarOpen(false); };

  return (
    <div className="min-h-screen flex bg-gray-50">
      {isMobile && sidebarOpen && <div className="fixed inset-0 bg-black/30 z-40" onClick={closeSidebar} />}

      {/* Sidebar */}
      <aside className={`${sidebarOpen ? "translate-x-0" : "-translate-x-full"} ${isMobile ? "fixed left-0 top-0 h-full z-50" : "relative"} w-64 bg-white border-r border-gray-200 flex flex-col transition-transform duration-300`}>
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-600 to-emerald-500 flex items-center justify-center shadow-md">
              <i className="fas fa-bolt text-white text-lg"></i>
            </div>
            <div>
              <h1 className="font-bold text-lg text-slate-800">TiTAN 360</h1>
              <p className="text-xs text-slate-400">Yönetim Paneli</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {menuItems.map(item => (
            <Link key={item.href} href={item.href} onClick={closeSidebar} className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${pathname === item.href ? "bg-sky-50 text-sky-700" : "text-slate-600 hover:bg-gray-50 hover:text-slate-800"}`}>
              <i className={`fas ${item.icon} w-5 text-center ${pathname === item.href ? "text-sky-600" : "text-slate-400"}`}></i>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-sky-500 to-emerald-400 flex items-center justify-center text-white font-semibold text-sm">
              {username?.charAt(0)?.toUpperCase() || "A"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-700 truncate">{username || "Admin"}</p>
              <p className="text-xs text-slate-400">Yönetici</p>
            </div>
            <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Çıkış">
              <i className="fas fa-sign-out-alt"></i>
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between sticky top-0 z-30">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 text-slate-500 hover:bg-gray-100 rounded-lg transition-colors">
            <i className="fas fa-bars"></i>
          </button>
          <div className="flex items-center gap-3">
            <a href="/" target="_blank" className="text-sm text-slate-500 hover:text-sky-600 transition-colors flex items-center gap-1">
              <i className="fas fa-external-link-alt text-xs"></i> Siteyi Gör
            </a>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
