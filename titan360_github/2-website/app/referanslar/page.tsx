"use client";
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import BeforeAfterSlider from "../components/BeforeAfterSlider";
import MobileStickyBar from "../components/MobileStickyBar";

interface TestimonialItem {
  name: string;
  text: string;
  rating: number;
  location: string;
}

interface GalleryItem {
  label: string;
  before_image: string;
  after_image: string;
}

interface SiteContent {
  testimonials?: TestimonialItem[];
  gallery?: GalleryItem[];
  contact?: { phone?: string; whatsapp?: string };
}

const defaultTestimonials = [
  { name: "Ayşe K.", text: "TiTAN 360 ile çalıştığımızdan beri evimiz ve koltuklarımız her zaman pırıl pırıl. Çok memnunuz, kesinlikle tavsiye ederim.", rating: 5, location: "Antalya, Konyaaltı" },
  { name: "Mehmet D.", text: "Koltuk yıkama için en iyisi. Zamanında geliyorlar, işlerini çok titiz yapıyorlar. 2 yıldır düzenli müşteriyiz.", rating: 5, location: "Antalya, Muratpaşa" },
  { name: "Fatma S.", text: "Koltuk yıkama hizmeti mükemmeldi. Koltuklarımız yeni gibi oldu. Fiyatları da gayet makul.", rating: 5, location: "Antalya, Lara" },
];

const defaultGallery = [
  { before: "https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=600&q=80", after: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&q=80", label: "Koltuk Yıkama" },
  { before: "https://images.unsplash.com/photo-1558317374-067fb5f30001?w=600&q=80", after: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80", label: "Halı Yıkama" },
  { before: "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=600&q=80", after: "https://images.unsplash.com/photo-1563453392212-326f5e854473?w=600&q=80", label: "Yatak Yıkama" }
];

export default function ReferanslarPage() {
  const [c, setC] = useState<SiteContent>({});
  
  useEffect(() => {
    fetch("/api/website-content")
      .then(r => r.ok ? r.json() : {})
      .then(setC)
      .catch(() => {});
  }, []);

  const phone = c.contact?.phone || "+90 552 363 74 25";
  const phoneClean = phone.replace(/[^0-9+]/g, "");
  const whatsapp = c.contact?.whatsapp || phone;
  const waNum = (whatsapp || phone).replace(/[^0-9]/g, "");
  const waLink = `https://wa.me/${waNum}?text=Merhaba%20koltuk%20y%C4%B1kama%20hizmeti%20almak%20istiyorum`;

  const testimonials = c.testimonials?.length ? c.testimonials : defaultTestimonials;
  const beforeAfterToRender = c.gallery?.length ? c.gallery.map(item => ({
    before: item.before_image,
    after: item.after_image,
    label: item.label
  })) : defaultGallery;

  return (
    <div className="min-h-screen flex flex-col bg-white overflow-hidden pb-16 md:pb-0">
      <Navbar />

      {/* Header */}
      <section className="bg-slate-900 py-16 text-white text-center relative">
        <div className="absolute inset-0 bg-cover bg-center opacity-10" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1000&q=80')` }} />
        <div className="relative page-container z-10">
          <span className="inline-block px-4 py-1.5 bg-emerald-500/20 text-emerald-300 text-xs font-bold rounded-full mb-3 tracking-widest uppercase">Referanslarımız</span>
          <h1 className="text-3xl md:text-5xl font-extrabold mb-4">Mutlu Müşteriler & Gerçek Sonuçlar</h1>
          <p className="text-slate-300 max-w-xl mx-auto text-sm sm:text-base">Müşterilerimizin memnuniyetini ve temizlik kalitemizi yansıtan gerçek fotoğraflar ve yorumlar.</p>
        </div>
      </section>

      {/* Before / After Slider Gallery */}
      <section className="py-16 md:py-24 bg-white">
        <div className="page-container">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-4xl font-bold text-slate-800 mb-2">Çalışma Sonuçlarımız</h2>
            <p className="text-slate-500 text-sm sm:text-base">Koltuk, yatak ve halılardaki farkı görmek için resimleri kaydırın.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {beforeAfterToRender.map((img, i) => (
              <div key={i} className="animate-fadeIn" style={{ animationDelay: `${i * 100}ms` }}>
                <BeforeAfterSlider
                  beforeImage={img.before}
                  afterImage={img.after}
                  title={img.label}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 md:py-24 bg-slate-50 border-t border-slate-100">
        <div className="page-container">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-4xl font-bold text-slate-800 mb-2">Google Yorumları & Değerlendirmeler</h2>
            <p className="text-slate-500 text-sm sm:text-base">Müşterilerimizin bizim için yazdığı bazı değerlendirmeler.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-md flex flex-col justify-between hover:shadow-xl transition-all duration-300">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex text-amber-400 gap-0.5">
                      {[...Array(t.rating)].map((_, j) => (
                        <i key={j} className="fas fa-star text-sm"></i>
                      ))}
                    </div>
                    <span className="flex items-center gap-1 text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">
                      <i className="fas fa-check-circle"></i> Doğrulanmış Müşteri
                    </span>
                  </div>
                  <p className="text-slate-600 leading-relaxed text-sm italic mb-6">"{t.text}"</p>
                </div>
                <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                  <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-600 text-sm">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 text-sm">{t.name}</p>
                    <p className="text-xs text-slate-400">{t.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
      <MobileStickyBar phone={phone} waLink={waLink} />
    </div>
  );
}
