"use client";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import BeforeAfterSlider from "./components/BeforeAfterSlider";
import LeadForm from "./components/LeadForm";
import MobileStickyBar from "./components/MobileStickyBar";
import InstagramFeed from "./components/InstagramFeed";
import ReviewsCarousel from "./components/ReviewsCarousel";

interface HeroSlide {
  image: string;
  title: string;
  subtitle: string;
  desc: string;
  badge: string;
  cta1_text?: string;
  cta1_link?: string;
  cta2_text?: string;
  cta2_link?: string;
}
interface Testimonial {
  name: string;
  text: string;
  rating: number;
  location: string;
  avatar?: string;
}

interface SiteContent {
  hero?: {
    title1?: string;
    title2?: string;
    subtitle?: string;
    badge?: string;
    image?: string;
    cta1_text?: string;
    cta1_link?: string;
    cta2_text?: string;
    cta2_link?: string;
  };
  stats?: { customers?: string; cleanings?: string; rating?: string; experience?: string };
  contact?: { phone?: string; whatsapp?: string; email?: string; address?: string };
  social?: { instagram?: string; facebook?: string };
  services_section?: { title?: string; subtitle?: string };
  whyus?: { title?: string; subtitle?: string; items?: { icon: string; title: string; desc: string }[] };
  testimonials?: Testimonial[];
  howit?: { title?: string; steps?: { icon: string; title: string; desc: string }[] };
  cta?: { title?: string; subtitle?: string };
  prices?: { name: string; price: string; icon: string }[];
  badges?: { title: string; desc: string; icon: string }[];
  gallery?: { label: string; before_image: string; after_image: string }[];
  hero_slides?: HeroSlide[];
  before_after_albums?: { title: string; images: { before_image: string; after_image: string; label: string }[] }[];
  instagram_username?: string;
  instagram_count?: number;
  reels_posts?: { image: string; title: string; views: string }[];
  prices_active?: boolean;
  show_hero_form?: boolean;
  social_instagram_active?: boolean;
  social_facebook_active?: boolean;
  social_phone_active?: boolean;
  music_active?: boolean;
  brand_music_url?: string;
  media_cover_image?: string;
  media_items?: { url: string; title: string; type: "image" | "video" }[];
  seo_h1?: string;
  seo_h2_1?: string;
  seo_h2_2?: string;
  seo_h2_3?: string;
  instagram_embed_code?: string;
  campaign_badge_bg?: string;
  campaign_badge_text?: string;
  campaign_price_color?: string;
  logo_url?: string;
}

interface ServiceItem { id: string; name: string; description: string; price: number; campaign_price?: number; image?: string; options?: any[]; slug?: string }

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

const heroSlides: HeroSlide[] = [
  {
    image: "https://images.unsplash.com/photo-1686178827149-6d55c72d81df?w=1400&q=80",
    title: "Antalya'nın 1 Numaralı",
    subtitle: "Koltuk Yıkama Hizmeti",
    desc: "Profesyonel ekibimiz, modern ekipmanlarımız ve garantili hizmetimizle koltuklarınızı pırıl pırıl yapıyoruz.",
    badge: "Aynı Gün Hizmet"
  },
  {
    image: "https://images.unsplash.com/photo-1759722667849-1a08d026db89?w=1400&q=80",
    title: "Koltuk Yıkama",
    subtitle: "Uzman Kadro",
    desc: "Koltuklarınız yeni gibi olsun! Yerinde koltuk yıkama hizmetimizle fark yaratıyoruz.",
    badge: "Yerinde Hizmet"
  },
  {
    image: "https://images.unsplash.com/photo-1758523670739-0d26a3ee976d?w=1400&q=80",
    title: "Antalya Koltuk Yıkama",
    subtitle: "Profesyonel Hizmet",
    desc: "Yerinde koltuk yıkama, halı yıkama ve yatak yıkama hizmetimizle koltuklarınız yeni gibi olsun!",
    badge: "%100 Memnuniyet"
  }
];

