"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [logo, setLogo] = useState("/logo.jpeg");
  const [social, setSocial] = useState<any>({});
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);

    try {
      const cachedContent = localStorage.getItem("titan360_content");
      if (cachedContent) {
        const data = JSON.parse(cachedContent);
        if (data.logo_url) setLogo(data.logo_url);
        if (data.social) setSocial(data.social);
      }
    } catch (e) {}

    fetch("/api/website-content")
      .then(r => r.ok ? r.json() : {})
      .then((data: any) => {
        if (data.logo_url) setLogo(data.logo_url);
        if (data.social) setSocial(data.social);
      })
      .catch(() => {});

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const links = [
    { href: "/", label: "Ana Sayfa" },
    { href: "/hizmetler", label: "Hizmetler" },
    { href: "/medya", label: "Medya" },
    { href: "/hakkimizda", label: "Hakkımızda" },
    { href: "/nasil-calisir", label: "Nasıl Çalışır" },
    { href: "/iletisim", label: "İletişim" },
  ];

  return (
    <>
      <div className="bg-slate-900 hidden md:block" data-testid="top-bar">
        <div className="page-container">
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-6 text-slate-400 text-xs">
              <span className="flex items-center gap-2"><i className="fas fa-clock text-sky-500"></i> Pazartesi - Cumartesi: 08:00 - 20:00</span>
              <span className="flex items-center gap-2"><i className="fas fa-map-marker-alt text-emerald-500"></i> Antalya & Tüm İlçeler</span>
            </div>
            <div className="flex items-center gap-4 text-slate-400 text-xs">
              <a href="mailto:titan360.com.tr@gmail.com" className="flex items-center gap-2 hover:text-white transition-colors"><i className="fas fa-envelope text-sky-500"></i> titan360.com.tr@gmail.com</a>
              <div className="flex items-center gap-2">
                <a href={social.instagram || "#"} target="_blank" rel="noopener noreferrer" className="w-6 h-6 bg-slate-800 rounded flex items-center justify-center hover:bg-sky-600 transition-colors"><i className="fab fa-instagram text-[10px]"></i></a>
                <a href={social.facebook || "#"} target="_blank" rel="noopener noreferrer" className="w-6 h-6 bg-slate-800 rounded flex items-center justify-center hover:bg-sky-600 transition-colors"><i className="fab fa-facebook-f text-[10px]"></i></a>
                {social.twitter && <a href={social.twitter} target="_blank" rel="noopener noreferrer" className="w-6 h-6 bg-slate-800 rounded flex items-center justify-center hover:bg-sky-600 transition-colors"><i className="fab fa-x-twitter text-[10px]"></i></a>}
                {social.youtube && <a href={social.youtube} target="_blank" rel="noopener noreferrer" className="w-6 h-6 bg-slate-800 rounded flex items-center justify-center hover:bg-red-600 transition-colors"><i className="fab fa-youtube text-[10px]"></i></a>}
                <a href="https://wa.me/905523637425" className="w-6 h-6 bg-slate-800 rounded flex items-center justify-center hover:bg-emerald-600 transition-colors"><i className="fab fa-whatsapp text-[10px]"></i></a>
              </div>
            </div>
          </div>
        </div>
      </div>
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 99999 }} className={`transition-all duration-300 ${scrolled ? "bg-white shadow-xl" : "bg-white/95 backdrop-blur-md shadow-sm"}`} data-testid="main-navbar">
        <div className="page-container">
          <div className="flex items-center justify-between h-16 md:h-[72px]">
            <Link href="/" className="flex items-center gap-3 group">
              <img src={logo} alt="TiTAN 360" className="w-12 h-12 rounded-xl shadow-lg object-cover" />
              <div className="flex flex-col">
                <span className="text-xl font-extrabold text-slate-800 leading-tight tracking-tight">TiTAN <span className="text-sky-600">360</span></span>
                <span className="text-[10px] text-slate-400 font-medium tracking-widest uppercase hidden sm:block">Profesyonel Temizlik</span>
              </div>
            </Link>
            <div className="hidden lg:flex items-center gap-1">
              {links.map((link) => (
                <Link key={link.href} href={link.href} className={`relative px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${pathname === link.href ? "text-sky-600" : "text-slate-600 hover:text-sky-600"}`}>
                  {link.label}
                  {pathname === link.href && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-sky-600 rounded-full"></span>}
                </Link>
              ))}
            </div>
            <div className="hidden lg:flex items-center gap-3">
              <a href="tel:+905523637425" className="flex items-center gap-2 text-sm font-bold text-slate-700 hover:text-sky-600 transition-colors">
                <div className="w-9 h-9 bg-sky-50 rounded-lg flex items-center justify-center"><i className="fas fa-phone text-sky-600 text-sm"></i></div>
                0552 363 74 25
              </a>
              <a href="https://wa.me/905523637425?text=Merhaba%20temizlik%20hizmeti%20almak%20istiyorum" target="_blank" rel="noopener noreferrer" className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-emerald-600/20 hover:shadow-emerald-600/30 flex items-center gap-2">
                <i className="fab fa-whatsapp"></i> Ücretsiz Teklif
              </a>
            </div>
            <button onClick={() => setIsOpen(!isOpen)} className="lg:hidden p-2.5 text-slate-700 hover:bg-slate-100 rounded-xl transition-colors" data-testid="mobile-menu-btn">
              <i className={`fas ${isOpen ? "fa-times" : "fa-bars"} text-xl`}></i>
            </button>
          </div>
          {isOpen && (
            <div className="lg:hidden py-4 border-t border-slate-100 bg-white animate-fadeIn">
              <div className="space-y-1">
                {links.map((link) => (
                  <Link key={link.href} href={link.href} onClick={() => setIsOpen(false)} className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold transition-colors ${pathname === link.href ? "text-sky-600 bg-sky-50" : "text-slate-600 hover:text-sky-600 hover:bg-sky-50"}`}>
                    <i className="fas fa-chevron-right text-xs text-sky-400"></i>{link.label}
                  </Link>
                ))}
                <div className="pt-4 mt-2 border-t border-slate-100 flex flex-col gap-3">
                  <a href="tel:+905523637425" className="flex items-center justify-center gap-3 px-4 py-4 bg-sky-600 text-white font-bold rounded-xl text-base shadow-lg"><i className="fas fa-phone-volume"></i> HEMEN ARA</a>
                  <a href="https://wa.me/905523637425?text=Merhaba%20temizlik%20hizmeti%20almak%20istiyorum" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-3 px-4 py-4 bg-emerald-500 text-white font-bold rounded-xl text-base shadow-lg"><i className="fab fa-whatsapp text-lg"></i> WhatsApp Yaz</a>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>
    </>
  );
}
