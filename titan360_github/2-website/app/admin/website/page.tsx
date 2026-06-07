"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

const API_URL = "/api";

const uploadImage = async (file: File): Promise<string> => {
  const token = localStorage.getItem("admin_token");
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${API_URL}/admin/upload`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || res.statusText || "Görsel yüklenemedi");
  }
  const data = await res.json();
  return data.url;
};

interface WhyUsItem { icon: string; title: string; desc: string }
interface TestimonialItem { name: string; text: string; rating: number; location: string; avatar?: string }
interface HowItStep { icon: string; title: string; desc: string }
interface PriceItem { name: string; price: string; icon: string }
interface GalleryItem { label: string; before_image: string; after_image: string }
interface BadgeItem { icon: string; title: string; desc: string }
interface HeroSlideItem { image: string; title: string; subtitle: string; desc: string; badge: string; cta1_text?: string; cta1_link?: string; cta2_text?: string; cta2_link?: string }
interface BeforeAfterAlbumItem { title: string; images: { before_image: string; after_image: string; label: string }[] }
interface InstagramReelsItem { image: string; title: string; views: string }

interface WebsiteContent {
  gallery: GalleryItem[];
  prices: PriceItem[];
  badges: BadgeItem[];
  hero: { 
    title1: string; 
    title2: string; 
    subtitle: string; 
    badge: string; 
    image: string;
    cta1_text: string;
    cta1_link: string;
    cta2_text: string;
    cta2_link: string;
  };
  stats: { customers: string; cleanings: string; rating: string; experience: string };
  contact: { phone: string; email: string; address: string; whatsapp: string; hours_weekday: string; hours_weekend: string };
  social: { instagram: string; facebook: string; twitter?: string; linkedin?: string; youtube?: string };
  about: { title: string; description: string; description2: string; description3: string; image: string; value1_title: string; value1_desc: string; value2_title: string; value2_desc: string; value3_title: string; value3_desc: string };
  services_section: { title: string; subtitle: string };
  whyus: { title: string; subtitle: string; items: WhyUsItem[] };
  testimonials: TestimonialItem[];
  howit: { title: string; steps: HowItStep[] };
  cta: { title: string; subtitle: string };
  
  // New CMS configurations
  hero_slides?: HeroSlideItem[];
  before_after_albums?: BeforeAfterAlbumItem[];
  instagram_username?: string;
  instagram_count?: number;
  reels_posts?: InstagramReelsItem[];
  prices_active?: boolean;
  seo_title?: string;
  seo_description?: string;
  negative_keywords?: string;
  
  // Custom Floating and Media Options
  show_hero_form?: boolean;
  social_instagram_active?: boolean;
  social_facebook_active?: boolean;
  social_phone_active?: boolean;
  music_active?: boolean;
  brand_music_url?: string;
  media_cover_image?: string;
  media_items?: { url: string; title: string; type: "image" | "video" }[];
  logo_url?: string;

  // Theme styling & campaign banner settings
  primary_color?: string;
  secondary_color?: string;
  campaign_percent?: number;
  campaign_badge_bg?: string;
  campaign_badge_text?: string;
  campaign_price_color?: string;
  banner_active?: boolean;
  banner_text?: string;
  banner_link?: string;
  banner_bg_color?: string;
  banner_text_color?: string;

  // Google Reviews
  google_reviews_active?: boolean;
  google_reviews_count?: number;

  // Headings & keywords
  seo_keywords?: string;
  seo_h1?: string;
  seo_h2_1?: string;
  seo_h2_2?: string;
  seo_h2_3?: string;
  seo_h2_4?: string;
  seo_h2_5?: string;
  seo_h3_1?: string;
  seo_h3_2?: string;
  instagram_embed_code?: string;
}

const defaults: WebsiteContent = {
  gallery: [
    { label: "Koltuk Yıkama Öncesi / Sonrası", before_image: "https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=600&q=80", after_image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&q=80" },
  ],
  prices: [
    { name: "Tekli Koltuk", price: "150 TL", icon: "fa-couch" },
    { name: "L Koltuk", price: "500 TL", icon: "fa-couch" },
  ],
  badges: [
    { icon: "fa-shipping-fast", title: "Aynı Gün Hizmet", desc: "Hızlı randevu ile hemen çözüm" },
  ],
  hero: { 
    title1: "TiTAN 360 | Antalya’nın En Hızlı ve Güvenilir", 
    title2: "Koltuk Yıkama Merkezi", 
    subtitle: "Aynı Gün Hizmet, %100 Memnuniyet Garantisi. Hemen Teklif Alın!", 
    badge: "Antalya'nın 1 Numaralı Temizlik Şirketi", 
    image: "",
    cta1_text: "Hemen Fiyat Teklifi Al",
    cta1_link: "#teklif-formu",
    cta2_text: "Randevu Oluştur",
    cta2_link: "#"
  },
  stats: { customers: "500+", cleanings: "1000+", rating: "4.9", experience: "5+" },
  contact: { phone: "+90 552 363 74 25", email: "titan360.com.tr@gmail.com", address: "Antalya, Turkiye", whatsapp: "+90 552 363 74 25", hours_weekday: "08:00 - 20:00", hours_weekend: "10:00 - 18:00" },
  social: { instagram: "", facebook: "", twitter: "", linkedin: "", youtube: "" },
  about: { title: "Hakkimizda", description: "TiTAN 360, Antalya'da kuruldu.", description2: "", description3: "", image: "", value1_title: "Guvenilirlik", value1_desc: "", value2_title: "", value2_desc: "", value3_title: "", value3_desc: "" },
  services_section: { title: "Profesyonel Temizlik Cozumleri", subtitle: "Ihtiyaciniza uygun, kaliteli ve guvenilir temizlik hizmetleri sunuyoruz." },
  whyus: { title: "Neden TiTAN 360?", subtitle: "", items: [] },
  testimonials: [],
  howit: { title: "3 Adimda Temizlik", steps: [] },
  cta: { title: "Ucretsiz Teklif Alin", subtitle: "" },
  
  hero_slides: [
    { image: "https://images.unsplash.com/photo-1686178827149-6d55c72d81df?w=1400&q=80", title: "Antalya'nın 1 Numaralı", subtitle: "Koltuk Yıkama Hizmeti", desc: "Profesyonel ekibimiz, modern ekipmanlarımız ve garantili hizmetimizle koltuklarınızı pırıl pırıl yapıyoruz.", badge: "Aynı Gün Hizmet", cta1_text: "Hemen Fiyat Teklifi Al", cta1_link: "#teklif-formu", cta2_text: "Randevu Oluştur", cta2_link: "" },
    { image: "https://images.unsplash.com/photo-1759722667849-1a08d026db89?w=1400&q=80", title: "Koltuk Yıkama", subtitle: "Uzman Kadro", desc: "Koltuklarınız yeni gibi olsun! Yerinde koltuk yıkama hizmetimizle fark yaratıyoruz.", badge: "Yerinde Hizmet", cta1_text: "Hemen Ara", cta1_link: "", cta2_text: "WhatsApp Yaz", cta2_link: "" },
    { image: "https://images.unsplash.com/photo-1758523670739-0d26a3ee976d?w=1400&q=80", title: "Antalya Koltuk Yıkama", subtitle: "Profesyonel Hizmet", desc: "Yerinde koltuk yıkama, halı yıkama ve yatak yıkama hizmetimizle koltuklarınız yeni gibi olsun!", badge: "%100 Memnuniyet", cta1_text: "Hemen Ara", cta1_link: "", cta2_text: "WhatsApp Yaz", cta2_link: "" }
  ],
  before_after_albums: [
    { title: "Koltuk Yıkama", images: [{ before_image: "https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=600&q=80", after_image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&q=80", label: "Koltuk Temizliği" }] }
  ],
  instagram_username: "titan360tr",
  instagram_count: 4,
  reels_posts: [],
  prices_active: true,
  seo_title: "",
  seo_description: "",
  negative_keywords: "",
  show_hero_form: true,
  social_instagram_active: true,
  social_facebook_active: true,
  social_phone_active: true,
  music_active: true,
  brand_music_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
  media_cover_image: "",
  media_items: [],
  logo_url: "",

  primary_color: "#059669",
  secondary_color: "#0284c7",
  campaign_percent: 20,
  campaign_badge_bg: "#dc2626",
  campaign_badge_text: "#ffffff",
  campaign_price_color: "#ef4444",
  banner_active: false,
  banner_text: "Titan360 ile temizlikte farkı yaşayın! Detaylı koltuk ve halı yıkamada indirim!",
  banner_link: "",
  banner_bg_color: "#059669",
  banner_text_color: "#ffffff",
  google_reviews_active: true,
  google_reviews_count: 6,
  seo_keywords: "",
  seo_h1: "",
  seo_h2_1: "",
  seo_h2_2: "",
  seo_h2_3: "",
  seo_h2_4: "",
  seo_h2_5: "",
  seo_h3_1: "",
  seo_h3_2: "",
  instagram_embed_code: ""
};

const tabs = [
  { id: "general", label: "Genel Ayarlar", icon: "fas fa-cog" },
  { id: "banner", label: "Kampanya Bannerı", icon: "fas fa-bullhorn" },
  { id: "media", label: "Medya Sayfası", icon: "fas fa-photo-video" },
  { id: "hero_slides", label: "Kahraman Slider", icon: "fas fa-images" },
  { id: "before_after_albums", label: "Önce/Sonra Albümleri", icon: "fas fa-columns" },
  { id: "instagram", label: "Sosyal Medya (Instagram)", icon: "fab fa-instagram" },
  { id: "seo_ads", label: "SEO & Google Ads", icon: "fas fa-search-dollar" },
  { id: "prices", label: "Fiyat Listesi", icon: "fas fa-tags" },
  { id: "hero", label: "Ana Sayfa Başı", icon: "fas fa-home" },
  { id: "stats", label: "İstatistikler", icon: "fas fa-chart-bar" },
  { id: "badges", label: "Güven Rozetleri", icon: "fas fa-shield-halved" },
  { id: "services_section", label: "Hizmetler Bölümü", icon: "fas fa-broom" },
  { id: "whyus", label: "Neden Biz", icon: "fas fa-star" },
  { id: "testimonials", label: "Müşteri Yorumları", icon: "fas fa-comment" },
  { id: "about", label: "Hakkımızda Sayfası", icon: "fas fa-info-circle" },
  { id: "contact", label: "İletişim Bilgileri", icon: "fas fa-phone" },
];

export default function WebsiteSettingsPage() {
  const [content, setContent] = useState<WebsiteContent>(defaults);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  const [msg, setMsg] = useState<{ type: string; text: string } | null>(null);
  const [uploadingIdx, setUploadingIdx] = useState<number | null>(null);
  const [uploadingMusic, setUploadingMusic] = useState(false);

  const handleImageUpload = async (file: File, index: number) => {
    setUploadingIdx(index);
    try {
      const url = await uploadImage(file);
      const slides = [...(content.hero_slides || [])];
      slides[index] = { ...slides[index], image: url };
      setContent((p: any) => ({ ...p, hero_slides: slides }));
    } catch (err: any) {
      alert(`Görsel yükleme hatası: ${err.message}`);
    } finally {
      setUploadingIdx(null);
    }
  };

  useEffect(() => { fetchContent(); }, []);

  const fetchContent = async () => {
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`${API_URL}/admin/website-content`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setContent({
          ...defaults,
          ...data,
          prices: data.prices?.length ? data.prices : defaults.prices,
          badges: data.badges?.length ? data.badges : defaults.badges,
          hero: { ...defaults.hero, ...(data.hero || {}) },
          stats: { ...defaults.stats, ...(data.stats || {}) },
          contact: { ...defaults.contact, ...(data.contact || {}) },
          social: { ...defaults.social, ...(data.social || {}) },
          about: { ...defaults.about, ...(data.about || {}) },
          services_section: { ...defaults.services_section, ...(data.services_section || {}) },
          whyus: { ...defaults.whyus, ...(data.whyus || {}), items: data.whyus?.items?.length ? data.whyus.items : defaults.whyus.items },
          testimonials: data.testimonials?.length ? data.testimonials : defaults.testimonials,
          howit: { ...defaults.howit, ...(data.howit || {}), steps: data.howit?.steps?.length ? data.howit.steps : defaults.howit.steps },
          cta: { ...defaults.cta, ...(data.cta || {}) },
          
          hero_slides: data.hero_slides?.length ? data.hero_slides : defaults.hero_slides,
          before_after_albums: data.before_after_albums?.length ? data.before_after_albums : defaults.before_after_albums,
          instagram_username: data.instagram_username || defaults.instagram_username,
          instagram_count: data.instagram_count || defaults.instagram_count,
          reels_posts: data.reels_posts || defaults.reels_posts,
          prices_active: data.prices_active !== undefined ? data.prices_active : defaults.prices_active,
          seo_title: data.seo_title || defaults.seo_title,
          seo_description: data.seo_description || defaults.seo_description,
          negative_keywords: data.negative_keywords || defaults.negative_keywords,
          
          show_hero_form: data.show_hero_form !== undefined ? data.show_hero_form : defaults.show_hero_form,
          social_instagram_active: data.social_instagram_active !== undefined ? data.social_instagram_active : defaults.social_instagram_active,
          social_facebook_active: data.social_facebook_active !== undefined ? data.social_facebook_active : defaults.social_facebook_active,
          social_phone_active: data.social_phone_active !== undefined ? data.social_phone_active : defaults.social_phone_active,
          music_active: data.music_active !== undefined ? data.music_active : defaults.music_active,
          brand_music_url: data.brand_music_url || defaults.brand_music_url,
          media_cover_image: data.media_cover_image || defaults.media_cover_image,
          media_items: data.media_items || defaults.media_items,
          logo_url: data.logo_url || defaults.logo_url,
          
          primary_color: data.primary_color || defaults.primary_color,
          secondary_color: data.secondary_color || defaults.secondary_color,
          campaign_percent: data.campaign_percent !== undefined ? data.campaign_percent : defaults.campaign_percent,
          campaign_badge_bg: data.campaign_badge_bg || defaults.campaign_badge_bg,
          campaign_badge_text: data.campaign_badge_text || defaults.campaign_badge_text,
          campaign_price_color: data.campaign_price_color || defaults.campaign_price_color,
          banner_active: data.banner_active !== undefined ? data.banner_active : defaults.banner_active,
          banner_text: data.banner_text || defaults.banner_text,
          banner_link: data.banner_link || defaults.banner_link,
          banner_bg_color: data.banner_bg_color || defaults.banner_bg_color,
          banner_text_color: data.banner_text_color || defaults.banner_text_color,
          google_reviews_active: data.google_reviews_active !== undefined ? data.google_reviews_active : defaults.google_reviews_active,
          google_reviews_count: data.google_reviews_count || defaults.google_reviews_count,
          seo_keywords: data.seo_keywords || defaults.seo_keywords,
          seo_h1: data.seo_h1 || defaults.seo_h1,
          seo_h2_1: data.seo_h2_1 || defaults.seo_h2_1,
          seo_h2_2: data.seo_h2_2 || defaults.seo_h2_2,
          seo_h2_3: data.seo_h2_3 || defaults.seo_h2_3,
          seo_h2_4: data.seo_h2_4 || defaults.seo_h2_4,
          seo_h2_5: data.seo_h2_5 || defaults.seo_h2_5,
          seo_h3_1: data.seo_h3_1 || defaults.seo_h3_1,
          seo_h3_2: data.seo_h3_2 || defaults.seo_h3_2,
          instagram_embed_code: data.instagram_embed_code || defaults.instagram_embed_code
        });
      }
    } catch {} finally { setLoading(false); }
  };

  const save = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`${API_URL}/admin/website-content`, { 
        method: "POST", 
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, 
        body: JSON.stringify(content) 
      });
      if (res.ok) { setMsg({ type: "success", text: "İçerik başarıyla kaydedildi!" }); } else { setMsg({ type: "error", text: "Kaydetme hatası!" }); }
    } catch { setMsg({ type: "error", text: "Bağlantı hatası!" }); }
    finally { setSaving(false); setTimeout(() => setMsg(null), 3000); }
  };

  const u = (section: string, field: string, value: any) => setContent((p: any) => ({ ...p, [section]: { ...p[section], [field]: value } }));

  const Input = ({ label, section, field, placeholder }: { label: string; section: string; field: string; placeholder?: string }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input type="text" value={(content as any)[section]?.[field] || ""} onChange={e => u(section, field, e.target.value)} placeholder={placeholder} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
    </div>
  );

  const Textarea = ({ label, section, field, rows }: { label: string; section: string; field: string; rows?: number }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <textarea rows={rows || 3} value={(content as any)[section]?.[field] || ""} onChange={e => u(section, field, e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
    </div>
  );

  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="text-lg text-gray-500">Yükleniyor...</div></div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Web Sitesi Yönetimi</h1>
            <p className="text-sm text-gray-500">Tüm sayfa içeriklerini ve entegrasyon ayarlarını buradan düzenleyin</p>
          </div>
          <button onClick={save} disabled={saving} className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 text-sm">
            <i className={`fas ${saving ? "fa-spinner fa-spin" : "fa-save"}`}></i> {saving ? "Kaydediliyor..." : "Kaydet"}
          </button>
        </div>

        {msg && <div className={`mb-4 p-3 rounded-lg text-sm font-medium ${msg.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{msg.text}</div>}

        <div className="flex gap-6">
          {/* Tabs */}
          <div className="w-56 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              {tabs.map(t => (
                <button key={t.id} onClick={() => setActiveTab(t.id)} className={`w-full px-4 py-3 text-left text-sm flex items-center gap-3 transition-colors ${activeTab === t.id ? "bg-blue-50 text-blue-700 font-medium border-r-2 border-blue-600" : "text-gray-600 hover:bg-gray-50"}`}>
                  <i className={`${t.icon} w-4 text-center`}></i> {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            
            {/* GENERAL SETTINGS */}
            {activeTab === "general" && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Genel Ayarlar</h2>
                
                {/* Logo Upload Zone */}
                <div className="p-4 bg-gray-50 rounded-lg space-y-3">
                  <span className="text-sm font-semibold text-gray-700 block">Web Sitesi Logosunu Değiştir</span>
                  <div className="flex items-center gap-4 bg-white p-3 rounded-lg border border-gray-200">
                    {content.logo_url ? (
                      <div className="relative w-20 h-20 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
                        <img src={content.logo_url} alt="" className="w-full h-full object-cover" />
                        <button 
                          type="button"
                          onClick={() => setContent(p => ({ ...p, logo_url: "" }))} 
                          className="absolute top-1 right-1 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-[10px] transition-colors"
                          title="Logoyu Kaldır"
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      </div>
                    ) : (
                      <div className="w-20 h-20 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 flex-shrink-0">
                        <i className="fas fa-image text-xl"></i>
                      </div>
                    )}
                    <div className="flex-1">
                      <input 
                        type="file" 
                        id="logo-file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={async e => {
                          const file = e.target.files?.[0];
                          if (file) {
                            try {
                              const url = await uploadImage(file);
                              setContent(p => ({ ...p, logo_url: url }));
                            } catch (err: any) {
                              alert(`Logo yükleme hatası: ${err.message}`);
                            }
                          }
                        }}
                      />
                      <label 
                        htmlFor="logo-file"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold rounded-lg cursor-pointer transition-colors border border-blue-200"
                      >
                        <i className="fas fa-upload"></i> Logo Seç
                      </label>
                      <p className="text-[10px] text-gray-400 mt-1">Önerilen boyut: 512x512px (Kare)</p>
                    </div>
                  </div>
                </div>

                {/* Tema Renkleri (Dynamic Skinning) */}
                <div className="p-4 bg-gray-50 rounded-lg space-y-3">
                  <span className="text-sm font-semibold text-gray-700 block">Tema Renkleri (Dinamik Arayüz)</span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-650 mb-1">Birincil Renk (Örn: #059669)</label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={content.primary_color || "#059669"}
                          onChange={e => setContent(p => ({ ...p, primary_color: e.target.value }))}
                          className="w-10 h-10 border border-gray-300 rounded-lg cursor-pointer"
                        />
                        <input
                          type="text"
                          value={content.primary_color || "#059669"}
                          onChange={e => setContent(p => ({ ...p, primary_color: e.target.value }))}
                          placeholder="#059669"
                          className="flex-grow px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-650 mb-1">İkincil Renk (Örn: #0284c7)</label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={content.secondary_color || "#0284c7"}
                          onChange={e => setContent(p => ({ ...p, secondary_color: e.target.value }))}
                          className="w-10 h-10 border border-gray-300 rounded-lg cursor-pointer"
                        />
                        <input
                          type="text"
                          value={content.secondary_color || "#0284c7"}
                          onChange={e => setContent(p => ({ ...p, secondary_color: e.target.value }))}
                          placeholder="#0284c7"
                          className="flex-grow px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                        />
                      </div>
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-400">Bu renkler sitenin genelindeki butonlar, başlıklar ve arka plan temalarında dinamik olarak kullanılır.</p>
                </div>

                <div className="flex flex-col gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="prices_active"
                      checked={content.prices_active !== false}
                      onChange={e => setContent(p => ({ ...p, prices_active: e.target.checked }))}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="prices_active" className="text-sm font-medium text-gray-700 cursor-pointer select-none">
                      Fiyat Listesini Web Sitesinde Göster
                    </label>
                  </div>
                  
                  <div className="flex items-center gap-3 border-t border-gray-200 pt-3">
                    <input
                      type="checkbox"
                      id="show_hero_form"
                      checked={content.show_hero_form !== false}
                      onChange={e => setContent(p => ({ ...p, show_hero_form: e.target.checked }))}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="show_hero_form" className="text-sm font-medium text-gray-700 cursor-pointer select-none">
                      Hero (Giriş) Bölümünde Hızlı Fiyat Teklif Formunu Göster
                    </label>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg space-y-4">
                  <h3 className="text-sm font-semibold text-gray-700 border-b pb-2"><i className="fas fa-bullhorn text-blue-500 mr-2"></i>Yüzen İletişim Butonları</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="social_instagram_active"
                        checked={content.social_instagram_active !== false}
                        onChange={e => setContent(p => ({ ...p, social_instagram_active: e.target.checked }))}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label htmlFor="social_instagram_active" className="text-xs font-medium text-gray-700 cursor-pointer">Instagram Butonu Göster</label>
                    </div>

                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="social_facebook_active"
                        checked={content.social_facebook_active !== false}
                        onChange={e => setContent(p => ({ ...p, social_facebook_active: e.target.checked }))}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label htmlFor="social_facebook_active" className="text-xs font-medium text-gray-700 cursor-pointer">Facebook Butonu Göster</label>
                    </div>

                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="social_phone_active"
                        checked={content.social_phone_active !== false}
                        onChange={e => setContent(p => ({ ...p, social_phone_active: e.target.checked }))}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label htmlFor="social_phone_active" className="text-xs font-medium text-gray-700 cursor-pointer">Telefon Arama Butonu Göster</label>
                    </div>

                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="music_active"
                        checked={content.music_active !== false}
                        onChange={e => setContent(p => ({ ...p, music_active: e.target.checked }))}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label htmlFor="music_active" className="text-xs font-medium text-gray-700 cursor-pointer">Marka Müziği Butonu Göster</label>
                    </div>
                  </div>
                  <div className="pt-2">
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">Marka Müziği (Ses Dosyası veya URL)</label>
                    <div className="space-y-3">
                      {content.brand_music_url && (
                        <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
                          <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-500 flex-shrink-0">
                            <i className="fas fa-music text-lg"></i>
                          </div>
                          <div className="flex-grow min-w-0">
                            <span className="text-[10px] text-gray-400 block font-mono truncate">{content.brand_music_url}</span>
                            <audio src={content.brand_music_url} controls className="w-full h-8 mt-1 scale-95 origin-left" />
                          </div>
                          <button
                            type="button"
                            onClick={() => setContent(p => ({ ...p, brand_music_url: "" }))}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                            title="Müziği Kaldır"
                          >
                            <i className="fas fa-trash-can"></i>
                          </button>
                        </div>
                      )}

                      <div className="flex gap-3">
                        <div className="flex-grow">
                          <input 
                            type="file" 
                            id="music-file" 
                            accept="audio/*" 
                            className="hidden" 
                            onChange={async e => {
                              const file = e.target.files?.[0];
                              if (file) {
                                setUploadingMusic(true);
                                try {
                                  const url = await uploadImage(file);
                                  setContent(p => ({ ...p, brand_music_url: url }));
                                } catch (err: any) {
                                  alert(`Müzik yükleme hatası: ${err.message}`);
                                } finally {
                                  setUploadingMusic(false);
                                }
                              }
                            }}
                            disabled={uploadingMusic}
                          />
                          <label 
                            htmlFor="music-file"
                            className={`w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold rounded-lg cursor-pointer transition-colors border border-blue-200 ${uploadingMusic ? 'opacity-50 pointer-events-none' : ''}`}
                          >
                            {uploadingMusic ? (
                              <>
                                <i className="fas fa-spinner fa-spin"></i> Yükleniyor...
                              </>
                            ) : (
                              <>
                                <i className="fas fa-music"></i> Müzik Dosyası Yükle (.mp3)
                              </>
                            )}
                          </label>
                        </div>
                      </div>

                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <i className="fas fa-link text-gray-400 text-[10px]"></i>
                        </div>
                        <input 
                          type="text" 
                          placeholder="Alternatif olarak MP3 URL adresi girin (https://...)"
                          value={content.brand_music_url || ""}
                          onChange={e => setContent(p => ({ ...p, brand_music_url: e.target.value }))}
                          className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg text-xs font-mono outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg space-y-4">
                  <h3 className="text-sm font-semibold text-gray-700 border-b pb-2"><i className="fab fa-share-nodes text-blue-500 mr-2"></i>Sosyal Medya Profil Adresleri</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Instagram Adresi</label>
                      <input 
                        type="text" 
                        placeholder="https://instagram.com/..."
                        value={content.social?.instagram || ""}
                        onChange={e => setContent(p => ({ ...p, social: { ...(p.social || {}), instagram: e.target.value } }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Facebook Adresi</label>
                      <input 
                        type="text" 
                        placeholder="https://facebook.com/..."
                        value={content.social?.facebook || ""}
                        onChange={e => setContent(p => ({ ...p, social: { ...(p.social || {}), facebook: e.target.value } }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Twitter / X Adresi</label>
                      <input 
                        type="text" 
                        placeholder="https://x.com/..."
                        value={content.social?.twitter || ""}
                        onChange={e => setContent(p => ({ ...p, social: { ...(p.social || {}), twitter: e.target.value } }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">LinkedIn Adresi</label>
                      <input 
                        type="text" 
                        placeholder="https://linkedin.com/in/..."
                        value={content.social?.linkedin || ""}
                        onChange={e => setContent(p => ({ ...p, social: { ...(p.social || {}), linkedin: e.target.value } }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-gray-600 mb-1">YouTube Kanal Adresi</label>
                      <input 
                        type="text" 
                        placeholder="https://youtube.com/..."
                        value={content.social?.youtube || ""}
                        onChange={e => setContent(p => ({ ...p, social: { ...(p.social || {}), youtube: e.target.value } }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* CAMPAIGN BANNER */}
            {activeTab === "banner" && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Kampanya Bannerı Yönetimi</h2>
                <p className="text-sm text-gray-500 mb-4">Sitenin en üst kısmında yer alan dikkat çekici kampanya/duyuru şeridini buradan yönetin.</p>
                
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <input
                    type="checkbox"
                    id="banner_active"
                    checked={content.banner_active !== false}
                    onChange={e => setContent(p => ({ ...p, banner_active: e.target.checked }))}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="banner_active" className="text-sm font-medium text-gray-700 cursor-pointer select-none">
                    Kampanya Bannerını Göster
                  </label>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Banner Duyuru Metni</label>
                    <input
                      type="text"
                      value={content.banner_text || ""}
                      onChange={e => setContent(p => ({ ...p, banner_text: e.target.value }))}
                      placeholder="Titan360 ile temizlikte indirim kampanyası!"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Yönlendirme Linki (İsteğe Bağlı)</label>
                    <input
                      type="text"
                      value={content.banner_link || ""}
                      onChange={e => setContent(p => ({ ...p, banner_link: e.target.value }))}
                      placeholder="örn: /hizmetler veya https://wa.me/..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-650 mb-1">Arka Plan Rengi</label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={content.banner_bg_color || "#059669"}
                          onChange={e => setContent(p => ({ ...p, banner_bg_color: e.target.value }))}
                          className="w-10 h-10 border border-gray-300 rounded-lg cursor-pointer"
                        />
                        <input
                          type="text"
                          value={content.banner_bg_color || "#059669"}
                          onChange={e => setContent(p => ({ ...p, banner_bg_color: e.target.value }))}
                          placeholder="#059669"
                          className="flex-grow px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-650 mb-1">Yazı Rengi</label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={content.banner_text_color || "#ffffff"}
                          onChange={e => setContent(p => ({ ...p, banner_text_color: e.target.value }))}
                          className="w-10 h-10 border border-gray-300 rounded-lg cursor-pointer"
                        />
                        <input
                          type="text"
                          value={content.banner_text_color || "#ffffff"}
                          onChange={e => setContent(p => ({ ...p, banner_text_color: e.target.value }))}
                          placeholder="#ffffff"
                          className="flex-grow px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* HERO SLIDES */}
            {activeTab === "hero_slides" && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Kahraman (Hero) Slider</h2>
                <p className="text-sm text-gray-500 mb-4">Ana sayfadaki yana kaydırılabilen 3 büyük görseli ve metinlerini yönetin.</p>
                {(content.hero_slides || []).map((slide, i) => (
                  <div key={i} className="p-5 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-gray-700"><i className="fas fa-image text-blue-500 mr-2"></i>Slayt {i + 1}</span>
                      <button onClick={() => setContent(p => ({ ...p, hero_slides: (p.hero_slides || []).filter((_, j) => j !== i) }))} className="text-red-500 text-xs hover:text-red-700 font-medium"><i className="fas fa-trash mr-1"></i>Sil</button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="col-span-2">
                        <label className="block text-xs font-medium text-gray-500 mb-1.5">Slayt Görseli</label>
                        <div className="flex items-center gap-4 bg-white p-3 rounded-lg border border-gray-200">
                          {slide.image ? (
                            <div className="relative w-20 h-20 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
                              <img src={slide.image} alt="" className="w-full h-full object-cover" />
                              <button 
                                type="button"
                                onClick={() => {
                                  const slides = [...(content.hero_slides || [])];
                                  slides[i] = { ...slides[i], image: "" };
                                  setContent(p => ({ ...p, hero_slides: slides }));
                                }} 
                                className="absolute top-1 right-1 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-[10px] transition-colors"
                                title="Resmi Kaldır"
                              >
                                <i className="fas fa-times"></i>
                              </button>
                            </div>
                          ) : (
                            <div className="w-20 h-20 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 flex-shrink-0">
                              <i className="fas fa-image text-xl"></i>
                            </div>
                          )}
                          <div className="flex-1">
                            <input 
                              type="file" 
                              id={`slide-file-${i}`} 
                              accept="image/*" 
                              className="hidden" 
                              onChange={e => {
                                const file = e.target.files?.[0];
                                if (file) handleImageUpload(file, i);
                              }}
                            />
                            <label 
                              htmlFor={`slide-file-${i}`}
                              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold rounded-lg cursor-pointer transition-colors border border-blue-200"
                            >
                              <i className={`fas ${uploadingIdx === i ? "fa-spinner fa-spin" : "fa-upload"}`}></i>
                              {uploadingIdx === i ? "Yükleniyor..." : "Dosya Seç"}
                            </label>
                            <p className="text-[10px] text-gray-400 mt-1">PNG, JPG veya WEBP. Önerilen boyut: 1920x1080px</p>
                          </div>
                        </div>
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-medium text-gray-500 mb-1">Rozet Metni</label>
                        <input placeholder="Aynı Gün Hizmet" value={slide.badge} onChange={e => {
                          const slides = [...(content.hero_slides || [])];
                          slides[i] = { ...slides[i], badge: e.target.value };
                          setContent(p => ({ ...p, hero_slides: slides }));
                        }} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-medium text-gray-500 mb-1">Ana Başlık</label>
                        <input placeholder="Antalya'nın En İyi Koltuk Yıkama Hizmeti" value={slide.title} onChange={e => {
                          const slides = [...(content.hero_slides || [])];
                          slides[i] = { ...slides[i], title: e.target.value };
                          setContent(p => ({ ...p, hero_slides: slides }));
                        }} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-medium text-gray-500 mb-1">Alt Başlık (Renkli Kısım)</label>
                        <input placeholder="Profesyonel Kadro" value={slide.subtitle} onChange={e => {
                          const slides = [...(content.hero_slides || [])];
                          slides[i] = { ...slides[i], subtitle: e.target.value };
                          setContent(p => ({ ...p, hero_slides: slides }));
                        }} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-medium text-gray-500 mb-1">Açıklama</label>
                        <textarea placeholder="Detaylı açıklama..." value={slide.desc} onChange={e => {
                          const slides = [...(content.hero_slides || [])];
                          slides[i] = { ...slides[i], desc: e.target.value };
                          setContent(p => ({ ...p, hero_slides: slides }));
                        }} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" rows={2} />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">1. Buton Metni</label>
                        <input placeholder="Hemen Fiyat Teklifi Al" value={slide.cta1_text || ""} onChange={e => {
                          const slides = [...(content.hero_slides || [])];
                          slides[i] = { ...slides[i], cta1_text: e.target.value };
                          setContent(p => ({ ...p, hero_slides: slides }));
                        }} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">1. Buton Linki</label>
                        <input placeholder="#teklif-formu" value={slide.cta1_link || ""} onChange={e => {
                          const slides = [...(content.hero_slides || [])];
                          slides[i] = { ...slides[i], cta1_link: e.target.value };
                          setContent(p => ({ ...p, hero_slides: slides }));
                        }} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">2. Buton Metni</label>
                        <input placeholder="WhatsApp Yaz" value={slide.cta2_text || ""} onChange={e => {
                          const slides = [...(content.hero_slides || [])];
                          slides[i] = { ...slides[i], cta2_text: e.target.value };
                          setContent(p => ({ ...p, hero_slides: slides }));
                        }} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">2. Buton Linki</label>
                        <input placeholder="https://wa.me/..." value={slide.cta2_link || ""} onChange={e => {
                          const slides = [...(content.hero_slides || [])];
                          slides[i] = { ...slides[i], cta2_link: e.target.value };
                          setContent(p => ({ ...p, hero_slides: slides }));
                        }} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                      </div>
                    </div>
                  </div>
                ))}
                <button onClick={() => setContent(p => ({ ...p, hero_slides: [...(p.hero_slides || []), { image: "", title: "", subtitle: "", desc: "", badge: "", cta1_text: "", cta1_link: "", cta2_text: "", cta2_link: "" }] }))} className="text-sm text-blue-600 hover:text-blue-800 font-medium"><i className="fas fa-plus mr-1"></i> Yeni Slayt Ekle</button>
              </div>
            )}

            {/* BEFORE AFTER ALBUMS */}
            {activeTab === "before_after_albums" && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Önce / Sonra Albümleri</h2>
                <p className="text-sm text-gray-500 mb-4">Web sitesinde ve mobil uygulamada gösterilen sekmeli albüm yapılarını buradan yönetin.</p>
                {(content.before_after_albums || []).map((album, idx) => (
                  <div key={idx} className="p-5 bg-gray-50 rounded-xl border border-gray-200 space-y-4">
                    <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                      <div className="flex items-center gap-3 flex-1">
                        <label className="text-sm font-semibold text-gray-700 whitespace-nowrap">Albüm Adı:</label>
                        <input
                          placeholder="örn: Koltuk Yıkama"
                          value={album.title}
                          onChange={e => {
                            const alb = [...(content.before_after_albums || [])];
                            alb[idx] = { ...alb[idx], title: e.target.value };
                            setContent(p => ({ ...p, before_after_albums: alb }));
                          }}
                          className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm max-w-xs"
                        />
                      </div>
                      <button onClick={() => setContent(p => ({ ...p, before_after_albums: (p.before_after_albums || []).filter((_, j) => j !== idx) }))} className="text-red-500 text-xs hover:text-red-700 font-medium"><i className="fas fa-trash mr-1"></i>Albümü Sil</button>
                    </div>
                    
                    <div className="space-y-4 pl-4 border-l-2 border-blue-500">
                      <span className="text-xs font-semibold text-gray-500 block">ALBÜM GÖRSELLERİ</span>
                      {album.images?.map((img, imgIdx) => (
                        <div key={imgIdx} className="bg-white p-4 rounded-lg border border-gray-150 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-gray-600">Görsel {imgIdx + 1}</span>
                            <button onClick={() => {
                              const alb = [...(content.before_after_albums || [])];
                              alb[idx] = { ...alb[idx], images: alb[idx].images.filter((_, j) => j !== imgIdx) };
                              setContent(p => ({ ...p, before_after_albums: alb }));
                            }} className="text-red-500 text-[11px] hover:text-red-700 font-medium"><i className="fas fa-times mr-0.5"></i>Kaldır</button>
                          </div>
                          <div>
                            <label className="block text-[11px] text-gray-500 mb-0.5">Etiket / Açıklama</label>
                            <input
                              placeholder="Konyaaltı Koltuk Temizliği"
                              value={img.label}
                              onChange={e => {
                                const alb = [...(content.before_after_albums || [])];
                                alb[idx].images[imgIdx] = { ...alb[idx].images[imgIdx], label: e.target.value };
                                setContent(p => ({ ...p, before_after_albums: alb }));
                              }}
                              className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            {/* ÖNCE GÖRSELİ */}
                            <div className="bg-slate-50 p-3 rounded-xl border border-gray-250">
                              <label className="block text-[11px] font-bold text-red-500 mb-1.5">ÖNCE GÖRSELİ</label>
                              <div className="flex items-center gap-3">
                                {img.before_image ? (
                                  <div className="relative w-14 h-14 bg-gray-100 rounded-lg border border-gray-200 overflow-hidden flex-shrink-0">
                                    <img src={img.before_image} alt="" className="w-full h-full object-cover" />
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const alb = [...(content.before_after_albums || [])];
                                        alb[idx].images[imgIdx] = { ...alb[idx].images[imgIdx], before_image: "" };
                                        setContent(p => ({ ...p, before_after_albums: alb }));
                                      }}
                                      className="absolute top-0.5 right-0.5 w-4.5 h-4.5 bg-red-500 text-white rounded-full flex items-center justify-center text-[9px]"
                                    >
                                      <i className="fas fa-times"></i>
                                    </button>
                                  </div>
                                ) : (
                                  <div className="w-14 h-14 bg-gray-50 rounded-lg border border-dashed border-gray-300 flex items-center justify-center text-gray-400 flex-shrink-0 text-xs">
                                    <i className="fas fa-image"></i>
                                  </div>
                                )}
                                <div className="flex-1">
                                  <input
                                    type="file"
                                    id={`before-img-${idx}-${imgIdx}`}
                                    accept="image/*"
                                    className="hidden"
                                    onChange={async e => {
                                      const file = e.target.files?.[0];
                                      if (file) {
                                        try {
                                          const url = await uploadImage(file);
                                          const alb = [...(content.before_after_albums || [])];
                                          alb[idx].images[imgIdx] = { ...alb[idx].images[imgIdx], before_image: url };
                                          setContent(p => ({ ...p, before_after_albums: alb }));
                                        } catch (err: any) {
                                          alert(`Yükleme hatası: ${err.message}`);
                                        }
                                      }
                                    }}
                                  />
                                  <label
                                    htmlFor={`before-img-${idx}-${imgIdx}`}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-gray-300 rounded-lg text-xs font-semibold cursor-pointer shadow-sm"
                                  >
                                    <i className="fas fa-upload text-[10px]"></i> Seç
                                  </label>
                                </div>
                              </div>
                            </div>

                            {/* SONRA GÖRSELİ */}
                            <div className="bg-slate-50 p-3 rounded-xl border border-gray-250">
                              <label className="block text-[11px] font-bold text-green-600 mb-1.5">SONRA GÖRSELİ</label>
                              <div className="flex items-center gap-3">
                                {img.after_image ? (
                                  <div className="relative w-14 h-14 bg-gray-100 rounded-lg border border-gray-200 overflow-hidden flex-shrink-0">
                                    <img src={img.after_image} alt="" className="w-full h-full object-cover" />
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const alb = [...(content.before_after_albums || [])];
                                        alb[idx].images[imgIdx] = { ...alb[idx].images[imgIdx], after_image: "" };
                                        setContent(p => ({ ...p, before_after_albums: alb }));
                                      }}
                                      className="absolute top-0.5 right-0.5 w-4.5 h-4.5 bg-red-500 text-white rounded-full flex items-center justify-center text-[9px]"
                                    >
                                      <i className="fas fa-times"></i>
                                    </button>
                                  </div>
                                ) : (
                                  <div className="w-14 h-14 bg-gray-50 rounded-lg border border-dashed border-gray-300 flex items-center justify-center text-gray-400 flex-shrink-0 text-xs">
                                    <i className="fas fa-image"></i>
                                  </div>
                                )}
                                <div className="flex-1">
                                  <input
                                    type="file"
                                    id={`after-img-${idx}-${imgIdx}`}
                                    accept="image/*"
                                    className="hidden"
                                    onChange={async e => {
                                      const file = e.target.files?.[0];
                                      if (file) {
                                        try {
                                          const url = await uploadImage(file);
                                          const alb = [...(content.before_after_albums || [])];
                                          alb[idx].images[imgIdx] = { ...alb[idx].images[imgIdx], after_image: url };
                                          setContent(p => ({ ...p, before_after_albums: alb }));
                                        } catch (err: any) {
                                          alert(`Yükleme hatası: ${err.message}`);
                                        }
                                      }
                                    }}
                                  />
                                  <label
                                    htmlFor={`after-img-${idx}-${imgIdx}`}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-gray-300 rounded-lg text-xs font-semibold cursor-pointer shadow-sm"
                                  >
                                    <i className="fas fa-upload text-[10px]"></i> Seç
                                  </label>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      <button onClick={() => {
                        const alb = [...(content.before_after_albums || [])];
                        alb[idx] = { ...alb[idx], images: [...(alb[idx].images || []), { before_image: "", after_image: "", label: "" }] };
                        setContent(p => ({ ...p, before_after_albums: alb }));
                      }} className="text-xs text-blue-600 hover:text-blue-800 font-medium"><i className="fas fa-plus mr-1"></i>Fotoğraf Ekle</button>
                    </div>
                  </div>
                ))}
                <button onClick={() => setContent(p => ({ ...p, before_after_albums: [...(p.before_after_albums || []), { title: "", images: [] }] }))} className="text-sm text-blue-600 hover:text-blue-800 font-medium"><i className="fas fa-plus mr-1"></i> Yeni Albüm Ekle</button>
              </div>
            )}

            {/* MEDYA SAYFASI AYARLARI */}
            {activeTab === "media" && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Medya Galerisi & Kapak Görseli</h2>
                <p className="text-sm text-gray-500 mb-4">Ana sayfadaki medya kapak görselini ve /medya sayfasında listelenecek görselleri ve videoları yönetin.</p>
                
                {/* Cover Image Upload */}
                <div className="p-5 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
                  <span className="text-sm font-semibold text-gray-700 block">Ana Sayfa Medya Kapak Görseli</span>
                  <div className="flex items-center gap-4 bg-white p-3 rounded-lg border border-gray-200">
                    {content.media_cover_image ? (
                      <div className="relative w-24 h-24 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
                        <img src={content.media_cover_image} alt="" className="w-full h-full object-cover" />
                        <button 
                          type="button"
                          onClick={() => setContent(p => ({ ...p, media_cover_image: "" }))} 
                          className="absolute top-1 right-1 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-[10px] transition-colors"
                          title="Resmi Kaldır"
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      </div>
                    ) : (
                      <div className="w-24 h-24 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 flex-shrink-0">
                        <i className="fas fa-image text-2xl"></i>
                      </div>
                    )}
                    <div className="flex-1">
                      <input 
                        type="file" 
                        id="media-cover-file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={async e => {
                          const file = e.target.files?.[0];
                          if (file) {
                            try {
                              const token = localStorage.getItem("admin_token");
                              const formData = new FormData();
                              formData.append("file", file);
                              const res = await fetch(`${API_URL}/admin/upload`, {
                                method: "POST",
                                headers: { Authorization: `Bearer ${token}` },
                                body: formData,
                              });
                              if (res.ok) {
                                const data = await res.json();
                                setContent(p => ({ ...p, media_cover_image: data.url }));
                              } else {
                                alert("Dosya yükleme hatası!");
                              }
                            } catch {
                              alert("Bağlantı hatası!");
                            }
                          }
                        }}
                      />
                      <label 
                        htmlFor="media-cover-file"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold rounded-lg cursor-pointer transition-colors border border-blue-200"
                      >
                        <i className="fas fa-upload"></i> Kapak Görseli Seç
                      </label>
                      <p className="text-[10px] text-gray-400 mt-1">Önerilen boyut: 16:9 oranında (örn: 1280x720px)</p>
                    </div>
                  </div>
                </div>

                {/* Media Gallery Items list */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-700">Galeri Dosyaları ({(content.media_items || []).length})</span>
                    <button 
                      onClick={() => setContent(p => ({ ...p, media_items: [...(p.media_items || []), { url: "", title: "", type: "image" }] }))}
                      className="text-xs text-blue-600 hover:text-blue-800 font-semibold"
                    >
                      <i className="fas fa-plus mr-1"></i> Dosya Ekle
                    </button>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    {(content.media_items || []).map((item, idx) => (
                      <div key={idx} className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3 relative">
                        <button 
                          onClick={() => setContent(p => ({ ...p, media_items: (p.media_items || []).filter((_, j) => j !== idx) }))}
                          className="absolute top-2 right-2 w-6 h-6 bg-red-50 hover:bg-red-100 text-red-500 rounded-full flex items-center justify-center transition-colors"
                          title="Sil"
                        >
                          <i className="fas fa-trash text-xs"></i>
                        </button>
                        
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Medya Tipi</label>
                          <select 
                            value={item.type} 
                            onChange={e => {
                              const list = [...(content.media_items || [])];
                              list[idx] = { ...list[idx], type: e.target.value as any };
                              setContent(p => ({ ...p, media_items: list }));
                            }}
                            className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs"
                          >
                            <option value="image">Fotoğraf</option>
                            <option value="video">Video (MP4)</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Medya Başlığı</label>
                          <input 
                            placeholder="Detaylı koltuk yıkama..." 
                            value={item.title} 
                            onChange={e => {
                              const list = [...(content.media_items || [])];
                              list[idx] = { ...list[idx], title: e.target.value };
                              setContent(p => ({ ...p, media_items: list }));
                            }}
                            className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1.5">Medya Dosyası</label>
                          <div className="flex items-center gap-3 bg-white p-3 rounded-lg border border-gray-200">
                            {item.url ? (
                              <div className="relative w-14 h-14 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0 flex items-center justify-center">
                                {item.type === "video" ? (
                                  <div className="w-full h-full bg-slate-950 flex items-center justify-center text-white">
                                    <i className="fas fa-video text-lg"></i>
                                  </div>
                                ) : (
                                  <img src={item.url} alt="" className="w-full h-full object-cover" />
                                )}
                                <button 
                                  type="button"
                                  onClick={() => {
                                    const list = [...(content.media_items || [])];
                                    list[idx] = { ...list[idx], url: "" };
                                    setContent(p => ({ ...p, media_items: list }));
                                  }} 
                                  className="absolute top-0.5 right-0.5 w-4.5 h-4.5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-[9px] transition-colors"
                                  title="Dosyayı Kaldır"
                                >
                                  <i className="fas fa-times"></i>
                                </button>
                              </div>
                            ) : (
                              <div className="w-14 h-14 bg-gray-50 rounded-lg border border-dashed border-gray-300 flex items-center justify-center text-gray-400 flex-shrink-0">
                                {item.type === "video" ? (
                                  <i className="fas fa-file-video text-lg"></i>
                                ) : (
                                  <i className="fas fa-image text-lg"></i>
                                )}
                              </div>
                            )}
                            <div className="flex-grow">
                              <input 
                                type="file" 
                                id={`gallery-file-${idx}`}
                                accept={item.type === "video" ? "video/*" : "image/*"}
                                className="hidden"
                                onChange={async e => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    try {
                                      const url = await uploadImage(file);
                                      const list = [...(content.media_items || [])];
                                      list[idx] = { ...list[idx], url };
                                      setContent(p => ({ ...p, media_items: list }));
                                    } catch (err: any) {
                                      alert(`Yükleme hatası: ${err.message}`);
                                    }
                                  }
                                }}
                              />
                              <label 
                                htmlFor={`gallery-file-${idx}`}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-semibold cursor-pointer transition-colors shadow-sm"
                              >
                                <i className="fas fa-upload text-[10px]"></i> Dosya Seç
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {(content.media_items || []).length === 0 && (
                    <p className="text-xs text-gray-400 text-center py-6 border-2 border-dashed border-gray-200 rounded-xl">Henüz dosya eklenmemiş.</p>
                  )}
                </div>
              </div>
            )}

            {/* INSTAGRAM */}
            {activeTab === "instagram" && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Sosyal Medya (Instagram) Ayarları</h2>
                
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <input
                    type="checkbox"
                    id="social_instagram_active"
                    checked={content.social_instagram_active !== false}
                    onChange={e => setContent(p => ({ ...p, social_instagram_active: e.target.checked }))}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="social_instagram_active" className="text-sm font-medium text-gray-700 cursor-pointer select-none">
                    Instagram Akışını Web Sitesinde Göster
                  </label>
                </div>

                {/* Yöntem A: Widget Embed Kodu */}
                <div className="p-4 bg-gray-50 rounded-lg space-y-3">
                  <span className="text-sm font-semibold text-gray-700 block"><i className="fas fa-code text-pink-500 mr-2"></i>Instagram Widget Embed Kodu (Yöntem A)</span>
                  <p className="text-xs text-gray-500">Elfsight, LightWidget veya Behold.so gibi servislerden aldığınız hazır embed kodunu (HTML/Script/Iframe) buraya yapıştırın. Bu kod canlı Instagram akışınızı otomatik gösterecektir.</p>
                  <textarea
                    rows={5}
                    value={content.instagram_embed_code || ""}
                    onChange={e => setContent(p => ({ ...p, instagram_embed_code: e.target.value }))}
                    placeholder='<iframe src="https://lightwidget.com/widgets/..." ...></iframe>'
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Instagram Kullanıcı Adı (Yalnızca ad, örn: titan360tr)</label>
                    <input
                      type="text"
                      value={content.instagram_username || ""}
                      onChange={e => setContent(p => ({ ...p, instagram_username: e.target.value }))}
                      placeholder="titan360tr"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Gösterilecek Reels Sayısı</label>
                    <input
                      type="number"
                      value={content.instagram_count || 4}
                      onChange={e => setContent(p => ({ ...p, instagram_count: Number(e.target.value) }))}
                      placeholder="4"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  <h3 className="text-sm font-semibold text-gray-700">Reels Videoları Listesi</h3>
                  {(content.reels_posts || []).map((reel, i) => (
                    <div key={i} className="p-4 bg-gray-50 rounded-lg space-y-3 border border-gray-200">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-600">Video {i + 1}</span>
                        <button onClick={() => setContent(p => ({ ...p, reels_posts: (p.reels_posts || []).filter((_, j) => j !== i) }))} className="text-red-500 text-xs hover:text-red-700"><i className="fas fa-trash mr-1"></i>Sil</button>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="col-span-2">
                          <label className="block text-xs font-semibold text-gray-500 mb-1">Reels Kapak Görseli</label>
                          <div className="flex items-center gap-3 bg-white p-2.5 rounded-lg border border-gray-200">
                            {reel.image ? (
                              <div className="relative w-12 h-12 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
                                <img src={reel.image} alt="" className="w-full h-full object-cover" />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const r = [...(content.reels_posts || [])];
                                    r[i] = { ...r[i], image: "" };
                                    setContent(p => ({ ...p, reels_posts: r }));
                                  }}
                                  className="absolute top-0.5 right-0.5 w-4.5 h-4.5 bg-red-500 text-white rounded-full flex items-center justify-center text-[9px]"
                                >
                                  <i className="fas fa-times"></i>
                                </button>
                              </div>
                            ) : (
                              <div className="w-12 h-12 bg-gray-50 rounded-lg border border-dashed border-gray-300 flex items-center justify-center text-gray-400 flex-shrink-0 text-xs">
                                <i className="fas fa-image"></i>
                              </div>
                            )}
                            <div className="flex-grow">
                              <input 
                                type="file" 
                                id={`reels-file-${i}`}
                                accept="image/*"
                                className="hidden"
                                onChange={async e => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    try {
                                      const url = await uploadImage(file);
                                      const r = [...(content.reels_posts || [])];
                                      r[i] = { ...r[i], image: url };
                                      setContent(p => ({ ...p, reels_posts: r }));
                                    } catch (err: any) {
                                      alert(`Yükleme hatası: ${err.message}`);
                                    }
                                  }
                                }}
                              />
                              <label 
                                htmlFor={`reels-file-${i}`}
                                className="inline-flex items-center gap-1 bg-white hover:bg-slate-100 text-slate-700 border border-gray-300 rounded px-2.5 py-1.5 text-xs font-semibold cursor-pointer shadow-sm"
                              >
                                Seç
                              </label>
                            </div>
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">İzlenme Sayısı Yazısı</label>
                          <input
                            placeholder="12.4K İzlenme"
                            value={reel.views}
                            onChange={e => {
                              const r = [...(content.reels_posts || [])];
                              r[i] = { ...r[i], views: e.target.value };
                              setContent(p => ({ ...p, reels_posts: r }));
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          />
                        </div>
                        <div className="col-span-3">
                          <label className="block text-xs text-gray-500 mb-1">Video Başlığı</label>
                          <input
                            placeholder="İnatçı Leke Çıkarma Aşamaları"
                            value={reel.title}
                            onChange={e => {
                              const r = [...(content.reels_posts || [])];
                              r[i] = { ...r[i], title: e.target.value };
                              setContent(p => ({ ...p, reels_posts: r }));
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  <button onClick={() => setContent(p => ({ ...p, reels_posts: [...(p.reels_posts || []), { image: "", title: "", views: "" }] }))} className="text-sm text-blue-600 hover:text-blue-800 font-medium"><i className="fas fa-plus mr-1"></i> Yeni Reels Ekle</button>
                </div>
              </div>
            )}

            {/* SEO & ADS */}
            {activeTab === "seo_ads" && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">SEO & Google Ads Ayarları</h2>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ana Sayfa SEO Başlığı (Meta Title)</label>
                  <input
                    type="text"
                    value={content.seo_title || ""}
                    onChange={e => setContent(p => ({ ...p, seo_title: e.target.value }))}
                    placeholder="Antalya Koltuk Yıkama Fiyatları | TiTAN 360"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ana Sayfa SEO Meta Açıklaması (Meta Description)</label>
                  <textarea
                    rows={3}
                    value={content.seo_description || ""}
                    onChange={e => setContent(p => ({ ...p, seo_description: e.target.value }))}
                    placeholder="Antalya'da profesyonel koltuk yıkama, halı yıkama ve yatak temizliği. Güvenilir ve garantili hizmet..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ana Sayfa SEO Anahtar Kelimeleri (Meta Keywords)</label>
                  <input
                    type="text"
                    value={content.seo_keywords || ""}
                    onChange={e => setContent(p => ({ ...p, seo_keywords: e.target.value }))}
                    placeholder="antalya koltuk yıkama, halı yıkama, buharlı temizlik"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ana Sayfa SEO H1 Başlığı (Örn: Antalya'nın 1 Numaralı Koltuk Yıkama Hizmeti)</label>
                  <input
                    type="text"
                    value={content.seo_h1 || ""}
                    onChange={e => setContent(p => ({ ...p, seo_h1: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Önce/Sonra Bölümü H2 Başlığı</label>
                  <input
                    type="text"
                    value={content.seo_h2_1 || ""}
                    onChange={e => setContent(p => ({ ...p, seo_h2_1: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hizmetlerimiz Bölümü H2 Başlığı</label>
                  <input
                    type="text"
                    value={content.seo_h2_2 || ""}
                    onChange={e => setContent(p => ({ ...p, seo_h2_2: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Neden Biz Bölümü H2 Başlığı</label>
                  <input
                    type="text"
                    value={content.seo_h2_3 || ""}
                    onChange={e => setContent(p => ({ ...p, seo_h2_3: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Müşteri Yorumları Bölümü H2 Başlığı</label>
                  <input
                    type="text"
                    value={content.seo_h2_4 || ""}
                    onChange={e => setContent(p => ({ ...p, seo_h2_4: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Instagram Akışı Bölümü H2 Başlığı</label>
                  <input
                    type="text"
                    value={content.seo_h2_5 || ""}
                    onChange={e => setContent(p => ({ ...p, seo_h2_5: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Google Ads Negatif Kelimeler (Her satıra bir kelime)</label>
                  <textarea
                    rows={6}
                    value={content.negative_keywords || ""}
                    onChange={e => setContent(p => ({ ...p, negative_keywords: e.target.value }))}
                    placeholder="bedava&#10;ücretsiz&#10;ikinci el&#10;sahibinden"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
                  />
                  <p className="text-xs text-gray-400 mt-1">Google Ads üzerinden gelen gereksiz aramaları negatiflemek için kelimelerinizi buraya listeleyebilirsiniz.</p>
                </div>
              </div>
            )}

            {/* PRICES */}
            {activeTab === "prices" && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Şeffaf Fiyat Listesi</h2>
                <p className="text-sm text-gray-500 mb-4">Web sitesinde gösterilen manuel fiyat listesi öğelerini buradan düzenleyin.</p>

                {/* Campaign Settings inside Prices Tab */}
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-4 mb-6">
                  <h3 className="text-sm font-semibold text-gray-850 border-b pb-2"><i className="fas fa-percent text-blue-500 mr-2"></i>Hizmet Fiyat Kampanya Ayarları</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-650 mb-1">Kampanya İndirim Yüzdesi (%)</label>
                      <input 
                        type="number" 
                        min="0"
                        max="100"
                        value={content.campaign_percent !== undefined ? content.campaign_percent : 20} 
                        onChange={e => setContent((p: any) => ({ ...p, campaign_percent: Number(e.target.value) }))} 
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-blue-500" 
                      />
                      <p className="text-[9px] text-gray-400 mt-1">Hizmetlerde özel kampanya fiyatı girilmemişse, bu oranda otomatik indirim hesaplanır.</p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-650 mb-1">Rozet Arka Plan Rengi</label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={content.campaign_badge_bg || "#dc2626"}
                          onChange={e => setContent((p: any) => ({ ...p, campaign_badge_bg: e.target.value }))}
                          className="w-10 h-10 border border-gray-300 rounded-lg cursor-pointer"
                        />
                        <input
                          type="text"
                          value={content.campaign_badge_bg || "#dc2626"}
                          onChange={e => setContent((p: any) => ({ ...p, campaign_badge_bg: e.target.value }))}
                          className="flex-grow px-2 py-1.5 border border-gray-300 rounded-lg text-xs font-mono outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-650 mb-1">Rozet Yazı Rengi</label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={content.campaign_badge_text || "#ffffff"}
                          onChange={e => setContent((p: any) => ({ ...p, campaign_badge_text: e.target.value }))}
                          className="w-10 h-10 border border-gray-300 rounded-lg cursor-pointer"
                        />
                        <input
                          type="text"
                          value={content.campaign_badge_text || "#ffffff"}
                          onChange={e => setContent((p: any) => ({ ...p, campaign_badge_text: e.target.value }))}
                          className="flex-grow px-2 py-1.5 border border-gray-300 rounded-lg text-xs font-mono outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-650 mb-1">Fiyat Yazı Rengi</label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={content.campaign_price_color || "#ef4444"}
                          onChange={e => setContent((p: any) => ({ ...p, campaign_price_color: e.target.value }))}
                          className="w-10 h-10 border border-gray-300 rounded-lg cursor-pointer"
                        />
                        <input
                          type="text"
                          value={content.campaign_price_color || "#ef4444"}
                          onChange={e => setContent((p: any) => ({ ...p, campaign_price_color: e.target.value }))}
                          className="flex-grow px-2 py-1.5 border border-gray-300 rounded-lg text-xs font-mono outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                {content.prices.map((item: any, i: number) => (
                  <div key={i} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-gray-600">Öğe {i + 1}</span>
                      {content.prices.length > 1 && <button onClick={() => setContent((p: any) => ({ ...p, prices: p.prices.filter((_: any, j: number) => j !== i) }))} className="text-red-500 text-xs hover:text-red-700"><i className="fas fa-trash"></i> Sil</button>}
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Hizmet Adı</label>
                        <input placeholder="Tekli Koltuk" value={item.name} onChange={(e: any) => { const p = [...content.prices]; p[i] = { ...p[i], name: e.target.value }; setContent((prev: any) => ({ ...prev, prices: p })); }} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Fiyat Değeri</label>
                        <input placeholder="150 TL" value={item.price} onChange={(e: any) => { const p = [...content.prices]; p[i] = { ...p[i], price: e.target.value }; setContent((prev: any) => ({ ...prev, prices: p })); }} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">İkon</label>
                        <select value={item.icon} onChange={(e: any) => { const p = [...content.prices]; p[i] = { ...p[i], icon: e.target.value }; setContent((prev: any) => ({ ...prev, prices: p })); }} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                          <option value="fa-couch">Koltuk</option>
                          <option value="fa-bed">Yatak</option>
                          <option value="fa-rug">Halı</option>
                          <option value="fa-broom">Temizlik</option>
                          <option value="fa-home">Ev</option>
                          <option value="fa-building">Ofis</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
                <button onClick={() => setContent((p: any) => ({ ...p, prices: [...p.prices, { name: "", price: "", icon: "fa-couch" }] }))} className="text-sm text-blue-600 hover:text-blue-800 font-medium"><i className="fas fa-plus mr-1"></i> Yeni Fiyat Ögesi Ekle</button>
              </div>
            )}

            {/* HERO */}
            {activeTab === "hero" && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Ana Sayfa Giriş Bölümü</h2>
                <Input label="Üst Rozet" section="hero" field="badge" placeholder="Antalya'nın 1 Numaralı Temizlik Şirketi" />
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Başlık Satır 1" section="hero" field="title1" placeholder="Pırıl Pırıl" />
                  <Input label="Başlık Satır 2" section="hero" field="title2" placeholder="Koltuklar" />
                </div>
                <Textarea label="Alt Metin (Açıklama)" section="hero" field="subtitle" />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Arka Plan Görseli</label>
                  <div className="flex items-center gap-4 bg-white p-3 rounded-lg border border-gray-200">
                    {content.hero.image ? (
                      <div className="relative w-24 h-24 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
                        <img src={content.hero.image} alt="" className="w-full h-full object-cover" />
                        <button 
                          type="button"
                          onClick={() => u("hero", "image", "")} 
                          className="absolute top-1 right-1 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-[10px] transition-colors"
                          title="Resmi Kaldır"
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      </div>
                    ) : (
                      <div className="w-24 h-24 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 flex-shrink-0">
                        <i className="fas fa-image text-2xl"></i>
                      </div>
                    )}
                    <div className="flex-1">
                      <input 
                        type="file" 
                        id="hero-bg-file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={async e => {
                          const file = e.target.files?.[0];
                          if (file) {
                            try {
                              const url = await uploadImage(file);
                              u("hero", "image", url);
                            } catch (err: any) {
                              alert(`Arka plan görseli yükleme hatası: ${err.message}`);
                            }
                          }
                        }}
                      />
                      <label 
                        htmlFor="hero-bg-file"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold rounded-lg cursor-pointer transition-colors border border-blue-200"
                      >
                        <i className="fas fa-upload"></i> Görsel Seç
                      </label>
                      <p className="text-[10px] text-gray-400 mt-1">Önerilen boyut: 1920x1080px</p>
                    </div>
                  </div>
                </div>
                
                <h3 className="text-sm font-semibold text-gray-700 mt-6 border-t pt-4">Harekete Geçirici Butonlar</h3>
                <div className="grid grid-cols-2 gap-4">
                  <Input label="1. Buton Metni" section="hero" field="cta1_text" placeholder="Hemen Fiyat Teklifi Al" />
                  <Input label="1. Buton Linki" section="hero" field="cta1_link" placeholder="#teklif-formu" />
                  <Input label="2. Buton Metni" section="hero" field="cta2_text" placeholder="WhatsApp Yaz" />
                  <Input label="2. Buton Linki" section="hero" field="cta2_link" placeholder="https://wa.me/..." />
                </div>
              </div>
            )}

            {/* BADGES */}
            {activeTab === "badges" && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Güven Rozetleri</h2>
                {(content.badges || []).map((item, i) => (
                  <div key={i} className="p-4 bg-gray-50 rounded-lg space-y-2 border border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">Rozet {i + 1}</span>
                      {content.badges.length > 1 && <button onClick={() => setContent((p: any) => ({ ...p, badges: p.badges.filter((_: any, j: number) => j !== i) }))} className="text-red-500 text-xs hover:text-red-700"><i className="fas fa-trash"></i> Sil</button>}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">İkon (FontAwesome)</label>
                        <input placeholder="fa-shield-halved" value={item.icon} onChange={e => { const b = [...content.badges]; b[i] = { ...b[i], icon: e.target.value }; setContent((p: any) => ({ ...p, badges: b })); }} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Başlık</label>
                        <input placeholder="Aynı Gün Hizmet" value={item.title} onChange={e => { const b = [...content.badges]; b[i] = { ...b[i], title: e.target.value }; setContent((p: any) => ({ ...p, badges: b })); }} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Açıklama</label>
                      <input placeholder="Açıklama..." value={item.desc} onChange={e => { const b = [...content.badges]; b[i] = { ...b[i], desc: e.target.value }; setContent((p: any) => ({ ...p, badges: b })); }} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                    </div>
                  </div>
                ))}
                <button onClick={() => setContent((p: any) => ({ ...p, badges: [...p.badges, { icon: "fa-certificate", title: "", desc: "" }] }))} className="text-sm text-blue-600 hover:text-blue-800 font-medium"><i className="fas fa-plus mr-1"></i> Yeni Rozet Ekle</button>
              </div>
            )}

            {/* STATS */}
            {activeTab === "stats" && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">İstatistik Değerleri</h2>
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Mutlu Müşteri Sayısı" section="stats" field="customers" placeholder="500+" />
                  <Input label="Tamamlanan Temizlik Sayısı" section="stats" field="cleanings" placeholder="1000+" />
                  <Input label="Ortalama Puan" section="stats" field="rating" placeholder="4.9" />
                  <Input label="Sektör Tecrübesi (Yıl)" section="stats" field="experience" placeholder="5+" />
                </div>
              </div>
            )}

            {/* SERVICES SECTION TITLE */}
            {activeTab === "services_section" && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Hizmetler Giriş Başlıkları</h2>
                <Input label="Bölüm Başlığı" section="services_section" field="title" placeholder="Profesyonel Temizlik Çözümleri" />
                <Textarea label="Bölüm Alt Başlık / Açıklama" section="services_section" field="subtitle" />
              </div>
            )}

            {/* TESTIMONIALS */}
            {activeTab === "testimonials" && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Müşteri Google Yorumları</h2>
                
                <div className="flex flex-col gap-4 p-4 bg-gray-50 rounded-lg mb-4">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="google_reviews_active"
                      checked={content.google_reviews_active !== false}
                      onChange={e => setContent(p => ({ ...p, google_reviews_active: e.target.checked }))}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="google_reviews_active" className="text-sm font-medium text-gray-700 cursor-pointer select-none">
                      Google Yorumları Karuselini Web Sitesinde Göster
                    </label>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Maksimum Gösterilecek Yorum Sayısı</label>
                    <input
                      type="number"
                      value={content.google_reviews_count || 6}
                      onChange={e => setContent(p => ({ ...p, google_reviews_count: Number(e.target.value) }))}
                      className="w-32 px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
                      placeholder="6"
                    />
                  </div>
                </div>

                {content.testimonials.map((t, i) => (
                  <div key={i} className="p-4 bg-gray-50 rounded-lg space-y-2 border border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">Yorum {i + 1}</span>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          disabled={i === 0}
                          onClick={() => {
                            const list = [...content.testimonials];
                            const temp = list[i];
                            list[i] = list[i - 1];
                            list[i - 1] = temp;
                            setContent(p => ({ ...p, testimonials: list }));
                          }}
                          className="text-gray-500 hover:text-gray-800 text-xs font-semibold disabled:opacity-30 p-1"
                          title="Yukarı Taşı"
                        >
                          <i className="fas fa-arrow-up"></i>
                        </button>
                        <button
                          type="button"
                          disabled={i === content.testimonials.length - 1}
                          onClick={() => {
                            const list = [...content.testimonials];
                            const temp = list[i];
                            list[i] = list[i + 1];
                            list[i + 1] = temp;
                            setContent(p => ({ ...p, testimonials: list }));
                          }}
                          className="text-gray-500 hover:text-gray-800 text-xs font-semibold disabled:opacity-30 p-1"
                          title="Aşağı Taşı"
                        >
                          <i className="fas fa-arrow-down"></i>
                        </button>
                        <button onClick={() => setContent(p => ({ ...p, testimonials: p.testimonials.filter((_, j) => j !== i) }))} className="text-red-500 text-xs hover:text-red-700 font-semibold"><i className="fas fa-trash"></i> Sil</button>
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      <div className="col-span-1">
                        <label className="block text-xs text-gray-500 mb-1">Müşteri Adı</label>
                        <input placeholder="Ayşe K." value={t.name} onChange={e => { const ts = [...content.testimonials]; ts[i] = { ...ts[i], name: e.target.value }; setContent(p => ({ ...p, testimonials: ts })); }} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                      </div>
                      <div className="col-span-1">
                        <label className="block text-xs text-gray-500 mb-1">Konum</label>
                        <input placeholder="Antalya, Lara" value={t.location} onChange={e => { const ts = [...content.testimonials]; ts[i] = { ...ts[i], location: e.target.value }; setContent(p => ({ ...p, testimonials: ts })); }} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                      </div>
                      <div className="col-span-1">
                        <label className="block text-xs text-gray-500 mb-1">Yıldız Sayısı</label>
                        <select value={t.rating} onChange={e => { const ts = [...content.testimonials]; ts[i] = { ...ts[i], rating: Number(e.target.value) }; setContent(p => ({ ...p, testimonials: ts })); }} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                          {[5, 4, 3, 2, 1].map(r => <option key={r} value={r}>{r} Yıldız</option>)}
                        </select>
                      </div>
                      <div className="col-span-1">
                        <label className="block text-xs text-gray-500 mb-1">Avatar URL (İsteğe Bağlı)</label>
                        <input placeholder="https://..." value={t.avatar || ""} onChange={e => { const ts = [...content.testimonials]; ts[i] = { ...ts[i], avatar: e.target.value }; setContent(p => ({ ...p, testimonials: ts })); }} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Yorum Metni</label>
                      <textarea placeholder="Yorum metni..." rows={2} value={t.text} onChange={e => { const ts = [...content.testimonials]; ts[i] = { ...ts[i], text: e.target.value }; setContent(p => ({ ...p, testimonials: ts })); }} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                    </div>
                  </div>
                ))}
                <button onClick={() => setContent(p => ({ ...p, testimonials: [...p.testimonials, { name: "", text: "", rating: 5, location: "", avatar: "" }] }))} className="text-sm text-blue-600 hover:text-blue-800 font-medium"><i className="fas fa-plus mr-1"></i> Yeni Yorum Ekle</button>
              </div>
            )}

            {/* WHY US */}
            {activeTab === "whyus" && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Neden Biz Bölümü</h2>
                <Input label="Bölüm Başlığı" section="whyus" field="title" placeholder="Neden TİTAN 360?" />
                <Textarea label="Açıklama" section="whyus" field="subtitle" />
                
                <h3 className="text-sm font-semibold text-gray-700 mt-6 border-t pt-4">Neden Biz Özellikleri (Kartlar)</h3>
                {content.whyus.items.map((item, i) => (
                  <div key={i} className="p-4 bg-gray-50 rounded-lg space-y-2 border border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">Özellik Kartı {i + 1}</span>
                      {content.whyus.items.length > 1 && <button onClick={() => setContent(p => ({ ...p, whyus: { ...p.whyus, items: p.whyus.items.filter((_, j) => j !== i) } }))} className="text-red-500 text-xs hover:text-red-700"><i className="fas fa-trash text-sm"></i> Sil</button>}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input placeholder="İkon (örn: fa-user-shield)" value={item.icon} onChange={e => { const items = [...content.whyus.items]; items[i] = { ...items[i], icon: e.target.value }; setContent(p => ({ ...p, whyus: { ...p.whyus, items } })); }} className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                      <input placeholder="Başlık" value={item.title} onChange={e => { const items = [...content.whyus.items]; items[i] = { ...items[i], title: e.target.value }; setContent(p => ({ ...p, whyus: { ...p.whyus, items } })); }} className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                    </div>
                    <input placeholder="Açıklama" value={item.desc} onChange={e => { const items = [...content.whyus.items]; items[i] = { ...items[i], desc: e.target.value }; setContent(p => ({ ...p, whyus: { ...p.whyus, items } })); }} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                  </div>
                ))}
                <button onClick={() => setContent(p => ({ ...p, whyus: { ...p.whyus, items: [...p.whyus.items, { icon: "fa-check", title: "", desc: "" }] } }))} className="text-sm text-blue-600 hover:text-blue-800 font-medium"><i className="fas fa-plus mr-1"></i> Özellik Kartı Ekle</button>
              </div>
            )}

            {/* ABOUT */}
            {activeTab === "about" && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Hakkımızda Sayfa İçerikleri</h2>
                <Input label="Ana Sayfa Başlığı" section="about" field="title" placeholder="Hakkımızda" />
                <Textarea label="Paragraf 1" section="about" field="description" rows={3} />
                <Textarea label="Paragraf 2" section="about" field="description2" rows={3} />
                <Textarea label="Paragraf 3" section="about" field="description3" rows={3} />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Hakkımızda Görseli</label>
                  <div className="flex items-center gap-4 bg-white p-3 rounded-lg border border-gray-200">
                    {content.about.image ? (
                      <div className="relative w-24 h-24 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
                        <img src={content.about.image} alt="" className="w-full h-full object-cover" />
                        <button 
                          type="button"
                          onClick={() => u("about", "image", "")} 
                          className="absolute top-1 right-1 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-[10px] transition-colors"
                          title="Resmi Kaldır"
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      </div>
                    ) : (
                      <div className="w-24 h-24 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 flex-shrink-0">
                        <i className="fas fa-image text-2xl"></i>
                      </div>
                    )}
                    <div className="flex-1">
                      <input 
                        type="file" 
                        id="about-bg-file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={async e => {
                          const file = e.target.files?.[0];
                          if (file) {
                            try {
                              const url = await uploadImage(file);
                              u("about", "image", url);
                            } catch (err: any) {
                              alert(`Görsel yükleme hatası: ${err.message}`);
                            }
                          }
                        }}
                      />
                      <label 
                        htmlFor="about-bg-file"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold rounded-lg cursor-pointer transition-colors border border-blue-200"
                      >
                        <i className="fas fa-upload"></i> Görsel Seç
                      </label>
                      <p className="text-[10px] text-gray-400 mt-1">Önerilen boyut: 800x600px</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* CONTACT */}
            {activeTab === "contact" && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">İletişim Bilgileri</h2>
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Telefon Numarası" section="contact" field="phone" placeholder="+90 552 363 74 25" />
                  <Input label="WhatsApp Numarası" section="contact" field="whatsapp" placeholder="+90 552 363 74 25" />
                  <Input label="E-Posta Adresi" section="contact" field="email" placeholder="info@titan360.com.tr" />
                  <Input label="Firma Adresi" section="contact" field="address" placeholder="Antalya, Türkiye" />
                  <Input label="Hafta İçi Çalışma Saatleri" section="contact" field="hours_weekday" placeholder="08:00 - 20:00" />
                  <Input label="Hafta Sonu Çalışma Saatleri" section="contact" field="hours_weekend" placeholder="10:00 - 18:00" />
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