const defaultBadges = [
  { icon: "fa-shipping-fast", title: "Aynı Gün Hizmet", desc: "Hızlı randevu ile hemen çözüm" },
  { icon: "fa-toolbox", title: "Profesyonel Ekipman", desc: "Son teknoloji buharlı makineler" },
  { icon: "fa-map-marked-alt", title: "Antalya Geneli Hizmet", desc: "Tüm ilçelere yerinde servis" },
  { icon: "fa-heart", title: "500+ Mutlu Müşteri", desc: "Güvenilir temizlik referansı" }
];

const defaultWhyUs = [
  { icon: "fa-user-shield", title: "Güvenilir ve Sigortalı Ekip", desc: "Tüm personelimiz referanslı, eğitimli ve sigortalıdır." },
  { icon: "fa-medal", title: "Garantili Hizmet", desc: "Memnun kalmazsanız tekrar temizlik yapıyoruz, ücretsiz." },
  { icon: "fa-tags", title: "Uygun ve Şeffaf Fiyat", desc: "Gizli ücret yok. Şeffaf ve net fiyat veriyoruz." },
  { icon: "fa-headset", title: "7/24 Müşteri Desteği", desc: "Bize her zaman ulaşabilir, sorularınızı sorabilirsiniz." },
];

const defaultTestimonials: Testimonial[] = [
  { name: "Ayşe K.", text: "TiTAN 360 ile çalıştığımızdan beri evimiz ve koltuklarımız her zaman pırıl pırıl. Çok memnunuz, kesinlikle tavsiye ederim.", rating: 5, location: "Antalya, Konyaaltı" },
  { name: "Mehmet D.", text: "Koltuk yıkama için en iyisi. Zamanında geliyorlar, işlerini çok titiz yapıyorlar. 2 yıldır düzenli müşteriyiz.", rating: 5, location: "Antalya, Muratpaşa" },
  { name: "Fatma S.", text: "Koltuk yıkama hizmeti mükemmeldi. Koltuklarımız yeni gibi oldu. Fiyatları da gayet makul.", rating: 5, location: "Antalya, Lara" },
  { name: "Ali R.", text: "Koltuk takımımızı yıkattık, harika iş çıkardılar. Ekip çok profesyonel ve güler yüzlü.", rating: 5, location: "Antalya, Kepez" },
  { name: "Zeynep B.", text: "Halı yıkama için geldiler, tüm halılarımızı pırıl pırıl yaptılar. Teşekkürler!", rating: 5, location: "Antalya, Döşemealtı" },
  { name: "Hasan Y.", text: "Düzenli koltuk yıkama yaptırıyoruz. Her seferinde aynı kalitede hizmet. Gerçekten güvenilir bir firma.", rating: 5, location: "Antalya, Konyaaltı" },
];

const defaultSteps = [
  { icon: "fa-phone-volume", title: "Bizi Arayın", desc: "Telefon, WhatsApp veya web sitesi üzerinden bize ulaşın." },
  { icon: "fa-calendar-check", title: "Randevu Oluşturun", desc: "Size uygun tarih ve saatte randevu oluşturalım." },
  { icon: "fa-sparkles", title: "Temizliğin Tadını Çıkarın", desc: "Profesyonel ekibimiz gelsin, pırıl pırıl ortamın keyfini çıkarın." },
];

