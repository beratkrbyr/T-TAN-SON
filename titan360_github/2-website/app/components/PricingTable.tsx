"use client";
import React from 'react';

export interface PricingFeature {
  name: string;
  included: boolean;
}

export interface PricingPackage {
  id: string;
  name: string;
  price: string;
  badge?: string;
  isPopular?: boolean;
  features: PricingFeature[];
}

interface PricingTableProps {
  packages?: PricingPackage[];
  phone?: string;
}

const defaultPackages: PricingPackage[] = [
  {
    id: "pkg_1",
    name: "Standart Paket",
    price: "2500 TL'den",
    features: [
      { name: "Temel temizlik maddeleri", included: true },
      { name: "Genel zemin süpürme ve silme", included: true },
      { name: "Yüzeysel toz alma", included: true },
      { name: "Fırın içi ve buzdolabı detay", included: false },
      { name: "Camların dıştan silinmesi", included: false },
      { name: "Balkon yıkama", included: false },
    ]
  },
  {
    id: "pkg_2",
    name: "TİTAN Detaylı",
    price: "4500 TL'den",
    badge: "👑 En Çok Tercih Edilen",
    isPopular: true,
    features: [
      { name: "Temel temizlik maddeleri", included: true },
      { name: "Genel zemin süpürme ve silme", included: true },
      { name: "Detaylı toz alma", included: true },
      { name: "Fırın içi ve buzdolabı detay", included: true },
      { name: "Camların iç/dış silinmesi", included: true },
      { name: "Balkon yıkama", included: true },
    ]
  },
  {
    id: "pkg_3",
    name: "Ultra VIP Paket",
    price: "8000 TL'den",
    badge: "Premium Hizmet",
    features: [
      { name: "Premium temizlik maddeleri", included: true },
      { name: "İnce detaylı dip köşe temizlik", included: true },
      { name: "Buharlı dezenfeksiyon", included: true },
      { name: "Fırın içi ve buzdolabı detay", included: true },
      { name: "Camların iç/dış silinmesi", included: true },
      { name: "Koltuk veya Yatak Yıkama (1 Adet)", included: true },
    ]
  }
];

export default function PricingTable({ packages, phone }: PricingTableProps) {
  const displayPackages = packages && packages.length > 0 ? packages : defaultPackages;
  const phoneNumber = phone || "+905523637425";
  const phoneClean = phoneNumber.replace(/[^0-9]/g, "");

  const handleWhatsApp = (pkgName: string) => {
    const msg = `Merhaba Titan 360 ekibi, web sitenizden ulaşıyorum. 👋\n\n📌 *${pkgName}* hakkında detaylı bilgi ve fiyat almak istiyorum. Yardımcı olabilir misiniz?`;
    window.open(`https://wa.me/${phoneClean}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <section className="py-20 bg-slate-50 relative" id="fiyatlar">
      <div className="absolute top-0 left-0 w-full h-1/2 bg-white"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-black text-slate-800 mb-4">Size En Uygun Paketi Seçin</h2>
          <p className="text-lg text-slate-500">Şeffaf fiyatlandırma, sürpriz maliyetler yok. İhtiyacınıza göre tasarlanmış temizlik paketlerimiz.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-start">
          {displayPackages.map((pkg, idx) => (
            <div 
              key={pkg.id || idx} 
              className={`bg-white rounded-3xl relative flex flex-col h-full transition-all duration-300 ${
                pkg.isPopular 
                  ? 'border-2 border-emerald-500 shadow-2xl shadow-emerald-500/10 scale-100 md:scale-105 z-10' 
                  : 'border border-slate-200 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:border-emerald-200'
              }`}
            >
              {pkg.badge && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 whitespace-nowrap">
                  <span className={`px-4 py-1.5 rounded-full text-sm font-bold shadow-md ${
                    pkg.isPopular ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-white'
                  }`}>
                    {pkg.badge}
                  </span>
                </div>
              )}

              <div className="p-8 pb-6 border-b border-slate-100 text-center flex-shrink-0">
                <h3 className="text-xl font-bold text-slate-800 mb-2 mt-4">{pkg.name}</h3>
                <div className="flex items-baseline justify-center gap-1 mb-4">
                  <span className="text-4xl font-black text-slate-800">{pkg.price}</span>
                </div>
                <p className="text-slate-500 text-sm">Hemen randevu oluşturun</p>
              </div>

              <div className="p-8 pt-6 flex-1 flex flex-col">
                <ul className="space-y-4 mb-8 flex-1">
                  {pkg.features.map((feature, fIdx) => (
                    <li key={fIdx} className="flex items-start gap-3">
                      {feature.included ? (
                        <i className="fas fa-check text-emerald-500 mt-1 shrink-0"></i>
                      ) : (
                        <i className="fas fa-times text-rose-400 mt-1 shrink-0 opacity-60"></i>
                      )}
                      <span className={`text-sm ${feature.included ? 'text-slate-700 font-medium' : 'text-slate-400 line-through'}`}>
                        {feature.name}
                      </span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleWhatsApp(pkg.name)}
                  className={`w-full py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 mt-auto ${
                    pkg.isPopular
                      ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/30 hover:-translate-y-1'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-800 hover:-translate-y-1'
                  }`}
                >
                  <i className="fab fa-whatsapp text-lg"></i>
                  {pkg.name} Seç
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
