"use client";
import { useEffect, useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";

const API_URL = "https://titan-api-gcuw.onrender.com";

interface LedgerEntry {
  id: string;
  _id?: string;
  entry_type: "borc" | "alacak";
  amount: number;
  description: string;
  entry_date: string;
  category?: string;
}

function LedgerPageContent() {
  const searchParams = useSearchParams();
  const defaultTab = searchParams?.get("personel") ? "employees" : "customers";
  const defaultSelectedEmpId = searchParams?.get("personel");

  const [activeTab, setActiveTab] = useState<"customers" | "employees">(defaultTab);
  const [list, setList] = useState<any[]>([]);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [ledgerEntries, setLedgerEntries] = useState<LedgerEntry[]>([]);
  const [totals, setTotals] = useState({ borc: 0, alacak: 0, bakiye: 0 });
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState({
    entry_type: "borc",
    amount: "",
    description: "",
    entry_date: new Date().toISOString().split("T")[0],
    category: "",
  });

  useEffect(() => {
    fetchList();
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === "employees" && list.length > 0 && defaultSelectedEmpId && !selectedItem) {
      const emp = list.find((e: any) => e.id === defaultSelectedEmpId || e._id === defaultSelectedEmpId);
      if (emp) selectItem(emp);
    }
  }, [list, defaultSelectedEmpId, activeTab]);

  const fetchList = async () => {
    setLoading(true);
    setSelectedItem(null);
    setLedgerEntries([]);
    try {
      const token = localStorage.getItem("admin_token");
      const endpoint = activeTab === "customers" ? "/api/admin/customer-ledger/all-summary" : "/api/admin/employees";
      const res = await fetch(`${API_URL}${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setList(data || []);
      } else if (activeTab === "customers") {
        // Fallback for customers if summary endpoint is missing
        const fallbackRes = await fetch(`${API_URL}/api/admin/customers`, {
           headers: { Authorization: `Bearer ${token}` }
        });
        if (fallbackRes.ok) {
           const fallbackData = await fallbackRes.json();
           setList(fallbackData.map((c:any) => ({...c, bakiye: 0})) || []);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const selectItem = async (item: any) => {
    setSelectedItem(item);
    fetchLedger(item.id || item._id);
  };

  const fetchLedger = async (id: string) => {
    try {
      const token = localStorage.getItem("admin_token");
      const endpoint = activeTab === "customers" ? `/api/admin/customers/${id}/ledger` : `/api/admin/employees/${id}/ledger`;
      const res = await fetch(`${API_URL}${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setLedgerEntries(data.entries || []);
        setTotals({ borc: data.total_borc || 0, alacak: data.total_alacak || 0, bakiye: data.bakiye || 0 });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEntrySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;
    try {
      const token = localStorage.getItem("admin_token");
      const id = selectedItem.id || selectedItem._id;
      const endpoint = activeTab === "customers" ? `/api/admin/customers/${id}/ledger` : `/api/admin/employees/${id}/ledger`;
      
      let payload = { ...formData, amount: parseFloat(formData.amount) };
      if (activeTab === "employees" && ["kesinti", "diger_borc"].includes(formData.category)) {
        payload.entry_type = "borc";
      } else if (activeTab === "employees") {
        payload.entry_type = "alacak"; // maas, avans, prim etc. are alacak for employee
      }

      await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      
      setFormData({ ...formData, amount: "", description: "" });
      fetchLedger(id);
      fetchList(); // refresh balances
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteEntry = async (entryId: string) => {
    if (!confirm("İşlemi silmek istediğinize emin misiniz?")) return;
    try {
      const token = localStorage.getItem("admin_token");
      const endpoint = activeTab === "customers" ? `/api/admin/customer-ledger/${entryId}` : `/api/admin/employee-ledger/${entryId}`;
      await fetch(`${API_URL}${endpoint}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchLedger(selectedItem.id || selectedItem._id);
      fetchList();
    } catch (err) {
      console.error(err);
    }
  };

  const printLedger = () => {
    window.print();
  };

  const filteredList = list.filter(item => 
    item.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.phone?.includes(searchTerm)
  );

  // Compute running balance for table
  const ledgerRows = useMemo(() => {
    const sorted = [...ledgerEntries].sort((a,b) => a.entry_date.localeCompare(b.entry_date));
    let runBal = 0;
    return sorted.map(e => {
      const isBorc = e.entry_type === "borc";
      if (activeTab === "customers") {
        if (isBorc) runBal += e.amount; else runBal -= e.amount;
      } else {
        if (isBorc) runBal -= e.amount; else runBal += e.amount;
      }
      return { ...e, runBal };
    }).reverse();
  }, [ledgerEntries, activeTab]);

  return (
    <div className="space-y-6 flex flex-col h-[calc(100vh-6rem)]">
      {/* Header Tabs */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-2 rounded-2xl shadow-sm border border-gray-200 no-print">
        <div className="flex w-full sm:w-auto p-1 bg-gray-100 rounded-xl">
          <button 
            onClick={() => setActiveTab("customers")} 
            className={`flex-1 sm:flex-none px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === "customers" ? "bg-white text-sky-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
          >
            Müşteri Carisi
          </button>
          <button 
            onClick={() => setActiveTab("employees")} 
            className={`flex-1 sm:flex-none px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === "employees" ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
          >
            Personel Carisi
          </button>
        </div>
      </div>

      <div className="flex flex-1 gap-6 min-h-0">
        {/* Left Side: List */}
        <div className="w-1/3 bg-white border border-gray-200 rounded-2xl shadow-sm flex flex-col min-h-0 no-print">
          <div className="p-4 border-b border-gray-100">
            <div className="relative">
              <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
              <input
                type="text"
                placeholder="İsim ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:border-sky-500 focus:ring-1 outline-none"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {loading && <p className="text-center text-slate-400 py-4 text-sm">Yükleniyor...</p>}
            {!loading && filteredList.map(item => {
              const bal = item.bakiye || 0;
              const isSelected = selectedItem && (selectedItem.id === item.id || selectedItem._id === item._id);
              let balColor = "text-slate-500";
              let balLabel = "Sıfır";
              if (activeTab === "customers") {
                balColor = bal > 0 ? "text-red-500" : bal < 0 ? "text-emerald-500" : "text-slate-500";
                balLabel = bal > 0 ? "Borçlu" : bal < 0 ? "Alacaklı" : "Sıfır";
              } else {
                balColor = bal < 0 ? "text-red-500" : bal > 0 ? "text-emerald-500" : "text-slate-500";
                balLabel = bal < 0 ? "Borçlu" : bal > 0 ? "Alacaklı" : "Sıfır";
              }

              return (
                <div 
                  key={item.id || item._id} 
                  onClick={() => selectItem(item)}
                  className={`p-3 rounded-xl cursor-pointer transition-all mb-1 flex justify-between items-center border ${isSelected ? (activeTab==='customers'?'bg-sky-50 border-sky-200':'bg-emerald-50 border-emerald-200') : 'border-transparent hover:bg-gray-50'}`}
                >
                  <div className="min-w-0 flex-1">
                    <p className={`font-semibold text-sm truncate ${isSelected ? 'text-slate-800' : 'text-slate-700'}`}>{item.name}</p>
                    <p className="text-xs text-slate-400 truncate">{item.phone || item.position || "—"}</p>
                  </div>
                  <div className="text-right ml-2 flex-shrink-0">
                    <p className={`font-bold text-sm ${balColor}`}>{Math.abs(bal).toLocaleString('tr-TR')} TL</p>
                    <p className="text-[10px] text-slate-400 font-medium">{balLabel}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Ledger Detail */}
        <div className="w-2/3 flex flex-col gap-4 min-h-0 overflow-y-auto print:w-full">
          {!selectedItem ? (
            <div className="flex-1 bg-white border border-gray-200 rounded-2xl shadow-sm flex flex-col items-center justify-center text-slate-400">
              <i className="fas fa-hand-point-left text-4xl mb-3 opacity-50"></i>
              <p>Sol taraftan bir kayıt seçin</p>
            </div>
          ) : (
            <>
              {/* Stats Header */}
              <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 flex flex-wrap gap-6 justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-slate-800">{selectedItem.name}</h2>
                  <p className="text-sm text-slate-500">Cari Ekstresi</p>
                </div>
                <div className="flex gap-6 text-right">
                  <div>
                    <p className="text-xs text-slate-400 font-semibold uppercase">Toplam Borç</p>
                    <p className="text-lg font-bold text-red-500">{totals.borc.toLocaleString('tr-TR')} TL</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-semibold uppercase">Toplam Alacak</p>
                    <p className="text-lg font-bold text-emerald-500">{totals.alacak.toLocaleString('tr-TR')} TL</p>
                  </div>
                  <div className="pl-6 border-l border-gray-200">
                    <p className="text-xs text-slate-400 font-semibold uppercase">Net Bakiye</p>
                    <p className={`text-xl font-black ${totals.bakiye > 0 ? (activeTab==='customers'?'text-red-500':'text-emerald-500') : totals.bakiye < 0 ? (activeTab==='customers'?'text-emerald-500':'text-red-500') : 'text-slate-800'}`}>
                      {Math.abs(totals.bakiye).toLocaleString('tr-TR')} TL
                    </p>
                  </div>
                </div>
              </div>

              {/* Add Entry Form */}
              <form onSubmit={handleEntrySubmit} className="bg-gray-50 border border-gray-200 rounded-2xl p-5 shadow-inner no-print">
                <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                  <i className="fas fa-plus-circle text-sky-500"></i> Yeni İşlem Ekle
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-end">
                  {activeTab === "customers" ? (
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">İşlem Türü</label>
                      <select value={formData.entry_type} onChange={e => setFormData({...formData, entry_type: e.target.value as "borc"|"alacak"})} className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:border-sky-500 outline-none">
                        <option value="borc">Borç (Hizmet verildi)</option>
                        <option value="alacak">Alacak (Ödeme alındı)</option>
                      </select>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Kategori</label>
                      <select value={formData.category} onChange={e => {
                        const cat = e.target.value;
                        const descMap:any = { maas: "Maaş", avans: "Avans", prim: "Prim", kesinti: "Kesinti" };
                        setFormData({...formData, category: cat, description: descMap[cat] || ""});
                      }} className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:border-emerald-500 outline-none">
                        <option value="">Seçiniz...</option>
                        <option value="maas">Maaş (Alacak)</option>
                        <option value="avans">Avans (Alacak)</option>
                        <option value="prim">Prim (Alacak)</option>
                        <option value="kesinti">Kesinti (Borç)</option>
                        <option value="diger_alacak">Diğer Alacak</option>
                        <option value="diger_borc">Diğer Borç</option>
                      </select>
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Tutar (TL)</label>
                    <input type="number" required min="0" step="0.01" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:border-sky-500 outline-none" placeholder="0.00" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Açıklama</label>
                    <div className="flex gap-2">
                      <input type="text" required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="flex-1 p-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:border-sky-500 outline-none" placeholder="İşlem açıklaması" />
                      <button type="submit" className={`px-5 py-2.5 text-white rounded-xl font-medium transition-colors ${activeTab==='customers'?'bg-sky-600 hover:bg-sky-700':'bg-emerald-600 hover:bg-emerald-700'}`}>
                        Kaydet
                      </button>
                    </div>
                  </div>
                </div>
              </form>

              {/* Table */}
              <div className="bg-white border border-gray-200 rounded-2xl shadow-sm flex-1 overflow-hidden flex flex-col">
                <div className="px-5 py-3 border-b border-gray-100 flex justify-between items-center bg-gray-50 no-print">
                  <h3 className="font-semibold text-sm text-slate-700">İşlem Geçmişi</h3>
                  <button onClick={printLedger} className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1"><i className="fas fa-print"></i> Yazdır</button>
                </div>
                <div className="overflow-y-auto flex-1 p-0">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-white sticky top-0 border-b border-gray-200 text-xs uppercase text-slate-400 z-10">
                      <tr>
                        <th className="px-5 py-3 font-semibold">Tarih</th>
                        <th className="px-5 py-3 font-semibold">Açıklama</th>
                        {activeTab === "employees" && <th className="px-5 py-3 font-semibold">Kategori</th>}
                        <th className="px-5 py-3 font-semibold">Borç</th>
                        <th className="px-5 py-3 font-semibold">Alacak</th>
                        <th className="px-5 py-3 font-semibold">Bakiye</th>
                        <th className="px-5 py-3 text-right no-print"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {ledgerRows.length === 0 ? (
                        <tr><td colSpan={activeTab==='employees'?7:6} className="text-center py-10 text-slate-400">İşlem kaydı yok</td></tr>
                      ) : (
                        ledgerRows.map((entry: any) => {
                          const isBorc = entry.entry_type === "borc";
                          let balColor = "text-slate-800";
                          if (activeTab === "customers") balColor = entry.runBal > 0 ? "text-red-600" : entry.runBal < 0 ? "text-emerald-600" : "text-slate-800";
                          else balColor = entry.runBal < 0 ? "text-red-600" : entry.runBal > 0 ? "text-emerald-600" : "text-slate-800";

                          return (
                            <tr key={entry.id || entry._id} className="hover:bg-gray-50">
                              <td className="px-5 py-3 text-slate-600">{new Date(entry.entry_date).toLocaleDateString('tr-TR')}</td>
                              <td className="px-5 py-3 font-medium text-slate-700">{entry.description}</td>
                              {activeTab === "employees" && <td className="px-5 py-3 text-xs text-slate-500 uppercase">{entry.category || "—"}</td>}
                              <td className={`px-5 py-3 ${isBorc ? 'font-bold text-red-500' : 'text-slate-300'}`}>{isBorc ? entry.amount.toLocaleString('tr-TR') : "—"}</td>
                              <td className={`px-5 py-3 ${!isBorc ? 'font-bold text-emerald-500' : 'text-slate-300'}`}>{!isBorc ? entry.amount.toLocaleString('tr-TR') : "—"}</td>
                              <td className={`px-5 py-3 font-black ${balColor}`}>{Math.abs(entry.runBal).toLocaleString('tr-TR')}</td>
                              <td className="px-5 py-3 text-right no-print">
                                <button onClick={() => handleDeleteEntry(entry.id || entry._id)} className="text-slate-300 hover:text-red-500 p-1"><i className="fas fa-trash"></i></button>
                              </td>
                            </tr>
                          )
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function LedgerPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-full min-h-[50vh]"><div className="w-12 h-12 border-4 border-sky-200 border-t-sky-600 rounded-full animate-spin"></div></div>}>
      <LedgerPageContent />
    </Suspense>
  );
}
