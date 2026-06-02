"use client";
import { useEffect, useState, useRef } from "react";

interface SiteContent {
  instagram_username?: string;
  social?: { facebook?: string };
  contact?: { phone?: string; whatsapp?: string };
  social_instagram_active?: boolean;
  social_facebook_active?: boolean;
  social_phone_active?: boolean;
  music_active?: boolean;
  brand_music_url?: string;
}

export default function FloatingActionBar() {
  const [c, setC] = useState<SiteContent>({});
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Fetch website content settings
    fetch("/api/website-content")
      .then((r) => (r.ok ? r.json() : {}))
      .then((data) => setC(data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (c.brand_music_url) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      audioRef.current = new Audio(c.brand_music_url);
      audioRef.current.loop = true;
      
      // If was playing, resume with the new audio URL
      if (isPlaying) {
        audioRef.current.play().catch((err) => {
          console.error("Audio playback error:", err);
          setIsPlaying(false);
        });
      }
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [c.brand_music_url]);

  const togglePlay = () => {
    if (!audioRef.current) {
      if (c.brand_music_url) {
        audioRef.current = new Audio(c.brand_music_url);
        audioRef.current.loop = true;
      } else {
        return;
      }
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch((err) => {
          console.error("Playback failed:", err);
          alert("Müzik çalınamadı. Lütfen tarayıcınızın medya oynatma iznini verdiğinizden veya geçerli bir MP3 adresi girildiğinden emin olun.");
          setIsPlaying(false);
        });
    }
  };

  const phone = c.contact?.phone || "+90 552 363 74 25";
  const phoneClean = phone.replace(/[^0-9+]/g, "");
  const whatsapp = c.contact?.whatsapp || phone;
  const waNum = whatsapp.replace(/[^0-9]/g, "");
  const waLink = `https://wa.me/${waNum}?text=Merhaba%20koltuk%20y%C4%B1kama%20hizmeti%20almak%20istiyorum`;
  const instagramUser = c.instagram_username || "titan360tr";

  return (
    <div className="fixed bottom-24 right-6 z-[99999] hidden md:flex flex-col gap-3 items-center">
      {/* Instagram */}
      {c.social_instagram_active !== false && instagramUser && (
        <a 
          href={`https://instagram.com/${instagramUser}`} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="w-12 h-12 bg-gradient-to-tr from-yellow-500 via-pink-500 to-purple-500 rounded-full flex items-center justify-center text-white shadow-lg hover:scale-110 transition-transform"
          aria-label="Instagram"
        >
          <i className="fab fa-instagram text-xl"></i>
        </a>
      )}
      
      {/* Facebook */}
      {c.social_facebook_active !== false && c.social?.facebook && (
        <a 
          href={c.social.facebook} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="w-12 h-12 bg-[#1877F2] rounded-full flex items-center justify-center text-white shadow-lg hover:scale-110 transition-transform"
          aria-label="Facebook"
        >
          <i className="fab fa-facebook-f text-xl"></i>
        </a>
      )}
      
      {/* Arama */}
      {c.social_phone_active !== false && (
        <a 
          href={`tel:${phoneClean}`} 
          className="w-12 h-12 bg-sky-600 rounded-full flex items-center justify-center text-white shadow-lg hover:scale-110 transition-transform"
          aria-label="Arama"
        >
          <i className="fas fa-phone-volume text-lg"></i>
        </a>
      )}
      
      {/* Marka Müziği */}
      {c.music_active !== false && c.brand_music_url && (
        <button
          onClick={togglePlay}
          className={`w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg hover:scale-110 transition-transform cursor-pointer ${
            isPlaying ? "bg-red-500 animate-pulse" : "bg-purple-600"
          }`}
          aria-label="Marka Müziği"
        >
          <i className={`fas fa-music text-lg ${isPlaying ? "animate-spin" : ""}`}></i>
        </button>
      )}
      
      {/* WhatsApp */}
      <a 
        href={waLink} 
        target="_blank" 
        rel="noopener noreferrer" 
        className="w-14 h-14 bg-[#25D366] rounded-full flex items-center justify-center text-white shadow-lg hover:scale-110 transition-transform cursor-pointer" 
        aria-label="WhatsApp" 
        data-testid="whatsapp-float"
      >
        <i className="fab fa-whatsapp text-white text-3xl"></i>
      </a>
    </div>
  );
}
