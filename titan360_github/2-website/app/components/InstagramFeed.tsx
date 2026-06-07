"use client";
import { useEffect, useState } from "react";

interface InstagramPost {
  image: string;
  title: string;
  views: string;
  link?: string;
}

interface SiteContent {
  instagram_username?: string;
  instagram_count?: number;
  reels_posts?: InstagramPost[];
  social_instagram_active?: boolean;
  seo_h2_5?: string;
  instagram_embed_code?: string;
}

const defaultReels: InstagramPost[] = [
  { image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&q=80", title: "Detaylı Koltuk Temizleme Aşamaları", views: "12.4K İzlenme" },
  { image: "https://images.unsplash.com/photo-1558317374-067fb5f30001?w=600&q=80", title: "Yerinde Buharlı Halı Yıkama Gücü", views: "8.5K İzlenme" },
  { image: "https://images.unsplash.com/photo-1563453392212-326f5e854473?w=600&q=80", title: "Antibakteriyel Yatak Dezenfeksiyonu", views: "15.3K İzlenme" },
  { image: "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=600&q=80", title: "İnşaat Sonrası Detaylı Temizlik Süreci", views: "9.1K İzlenme" }
];

export default function InstagramFeed() {
  const [c, setC] = useState<SiteContent>({});

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

  useEffect(() => {
    if (!c.instagram_embed_code) return;
    
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(c.instagram_embed_code, "text/html");
      const scripts = doc.querySelectorAll("script");
      
      scripts.forEach((oldScript) => {
        if (oldScript.src && document.querySelector(`script[src="${oldScript.src}"]`)) return;
        
        const newScript = document.createElement("script");
        Array.from(oldScript.attributes).forEach((attr) => {
          newScript.setAttribute(attr.name, attr.value);
        });
        if (oldScript.src) {
          newScript.src = oldScript.src;
        } else {
          newScript.textContent = oldScript.textContent;
        }
        document.body.appendChild(newScript);
      });
    } catch (e) {
      console.error("Failed to parse and inject Instagram script widget:", e);
    }
  }, [c.instagram_embed_code]);

  if (c.social_instagram_active === false) return null;

  const username = c.instagram_username || "titan360tr";
  const limit = c.instagram_count || 4;
  const posts = c.reels_posts && c.reels_posts.length > 0 
    ? c.reels_posts.slice(0, limit) 
    : defaultReels.slice(0, limit);

  const profileUrl = `https://instagram.com/${username}`;

  if (c.instagram_embed_code && c.instagram_embed_code.trim().length > 0) {
    return (
      <section className="py-20 md:py-28 bg-slate-50 border-b border-slate-100" data-testid="instagram-feed-section">
        <div className="page-container">
          {/* Section Header */}
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-tr from-yellow-500/10 via-pink-500/10 to-purple-500/10 border border-pink-500/20 rounded-full mb-4">
              <i className="fab fa-instagram text-pink-600 text-sm"></i>
              <span className="text-xs font-bold text-pink-700 uppercase tracking-wider">Instagram'da @{username}</span>
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-800 mb-4">{c.seo_h2_5 || "Sosyal Medya Akışımız"}</h2>
            <p className="text-slate-500 max-w-2xl mx-auto text-base lg:text-lg">
              Bizi sosyal medyada takip ederek güncel temizlik işlemlerimizi, referanslarımızı ve öncesi/sonrası videolarımızı inceleyebilirsiniz.
            </p>
          </div>

          {/* Embed Container */}
          <div 
            className="instagram-embed-widget overflow-hidden rounded-3xl border border-slate-200 bg-white p-4 shadow-md"
            dangerouslySetInnerHTML={{ __html: c.instagram_embed_code }} 
          />
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 md:py-28 bg-slate-50 border-b border-slate-100" data-testid="instagram-feed-section">
      <div className="page-container">
        {/* Section Header */}
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-tr from-yellow-500/10 via-pink-500/10 to-purple-500/10 border border-pink-500/20 rounded-full mb-4">
            <i className="fab fa-instagram text-pink-600 text-sm"></i>
            <span className="text-xs font-bold text-pink-700 uppercase tracking-wider">Instagram'da @{username}</span>
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-800 mb-4">{c.seo_h2_5 || "Sosyal Medya Akışımız"}</h2>
          <p className="text-slate-500 max-w-2xl mx-auto text-base lg:text-lg">
            Bizi sosyal medyada takip ederek güncel temizlik işlemlerimizi, referanslarımızı ve öncesi/sonrası videolarımızı inceleyebilirsiniz.
          </p>
        </div>

        {/* Posts Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {posts.map((post, idx) => {
            const hasViews = post.views && post.views.trim().length > 0;
            return (
              <a
                key={idx}
                href={post.link || profileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative aspect-[4/5] bg-slate-100 rounded-3xl overflow-hidden shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-200"
              >
                <img
                  src={post.image || "/logo.jpeg"}
                  alt={post.title || "Instagram Post"}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
                
                {/* Dark Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent opacity-90 transition-opacity duration-300 group-hover:opacity-95" />

                {/* Reels Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-14 h-14 bg-white/25 backdrop-blur-md rounded-full flex items-center justify-center border border-white/40 opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300">
                    <i className="fas fa-play text-white text-lg ml-0.5"></i>
                  </div>
                </div>

                {/* Info Text at the Bottom */}
                <div className="absolute bottom-0 left-0 right-0 p-5 text-white flex flex-col justify-end">
                  {hasViews && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-400/20 px-2.5 py-1 rounded-full w-max mb-3">
                      <i className="fas fa-eye"></i>
                      {post.views}
                    </span>
                  )}
                  <h3 className="text-sm font-bold leading-snug line-clamp-2 mb-1 group-hover:text-emerald-400 transition-colors">
                    {post.title || "Titan360 Temizlik Süreçleri"}
                  </h3>
                  <p className="text-[10px] text-slate-300 flex items-center gap-1">
                    <i className="fab fa-instagram"></i>
                    instagram.com/{username}
                  </p>
                </div>
              </a>
            );
          })}
        </div>

        {/* Follow CTA Button */}
        <div className="text-center">
          <a
            href={profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-yellow-500 via-pink-500 to-purple-600 hover:from-yellow-600 hover:via-pink-600 hover:to-purple-700 text-white font-bold rounded-2xl shadow-lg shadow-pink-500/20 hover:shadow-pink-500/40 hover:-translate-y-0.5 transition-all text-base"
          >
            <i className="fab fa-instagram text-xl"></i>
            Hesabımızı Instagram'da Gör
          </a>
        </div>
      </div>
    </section>
  );
}
