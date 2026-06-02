"use client";
import { useEffect, useState, useRef } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

interface MediaItem {
  url: string;
  title: string;
  type: "image" | "video";
}

const defaultMediaItems: MediaItem[] = [
  { url: "https://images.unsplash.com/photo-1686178827149-6d55c72d81df?w=800&q=80", title: "Detaylı Koltuk Yıkama İşlemi", type: "image" },
  { url: "https://images.unsplash.com/photo-1759722667849-1a08d026db89?w=800&q=80", title: "Koltuk Lekesi Çıkarma Öncesi", type: "image" },
  { url: "https://images.unsplash.com/photo-1745127262997-214698891f3c?w=800&q=80", title: "Buharlı Halı Temizliği", type: "image" },
  { url: "https://images.unsplash.com/photo-1563453392212-326f5e854473?w=800&q=80", title: "Antibakteriyel Yatak Yıkama", type: "image" }
];

export default function MedyaPage() {
  const [c, setC] = useState<any>({});
  const [mediaItems, setMediaItems] = useState<MediaItem[]>(defaultMediaItems);
  const [filter, setFilter] = useState<"all" | "image" | "video">("all");
  const [lightbox, setLightbox] = useState<MediaItem | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === "left" ? scrollLeft - clientWidth * 0.7 : scrollLeft + clientWidth * 0.7;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
    }
  };

  useEffect(() => {
    try {
      const cachedContent = localStorage.getItem("titan360_content");
      if (cachedContent) {
        const data = JSON.parse(cachedContent);
        setC(data);
        if (data.media_items && data.media_items.length > 0) {
          setMediaItems(data.media_items);
        }
      }
    } catch (e) {}

    fetch("/api/website-content")
      .then((r) => (r.ok ? r.json() : {}))
      .then((data: any) => {
        setC(data);
        if (data.media_items && data.media_items.length > 0) {
          setMediaItems(data.media_items);
        }
      })
      .catch(() => {});
  }, []);

  const filteredItems = mediaItems.filter(
    (item) => filter === "all" || item.type === filter
  );

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-800">
      <Navbar />
      <div className="h-20"></div>

      {/* Hero Header with Background Image (Same as other subpages) */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center" 
          style={{ backgroundImage: `url(${c.media_cover_image || "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1400&q=80"})` }} 
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/85 via-slate-900/70 to-slate-900/50" />
        <div className="relative page-container text-center z-10">
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-sky-500/20 backdrop-blur-sm border border-sky-400/30 rounded-full mb-6">
            <i className="fas fa-photo-video text-sky-400 text-sm"></i>
            <span className="text-sm font-medium text-sky-300">Galerimiz</span>
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">Medya</h1>
          <p className="text-slate-300 max-w-2xl mx-auto text-lg text-center">
            İşlerimizden ve temizlik süreçlerimizden fotoğraf ve videolar.
          </p>
        </div>
      </section>

      {/* Main Content Section */}
      <main className="flex-grow py-16 md:py-24 bg-slate-50/50">
        <div className="page-container">
          
          {/* Filters (Clean design matching before/after slider tabs) */}
          <div className="flex justify-center gap-3 mb-12">
            {[
              { id: "all", label: "Tümü" },
              { id: "image", label: "Fotoğraflar" },
              { id: "video", label: "Videolar" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id as any)}
                className={`px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  filter === tab.id
                    ? "bg-sky-600 text-white shadow-md shadow-sky-600/20"
                    : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-800"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Grid of Media Items */}
          {filteredItems.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm max-w-lg mx-auto">
              <i className="fas fa-photo-video text-slate-400 text-4xl mb-4"></i>
              <p className="text-slate-500">Bu kategoride henüz medya bulunmamaktadır.</p>
            </div>
          ) : (
            <div className="relative group/slider px-4 md:px-8">
              {/* Left Arrow Button */}
              <button
                onClick={() => scroll("left")}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white/95 hover:bg-sky-600 hover:text-white text-slate-700 rounded-full flex items-center justify-center transition-all hover:scale-110 shadow-md border border-slate-200 cursor-pointer -ml-2 md:-ml-4 opacity-100 md:opacity-0 md:group-hover/slider:opacity-100"
                aria-label="Önceki Medya"
              >
                <i className="fas fa-chevron-left text-lg"></i>
              </button>

              {/* Slider Container */}
              <div
                ref={scrollRef}
                className="flex gap-6 overflow-x-auto pb-6 snap-x snap-mandatory scroll-smooth"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
              >
                {filteredItems.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => setLightbox(item)}
                    className="snap-start flex-shrink-0 w-[82vw] sm:w-[48vw] md:w-[38vw] lg:w-[28vw] min-w-[280px] bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 cursor-pointer"
                  >
                    <div className="aspect-[4/3] w-full bg-slate-950 relative overflow-hidden flex items-center justify-center">
                      {item.type === "video" ? (
                        <div className="w-full h-full relative">
                          <video
                            src={item.url}
                            className="w-full h-full object-cover"
                            preload="metadata"
                          />
                          <div className="absolute inset-0 bg-black/45 flex items-center justify-center">
                            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30">
                              <i className="fas fa-play text-white text-sm ml-0.5"></i>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <img
                          src={item.url}
                          alt={item.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      )}
                    </div>
                    <div className="p-5">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold mb-2 ${
                        item.type === "video" ? "bg-purple-50 text-purple-600" : "bg-sky-50 text-sky-600"
                      }`}>
                        {item.type === "video" ? "Video" : "Fotoğraf"}
                      </span>
                      <h3 className="font-bold text-slate-800 text-sm line-clamp-1 group-hover:text-sky-600 transition-colors">
                        {item.title || "Temizlik Uygulaması"}
                      </h3>
                    </div>
                  </div>
                ))}
              </div>

              {/* Right Arrow Button */}
              <button
                onClick={() => scroll("right")}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white/95 hover:bg-sky-600 hover:text-white text-slate-700 rounded-full flex items-center justify-center transition-all hover:scale-110 shadow-md border border-slate-200 cursor-pointer -mr-2 md:-mr-4 opacity-100 md:opacity-0 md:group-hover/slider:opacity-100"
                aria-label="Sonraki Medya"
              >
                <i className="fas fa-chevron-right text-lg"></i>
              </button>
            </div>
          )}
        </div>
      </main>

      <Footer />

      {/* Lightbox Modal */}
      {lightbox && (
        <div className="fixed inset-0 z-[999999] bg-black/95 flex items-center justify-center p-4">
          <button
            onClick={() => setLightbox(null)}
            className="absolute top-6 right-6 w-12 h-12 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center text-lg transition-colors border border-white/10 cursor-pointer"
            aria-label="Kapat"
          >
            <i className="fas fa-times"></i>
          </button>
          
          <div className="max-w-4xl w-full max-h-[80vh] flex flex-col items-center">
            {lightbox.type === "video" ? (
              <video
                src={lightbox.url}
                controls
                autoPlay
                className="max-w-full max-h-[70vh] rounded-xl object-contain shadow-2xl"
              />
            ) : (
              <img
                src={lightbox.url}
                alt={lightbox.title}
                className="max-w-full max-h-[70vh] rounded-xl object-contain shadow-2xl"
              />
            )}
            <h3 className="text-white text-base md:text-lg font-bold mt-4 text-center">
              {lightbox.title}
            </h3>
          </div>
        </div>
      )}
    </div>
  );
}
