"use client";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

interface ServiceItem { id: string; name: string; description: string; price: number; campaign_price?: number; image?: string; options?: { name: string; price: number }[]; slug?: string }
const iconMap: Record<string, string> = { "Ev Temizliği": "fa-home", "Ofis Temizliği": "fa-building", "Cam Temizliği": "fa-window-maximize", "Koltuk Yıkama": "fa-couch", "Halı Yıkama": "fa-rug", "İnşaat Sonrası": "fa-hard-hat", "Perde": "fa-curtain", "Yatak Yıkama": "fa-bed" };
const serviceImages: Record<string, string> = {
  "Ev Temizliği": "https://images.unsplash.com/photo-1758523670739-0d26a3ee976d?w=600&q=80",
  "Ofis Temizliği": "https://images.unsplash.com/photo-1759722667849-1a08d026db89?w=700&q=80",
  "Cam Temizliği": "https://images.unsplash.com/photo-1589999405513-56f584947885?w=600&q=80",
  "Koltuk Yıkama": "https://images.unsplash.com/photo-1686178827149-6d55c72d81df?w=600&q=80",
  "Halı Yıkama": "https://images.unsplash.com/photo-1745127262997-214698891f3c?w=600&q=80",
  "İnşaat Sonrası": "https://images.unsplash.com/photo-1581631059710-7b30fcd0e8d8?w=600&q=80",
  "Perde": "https://images.unsplash.com/photo-1597665863042-47e00964d899?w=600&q=80",
  "Yatak Yıkama": "https://images.unsplash.com/photo-1597665863042-47e00964d899?w=600&q=80",
};

const defaultServices: ServiceItem[] = [
  {
    id: "6a1f84fb1579dff44f9af7d1",
    name: "Koltuk Yıkama",
    slug: "koltuk-yikama",
    description: "Koltuk ve mobilya yıkama hizmeti.",
    price: 1250,
    options: [
      { name: "3'lü Koltuk (1 ADET)", price: 1250 },
      { name: "3'lü Koltuk (2 ADET)", price: 1700 },
      { name: "Koltuk Takımı (3+2+1)", price: 3000 },
      { name: "L Koltuk Küçük", price: 2500 },
      { name: "L Koltuk Büyük", price: 3500 },
      { name: "Sandalye Tek Taraf", price: 150 },
      { name: "Sandalye Çift Taraf", price: 231 }
    ]
  },
  {
    id: "6a1f85451579dff44f9af7d2",
    name: "Yatak Yıkama ",
    slug: "yatak-yikama",
    description: "Yerinde antibakteriyel yatak temizliği.",
    price: 1000,
    options: [
      { name: "Tek Kişilik", price: 1000 },
      { name: "Çift Kişilik", price: 1600 }
    ]
  },
  {
    id: "6a1f810f1579dff44f9af7ce",
    name: "Ev Temizliği",
    slug: "ev-temizligi",
    description: "Zeminler detaylı şekilde temizlenir, balkon, mutfak, kapılar, WC ve banyo hijyenik olarak temizlenir.",
    price: 4500,
    options: [
      { name: "45 m2 kadar", price: 4500 },
      { name: "65 m2 kadar", price: 6000 },
      { name: "90 m2 kadar", price: 7000 },
      { name: "125 m2 kadar", price: 9000 },
      { name: "125 m2 üzeri için iletişime geçiniz", price: 0 }
    ]
  },
  {
    id: "6a1f833e1579dff44f9af7cf",
    name: " İnşaat Sonrası İnce Temizlik ",
    slug: "insaat-sonrasi-ince-temizlik",
    description: "İnşaat sonrası oluşan ince toz ve kirler profesyonel ekipmanlarla detaylı şekilde temizlenir.",
    price: 8000,
    options: [
      { name: "45 m2 kadar", price: 8000 },
      { name: "65 m2 kadar", price: 9000 },
      { name: "90 m2 kadar", price: 14000 },
      { name: "125 m2 kadar", price: 18000 },
      { name: "125 m2 üstü için iletişime geçin", price: 0 }
    ]
  }
];

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

