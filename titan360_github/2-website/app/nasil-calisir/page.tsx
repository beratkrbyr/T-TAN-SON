"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function NasilCalisirPage() {
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
  const phone = contact.phone || "+90 552 363 74 25";

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <div className="h-20"></div>
      <section className="relative py-20 md:py-28 overflow-hidden" data-testid="nasilcalisir-hero">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url(https://images.unsplash.com/photo-1758448511320-05d7d28f4298?w=1400&q=80)" }} />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/85 via-slate-900/70 to-slate-900/50" />
        <div className="relative page-container text-center z-10">
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-sky-500/20 backdrop-blur-sm border border-sky-400/30 rounded-full mb-6">
            <i className="fas fa-list-ol text-sky-400 text-sm"></i>
            <span className="text-sm font-medium text-sky-300">Sürecimiz</span>
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">Nasıl Çalışır?</h1>
          <p className="text-slate-300 max-w-2xl mx-auto text-lg text-center">3 basit adımda profesyonel temizlik hizmetinizi alın.</p>
        </div>
      </section>
      <section className="py-16 md:py-24">
        <div className="page-container-sm">
          <div className="space-y-16">
            {[
              { step: "1", icon: "fa-phone-volume", title: "Bize Ulaşın", desc: "Telefon, WhatsApp veya web sitesi üzerinden bize ulaşın. İhtiyacınızı dinleyelim ve size en uygun hizmeti önerelim. Hızlı ve kolay!", img: "https://images.unsplash.com/photo-1556745757-8d76bdb6984b?w=600&q=80", reverse: false },
              { step: "2", icon: "fa-calendar-check", title: "Randevu ve Teklif", desc: "Size uygun bir tarihte randevu oluşturalım. İhtiyacınızı dinleyelim ve net fiyat teklifi verelim.", img: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&q=80", reverse: true },
              { step: "3", icon: "fa-sparkles", title: "Profesyonel Temizlik", desc: "Eğitimli ekibimiz belirlenen tarihte gelsin, modern ekipmanlarla temizlik yapsın. Sonucu siz de görün, pırıl pırıl bir ortamın keyfini çıkarın!", img: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&q=80", reverse: false },
            ].map((s, i) => (
              <div key={i} className="grid md:grid-cols-2 gap-12 items-center">
                <div className={s.reverse ? "md:order-2" : ""}>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-sky-600 to-sky-500 rounded-2xl flex items-center justify-center shadow-lg shadow-sky-600/20"><span className="text-white font-bold text-lg">{s.step}</span></div>
                    <i className={`fas ${s.icon} text-sky-600 text-2xl`}></i>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-4">{s.title}</h2>
                  <p className="text-slate-500 leading-relaxed text-lg">{s.desc}</p>
                </div>
                <div className={s.reverse ? "md:order-1" : ""}><img src={s.img} alt={s.title} className="w-full h-[300px] object-cover rounded-2xl shadow-lg" /></div>
              </div>
            ))}
          </div>
          <div className="text-center mt-16 pt-16 border-t border-slate-100">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">Hemen Başlayalım!</h2>
            <p className="text-slate-500 mb-8">Teklif almak için bize ulaşın.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/iletisim" className="btn-primary"><i className="fas fa-paper-plane"></i> Teklif Al</Link>
              <a href={"tel:" + phone.replace(/[^0-9+]/g, "")} className="btn-secondary"><i className="fas fa-phone"></i> {phone}</a>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
