"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) { setError("Kullanıcı adı ve şifre gerekli"); return; }
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username, password }) });
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("admin_token", data.token);
        localStorage.setItem("admin_username", data.username);
        router.push("/admin/dashboard");
      } else { setError("Giriş başarısız. Bilgileri kontrol edin."); }
    } catch { setError("Bağlantı hatası"); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-sky-50 via-white to-slate-100">
      <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 p-10 w-full max-w-md border border-slate-100">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-600 to-emerald-500 mb-4 shadow-lg shadow-sky-600/20">
            <i className="fas fa-bolt text-white text-2xl"></i>
          </div>
          <h1 className="text-2xl font-bold text-slate-800">TiTAN 360</h1>
          <p className="text-slate-500 text-sm mt-1">Yönetim Paneli</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
              <i className="fas fa-exclamation-circle"></i> {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Kullanıcı Adı</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><i className="fas fa-user"></i></span>
              <input type="text" value={username} onChange={e => setUsername(e.target.value)} className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all text-sm bg-white text-slate-800" placeholder="Kullanıcı adınız" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Şifre</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><i className="fas fa-lock"></i></span>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all text-sm bg-white text-slate-800" placeholder="Şifreniz" />
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full py-3 bg-gradient-to-r from-sky-600 to-sky-500 text-white font-semibold rounded-xl hover:from-sky-700 hover:to-sky-600 transition-all shadow-lg shadow-sky-600/20 disabled:opacity-50 flex items-center justify-center gap-2">
            {loading ? (<><i className="fas fa-spinner fa-spin"></i> Giriş Yapılıyor...</>) : (<>Giriş Yap <i className="fas fa-arrow-right"></i></>)}
          </button>
        </form>
      </div>
    </div>
  );
}
