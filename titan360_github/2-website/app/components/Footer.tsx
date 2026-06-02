"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function Footer({ hideCta = false }: { hideCta?: boolean }) {
  const [c, setC] = useState<any>({});
  useEffect(() => {
    try {
      const cachedContent = localStorage.getItem("titan360_content");
      if (cachedContent) setC(JSON.parse(cachedContent));
    } catch (e) {}

    fetch("/api/website-content")
      .then(r => r.ok ? r.json() : {})
      .then(setC)
      .catch(() => {});
  }, []);

  const contact = c.contact || {};
  const social = c.social || {};
  const phone = contact.phone || "+90 552 363 74 25";
  const email = contact.email || "titan360.com.tr@gmail.com";
  const address = contact.address || "ANTALYA";
  const waLink = `https://wa.me/${phone.replace(/[^0-9]/g, "")}?text=Merhaba%20temizlik%20hizmeti%20almak%20istiyorum`;

  return (
    <footer className="bg-slate-900 text-white mt-auto">
      {!hideCta && (
        <div className="bg-gradient-to-r from-sky-600 to-emerald-500">
          <div className="page-container py-8 md:py-10">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-center md:text-left">
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-1">Ücretsiz Teklif Alın</h3>
                <p className="text-sky-100 text-sm">Hemen bizi arayın veya formumuzu doldurun.</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <a href={"tel:" + phone.replace(/[^0-9+]/g, "")} className="flex items-center justify-center gap-3 px-8 py-4 bg-white text-sky-700 font-bold rounded-xl hover:bg-sky-50 transition-all shadow-xl text-base min-w-[220px]"><i className="fas fa-phone-volume"></i> {phone}</a>
                <a href={waLink} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-3 px-8 py-4 bg-white/15 border-2 border-white/30 text-white font-bold rounded-xl hover:bg-white/25 transition-all text-base min-w-[220px]"><i className="fab fa-whatsapp text-lg"></i> WhatsApp Yaz</a>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="page-container py-16">
        <div className="grid md:grid-cols-4 gap-10">
          <div>
            <Link href="/" className="flex items-center gap-3 mb-5">
              <img src={c.logo_url || "/logo.jpeg"} alt="TiTAN 360" className="w-12 h-12 rounded-xl object-cover" />
              <div><span className="text-xl font-extrabold block leading-tight">TiTAN <span className="text-sky-400">360</span></span><span className="text-[10px] text-slate-500 tracking-widest uppercase">Profesyonel Temizlik</span></div>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed mb-5">Profesyonel temizlik hizmetleri ile yaşam alanınızı tertemiz tutuyoruz.</p>
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 mb-5"><p className="text-emerald-400 text-sm font-semibold flex items-center gap-2"><i className="fas fa-map-marker-alt"></i> Antalya'nın tüm ilçelerine hizmet!</p></div>
            <div className="flex flex-wrap gap-2">
              {social.instagram && <a href={social.instagram} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center hover:bg-sky-600 transition-colors" title="Instagram"><i className="fab fa-instagram text-slate-400 hover:text-white"></i></a>}
              {social.facebook && <a href={social.facebook} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center hover:bg-sky-600 transition-colors" title="Facebook"><i className="fab fa-facebook-f text-slate-400 hover:text-white"></i></a>}
              {social.twitter && <a href={social.twitter} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center hover:bg-sky-600 transition-colors" title="Twitter/X"><i className="fab fa-x-twitter text-slate-400 hover:text-white"></i></a>}
              {social.linkedin && <a href={social.linkedin} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center hover:bg-sky-600 transition-colors" title="LinkedIn"><i className="fab fa-linkedin-in text-slate-400 hover:text-white"></i></a>}
              {social.youtube && <a href={social.youtube} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center hover:bg-red-600 transition-colors" title="YouTube"><i className="fab fa-youtube text-slate-400 hover:text-white"></i></a>}
              <a href={"https://wa.me/" + phone.replace(/[^0-9]/g, "")} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center hover:bg-emerald-600 transition-colors" title="WhatsApp"><i className="fab fa-whatsapp text-slate-400 hover:text-white"></i></a>
            </div>
          </div>
          <div>
            <h4 className="font-bold text-white mb-5 text-base">Hızlı Linkler</h4>
            <ul className="space-y-3">
              {[{ l: "Ana Sayfa", h: "/" }, { l: "Hizmetler", h: "/hizmetler" }, { l: "Hakkımızda", h: "/hakkimizda" }, { l: "Nasıl Çalışır", h: "/nasil-calisir" }, { l: "İletişim", h: "/iletisim" }].map(i => (
                <li key={i.h}><Link href={i.h} className="text-slate-400 hover:text-sky-400 text-sm transition-colors flex items-center gap-2"><i className="fas fa-chevron-right text-xs text-sky-600"></i>{i.l}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-white mb-5 text-base">Hizmetlerimiz</h4>
            <ul className="space-y-3">
              {["Ev Temizliği", "Ofis Temizliği", "Cam Temizliği", "Koltuk Yıkama", "Halı Yıkama", "İnşaat Sonrası"].map(s => (
                <li key={s}><Link href="/hizmetler" className="text-slate-400 hover:text-sky-400 text-sm transition-colors flex items-center gap-2"><i className="fas fa-chevron-right text-xs text-sky-600"></i>{s}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-white mb-5 text-base">İletişim</h4>
            <ul className="space-y-4">
              <li><a href={"tel:" + phone.replace(/[^0-9+]/g, "")} className="flex items-center gap-3 text-slate-400 hover:text-sky-400 text-sm transition-colors"><div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center flex-shrink-0"><i className="fas fa-phone text-sky-500"></i></div>{phone}</a></li>
              <li><a href={"mailto:" + email} className="flex items-center gap-3 text-slate-400 hover:text-sky-400 text-sm transition-colors"><div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center flex-shrink-0"><i className="fas fa-envelope text-sky-500"></i></div>{email}</a></li>
              <li><div className="flex items-center gap-3 text-slate-400 text-sm"><div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center flex-shrink-0"><i className="fas fa-clock text-sky-500"></i></div>Pazartesi - Cumartesi: 08:00 - 20:00</div></li>
              <li><div className="flex items-center gap-3 text-slate-400 text-sm"><div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center flex-shrink-0"><i className="fas fa-location-dot text-sky-500"></i></div>{address}</div></li>
            </ul>
            <a href={"tel:" + phone.replace(/[^0-9+]/g, "")} className="mt-5 flex items-center justify-center gap-2 w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors text-base shadow-lg shadow-emerald-600/20"><i className="fas fa-phone-volume"></i> HEMEN ARA</a>
          </div>
        </div>
        {/* Google Harita Entegrasyonu */}
        <div className="mt-12 rounded-2xl overflow-hidden shadow-lg border border-slate-800 h-64 w-full">
          <iframe 
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d102124.6366750379!2d30.61205629168924!3d36.89270529517596!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14c39aaeddad24fc%3A0xd64f3e1bf4c2f42a!2sAntalya!5e0!3m2!1str!2str!4v1716942000000!5m2!1str!2str" 
            width="100%" 
            height="100%" 
            style={{ border: 0 }} 
            allowFullScreen={true} 
            loading="lazy" 
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
        <div className="mt-12 pt-8 border-t border-slate-800">
          <div className="text-center mb-4"><p className="text-sky-400 text-sm font-medium"><i className="fas fa-map-marker-alt mr-2"></i>Konyaaltı, Muratpaşa, Kepez, Lara, Kundu, Döşemealtı, Aksu ve tüm Antalya ilçelerine hizmet veriyoruz.</p></div>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-slate-500 text-sm">&copy; 2025 TiTAN 360. Tüm hakları saklıdır.</p>
            <Link href="/gizlilik-politikasi" className="text-slate-500 hover:text-sky-400 text-sm transition-colors">Gizlilik Politikası</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