export default function HizmetlerPage() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [c, setC] = useState<any>({});
  const [activeCard, setActiveCard] = useState<number | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const hasAutoOpened = useRef(false);

  useEffect(() => {
    try {
      const cachedContent = localStorage.getItem("titan360_content");
      const cachedServices = localStorage.getItem("titan360_services");
      if (cachedContent) setC(JSON.parse(cachedContent));
      if (cachedServices) setServices(JSON.parse(cachedServices));
    } catch (e) {}

    let isMounted = true;

    Promise.all([
      fetch("/api/services").then(r => r.ok ? r.json() : []),
      fetch("/api/website-content").then(r => r.ok ? r.json() : {})
    ])
      .then(([servicesData, contentData]) => {
        if (!isMounted) return;
        setServices(servicesData || []);
        setC(contentData || {});

        try {
          localStorage.setItem("titan360_services", JSON.stringify(servicesData));
          localStorage.setItem("titan360_content", JSON.stringify(contentData));
        } catch (e) {}
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  const phone = c.contact?.phone || "+90 552 363 74 25";
  const phoneClean = phone.replace(/[^0-9+]/g, "");
  const waLink = `https://wa.me/${(c.contact?.whatsapp || phone).replace(/[^0-9]/g, "")}?text=Merhaba%20temizlik%20hizmeti%20almak%20istiyorum`;
  const servicesToRender = services.length ? services : defaultServices;

  useEffect(() => {
    if (hasAutoOpened.current || servicesToRender.length === 0) return;

    const hash = window.location.hash.substring(1);
    if (!hash) return;

    const decodedHash = decodeURIComponent(hash);
    const index = servicesToRender.findIndex(
      (s) => (s.slug && decodeURIComponent(s.slug) === decodedHash) || s.id === decodedHash
    );

    if (index !== -1) {
      setActiveCard(index);
      hasAutoOpened.current = true;

      // Scroll to the card
      setTimeout(() => {
        const element = document.getElementById(decodedHash);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 300);
    }
  }, [servicesToRender]);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <div className="h-[72px]"></div>

      {/* Hero */}
      <section className="relative py-20 md:py-28 overflow-hidden" data-testid="hizmetler-hero">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url(https://images.unsplash.com/photo-1686178827149-6d55c72d81df?w=1400&amp;q=80)" }} />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/85 via-slate-900/70 to-slate-900/50" />
        <div className="relative page-container text-center z-10">
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-sky-500/20 backdrop-blur-sm border border-sky-400/30 rounded-full mb-6">
            <i className="fas fa-sparkles text-sky-400 text-sm"></i>
            <span className="text-sm font-medium text-sky-300">Profesyonel Çözümler</span>
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">Hizmetlerimiz</h1>
          <p className="text-slate-300 max-w-2xl mx-auto text-lg">İhtiyacınıza uygun profesyonel temizlik çözümleri. Modern ekipmanlar, uzman kadro.</p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 md:py-28" data-testid="hizmetler-grid">
        <div className="page-container">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {servicesToRender.map((s, i) => (
              <div 
                key={i} 
                id={s.slug || s.id}
                onClick={(e) => {
                  if ((e.target as HTMLElement).closest("a, button")) return;
                  if (activeCard === i) {
                    setActiveCard(null);
                    window.history.pushState(null, "", window.location.pathname);
                  } else {
                    setActiveCard(i);
                    window.history.pushState(null, "", `#${s.slug || s.id}`);
                  }
                }}
                className="group relative bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-500 flex flex-col justify-between h-[420px] cursor-pointer" 
                style={{ transitionDelay: `${i * 80}ms` }}>
                
                {/* Static Card Content */}
                <div className="h-full flex flex-col justify-between">
                  <div>
                    <div className="relative h-56 overflow-hidden">
                      <img src={s.image || serviceImages[s.name] || "https://images.unsplash.com/photo-1686178827149-6d55c72d81df?w=600&amp;q=80"} alt={s.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
                      {s.campaign_price && s.campaign_price > 0 ? (
                        <div className="absolute top-4 right-4 px-3 py-1 bg-red-600 text-white text-sm font-bold rounded-lg shadow-lg flex flex-col items-center">
                          <span className="text-[10px] line-through opacity-75">{s.price} TL</span>
                          <span>{s.campaign_price} TL'den</span>
                        </div>
                      ) : (
                        <div className="absolute top-4 right-4 px-3 py-1.5 bg-emerald-500 text-white text-sm font-bold rounded-lg shadow-lg">
                          {s.price} TL'den
                        </div>
                      )}
                      <div className="absolute bottom-4 left-4 flex items-center gap-2">
                        <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-white">
                          <i className={`fas ${iconMap[s.name] || "fa-broom"}`}></i>
                        </div>
                        <h3 className="text-xl font-bold text-white">{s.name}</h3>
                      </div>
                    </div>
                    <div className="p-6">
                      <p className="text-sm text-slate-500 mb-4 leading-relaxed line-clamp-3">{s.description}</p>
                    </div>
                  </div>
                  
                  <div className="p-6 pt-0 mt-auto border-t border-slate-50">
                    <div className="flex items-center gap-3 mt-4">
                      <a href={"tel:" + phoneClean} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-sky-600/10 text-sky-700 text-sm font-bold rounded-xl hover:bg-sky-600 hover:text-white transition-colors">
                        <i className="fas fa-phone"></i> Ara
                      </a>
                      <a href={waLink} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-emerald-500/10 text-emerald-700 text-sm font-bold rounded-xl hover:bg-emerald-500 hover:text-white transition-colors">
                        <i className="fab fa-whatsapp"></i> Yaz
                      </a>
                    </div>
                  </div>
                </div>

                {/* Hover Slide-up Overlay */}
                <div className={`absolute inset-0 bg-slate-950/95 backdrop-blur-md z-20 p-6 flex flex-col justify-between transition-all duration-500 ${
                  activeCard === i ? "translate-y-0" : "translate-y-full group-hover:translate-y-0"
                }`}>
                  <div>
                    <div className="flex items-center justify-between gap-3 mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-orange-500/20 text-orange-400 rounded-xl flex items-center justify-center">
                          <i className={`fas ${iconMap[s.name] || "fa-broom"}`}></i>
                        </div>
                        <h3 className="text-lg font-bold text-white">{s.name}</h3>
                      </div>
                      {/* Close button for mobile */}
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveCard(null);
                          window.history.pushState(null, "", window.location.pathname);
                        }}
                        className="md:hidden text-slate-400 hover:text-white p-2 -mr-2 -mt-2 transition-colors"
                        aria-label="Kapat"
                      >
                        <i className="fas fa-times text-lg"></i>
                      </button>
                    </div>
                    
                    {s.options && s.options.length > 0 ? (
                      <div className="space-y-2.5 overflow-y-auto max-h-[200px] pr-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">HİZMET FİYAT DETAYLARI</p>
                        {s.options.map((opt, j) => (
                          <div key={j} className="flex justify-between items-center text-xs py-1.5 border-b border-white/5 text-slate-300">
                            <span className="flex items-center gap-1.5"><i className="fas fa-circle text-[6px] text-orange-500"></i>{opt.name}</span>
                            <span className="font-bold text-orange-400 whitespace-nowrap ml-2">{opt.price} TL</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-8 text-center">
                        {s.campaign_price && s.campaign_price > 0 ? (
                          <>
                            <span className="text-slate-400 text-xs uppercase tracking-wider block mb-1">KAMPANYALI BAŞLANGIÇ FİYATI</span>
                            <div className="flex items-center justify-center gap-3">
                              <span className="text-2xl line-through text-slate-500">{s.price} TL</span>
                              <span className="text-4xl font-extrabold text-red-500">{s.campaign_price} TL</span>
                            </div>
                          </>
                        ) : (
                          <>
                            <span className="text-slate-400 text-xs uppercase tracking-wider block mb-1">BAŞLANGIÇ FİYATI</span>
                            <p className="text-4xl font-extrabold text-orange-500">{s.price} TL</p>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2 pt-4 border-t border-white/5">
                    <Link href={`/hizmetler/${s.slug || s.id}`} className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-orange-500/20">
                      Detaylı Bilgi & Fiyat Al <i className="fas fa-arrow-right"></i>
                    </Link>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        const link = `${window.location.origin}/hizmetler#${s.slug || s.id}`;
                        navigator.clipboard.writeText(link);
                        setCopiedId(s.id);
                        setTimeout(() => setCopiedId(null), 2000);
                      }}
                      className={`w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all border ${
                        copiedId === s.id
                          ? "bg-emerald-600 border-emerald-600 text-white"
                          : "bg-white/10 hover:bg-white/20 text-white border-white/10"
                      }`}
                    >
                      {copiedId === s.id ? (
                        <>
                          <i className="fas fa-check"></i> Kopyalandı!
                        </>
                      ) : (
                        <>
                          <i className="fas fa-link"></i> Reklam & Paylaşım Linkini Kopyala
                        </>
                      )}
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-20 md:py-24 overflow-hidden" data-testid="hizmetler-cta">
        <div className="absolute inset-0 bg-gradient-to-br from-sky-700 via-sky-600 to-emerald-600" />
        <div className="relative page-container-md text-center z-10">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Özel Fiyat Teklifi Alın</h2>
          <p className="text-sky-200 mb-8 text-lg">Size özel fiyat teklifi için hemen iletişime geçin.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href={"tel:" + phoneClean} className="px-10 py-5 bg-white text-sky-700 font-bold rounded-xl hover:bg-sky-50 transition-all shadow-xl hover:-translate-y-1 text-lg min-w-[240px]">
              <i className="fas fa-phone-volume mr-3"></i>{phone}
            </a>
            <a href={waLink} target="_blank" rel="noopener noreferrer" className="px-10 py-5 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600 transition-all shadow-xl hover:-translate-y-1 text-lg min-w-[240px]">
              <i className="fab fa-whatsapp mr-3"></i>WhatsApp Yaz
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
