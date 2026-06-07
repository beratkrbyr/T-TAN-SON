"use client";
import { useEffect, useState } from "react";

interface Testimonial {
  name: string;
  text: string;
  rating: number;
  location: string;
  avatar?: string;
  hidden?: boolean;
}

interface SiteContent {
  testimonials?: Testimonial[];
  google_reviews_active?: boolean;
  google_reviews_count?: number;
  stats?: { rating?: string };
  seo_h2_4?: string;
}

const defaultTestimonials: Testimonial[] = [
  { name: "Ayşe K.", text: "TiTAN 360 ile çalıştığımızdan beri evimiz ve koltuklarımız her zaman pırıl pırıl. Çok memnunuz, kesinlikle tavsiye ederim.", rating: 5, location: "Antalya, Konyaaltı" },
  { name: "Mehmet D.", text: "Koltuk yıkama için en iyisi. Zamanında geliyorlar, işlerini çok titiz yapıyorlar. 2 yıldır düzenli müşteriyiz.", rating: 5, location: "Antalya, Muratpaşa" },
  { name: "Fatma S.", text: "Koltuk yıkama hizmeti mükemmeldi. Koltuklarımız yeni gibi oldu. Fiyatları da gayet makul.", rating: 5, location: "Antalya, Lara" },
  { name: "Ali R.", text: "Koltuk takımımızı yıkattık, harika iş çıkardılar. Ekip çok profesyonel ve güler yüzlü.", rating: 5, location: "Antalya, Kepez" },
  { name: "Zeynep B.", text: "Halı yıkama için geldiler, tüm halılarımızı pırıl pırıl yaptılar. Teşekkürler!", rating: 5, location: "Antalya, Döşemealtı" },
  { name: "Hasan Y.", text: "Düzenli koltuk yıkama yaptırıyoruz. Her seferinde aynı kalitede hizmet. Gerçekten güvenilir bir firma.", rating: 5, location: "Antalya, Konyaaltı" },
];

export default function ReviewsCarousel() {
  const [c, setC] = useState<SiteContent>({});
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const applyData = (data: any) => {
      setC(data);
    };

    try {
      const cached = localStorage.getItem("titan360_content");
      if (cached) applyData(JSON.parse(cached));
    } catch (e) {}

    fetch("/api/website-content")
      .then((r) => (r.ok ? r.json() : {}))
      .then(applyData)
      .catch(() => {});
  }, []);

  if (c.google_reviews_active === false) return null;

  const rawTestimonials = c.testimonials?.length ? c.testimonials : defaultTestimonials;
  // Filter hidden reviews
  const activeReviews = rawTestimonials.filter(t => !t.hidden);
  
  // Apply limit
  const limit = c.google_reviews_count || 6;
  const reviews = activeReviews.slice(0, limit);

  if (reviews.length === 0) return null;

  const nextSlide = () => {
    setActiveIndex((prev) => (prev + 1) % reviews.length);
  };

  const prevSlide = () => {
    setActiveIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
  };

  return (
    <section className="py-20 md:py-28 bg-slate-50 border-y border-slate-100" data-testid="google-reviews-section">
      <div className="page-container">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <svg className="w-8 h-8" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span className="text-xl font-bold text-slate-800 tracking-tight">Google Yorumları</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-800 mb-4">{c.seo_h2_4 || "Müşterilerimiz Ne Diyor?"}</h2>
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="flex text-amber-400 gap-0.5">
              {[...Array(5)].map((_, i) => (
                <i key={i} className="fas fa-star text-sm"></i>
              ))}
            </div>
            <span className="text-sm font-bold text-slate-700">{c.stats?.rating || "4.9"} / 5 Yıldız</span>
          </div>
          <p className="text-slate-500 max-w-2xl mx-auto text-base">
            Hizmet kalitemizi müşterilerimizin %100 gerçek Google yorumlarıyla tescilliyoruz.
          </p>
        </div>

        {/* Carousel Container */}
        <div className="relative max-w-4xl mx-auto px-4 md:px-12">
          {/* Card Slider wrapper */}
          <div className="overflow-hidden rounded-3xl border border-slate-200 shadow-xl bg-white p-8 md:p-12 relative min-h-[280px] flex flex-col justify-between">
            {/* Dynamic Content */}
            <div className="transition-all duration-500 ease-in-out">
              <div className="flex items-center justify-between mb-6">
                <div className="flex text-amber-400 gap-0.5">
                  {[...Array(Math.floor(reviews[activeIndex].rating || 5))].map((_, j) => (
                    <i key={j} className="fas fa-star text-base"></i>
                  ))}
                </div>
                <span className="inline-flex items-center gap-1 text-[10px] md:text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                  <i className="fas fa-check-circle"></i> Doğrulanmış Google Yorumu
                </span>
              </div>

              <blockquote className="text-slate-600 text-base md:text-lg italic leading-relaxed mb-8">
                "{reviews[activeIndex].text}"
              </blockquote>
            </div>

            {/* Author Profile details */}
            <div className="flex items-center justify-between pt-6 border-t border-slate-100 mt-auto">
              <div className="flex items-center gap-3">
                {reviews[activeIndex].avatar ? (
                  <img
                    src={reviews[activeIndex].avatar}
                    alt={reviews[activeIndex].name}
                    className="w-12 h-12 rounded-full object-cover shadow-md border border-slate-200"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gradient-to-br from-sky-500 to-sky-600 rounded-full flex items-center justify-center text-white font-extrabold text-base shadow-md">
                    {reviews[activeIndex].name ? reviews[activeIndex].name.charAt(0) : "T"}
                  </div>
                )}
                <div>
                  <p className="font-bold text-slate-800 text-sm md:text-base leading-tight">
                    {reviews[activeIndex].name}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {reviews[activeIndex].location || "Antalya Müşterimiz"}
                  </p>
                </div>
              </div>

              {/* Google G Icon */}
              <div className="text-slate-300 pr-2">
                <i className="fab fa-google text-2xl"></i>
              </div>
            </div>
          </div>

          {/* Navigation Controls */}
          {reviews.length > 1 && (
            <>
              {/* Left Arrow */}
              <button
                onClick={prevSlide}
                className="absolute left-0 md:-left-4 top-1/2 -translate-y-1/2 w-11 h-11 bg-white hover:bg-emerald-500 hover:text-white text-slate-700 rounded-full flex items-center justify-center transition-all duration-300 shadow-md border border-slate-100 cursor-pointer hover:scale-105 z-10"
                aria-label="Önceki Yorum"
              >
                <i className="fas fa-chevron-left text-sm"></i>
              </button>

              {/* Right Arrow */}
              <button
                onClick={nextSlide}
                className="absolute right-0 md:-right-4 top-1/2 -translate-y-1/2 w-11 h-11 bg-white hover:bg-emerald-500 hover:text-white text-slate-700 rounded-full flex items-center justify-center transition-all duration-300 shadow-md border border-slate-100 cursor-pointer hover:scale-105 z-10"
                aria-label="Sonraki Yorum"
              >
                <i className="fas fa-chevron-right text-sm"></i>
              </button>
            </>
          )}

          {/* Dots Indicator */}
          {reviews.length > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              {reviews.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveIndex(i)}
                  className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                    i === activeIndex ? "w-8 bg-emerald-500" : "w-2 bg-slate-300 hover:bg-slate-450"
                  }`}
                  aria-label={`Yorum ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