const galleryImages = [
  { before: "https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=600&q=80", after: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&q=80", label: "Koltuk Yıkama Öncesi / Sonrası" },
  { before: "https://images.unsplash.com/photo-1558317374-067fb5f30001?w=600&q=80", after: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80", label: "Halı Yıkama Öncesi / Sonrası" },
  { before: "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=600&q=80", after: "https://images.unsplash.com/photo-1563453392212-326f5e854473?w=600&q=80", label: "Yatak Yıkama Öncesi / Sonrası" },
];

const reelsVideos = [
  { image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=500&q=80", title: "Koltuk Yıkama Aşamaları", views: "12K İzlenme" },
  { image: "https://images.unsplash.com/photo-1558317374-067fb5f30001?w=500&q=80", title: "Leke Çıkarma Gücü", views: "8.5K İzlenme" },
  { image: "https://images.unsplash.com/photo-1563453392212-326f5e854473?w=500&q=80", title: "Yatak Dezenfeksiyonu", views: "15.3K İzlenme" },
  { image: "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=500&q=80", title: "Detaylı Temizlik Süreci", views: "9.1K İzlenme" }
];

function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold: 0.15 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

function CountUp({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const { ref, visible } = useScrollReveal();
  useEffect(() => {
    if (!visible) return;
    let start = 0;
    const duration = 2000;
    const step = Math.ceil(target / (duration / 30));
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(start);
    }, 30);
    return () => clearInterval(timer);
  }, [visible, target]);
  return <span ref={ref}>{count}{suffix}</span>;
}

const iconMap: Record<string, string> = { "Ev Temizliği": "fa-home", "Ofis Temizliği": "fa-building", "Cam Temizliği": "fa-window-maximize", "Koltuk Yıkama": "fa-couch", "Halı Yıkama": "fa-rug", "İnşaat Sonrası": "fa-hard-hat" };
const serviceImages: Record<string, string> = {
  "Ev Temizliği": "https://images.unsplash.com/photo-1758523670739-0d26a3ee976d?w=600&q=80",
  "Ofis Temizliği": "https://images.unsplash.com/photo-1759722665623-c4c1075c0a6b?w=600&q=80",
  "Cam Temizliği": "https://images.unsplash.com/photo-1589999405513-56f584947885?w=600&q=80",
  "Koltuk Yıkama": "https://images.unsplash.com/photo-1686178827149-6d55c72d81df?w=600&q=80",
  "Halı Yıkama": "https://images.unsplash.com/photo-1745127262997-214698891f3c?w=600&q=80",
  "İnşaat Sonrası": "https://images.unsplash.com/photo-1581631059710-7b30fcd0e8d8?w=600&q=80",
};



export default function HomePage() {
  const [c, setC] = useState<SiteContent>({});
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [activeSlide, setActiveSlide] = useState(0);
  const [activeAlbumIdx, setActiveAlbumIdx] = useState(0);
  const [showHeroForm, setShowHeroForm] = useState(true);

  useEffect(() => {
    try {
      const cachedContent = localStorage.getItem("titan360_content");
      const cachedServices = localStorage.getItem("titan360_services");
      if (cachedContent) setC(JSON.parse(cachedContent));
      if (cachedServices) setServices(JSON.parse(cachedServices));
    } catch (e) {}

    let isMounted = true;

    Promise.all([
      fetch("/api/website-content").then(r => r.ok ? r.json() : {}),
      fetch("/api/services").then(r => r.ok ? r.json() : [])
    ])
      .then(([contentData, servicesData]) => {
        if (!isMounted) return;
        setC(contentData || {});
        setServices(servicesData || []);

        try {
          localStorage.setItem("titan360_content", JSON.stringify(contentData));
          localStorage.setItem("titan360_services", JSON.stringify(servicesData));
        } catch (e) {}
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  const slidesToRender = c.hero_slides?.length ? c.hero_slides : heroSlides;

  // Hero slider auto-play
  useEffect(() => {
    const timer = setInterval(() => setActiveSlide(p => (p + 1) % slidesToRender.length), 6000);
    return () => clearInterval(timer);
  }, [slidesToRender.length]);

  const phone = c.contact?.phone || "+90 552 363 74 25";
  const phoneClean = phone.replace(/[^0-9+]/g, "");
  const whatsapp = c.contact?.whatsapp || phone;
  const waNum = (whatsapp || phone).replace(/[^0-9]/g, "");
  const waLink = `https://wa.me/${waNum}?text=Merhaba%20koltuk%20y%C4%B1kama%20hizmeti%20almak%20istiyorum`;
  const whyItems = c.whyus?.items?.length ? c.whyus.items : defaultWhyUs;
  const testimonials = c.testimonials?.length ? c.testimonials : defaultTestimonials;
  const steps = c.howit?.steps?.length ? c.howit.steps : defaultSteps;

  const heroBadge = c.hero?.badge || "Aynı Gün Hizmet";
  const heroTitle = c.seo_h1 || (c.hero?.title1 ? `${c.hero.title1} ${c.hero.title2 || ""}` : "Antalya'nın 1 Numaralı Koltuk Yıkama Hizmeti");
  const heroSubtitle = c.hero?.subtitle || "Aynı Gün Hizmet, %100 Memnuniyet Garantisi. Hemen Teklif Alın!";
  const cta1Text = c.hero?.cta1_text || "Hemen Fiyat Teklifi Al";
  const cta1Link = cta1Text === "Hemen Fiyat Teklifi Al" ? "#teklif-formu" : (c.hero?.cta1_link || "#teklif-formu");
  const cta2Text = c.hero?.cta2_text || "Randevu Oluştur";
  const cta2Link = cta2Text === "Randevu Oluştur" ? waLink : (c.hero?.cta2_link || "#");

  const badgesToRender = c.badges?.length ? c.badges : defaultBadges;

  // Campaign styling variables
  const badgeBg = c.campaign_badge_bg || "#dc2626";
  const badgeText = c.campaign_badge_text || "#ffffff";
  
  const defaultAlbums = [
    {
      title: "Koltuk Yıkama",
      images: [
        { before_image: "https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=600&q=80", after_image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&q=80", label: "Koltuk Temizliği" }
      ]
    },
    {
      title: "Halı Yıkama",
      images: [
        { before_image: "https://images.unsplash.com/photo-1558317374-067fb5f30001?w=600&q=80", after_image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80", label: "Halı Temizliği" }
      ]
    },
    {
      title: "Yatak Yıkama",
      images: [
        { before_image: "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=600&q=80", after_image: "https://images.unsplash.com/photo-1563453392212-326f5e854473?w=600&q=80", label: "Yatak Temizliği" }
      ]
    }
  ];
  
  const albumsToRender = c.before_after_albums?.length ? c.before_after_albums : defaultAlbums;
  
  const instagramUser = c.instagram_username || "titan360tr";
  const instagramCount = c.instagram_count || 4;
  const reelsToRender = c.reels_posts?.length ? c.reels_posts.slice(0, instagramCount) : reelsVideos.slice(0, instagramCount);

  const servicesToRender = services.length ? services : defaultServices;

  const s2 = useScrollReveal();
  const s3 = useScrollReveal();
  const s4 = useScrollReveal();
  const s5 = useScrollReveal();
  const s6 = useScrollReveal();
  const s7 = useScrollReveal();
  return (
    <div className="min-h-screen flex flex-col bg-white overflow-hidden pb-16 md:pb-0">
      <Navbar />

      {/* ===== HERO SLIDER ===== */}
      <section className="relative h-[100vh] min-h-[650px] max-h-[950px] overflow-hidden bg-slate-950" data-testid="hero-slider">
        {/* Horizontal Sliding Wrapper */}
        <div className="flex h-full w-full transition-transform duration-1000 ease-in-out" style={{ transform: `translateX(-${activeSlide * 100}%)` }}>
          {slidesToRender.map((slide, i) => (
            <div key={i} className="w-full h-full flex-shrink-0 relative flex items-center">
              {/* Background image & gradient overlay */}
              <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${slide.image})` }} />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-900/70 to-transparent" />

              {/* Text content grid */}
              <div className="relative z-10 page-container w-full">
                <div className="grid lg:grid-cols-12 gap-8 items-center">
                  <div className="lg:col-span-7 text-left">
                    <div className={`transition-all duration-700 ease-out delay-200 ${i === activeSlide ? "translate-x-0 opacity-100" : "translate-x-8 opacity-0"}`}>
                      <span className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/20 backdrop-blur-sm border border-emerald-400/30 rounded-full mb-6">
                        <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                        <span className="text-sm font-medium text-emerald-300">{slide.badge || (i === 0 ? heroBadge : "")}</span>
                      </span>
                    </div>
                    {i === 0 ? (
                      <h1 className={`text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-white mb-4 leading-tight tracking-tight transition-all duration-700 ease-out delay-300 ${i === activeSlide ? "translate-x-0 opacity-100" : "translate-x-8 opacity-0"}`}>
                        {slide.title || heroTitle}
                      </h1>
                    ) : (
                      <h2 className={`text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-white mb-4 leading-tight tracking-tight transition-all duration-700 ease-out delay-300 ${i === activeSlide ? "translate-x-0 opacity-100" : "translate-x-8 opacity-0"}`}>
                        {slide.title || ""}
                      </h2>
                    )}
                    <h2 className={`text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold mb-6 transition-all duration-700 ease-out delay-400 ${i === activeSlide ? "translate-x-0 opacity-100" : "translate-x-8 opacity-0"}`}>
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-sky-400">{slide.subtitle || (i === 0 ? heroSubtitle : "")}</span>
                    </h2>
                    <p className={`text-base lg:text-lg text-slate-300 mb-8 max-w-lg leading-relaxed transition-all duration-700 ease-out delay-500 ${i === activeSlide ? "translate-x-0 opacity-100" : "translate-x-8 opacity-0"}`}>
                      {slide.desc || (i === 0 ? "Ayni gun yerinde hizmet ve uzman temizlik kadromuz ile koltuk, hali ve yataklarinizi ilk gunku temizligine kavusturuyoruz." : "")}
                    </p>
                    <div className={`flex flex-col sm:flex-row gap-4 mb-8 transition-all duration-700 ease-out delay-600 ${i === activeSlide ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}>
                      <a 
                        href={slide.cta1_link || (i === 0 ? cta1Link : ("tel:" + phoneClean))} 
                        onClick={(e) => {
                          const targetLink = slide.cta1_link || (i === 0 ? cta1Link : ("tel:" + phoneClean));
                          if (targetLink === "#teklif-formu") {
                            e.preventDefault();
                            setShowHeroForm(true);
                            const el = document.getElementById("teklif-formu");
                            if (el) el.scrollIntoView({ behavior: "smooth" });
                          }
                        }}
                        className="group flex items-center justify-center gap-3 px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-lg transition-all shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:-translate-y-1" 
                        data-testid="hero-call-btn"
                      >
                        <i className="fas fa-phone-volume text-xl group-hover:animate-bounce"></i> {slide.cta1_text || (i === 0 ? cta1Text : "Hemen Ara")}
                      </a>
                      <a href={slide.cta2_link || (i === 0 ? cta2Link : waLink)} target={(slide.cta2_link || (i === 0 ? cta2Link : waLink)).startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" className="group flex items-center justify-center gap-3 px-8 py-4 bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white font-bold rounded-xl text-lg transition-all hover:bg-white/20 hover:text-emerald-400 hover:border-emerald-400 hover:-translate-y-1" data-testid="hero-whatsapp-btn">
                        <i className="fab fa-whatsapp text-xl"></i> {slide.cta2_text || (i === 0 ? cta2Text : "WhatsApp Yaz")}
                      </a>
                    </div>
                  </div>
                  {/* Spacer for static LeadForm on desktop */}
                  <div className="lg:col-span-5 hidden lg:block" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Static LeadForm Container (Absolutely Overlayed, does not slide or re-render) */}
        {showHeroForm && c.show_hero_form !== false && (
          <div className="absolute inset-0 pointer-events-none z-20 flex items-center">
            <div className="page-container w-full">
              <div className="grid lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-7 hidden lg:block" />
                <div className="lg:col-span-5 hidden lg:block pointer-events-auto">
                  <LeadForm onClose={() => setShowHeroForm(false)} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Left & Right Navigation Arrows */}
        {slidesToRender.length > 1 && (
          <>
            <button 
              onClick={() => setActiveSlide(p => (p - 1 + slidesToRender.length) % slidesToRender.length)} 
              className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 bg-black/40 hover:bg-emerald-500 text-white rounded-full flex items-center justify-center transition-all hover:scale-110 cursor-pointer border border-white/10 shadow-lg"
              aria-label="Önceki Görsel"
            >
              <i className="fas fa-chevron-left text-lg"></i>
            </button>
            <button 
              onClick={() => setActiveSlide(p => (p + 1) % slidesToRender.length)} 
              className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 bg-black/40 hover:bg-emerald-500 text-white rounded-full flex items-center justify-center transition-all hover:scale-110 cursor-pointer border border-white/10 shadow-lg"
              aria-label="Sonraki Görsel"
            >
              <i className="fas fa-chevron-right text-lg"></i>
            </button>
          </>
        )}

        {/* Slider Dots */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex gap-3" data-testid="hero-dots">
          {slidesToRender.map((_, i) => (
            <button key={i} onClick={() => setActiveSlide(i)} className={`transition-all duration-300 rounded-full cursor-pointer ${i === activeSlide ? "w-10 h-3 bg-emerald-400" : "w-3 h-3 bg-white/50 hover:bg-white/80"}`} aria-label={`Slide ${i + 1}`} />
          ))}
        </div>
      </section>

      {/* Güven Rozetleri (Hero Altı Hızlı Güven Alanı) */}
      <section className="bg-slate-900 border-y border-slate-800 py-6" data-testid="trust-badges-bar">
        <div className="page-container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center md:text-left">
            {badgesToRender.map((badge, idx) => (
              <div key={idx} className="flex flex-col md:flex-row items-center gap-3 justify-center md:justify-start">
                <div className="w-10 h-10 bg-sky-500/10 border border-sky-500/20 text-sky-400 rounded-xl flex items-center justify-center">
                  <i className={`fas ${badge.icon || "fa-certificate"} text-lg`}></i>
                </div>
                <div>
                  <p className="text-white text-sm font-bold">{badge.title}</p>
                  <p className="text-slate-400 text-xs">{badge.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Hızlı Teklif Formu (Mobilde Hero Altı Bölüm Olarak) */}
      {c.show_hero_form !== false && (
        <section id="teklif-formu" className="py-12 bg-slate-50 border-b border-slate-100 lg:hidden">
          <div className="px-4">
            <LeadForm />
          </div>
        </section>
      )}

      {/* ===== BEFORE / AFTER COMPARISON ===== */}
      <section className="py-20 md:py-28 bg-white border-b border-slate-100" data-testid="before-after-section">
        <div className="page-container" ref={s2.ref}>
          <div className={`text-center mb-12 transition-all duration-700 ${s2.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <span className="inline-block px-5 py-2 bg-emerald-100 text-emerald-700 text-sm font-semibold rounded-full mb-4 tracking-wide uppercase">Öncesi / Sonrası</span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-800 mb-4">{c.seo_h2_1 || "Gerçek İş Görselleriyle Farkı Görün"}</h2>
            <p className="text-slate-500 max-w-2xl mx-auto text-base lg:text-lg">Koltuk, halı ve yataklardaki inatçı lekeleri nasıl temizlediğimizi sekmelerden albüm seçerek inceleyin.</p>
          </div>

          {/* Album Tabs */}
          {albumsToRender.length > 1 && (
            <div className="flex flex-wrap justify-center gap-3 mb-10">
              {albumsToRender.map((album, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveAlbumIdx(idx)}
                  className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer ${
                    idx === activeAlbumIdx
                      ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20"
                      : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {album.title}
                </button>
              ))}
            </div>
          )}

          {/* Selected Album Images Slider Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {albumsToRender[activeAlbumIdx]?.images?.map((img, idx) => (
              <div key={idx} className="transition-all duration-500">
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 shadow-sm">
                  <p className="text-slate-800 font-bold text-sm mb-3 text-center">{img.label}</p>
                  <BeforeAfterSlider
                    beforeImage={img.before_image}
                    afterImage={img.after_image}
                    title={img.label}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== SERVICES ===== */}
      <section className="py-20 md:py-28 bg-slate-50/50" data-testid="services-section">
        <div className="page-container">
          <div className="text-center mb-16">
            <span className="inline-block px-5 py-2 bg-sky-100 text-sky-700 text-sm font-semibold rounded-full mb-4 tracking-wide uppercase">Hizmetlerimiz</span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-800 mb-4">{c.seo_h2_2 || c.services_section?.title || "Profesyonel Temizlik Çözümleri"}</h2>
            <p className="text-slate-500 max-w-2xl mx-auto text-base lg:text-lg">{c.services_section?.subtitle || "İhtiyacınıza uygun, kaliteli ve güvenilir temizlik hizmetleri sunuyoruz."}</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {servicesToRender.slice(0, 6).map((s, i) => (
              <div key={i} className="group relative rounded-2xl overflow-hidden bg-white shadow-md border border-slate-100/50 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 flex flex-col justify-between h-[360px]">
                <Link href={`/hizmetler#${s.slug || s.id}`} className="block cursor-pointer flex-1">
                  <div>
                    <div className="relative h-48 overflow-hidden">
                      <img src={s.image || serviceImages[s.name] || "https://images.unsplash.com/photo-1686178827149-6d55c72d81df?w=600&q=80"} alt={s.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/30 to-transparent" />
                      {s.campaign_price && s.campaign_price > 0 && s.campaign_price < s.price ? (
                        <div 
                          className="absolute top-4 right-4 px-3 py-1 text-xs font-bold rounded-lg shadow-md flex flex-col items-center"
                          style={{ backgroundColor: badgeBg, color: badgeText }}
                        >
                          <span className="text-[9px] line-through opacity-75">{s.price} TL</span>
                          <span>{s.campaign_price} TL'den</span>
                        </div>
                      ) : (
                        <div className="absolute top-4 right-4 px-3 py-1.5 bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-md">
                          {s.price} TL'den
                        </div>
                      )}
                    </div>
                    <div className="p-5">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 bg-sky-50 rounded-lg flex items-center justify-center text-sky-600">
                          <i className={`fas ${iconMap[s.name] || "fa-broom"}`}></i>
                        </div>
                        <h3 className="text-lg font-bold text-slate-800">{s.name}</h3>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{s.description}</p>
                    </div>
                  </div>
                </Link>
                {/* Alt CTA Butonu */}
                <div className="p-5 pt-0 border-t border-slate-50 mt-auto">
                  <Link
                    href={`/hizmetler#${s.slug || s.id}`}
                    className="flex items-center justify-center gap-2 w-full py-2.5 bg-sky-50 text-sky-700 hover:bg-sky-600 hover:text-white rounded-xl text-xs font-bold transition-all"
                  >
                    <i className="fas fa-arrow-right"></i> Fiyat Bilgisini Gör
                  </Link>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link href="/hizmetler" className="inline-flex items-center gap-2 px-8 py-4 border-2 border-sky-600 text-sky-600 font-bold rounded-xl hover:bg-sky-600 hover:text-white transition-all duration-300 text-lg group">
              Fiyat Bilgisini Gör <i className="fas fa-arrow-right transition-transform group-hover:translate-x-1"></i>
            </Link>
          </div>
        </div>
      </section>

      <ReviewsCarousel />

      <InstagramFeed />

      {/* ===== WHY US ===== */}
      <section className="py-20 md:py-28 bg-white" data-testid="why-us-section">
        <div className="page-container" ref={s5.ref}>
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className={`transition-all duration-700 ${s5.visible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"}`}>
              <span className="inline-block px-5 py-2 bg-sky-100 text-sky-700 text-sm font-semibold rounded-full mb-4 tracking-wide uppercase">Neden Biz?</span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-800 mb-6">{c.seo_h2_3 || c.whyus?.title || "Neden TİTAN 360?"}</h2>
              <p className="text-slate-500 mb-10 leading-relaxed text-lg">{c.whyus?.subtitle || "5 yıllık deneyimimiz, eğitimli kadromuz ve modern ekipmanlarımız ile Antalya'nın en güvenilir temizlik hizmetini sunuyoruz."}</p>
              <div className="space-y-6">
                {whyItems.map((item, i) => (
                  <div key={i} className="flex gap-5 items-start group" style={{ transitionDelay: `${i * 100}ms` }}>
                    <div className="w-14 h-14 bg-gradient-to-br from-sky-100 to-sky-50 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all">
                      <i className={`fas ${item.icon} text-sky-600 text-lg`}></i>
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-lg mb-1">{item.title}</h3>
                      <p className="text-slate-500 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className={`relative hidden md:block transition-all duration-700 delay-300 ${s5.visible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"}`}>
              <div className="relative">
                <img src="https://images.unsplash.com/photo-1759722667849-1a08d026db89?w=700&q=80" alt="Temizlik ekibi" className="w-full h-[550px] object-cover rounded-3xl shadow-2xl" />
                <div className="absolute -top-6 -right-6 bg-white rounded-2xl p-5 shadow-2xl border border-slate-100 animate-float">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex text-amber-400">{[1,2,3,4,5].map(j => <i key={j} className="fas fa-star text-sm"></i>)}</div>
                  </div>
                  <p className="text-2xl font-bold text-slate-800">{c.stats?.rating || "4.9"}</p>
                  <p className="text-xs text-slate-500">Müşteri Puanı</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials section removed, replaced by ReviewsCarousel above */}

      {/* ===== FINAL CTA ===== */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-sky-700 via-sky-600 to-emerald-600" />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-300 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
        </div>
        <div className="relative page-container-md text-center z-10">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">{c.cta?.title || "Hemen Arayın, Aynı Gün Geliyoruz!"}</h2>
          <p className="text-sky-200 mb-10 max-w-2xl mx-auto text-lg">{c.cta?.subtitle || "Profesyonel temizlik için bir telefon kadar yakınız."}</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href={"tel:" + phoneClean} className="px-10 py-5 bg-white text-sky-700 font-bold rounded-xl hover:bg-sky-50 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 text-lg min-w-[260px]">
              <i className="fas fa-phone-volume mr-3"></i> {phone}
            </a>
            <a href={waLink} target="_blank" rel="noopener noreferrer" className="px-10 py-5 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600 transition-all shadow-xl hover:-translate-y-1 text-lg min-w-[260px]">
              <i className="fab fa-whatsapp mr-3 text-xl"></i> WhatsApp Yaz
            </a>
          </div>
        </div>
      </section>

      <Footer hideCta={true} />



      {/* Mobil Sticky Bottom Bar */}
      <MobileStickyBar phone={phone} waLink={waLink} />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            "name": "TiTAN 360",
            "image": "https://titan360.com.tr/logo.jpeg",
            "@id": "https://titan360.com.tr/#organization",
            "url": "https://titan360.com.tr",
            "telephone": phoneClean,
            "address": {
              "@type": "PostalAddress",
              "streetAddress": c.contact?.address || "Antalya, Türkiye",
              "addressLocality": "Antalya",
              "addressCountry": "TR"
            },
            "geo": {
              "@type": "GeoCoordinates",
              "latitude": 36.8848,
              "longitude": 30.7040
            },
            "openingHoursSpecification": [
              {
                "@type": "OpeningHoursSpecification",
                "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
                "opens": "08:00",
                "closes": "20:00"
              },
              {
                "@type": "OpeningHoursSpecification",
                "dayOfWeek": ["Saturday", "Sunday"],
                "opens": "10:00",
                "closes": "18:00"
              }
            ]
          })
        }}
      />
    </div>
  );
}
