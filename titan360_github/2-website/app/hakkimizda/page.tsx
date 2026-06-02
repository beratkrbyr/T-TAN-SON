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

export default function HakkimizdaPage() {
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
  const about = c.about || {};
  const s1 = useReveal();
  const s2 = useReveal();
  const s3 = useReveal();

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <div className="h-[72px]"></div>

      {/* Hero */}
      <section className="relative py-20 md:py-28 overflow-hidden" data-testid="hakkimizda-hero">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url(https://images.unsplash.com/photo-1759722667849-1a08d026db89?w=1400&q=80)" }} />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/85 via-slate-900/70 to-slate-900/50" />
        <div className="relative page-container text-center z-10">
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/20 backdrop-blur-sm border border-emerald-400/30 rounded-full mb-6">
            <i className="fas fa-users text-emerald-400 text-sm"></i>
            <span className="text-sm font-medium text-emerald-300">Biz Kimiz?</span>
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">Hakkımızda</h1>
          <p className="text-slate-300 max-w-2xl mx-auto text-lg">TiTAN 360 ile tanışın. Antalya'nın güvenilir temizlik partneri.</p>
        </div>
      </section>

      {/* Story */}
      <section className="py-20 md:py-28" data-testid="hakkimizda-story">
        <div className="page-container" ref={s1.ref}>
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className={`transition-all duration-700 ${s1.v ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"}`}>
              <span className="inline-block px-5 py-2 bg-sky-100 text-sky-700 text-sm font-semibold rounded-full mb-4 tracking-wide uppercase">Hikayemiz</span>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-6">Temizlikte Güven ve Kalite</h2>
              <div className="space-y-4 text-slate-500 leading-relaxed">
                <p>{about.description || "TiTAN 360, Antalya'da kuruldu. Amacımız, profesyonel temizlik hizmetlerini herkes için ulaşılabilir kılmak ve yaşam alanınızı daha sağlıklı hale getirmektir."}</p>
                <p>{about.description2 || "Kurulduğumuz günden bu yana 500'den fazla mutlu müşteriye hizmet verdik ve 1000'den fazla temizlik gerçekleştirdik."}</p>
                <p>{about.description3 || "Eğitimli personelimiz, modern ekipmanlarımız ve çevre dostu temizlik ürünlerimizle evinizi ve iş yerinizi en iyi şekilde temizliyoruz."}</p>
              </div>
              <div className="flex gap-4 mt-8">
                <div className="flex items-center gap-3 px-4 py-3 bg-emerald-50 rounded-xl">
                  <i className="fas fa-shield-halved text-emerald-600 text-lg"></i>
                  <span className="text-sm font-semibold text-emerald-700">Sigortalı Hizmet</span>
                </div>
                <div className="flex items-center gap-3 px-4 py-3 bg-sky-50 rounded-xl">
                  <i className="fas fa-certificate text-sky-600 text-lg"></i>
                  <span className="text-sm font-semibold text-sky-700">Garantili Temizlik</span>
                </div>
              </div>
            </div>
            <div className={`relative transition-all duration-700 delay-300 ${s1.v ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"}`}>
              <img src={about.image || "https://images.unsplash.com/photo-1686178827149-6d55c72d81df?w=700&q=80"} alt="Temizlik ekibi" className="w-full h-[450px] object-cover rounded-3xl shadow-2xl" />
              <div className="absolute -bottom-6 -right-6 bg-gradient-to-br from-sky-600 to-sky-500 rounded-2xl p-6 text-white shadow-xl">
                <p className="text-4xl font-bold">{c.stats?.experience || "5+"}</p>
                <p className="text-sky-200 text-sm">Yıllık Deneyim</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 md:py-28 section-gray" data-testid="hakkimizda-values">
        <div className="page-container-sm" ref={s2.ref}>
          <div className={`text-center mb-16 transition-all duration-700 ${s2.v ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <span className="inline-block px-5 py-2 bg-sky-100 text-sky-700 text-sm font-semibold rounded-full mb-4 tracking-wide uppercase">Değerlerimiz</span>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">Bizi Farklı Kılan Değerler</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: "fa-handshake", title: about.value1_title || "Güvenilirlik", desc: about.value1_desc || "Referanslı, eğitimli ve sigortalı personelimiz ile evinize güvenle girebilirsiniz.", color: "from-sky-500 to-sky-400" },
              { icon: "fa-leaf", title: about.value2_title || "Çevre Dostu", desc: about.value2_desc || "Çevre dostu ve sağlığa zararsız temizlik ürünleri kullanıyoruz.", color: "from-emerald-500 to-emerald-400" },
              { icon: "fa-heart", title: about.value3_title || "Müşteri Memnuniyeti", desc: about.value3_desc || "Memnuniyetiniz bizim önceliğimiz. Memnun kalmazsanız tekrar temizlik yapıyoruz.", color: "from-amber-500 to-orange-400" },
            ].map((v, i) => (
              <div key={i} className={`bg-white rounded-2xl p-8 text-center border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-500 ${s2.v ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`} style={{ transitionDelay: `${i * 150}ms` }}>
                <div className={`w-16 h-16 bg-gradient-to-br ${v.color} rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg`}>
                  <i className={`fas ${v.icon} text-white text-2xl`}></i>
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-3">{v.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="relative py-20 md:py-24 overflow-hidden" ref={s3.ref} data-testid="hakkimizda-stats">
        <div className="absolute inset-0 bg-gradient-to-br from-sky-700 via-sky-600 to-emerald-600" />
        <div className={`relative page-container-sm z-10 transition-all duration-700 ${s3.v ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { num: c.stats?.customers || "500+", label: "Mutlu Müşteri", icon: "fa-users" },
              { num: c.stats?.cleanings || "1000+", label: "Temizlik", icon: "fa-broom" },
              { num: c.stats?.experience || "5+", label: "Yıllık Deneyim", icon: "fa-award" },
              { num: c.stats?.rating || "4.9", label: "Müşteri Puanı", icon: "fa-star" },
            ].map((s, i) => (
              <div key={i} className="group">
                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-white/20 transition-colors">
                  <i className={`fas ${s.icon} text-white text-2xl`}></i>
                </div>
                <p className="text-4xl font-bold text-white mb-1">{s.num}</p>
                <p className="text-sky-200 text-sm">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
