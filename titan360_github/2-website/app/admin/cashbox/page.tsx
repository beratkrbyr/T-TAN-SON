"use client";
import { useEffect, useState, useMemo } from "react";
import Link from "next/link";

const API_URL = "https://titan-api-gcuw.onrender.com";

interface DailyEntry {
  _id: string;
  entry_date: string;
  amount: number;
  description: string;
  entry_type: "borc" | "alacak";
  category?: string;
  person_name: string;
  source: "customer" | "employee";
}

export default function DailyCashboxPage() {
  const [entries, setEntries] = useState<DailyEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);

  // Forms
  const [customerForm, setCustomerForm] = useState({ id: "", amount: "", description: "", newName: "" });
  const [employeeForm, setEmployeeForm] = useState({ id: "", amount: "", description: "", category: "avans" });
  
  const todayStr = new Date().toISOString().split("T")[0];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("admin_token");
      
      // Fetch today's transactions
      const resTrans = await fetch(`${API_URL}/api/admin/daily-transactions?date=${todayStr}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (resTrans.ok) {
        setEntries(await resTrans.json());
      }

      // Fetch customers & employees for dropdowns
      const resCust = await fetch(`${API_URL}/api/admin/customer-ledger/all-summary`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (resCust.ok) setCustomers(await resCust.json());

      const resEmp = await fetch(`${API_URL}/api/admin/employees`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (resEmp.ok) setEmployees(await resEmp.json());

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCustomerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerForm.id && !customerForm.newName) return alert("Lütfen müşteri seçin veya adını yazın");
    try {
      const token = localStorage.getItem("admin_token");
      let targetCustomerId = customerForm.id;

      // Hızlı yeni müşteri oluşturma
      if (customerForm.id === "NEW") {
        const createRes = await fetch(`${API_URL}/api/admin/customers`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ name: customerForm.newName, phone: "" })
        });
        if (createRes.ok) {
           const createData = await createRes.json();
           targetCustomerId = createData.id;
        } else {
           return alert("Müşteri oluşturulamadı.");
        }
      }

      await fetch(`${API_URL}/api/admin/customers/${targetCustomerId}/ledger`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          entry_type: "alacak", // Customer paying us is alacak
          amount: parseFloat(customerForm.amount),
          description: customerForm.description || "Tahsilat",
          entry_date: todayStr
        })
      });
      setCustomerForm({ id: "", amount: "", description: "", newName: "" });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEmployeeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeForm.id) return alert("Lütfen personel seçin");
    try {
      const token = localStorage.getItem("admin_token");
      
      const payload = {
        entry_type: "borc", // Giving money to employee is "borc" (deduction from our debt to them)
        amount: parseFloat(employeeForm.amount),
        description: employeeForm.description || (employeeForm.category === "avans" ? "Avans" : "Ödeme"),
        entry_date: todayStr,
        category: employeeForm.category
      };

      await fetch(`${API_URL}/api/admin/employees/${employeeForm.id}/ledger`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      setEmployeeForm({ id: "", amount: "", description: "", category: "avans" });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (entryId: string, source: "customer" | "employee") => {
    if (!confirm("İşlemi geri almak istediğinize emin misiniz?")) return;
    try {
      const token = localStorage.getItem("admin_token");
      const endpoint = source === "customer" ? `/api/admin/customer-ledger/${entryId}` : `/api/admin/employee-ledger/${entryId}`;
      
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      // Try alternative route if the previous one fails
      if (!res.ok && source === "employee") {
         await fetch(`${API_URL}/api/admin/employee-ledger/${entryId}`, {
           method: "GET", // My bad, backend defined delete as GET with same url due to copy paste.
           headers: { Authorization: `Bearer ${token}` }
         });
      }
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ amount: "", description: "" });

  const handleEditInit = (e: DailyEntry) => {
    setEditingEntryId(e._id);
    setEditForm({ amount: e.amount.toString(), description: e.description });
  };

  const handleEditSubmit = async (e: React.FormEvent, entry: DailyEntry) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("admin_token");
      const endpoint = entry.source === "customer" ? `/api/admin/customer-ledger/${entry._id}` : `/api/admin/employee-ledger/${entry._id}`;
      
      await fetch(`${API_URL}${endpoint}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          amount: editForm.amount,
          description: editForm.description
        })
      });
      setEditingEntryId(null);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  // Calculate totals
  const totals = useMemo(() => {
    let income = 0;
    let expense = 0;
    entries.forEach(e => {
      if (e.source === "customer" && e.entry_type === "alacak") income += e.amount;
      if (e.source === "employee" && e.entry_type === "borc") expense += e.amount;
    });
    return { income, expense, net: income - expense };
  }, [entries]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="w-12 h-12 border-4 border-sky-200 border-t-sky-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Günlük Kasa</h1>
        <p className="text-slate-500 mt-1 text-sm">{new Date().toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} — Hızlı İşlem Ekranı</p>
      </div>

      {/* Forms Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Income Card (Customer) */}
        <div className="bg-white border-2 border-emerald-100 rounded-3xl shadow-sm p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full -mr-10 -mt-10 opacity-50 pointer-events-none"></div>
          
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center text-xl shadow-inner">
              <i className="fas fa-arrow-down"></i>
            </div>
            <div>
              <h2 className="text-xl font-bold text-emerald-700">Para Girişi</h2>
              <p className="text-sm text-emerald-600/70">Müşteriden tahsilat</p>
            </div>
          </div>

          <form onSubmit={handleCustomerSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-1.5">Müşteri Seçin veya Ekleyin</label>
              <div className="flex flex-col gap-2">
                <select required value={customerForm.id} onChange={e => setCustomerForm({...customerForm, id: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none">
                  <option value="">Müşteri Seçiniz...</option>
                  <option value="NEW" className="font-bold text-emerald-600">+ Yeni Müşteri Ekle</option>
                  {customers.map(c => <option key={c.id || c._id} value={c.id || c._id}>{c.name}</option>)}
                </select>
                {customerForm.id === "NEW" && (
                  <input type="text" required value={customerForm.newName} onChange={e => setCustomerForm({...customerForm, newName: e.target.value})} className="w-full px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl text-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none placeholder-emerald-400" placeholder="Yeni müşteri adı soyadı..." />
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1.5">Tutar (TL)</label>
                <input type="number" required min="1" step="0.01" value={customerForm.amount} onChange={e => setCustomerForm({...customerForm, amount: e.target.value})} className="w-full px-4 py-3 bg-white border border-emerald-200 rounded-xl text-emerald-700 font-bold text-lg focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none placeholder-emerald-200" placeholder="0.00" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1.5">Açıklama (Ne satın aldı?)</label>
                <input type="text" value={customerForm.description} onChange={e => setCustomerForm({...customerForm, description: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-slate-800 focus:border-emerald-500 outline-none" placeholder="Örn: Yıkama ücreti" />
              </div>
            </div>
            <button type="submit" className="w-full py-4 mt-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-200 transition-all active:scale-[0.98]">
              KASAYA EKLE
            </button>
          </form>
        </div>

        {/* Expense Card (Employee) */}
        <div className="bg-white border-2 border-red-100 rounded-3xl shadow-sm p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-full -mr-10 -mt-10 opacity-50 pointer-events-none"></div>
          
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center text-xl shadow-inner">
              <i className="fas fa-arrow-up"></i>
            </div>
            <div>
              <h2 className="text-xl font-bold text-red-700">Para Çıkışı</h2>
              <p className="text-sm text-red-600/70">Personele yevmiye/avans</p>
            </div>
          </div>

          <form onSubmit={handleEmployeeSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-1.5">Personel Seçin</label>
              <select required value={employeeForm.id} onChange={e => setEmployeeForm({...employeeForm, id: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-slate-800 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none">
                <option value="">Seçiniz...</option>
                {employees.map(c => <option key={c.id || c._id} value={c.id || c._id}>{c.name}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1.5">Tutar (TL)</label>
                <input type="number" required min="1" step="0.01" value={employeeForm.amount} onChange={e => setEmployeeForm({...employeeForm, amount: e.target.value})} className="w-full px-4 py-3 bg-white border border-red-200 rounded-xl text-red-700 font-bold text-lg focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none placeholder-red-200" placeholder="0.00" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1.5">Açıklama</label>
                <input type="text" value={employeeForm.description} onChange={e => setEmployeeForm({...employeeForm, description: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-slate-800 focus:border-red-500 outline-none" placeholder="Örn: Günlük yevmiye" />
              </div>
            </div>
            <button type="submit" className="w-full py-4 mt-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg shadow-red-200 transition-all active:scale-[0.98]">
              KASADAN ÇIKAR
            </button>
          </form>
        </div>

      </div>

      {/* Daily Summary */}
      <div className="bg-slate-800 rounded-3xl shadow-xl overflow-hidden mt-8 text-white">
        <div className="p-6 md:p-8 flex flex-wrap gap-8 items-center justify-between border-b border-slate-700 bg-slate-900/50">
          <div>
            <h3 className="text-xl font-semibold text-sky-400">Günün Özeti</h3>
            <p className="text-slate-400 text-sm mt-1">Bugün yapılan tüm kasa hareketleri</p>
          </div>
          <div className="flex gap-8">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Giren</p>
              <p className="text-2xl font-bold text-emerald-400">+{totals.income.toLocaleString('tr-TR')} ₺</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Çıkan</p>
              <p className="text-2xl font-bold text-red-400">-{totals.expense.toLocaleString('tr-TR')} ₺</p>
            </div>
            <div className="pl-8 border-l border-slate-700">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Net Kasa</p>
              <p className={`text-3xl font-black ${totals.net >= 0 ? 'text-white' : 'text-red-400'}`}>
                {totals.net.toLocaleString('tr-TR')} ₺
              </p>
            </div>
          </div>
        </div>

        <div className="p-0">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-800/50 text-slate-400 text-xs uppercase font-semibold">
              <tr>
                <th className="px-6 py-4">Kişi / Kaynak</th>
                <th className="px-6 py-4">Açıklama</th>
                <th className="px-6 py-4 text-right">Tutar</th>
                <th className="px-6 py-4 text-center">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {entries.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                    <i className="fas fa-receipt text-3xl mb-3 opacity-20"></i>
                    <p>Bugün henüz bir kasa hareketi yok</p>
                  </td>
                </tr>
              ) : (
                entries.map(e => {
                  const isIncome = (e.source === "customer" && e.entry_type === "alacak");
                  const isExpense = (e.source === "employee" && e.entry_type === "borc");
                  
                  let amountColor = "text-slate-300";
                  let sign = "";
                  
                  if (isIncome) { amountColor = "text-emerald-400"; sign = "+"; }
                  else if (isExpense) { amountColor = "text-red-400"; sign = "-"; }

                  if (editingEntryId === e._id) {
                    return (
                      <tr key={e._id} className="bg-slate-700/80 transition-colors">
                        <td className="px-6 py-4">
                          <span className={`inline-block w-2 h-2 rounded-full mr-2 ${e.source === 'customer' ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                          <span className="font-medium text-slate-200">{e.person_name}</span>
                        </td>
                        <td className="px-6 py-4">
                          <input type="text" value={editForm.description} onChange={evt => setEditForm({...editForm, description: evt.target.value})} className="w-full px-2 py-1 bg-slate-900 border border-slate-600 rounded text-slate-200 outline-none focus:border-sky-500" />
                        </td>
                        <td className="px-6 py-4">
                          <input type="number" step="0.01" value={editForm.amount} onChange={evt => setEditForm({...editForm, amount: evt.target.value})} className="w-24 px-2 py-1 bg-slate-900 border border-slate-600 rounded text-slate-200 outline-none focus:border-sky-500 text-right" />
                        </td>
                        <td className="px-6 py-4 text-center space-x-2">
                          <button onClick={(evt) => handleEditSubmit(evt, e)} className="text-emerald-400 hover:text-emerald-300 transition-colors p-1" title="Kaydet"><i className="fas fa-check"></i></button>
                          <button onClick={() => setEditingEntryId(null)} className="text-slate-400 hover:text-slate-200 transition-colors p-1" title="İptal"><i className="fas fa-times"></i></button>
                        </td>
                      </tr>
                    )
                  }

                  return (
                    <tr key={e._id} className="hover:bg-slate-700/50 transition-colors group">
                      <td className="px-6 py-4">
                        <span className={`inline-block w-2 h-2 rounded-full mr-2 ${e.source === 'customer' ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                        <span className="font-medium text-slate-200">{e.person_name}</span>
                        <span className="text-xs text-slate-500 ml-2">({e.source === 'customer' ? 'Müşteri' : 'Personel'})</span>
                      </td>
                      <td className="px-6 py-4 text-slate-300">{e.description}</td>
                      <td className={`px-6 py-4 text-right font-bold text-lg ${amountColor}`}>
                        {sign}{e.amount.toLocaleString('tr-TR')} ₺
                      </td>
                      <td className="px-6 py-4 text-center space-x-1">
                        <button onClick={() => handleEditInit(e)} className="text-slate-500 hover:text-sky-400 transition-colors p-2 rounded-lg opacity-0 group-hover:opacity-100" title="Düzenle">
                          <i className="fas fa-edit"></i>
                        </button>
                        <button onClick={() => handleDelete(e._id, e.source)} className="text-slate-500 hover:text-red-400 transition-colors p-2 rounded-lg opacity-0 group-hover:opacity-100" title="Sil">
                          <i className="fas fa-trash"></i>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
