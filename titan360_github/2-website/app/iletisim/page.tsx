"use client";
import { useEffect, useState, useRef } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [v, setV] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setV(true); obs.disconnect(); } }, { threshold: 0.1 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, v };
}

export default function IletisimPage() {
  const [c, setC] = useState<any>({});
  const [form, setForm] = useState({ name: "", phone: "", email: "", service: "", message: "" });
  const [sent, setSent] = useState(false);
  const [services, setServices] = useState<any[]>([]);

  useEffect(() => {
    try {
      const cachedContent = localStorage.getItem("titan360_content");
      const cachedServices = localStorage.getItem("titan360_services");
      if (cachedContent) setC(JSON.parse(cachedContent));
      if (cachedServices) setServices(JSON.parse(cachedServices));
    } catch (e) {}

    fetch("/api/website-content").then(r => r.ok ? r.json() : {}).then(setC).catch(() => {});
    fetch("/api/services").then(r => r.ok ? r.json() : []).then(setServices).catch(() => {});
  }, []);

  const contact = c.contact || {};
  const phone = contact.phone || "+90 552 363 74 25";
  const phoneClean = phone.replace(/[^0-9+]/g, "");
  const email = contact.email || "titan360.com.tr@gmail.com";
  const address = contact.address || "Antalya, Türkiye";
  const waLink = `https://wa.me/${(contact.whatsapp || phone).replace(/[^0-9]/g, "")}?text=Merhaba%20temizlik%20hizmeti%20almak%20istiyorum`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch("/api/submissions/public", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "contact",
          name: form.name,
          phone: form.phone,
          email: form.email,
          service: form.service,
          message: form.message,
        }),
      });
      setSent(true);
      setForm({ name: "", phone: "", email: "", service: "", message: "" });
    } catch {}
  };

  const s1 = useReveal();

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <div className="h-[72px]"></div>

      {/* Hero */}
      <section className="relative py-20 md:py-28 overflow-hidden" data-testid="iletisim-hero">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url(https://images.unsplash.com/photo-1759722665623-c4c1075c0a6b?w=1400&q=80)" }} />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/85 via-slate-900/70 to-slate-900/50" />
        <div className="relative page-container text-center z-10">
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/20 backdrop-blur-sm border border-emerald-400/30 rounded-full mb-6">
            <i className="fas fa-paper-plane text-emerald-400 text-sm"></i>
            <span className="text-sm font-medium text-emerald-300">Bize Ulaşın</span>
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">İletişim</h1>
          <p className="text-slate-300 max-w-2xl mx-auto text-lg">Fiyat teklifi, soru veya öneri için bize ulaşın. 1 saat içinde dönelim.</p>
        </div>
      </section>

      {/* Quick Contact Cards */}
      <section className="relative -mt-12 z-20 px-4 mb-16" data-testid="iletisim-cards">
        <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-4">
          <a href={"tel:" + phoneClean} className="group bg-white rounded-2xl p-6 shadow-xl border border-slate-100 hover:shadow-2xl hover:-translate-y-1 transition-all text-center">
            <div className="w-14 h-14 bg-gradient-to-br from-sky-500 to-sky-400 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-sky-500/20 group-hover:scale-110 transition-transform">
              <i className="fas fa-phone text-white text-xl"></i>
            </div>
            <h3 className="font-bold text-slate-800 mb-1">Telefon</h3>
            <p className="text-sky-600 font-semibold">{phone}</p>
          </a>
          <a href={waLink} target="_blank" rel="noopener noreferrer" className="group bg-white rounded-2xl p-6 shadow-xl border border-slate-100 hover:shadow-2xl hover:-translate-y-1 transition-all text-center">
            <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform">
              <i className="fab fa-whatsapp text-white text-2xl"></i>
            </div>
            <h3 className="font-bold text-slate-800 mb-1">WhatsApp</h3>
            <p className="text-emerald-600 font-semibold">Hızlı Mesaj Gönderin</p>
          </a>
          <a href={"mailto:" + email} className="group bg-white rounded-2xl p-6 shadow-xl border border-slate-100 hover:shadow-2xl hover:-translate-y-1 transition-all text-center">
            <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-400 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-500/20 group-hover:scale-110 transition-transform">
              <i className="fas fa-envelope text-white text-xl"></i>
            </div>
            <h3 className="font-bold text-slate-800 mb-1">E-posta</h3>
            <p className="text-amber-600 font-semibold text-sm">{email}</p>
          </a>
        </div>
      </section>

      {/* Form + Info */}
      <section className="py-10 md:py-16" data-testid="iletisim-form">
        <div className="page-container" ref={s1.ref}>
          <div className={`grid md:grid-cols-5 gap-12 transition-all duration-700 ${s1.v ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            {/* Left: Info */}
            <div className="md:col-span-2">
              <h2 className="text-2xl font-bold text-slate-800 mb-8">İletişim Bilgileri</h2>
              <div className="space-y-6">
                <a href={"tel:" + phoneClean} className="flex items-start gap-4 group">
                  <div className="w-12 h-12 bg-sky-50 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-sky-600 transition-colors"><i className="fas fa-phone text-sky-600 group-hover:text-white transition-colors"></i></div>
                  <div><p className="font-bold text-slate-800">Telefon</p><p className="text-slate-500 text-sm">{phone}</p></div>
                </a>
                <a href={"mailto:" + email} className="flex items-start gap-4 group">
                  <div className="w-12 h-12 bg-sky-50 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-sky-600 transition-colors"><i className="fas fa-envelope text-sky-600 group-hover:text-white transition-colors"></i></div>
                  <div><p className="font-bold text-slate-800">E-posta</p><p className="text-slate-500 text-sm">{email}</p></div>
                </a>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-sky-50 rounded-xl flex items-center justify-center flex-shrink-0"><i className="fas fa-location-dot text-sky-600"></i></div>
                  <div><p className="font-bold text-slate-800">Adres</p><p className="text-slate-500 text-sm">{address}</p></div>
                </div>
              </div>

              {/* Working Hours */}
              <div className="mt-8 p-6 bg-gradient-to-br from-sky-50 to-emerald-50/30 rounded-2xl border border-sky-100">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><i className="fas fa-clock text-sky-600"></i> Çalışma Saatleri</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between"><span className="text-slate-500">Pazartesi - Cumartesi</span><span className="font-bold text-slate-700">{contact.hours_weekday || "08:00 - 20:00"}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Pazar</span><span className="font-bold text-slate-700">{contact.hours_weekend || "10:00 - 18:00"}</span></div>
                </div>
              </div>

              {/* Map placeholder */}
              <div className="mt-6 bg-slate-100 rounded-2xl h-48 flex items-center justify-center">
                <div className="text-center">
                  <i className="fas fa-map-marker-alt text-sky-600 text-3xl mb-2"></i>
                  <p className="text-slate-500 text-sm font-semibold">Antalya - Tüm İlçelere Hizmet</p>
                </div>
              </div>
            </div>

            {/* Right: Form */}
            <div className="md:col-span-3">
              <div className="bg-white rounded-2xl p-8 md:p-10 border border-slate-100 shadow-xl">
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Ücretsiz Teklif Alın</h2>
                <p className="text-slate-500 text-sm mb-8">Formu doldurun, 1 saat içinde size dönelim.</p>
                {sent ? (
                  <div className="text-center py-16">
                    <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5">
                      <i className="fas fa-check text-emerald-600 text-3xl"></i>
                    </div>
                    <h3 className="text-2xl font-bold text-slate-800 mb-2">Mesajınız Gönderildi!</h3>
                    <p className="text-slate-500 mb-6">En kısa sürede sizinle iletişime geçeceğiz.</p>
                    <button onClick={() => setSent(false)} className="px-6 py-3 bg-sky-600 text-white font-bold rounded-xl hover:bg-sky-700 transition-colors">Yeni Mesaj Gönder</button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5" data-testid="contact-form">
                    <div className="grid md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Adınız Soyadınız *</label>
                        <input type="text" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-3.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all text-sm bg-slate-50 focus:bg-white" placeholder="Örnek: Ahmet Yılmaz" data-testid="contact-name" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Telefon *</label>
                        <input type="tel" required value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="w-full px-4 py-3.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all text-sm bg-slate-50 focus:bg-white" placeholder="0500 000 00 00" data-testid="contact-phone" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">E-posta (Opsiyonel)</label>
                      <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full px-4 py-3.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all text-sm bg-slate-50 focus:bg-white" placeholder="ornek@email.com" data-testid="contact-email" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Hizmet Seçin</label>
                      <select value={form.service} onChange={e => setForm({ ...form, service: e.target.value })} className="w-full px-4 py-3.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all text-sm bg-slate-50 focus:bg-white text-slate-600" data-testid="contact-service">
                        <option value="">Hizmet Seçin</option>
                        {services.map((s: any) => <option key={s.id} value={s.name}>{s.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Mesajınız</label>
                      <textarea rows={4} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} className="w-full px-4 py-3.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all text-sm resize-none bg-slate-50 focus:bg-white" placeholder="İhtiyacınızı kısa bir şekilde anlatın..." data-testid="contact-message"></textarea>
                    </div>
                    <button type="submit" className="w-full py-4 bg-gradient-to-r from-sky-600 to-emerald-500 text-white font-bold rounded-xl hover:from-sky-700 hover:to-emerald-600 transition-all shadow-lg shadow-sky-600/20 flex items-center justify-center gap-3 text-base" data-testid="contact-submit">
                      <i className="fas fa-paper-plane"></i> Ücretsiz Teklif İste
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
