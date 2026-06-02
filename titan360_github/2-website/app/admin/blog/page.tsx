"use client";
import { useEffect, useState } from "react";

const API_URL = "";

interface BlogPost {
  id?: string;
  _id?: string;
  title: string;
  summary: string;
  content: string;
  image: string;
  slug: string;
  active: boolean;
  created_at?: string;
}

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [formData, setFormData] = useState<{
    title: string;
    summary: string;
    content: string;
    image: string;
    slug: string;
    active: boolean;
  }>({ title: "", summary: "", content: "", image: "", slug: "", active: true });

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`${API_URL}/api/admin/blog`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setPosts(data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const slugify = (text: string) => {
    const trMap: { [key: string]: string } = {
      'ç': 'c', 'Ç': 'c', 'ğ': 'g', 'Ğ': 'g', 'ı': 'i', 'İ': 'i', 'ö': 'o', 'Ö': 'o', 'ş': 's', 'Ş': 's', 'ü': 'u', 'Ü': 'u'
    };
    let str = text;
    for (const tr in trMap) {
      str = str.replace(new RegExp(tr, 'g'), trMap[tr]);
    }
    return str
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleTitleChange = (val: string) => {
    setFormData(prev => ({
      ...prev,
      title: val,
      slug: slugify(val)
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("admin_token");
      const url = editingPost
        ? `${API_URL}/api/admin/blog/${editingPost._id || editingPost.id}`
        : `${API_URL}/api/admin/blog`;
      const method = editingPost ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setShowModal(false);
        setEditingPost(null);
        setFormData({ title: "", summary: "", content: "", image: "", slug: "", active: true });
        fetchPosts();
      } else {
        const errData = await res.json();
        alert("Hata: " + (errData.detail || "İşlem başarısız"));
      }
    } catch (err) {
      console.error(err);
      alert("Sunucu bağlantı hatası oluştu.");
    }
  };

  const handleEdit = (post: BlogPost) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      summary: post.summary || "",
      content: post.content,
      image: post.image || "",
      slug: post.slug,
      active: post.active !== undefined ? post.active : true,
    });
    setShowModal(true);
  };

  const handleDelete = async (post: BlogPost) => {
    const id = post._id || post.id;
    if (!id) return;
    if (!confirm(`"${post.title}" başlıklı yazıyı silmek istediğinizden emin misiniz?`)) return;
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`${API_URL}/api/admin/blog/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        fetchPosts();
      } else {
        alert("Silme işlemi başarısız.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Blog Yönetimi</h2>
          <p className="text-sm text-slate-500">Müşterileriniz için temizlik rehberleri ve duyurular hazırlayın.</p>
        </div>
        <button
          onClick={() => {
            setEditingPost(null);
            setFormData({ title: "", summary: "", content: "", image: "", slug: "", active: true });
            setShowModal(true);
          }}
          className="px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-xl text-sm transition-all shadow-md flex items-center gap-2"
        >
          <i className="fas fa-plus"></i> Yeni Yazı Ekle
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 bg-white rounded-2xl border border-slate-100">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-sky-600 rounded-full animate-spin"></div>
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
          <i className="fas fa-newspaper text-slate-300 text-5xl mb-3 block"></i>
          <h3 className="text-lg font-bold text-slate-700 mb-1">Kayıtlı Blog Yazısı Yok</h3>
          <p className="text-slate-400 text-sm max-w-sm mx-auto mb-5">Henüz hiçbir blog yazısı eklemediniz. Hemen bir tane oluşturun.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase">
                  <th className="p-4 w-20">Görsel</th>
                  <th className="p-4">Yazı Başlığı</th>
                  <th className="p-4">Slug (URL)</th>
                  <th className="p-4">Tarih</th>
                  <th className="p-4 w-24">Durum</th>
                  <th className="p-4 w-32 text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-600">
                {posts.map((post) => (
                  <tr key={post._id || post.id} className="hover:bg-slate-50/55 transition-colors">
                    <td className="p-4">
                      <div className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden border border-slate-100">
                        {post.image ? (
                          <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400">
                            <i className="far fa-image text-lg"></i>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-4 font-semibold text-slate-800">
                      <div className="max-w-[280px] truncate" title={post.title}>{post.title}</div>
                    </td>
                    <td className="p-4 text-xs font-mono text-slate-400">
                      <div className="max-w-[180px] truncate" title={post.slug}>{post.slug}</div>
                    </td>
                    <td className="p-4 text-slate-500 text-xs">
                      {post.created_at ? new Date(post.created_at).toLocaleDateString("tr-TR") : "-"}
                    </td>
                    <td className="p-4">
                      {post.active ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span> Aktif
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-50 text-slate-500 border border-slate-100">
                          Pasif
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => handleEdit(post)}
                        className="p-1.5 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                        title="Düzenle"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button
                        onClick={() => handleDelete(post)}
                        className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Sil"
                      >
                        <i className="fas fa-trash-alt"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Write/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800">
                {editingPost ? "Blog Yazısını Düzenle" : "Yeni Blog Yazısı Ekle"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Başlık</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none"
                  placeholder="Temizlik İpuçları..."
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Slug (URL)</label>
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: slugify(e.target.value) })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm font-mono focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none"
                    placeholder="temizlik-ipuclari"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Görsel (Dosya Yükle)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100"
                  />
                </div>
              </div>

              {formData.image && (
                <div>
                  <span className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Görsel Önizleme</span>
                  <div className="relative h-40 rounded-xl overflow-hidden border border-slate-100">
                    <img src={formData.image} alt="Önizleme" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, image: "" })}
                      className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white rounded-lg p-1.5 text-xs transition-colors"
                    >
                      Resmi Kaldır
                    </button>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Özet</label>
                <input
                  type="text"
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none"
                  placeholder="Yazının kısa özeti..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">İçerik</label>
                <textarea
                  required
                  rows={8}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none resize-y"
                  placeholder="Yazı içeriği buraya gelecek..."
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="active"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="rounded border-slate-300 text-sky-600 focus:ring-sky-500 w-4 h-4"
                />
                <label htmlFor="active" className="text-sm font-semibold text-slate-700 select-none">Web sitesinde aktif olarak göster</label>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3 sticky bottom-0 bg-white">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-500 hover:bg-slate-50 rounded-xl text-sm font-semibold transition-colors"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-md"
                >
                  Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
