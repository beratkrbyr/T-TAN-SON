import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import LeadForm from "../../components/LeadForm";
import BeforeAfterSlider from "../../components/BeforeAfterSlider";
import MobileStickyBar from "../../components/MobileStickyBar";

interface ServiceOption {
  id: string;
  name: string;
  price: number;
}

interface ServiceItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  options?: ServiceOption[];
  slug?: string;
  seo_title?: string;
  seo_description?: string;
}

// Fallback services if database is unreachable
const defaultServices: ServiceItem[] = [
  {
    id: "1",
    name: "Koltuk Yıkama",
    description: "Profesyonel ekibimiz ve bitkisel şampuanlarımızla koltuklarınızı derinlemesine temizliyoruz. Lekelerden arındırıp hijyenik hale getiriyoruz.",
    price: 499,
    slug: "koltuk-yikama",
    seo_title: "Antalya Koltuk Yıkama Fiyatları | TiTAN 360",
    seo_description: "Antalya'da profesyonel yerinde koltuk yıkama hizmeti. %100 temizlik garantisi ve uygun fiyatlar için hemen ücretsiz teklif alın.",
    options: [
      { id: "1_1", name: "Standart Koltuk Takımı (5-7 Kişilik)", price: 499 },
      { id: "1_2", name: "L Koltuk Takımı", price: 549 },
      { id: "1_3", name: "Tekli Koltuk / Berjer", price: 149 }
    ]
  },
  {
    id: "2",
    name: "Halı Yıkama",
    description: "Antibakteriyel halı yıkama makinelerimizle halılarınızı yıpratmadan, ilk günkü temizliğine kavuşturuyoruz.",
    price: 99,
    slug: "hali-yikama",
    seo_title: "Antalya Halı Yıkama Fabrikası | TiTAN 360",
    seo_description: "Antalya halı yıkama hizmeti. Derinlemesine dezenfeksiyon, ücretsiz servis ve hızlı teslimat avantajıyla hemen teklif alın.",
    options: [
      { id: "2_1", name: "Makine Halısı (m²)", price: 99 },
      { id: "2_2", name: "Yün Halı (m²)", price: 149 },
      { id: "2_3", name: "El Dokuma Halısı (m²)", price: 199 }
    ]
  },
  {
    id: "3",
    name: "Yatak Yıkama",
    description: "Yataklarınızdaki mayt, akar ve bakterileri buharlı temizleme teknolojimizle tamamen yok ediyor, derinlemesine hijyen sağlıyoruz.",
    price: 299,
    slug: "yatak-yikama",
    seo_title: "Antalya Buharlı Yatak Yıkama Hizmeti | TiTAN 360",
    seo_description: "Buharlı yatak yıkama ve dezenfeksiyonu. Mayt ve bakterileri yok eden profesyonel sistemlerle Antalya geneli yerinde hizmet.",
    options: [
      { id: "3_1", name: "Tek Kişilik Yatak", price: 299 },
      { id: "3_2", name: "Çift Kişilik Yatak", price: 449 }
    ]
  }
];

