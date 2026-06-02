import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import MobileStickyBar from "../../components/MobileStickyBar";

interface BlogPost {
  id: string;
  title: string;
  content: string;
  summary?: string;
  image?: string;
  slug: string;
  created_at: string;
}

async function fetchBlogPost(slug: string): Promise<BlogPost | null> {
  try {
    const res = await fetch(`http://localhost:8001/api/blog/${slug}`, { next: { revalidate: 60 } });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {}
  return null;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await fetchBlogPost(slug);
  if (post) {
    return {
      title: `${post.title} | TiTAN 360`,
      description: post.summary || post.content.substring(0, 160),
    };
  }
  return {
    title: "Blog | TiTAN 360",
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await fetchBlogPost(slug);

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center py-20 text-center">
          <h1 className="text-3xl font-bold text-slate-800 mb-4">Yazı Bulunamadı</h1>
          <p className="text-slate-500 mb-8">Aradığınız blog yazısı yayından kaldırılmış veya taşınmış olabilir.</p>
          <Link href="/blog" className="px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl transition-all">
            Blog Sayfasına Dön
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const phone = "+90 552 363 74 25";
  const phoneClean = "05523637425";
  const waLink = `https://wa.me/905523637425?text=Merhaba,%20"${encodeURIComponent(post.title)}"%20başlıklı%20yazınızı%20okudum.%20Temizlik%20hizmetleriniz%20hakkında%20bilgi%20alabilir%20miyim?`;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 overflow-hidden pb-16 md:pb-0">
      <Navbar />

      {/* Hero Header Area */}
      <section className="bg-slate-900 py-16 text-white relative">
        <div className="absolute inset-0 bg-cover bg-center opacity-10" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1000&q=80')` }} />
        <div className="relative page-container z-10">
          <Link href="/blog" className="inline-flex items-center gap-2 text-sky-400 hover:text-sky-300 text-sm font-bold mb-4 transition-colors">
            <i className="fas fa-chevron-left text-xs"></i> Bloga Geri Dön
          </Link>
          <span className="block px-3 py-1 bg-sky-500/20 text-sky-300 text-xs font-bold rounded-full mb-3 w-fit tracking-wider uppercase">Temizlik İpuçları & Rehber</span>
          <h1 className="text-3xl md:text-5xl font-extrabold max-w-4xl leading-tight">
            {post.title}
          </h1>
          <div className="flex items-center gap-4 mt-6 text-slate-400 text-sm">
            <span className="flex items-center gap-1.5">
              <i className="far fa-calendar"></i>
              {new Date(post.created_at).toLocaleDateString("tr-TR", { year: "numeric", month: "long", day: "numeric" })}
            </span>
            <span className="w-1.5 h-1.5 bg-slate-700 rounded-full"></span>
            <span className="flex items-center gap-1.5">
              <i className="far fa-clock"></i> 4 dk Okuma
            </span>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="py-12 md:py-16 flex-1">
        <div className="page-container">
          <div className="grid lg:grid-cols-12 gap-10">
            {/* Left Content Column */}
            <article className="lg:col-span-8 bg-white rounded-2xl p-6 sm:p-10 shadow-sm border border-slate-100/80">
              {post.image && (
                <div className="relative h-[250px] sm:h-[400px] w-full rounded-xl overflow-hidden mb-8">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {post.summary && (
                <p className="text-lg text-slate-600 font-medium border-l-4 border-sky-500 pl-4 py-1 mb-8 leading-relaxed italic">
                  {post.summary}
                </p>
              )}

              <div className="prose max-w-none text-slate-700 leading-relaxed text-base sm:text-lg whitespace-pre-line space-y-6">
                {post.content}
              </div>
            </article>

            {/* Right Sidebar Column */}
            <aside className="lg:col-span-4 space-y-8">
              {/* WhatsApp & Call Widget */}
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500/10 rounded-full blur-xl"></div>
                <h3 className="text-xl font-bold mb-3 relative z-10">Hızlı Temizlik Desteği</h3>
                <p className="text-slate-300 text-sm mb-6 leading-relaxed relative z-10">
                  Antalya genelinde ev, koltuk, halı ve yatak yıkama hizmetlerimiz hakkında anında fiyat teklifi alın.
                </p>
                <div className="space-y-3 relative z-10">
                  <a href={waLink} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2.5 w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition-all shadow-md">
                    <i className="fab fa-whatsapp text-xl"></i> WhatsApp'tan Sorun
                  </a>
                  <a href={`tel:${phoneClean}`} className="flex items-center justify-center gap-2.5 w-full py-3.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-all border border-white/20">
                    <i className="fas fa-phone-alt"></i> Hemen Arayın
                  </a>
                </div>
                <div className="mt-4 pt-4 border-t border-white/10 text-center">
                  <span className="text-xs text-slate-400 font-semibold">{phone}</span>
                </div>
              </div>

              {/* Badges / Trust Info */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100/80">
                <h3 className="text-base font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100">Neden TiTAN 360?</h3>
                <ul className="space-y-3 text-sm text-slate-600">
                  <li className="flex items-start gap-2.5">
                    <i className="fas fa-check-circle text-emerald-500 mt-0.5"></i>
                    <span><strong>100% Memnuniyet:</strong> Beğenmediğiniz takdirde ücret talep etmiyoruz.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <i className="fas fa-check-circle text-emerald-500 mt-0.5"></i>
                    <span><strong>Yerinde Hizmet:</strong> Antalya geneli hızlı servis ağımızla adresinizdeyiz.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <i className="fas fa-check-circle text-emerald-500 mt-0.5"></i>
                    <span><strong>Bitkisel Şampuan:</strong> Çocuk ve evcil hayvan dostu sağlıklı temizlik.</span>
                  </li>
                </ul>
              </div>
            </aside>
          </div>
        </div>
      </main>

      <Footer />
      <MobileStickyBar phone={phone} waLink={waLink} />
    </div>
  );
}
