"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import MobileStickyBar from "../components/MobileStickyBar";

interface BlogPost {
  id: string;
  title: string;
  summary?: string;
  image?: string;
  slug: string;
  created_at: string;
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/blog")
      .then(res => res.ok ? res.json() : [])
      .then(setPosts)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const phone = "+90 552 363 74 25";
  const waLink = "https://wa.me/905523637425";

  return (
    <div className="min-h-screen flex flex-col bg-white overflow-hidden pb-16 md:pb-0">
      <Navbar />

      {/* Header */}
      <section className="bg-slate-900 py-16 text-white text-center relative">
        <div className="absolute inset-0 bg-cover bg-center opacity-10" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1000&q=80')` }} />
        <div className="relative page-container z-10">
          <span className="inline-block px-4 py-1.5 bg-emerald-500/20 text-emerald-300 text-xs font-bold rounded-full mb-3 tracking-widest uppercase">Temizlik Rehberi</span>
          <h1 className="text-3xl md:text-5xl font-extrabold mb-4">Blog & Temizlik İpuçları</h1>
          <p className="text-slate-300 max-w-xl mx-auto text-sm sm:text-base">Koltuk bakımı, leke çıkarma rehberleri ve evinizi temiz tutmanın püf noktaları.</p>
        </div>
      </section>

      {/* Blog List */}
      <section className="py-16 md:py-24 bg-white flex-1">
        <div className="page-container">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-12 h-12 border-4 border-slate-200 border-t-sky-600 rounded-full animate-spin mb-4"></div>
              <p className="text-slate-500">Yazılar Yükleniyor...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-20 border border-slate-100 bg-slate-50 rounded-2xl max-w-md mx-auto">
              <i className="fas fa-newspaper text-slate-300 text-5xl mb-4"></i>
              <h2 className="text-xl font-bold text-slate-800 mb-2">Henüz Yazı Eklenmemiş</h2>
              <p className="text-slate-500 text-sm mb-6">Yöneticilerimiz yakında ilk temizlik ipuçlarını paylaşacaklardır.</p>
              <Link href="/" className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl text-sm transition-all shadow-md">
                Ana Sayfaya Dön
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post) => (
                <article key={post.id} className="group flex flex-col justify-between border border-slate-100/80 rounded-2xl shadow-md overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                  <div>
                    <div className="relative h-48 bg-slate-100 overflow-hidden">
                      <img
                        src={post.image || "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&q=80"}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-6">
                      <time className="text-xs text-slate-400 font-semibold block mb-2">
                        {new Date(post.created_at).toLocaleDateString("tr-TR", { year: "numeric", month: "long", day: "numeric" })}
                      </time>
                      <h2 className="text-xl font-bold text-slate-800 mb-3 group-hover:text-sky-600 transition-colors line-clamp-2">
                        {post.title}
                      </h2>
                      <p className="text-sm text-slate-500 line-clamp-3 leading-relaxed">
                        {post.summary}
                      </p>
                    </div>
                  </div>
                  <div className="p-6 pt-0">
                    <Link href={`/blog/${post.slug}`} className="inline-flex items-center gap-1.5 text-sm text-sky-600 hover:text-sky-700 font-bold">
                      Devamını Oku <i className="fas fa-chevron-right text-xs"></i>
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
      <MobileStickyBar phone={phone} waLink={waLink} />
    </div>
  );
}