const defaultGallery = [
  { before: "https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=600&q=80", after: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&q=80", label: "Koltuk Yıkama" },
  { before: "https://images.unsplash.com/photo-1558317374-067fb5f30001?w=600&q=80", after: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80", label: "Halı Yıkama" },
  { before: "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=600&q=80", after: "https://images.unsplash.com/photo-1563453392212-326f5e854473?w=600&q=80", label: "Yatak Yıkama" }
];

async function fetchServiceData(slug: string): Promise<ServiceItem | null> {
  try {
    const res = await fetch("http://localhost:8001/api/services", { next: { revalidate: 60 } });
    if (res.ok) {
      const services: ServiceItem[] = await res.json();
      const match = services.find(s => s.slug === slug);
      if (match) return match;
    }
  } catch (err) {}
  
  // Fallback match
  const fallback = defaultServices.find(s => s.slug === slug);
  return fallback || null;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const service = await fetchServiceData(slug);
  if (service) {
    return {
      title: service.seo_title || `${service.name} | TiTAN 360`,
      description: service.seo_description || service.description,
    };
  }
  return {
    title: "Temizlik Hizmeti | TiTAN 360",
  };
}

export default async function ServiceLandingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = await fetchServiceData(slug);
  
  if (!service) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center py-20 text-center">
          <h1 className="text-3xl font-bold text-slate-800 mb-4">Hizmet Bulunamadı</h1>
          <p className="text-slate-500 mb-8">Aradığınız hizmet açılış sayfası yayında değil veya taşınmış olabilir.</p>
          <Link href="/" className="px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl transition-all">
            Ana Sayfaya Dön
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const phone = "+90 552 363 74 25";
  const phoneClean = "05523637425";
  const waLink = `https://wa.me/905523637425?text=Merhaba,${encodeURIComponent(service.name)}%20hizmeti%20hakkında%20teklif%20almak%20istiyorum.`;
  
  // Find related gallery slider
  const matchedGallery = defaultGallery.find(g => service.name.toLowerCase().includes(g.label.toLowerCase().slice(0, 4))) || defaultGallery[0];

  // Service Schema LD JSON
  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "serviceType": service.name,
    "provider": {
      "@type": "LocalBusiness",
      "name": "TiTAN 360",
      "telephone": phone,
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Antalya",
        "addressCountry": "TR"
      }
    },
    "areaServed": "Antalya",
    "description": service.description,
    "offers": {
      "@type": "Offer",
      "price": service.price.toString(),
      "priceCurrency": "TRY"
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white overflow-hidden pb-16 md:pb-0">
      <Navbar />

      {/* Hero Section */}
      <section className="relative bg-slate-950 py-20 md:py-28 text-white">
        <div className="absolute inset-0 bg-cover bg-center opacity-30" style={{ backgroundImage: `url(${service.image || "https://images.unsplash.com/photo-1686178827149-6d55c72d81df?w=1400&q=80"})` }} />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/80 to-transparent" />
        
        <div className="relative page-container z-10">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            {/* Left Metin */}
            <div className="lg:col-span-7">
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/20 backdrop-blur-sm border border-emerald-400/30 rounded-full mb-6">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                <span className="text-sm font-medium text-emerald-300">Google Ads Özel Teklifi</span>
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight mb-6">
                {service.name}
              </h1>
              <p className="text-lg sm:text-xl text-slate-300 mb-8 max-w-xl leading-relaxed">
                {service.description}
              </p>
              
              {/* Güven Madde Noktaları */}
              <div className="grid sm:grid-cols-2 gap-4 mb-8">
                <div className="flex items-center gap-3 text-slate-200">
                  <i className="fas fa-check-circle text-emerald-400 text-lg"></i>
                  <span>Aynı Gün Profesyonel Servis</span>
                </div>
                <div className="flex items-center gap-3 text-slate-200">
                  <i className="fas fa-check-circle text-emerald-400 text-lg"></i>
                  <span>Bitkisel Şampuanlar & Hijyen</span>
                </div>
                <div className="flex items-center gap-3 text-slate-200">
                  <i className="fas fa-check-circle text-emerald-400 text-lg"></i>
                  <span>%100 Memnuniyet Garantisi</span>
                </div>
                <div className="flex items-center gap-3 text-slate-200">
                  <i className="fas fa-check-circle text-emerald-400 text-lg"></i>
                  <span>Antalya Geneli Yerinde Hizmet</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <a href={"tel:" + phoneClean} className="group flex items-center justify-center gap-3 px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-lg transition-all shadow-lg shadow-emerald-500/30 hover:-translate-y-0.5">
                  <i className="fas fa-phone-volume text-xl"></i> Hemen Teklif Al
                </a>
                <a href={waLink} target="_blank" rel="noopener noreferrer" className="group flex items-center justify-center gap-3 px-8 py-4 bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white font-bold rounded-xl text-lg transition-all hover:bg-white/20 hover:text-emerald-400 hover:border-emerald-400 hover:-translate-y-0.5">
                  <i className="fab fa-whatsapp text-xl"></i> WhatsApp Sorun
                </a>
              </div>
            </div>

            {/* Right Hızlı Form */}
            <div className="lg:col-span-5 w-full">
              <LeadForm />
            </div>
          </div>
        </div>
      </section>

      {/* Fiyat Listesi ve Fiyat Seçenekleri */}
      {service.options && service.options.length > 0 && (
        <section className="py-16 bg-slate-50 border-b border-slate-100">
          <div className="page-container-sm text-center">
            <h2 className="text-3xl font-bold text-slate-800 mb-4">Şeffaf {service.name} Fiyat Listesi</h2>
            <p className="text-slate-500 mb-10">Gizli hiçbir ücret yok, net metrekare ve adet bazlı fiyatlandırma.</p>
            <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl border border-slate-100/50 overflow-hidden">
              <div className="bg-gradient-to-r from-sky-600 to-sky-500 px-6 py-4 flex items-center gap-3">
                <i className="fas fa-tags text-white text-lg"></i>
                <h3 className="text-lg font-bold text-white">{service.name} Paketleri</h3>
              </div>
              <div className="divide-y divide-slate-100">
                {service.options.map((opt) => (
                  <div key={opt.id} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors">
                    <span className="font-semibold text-slate-700 text-sm sm:text-base">{opt.name}</span>
                    <span className="text-lg font-bold text-emerald-600">{opt.price} TL</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Önce Sonra Slider */}
      <section className="py-16 bg-white border-b border-slate-100">
        <div className="page-container-sm">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-slate-800 mb-3">{service.name} Sonuçlarımız</h2>
            <p className="text-slate-500">Müşterilerimize teslim ettiğimiz koltuk, yatak ve halılardaki farkı gözlerinizle görün.</p>
          </div>
          <div className="max-w-xl mx-auto">
            <BeforeAfterSlider
              beforeImage={matchedGallery.before}
              afterImage={matchedGallery.after}
              title={`${service.name} Öncesi / Sonrası`}
            />
          </div>
        </div>
      </section>

      {/* Hızlı İrtibat ve Neden Biz */}
      <section className="py-20 bg-slate-900 text-white relative">
        <div className="page-container-md text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Hızlı Randevu & Fiyat Bilgisi</h2>
          <p className="text-slate-400 mb-10 max-w-xl mx-auto">Uzman ekibimizle anında iletişim kurun, koltuklarınızı aynı gün yerinde dezenfekte edelim.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href={"tel:" + phoneClean} className="px-10 py-5 bg-white text-sky-700 font-bold rounded-xl hover:bg-sky-50 transition-all text-lg min-w-[260px]">
              <i className="fas fa-phone-volume mr-3"></i> {phone}
            </a>
            <a href={waLink} target="_blank" rel="noopener noreferrer" className="px-10 py-5 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600 transition-all text-lg min-w-[260px]">
              <i className="fab fa-whatsapp mr-3 text-xl"></i> WhatsApp Destek
            </a>
          </div>
        </div>
      </section>

      <Footer />
      <MobileStickyBar phone={phone} waLink={waLink} />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
    </div>
  );
}
