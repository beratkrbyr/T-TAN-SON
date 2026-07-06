"use client";

import React, { useState } from 'react';

interface ServiceOption {
  id: string;
  name: string;
  price: number;
}

interface ServicePackage {
  id: string;
  name: string;
  price: number;
  features: string[];
  is_popular?: boolean;
  optional_addons?: string[];
}

interface ServicePackagesProps {
  packages: ServicePackage[];
  extras?: ServiceOption[];
  serviceName: string;
  phoneClean: string;
}

// Dinamik ikon eşleştirici
const getFeatureIcon = (feature: string) => {
  const lower = feature.toLowerCase();
  if (lower.includes('cam') || lower.includes('pencere')) return 'fas fa-window-maximize';
  if (lower.includes('zemin') || lower.includes('parke')) return 'fas fa-broom';
  if (lower.includes('toz')) return 'fas fa-wind';
  if (lower.includes('banyo') || lower.includes('tuvalet')) return 'fas fa-bath';
  if (lower.includes('mutfak') || lower.includes('dolap')) return 'fas fa-sink';
  if (lower.includes('derin') || lower.includes('detay')) return 'fas fa-search';
  if (lower.includes('balkon')) return 'fas fa-door-open';
  return 'fas fa-check-circle';
};

function PackageCard({ pkg, serviceName, extras = [], phoneClean }: { pkg: ServicePackage, serviceName: string, extras?: ServiceOption[], phoneClean: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const isPopular = pkg.is_popular;
  
  // Resolve add-ons names from their IDs
  const resolvedAddons = pkg.optional_addons 
    ? pkg.optional_addons.map(id => extras.find(ext => ext.id === id)).filter(Boolean) as ServiceOption[]
    : [];

  const handleActionClick = () => {
    // 1. GTM DataLayer Entegrasyonu
    if (typeof window !== 'undefined') {
      // @ts-ignore
      const dataLayer = window.dataLayer = window.dataLayer || [];
      dataLayer.push({
        event: 'package_purchase_click',
        ecommerce: {
          items: [{
            item_name: pkg.name,
            item_category: serviceName,
            price: pkg.price
          }]
        }
      });
    }

    // 2. Dinamik WhatsApp Mesajı Oluşturma
    let text = `Merhaba, ${serviceName} hizmetinizdeki *${pkg.name}* paketi hakkında bilgi almak istiyorum.\n\n`;
    text += `*Kapsam:*\n- ${pkg.features.join('\n- ')}\n`;
    
    if (resolvedAddons.length > 0) {
      text += `\n*Ekstra İstediklerim:*\n- ${resolvedAddons.map(a => a.name).join('\n- ')}\n`;
    }
    
    const encodedText = encodeURIComponent(text);
    const waUrl = `https://wa.me/${phoneClean.replace(/\s+/g, '')}?text=${encodedText}`;
    
    window.open(waUrl, '_blank');
  };

  return (
    <div 
      className={`relative flex flex-col h-full bg-white rounded-3xl border transition-all duration-300 ${
        isPopular 
        ? 'border-emerald-500 shadow-xl shadow-emerald-500/10 md:-translate-y-4' 
        : 'border-slate-200 shadow-md hover:shadow-lg'
      }`}
    >
      {isPopular && (
        <div className="absolute -top-4 left-0 right-0 flex justify-center">
          <span className="px-4 py-1 bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider rounded-full shadow-sm">
            En Çok Tercih Edilen
          </span>
        </div>
      )}

      <div className={`p-6 sm:p-8 text-center border-b ${isPopular ? 'border-emerald-100 bg-emerald-50/30' : 'border-slate-100'}`}>
        <h3 className="text-xl font-bold text-slate-800 mb-2">{pkg.name}</h3>
        <div className="flex items-center justify-center gap-1 mb-2">
          <span className="text-3xl sm:text-4xl font-extrabold text-slate-900">{pkg.price}</span>
          <span className="text-slate-500 font-medium mt-2">TL</span>
        </div>
        <p className="text-sm text-slate-400">Sabit Fiyat Garantisi</p>
      </div>

      <div className="p-6 sm:p-8 flex-1 flex flex-col">
        {/* Akordeon Toggle */}
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="w-full mb-4 flex items-center justify-between text-sm font-semibold text-slate-700 hover:text-emerald-600 transition-colors"
        >
          <span>Hizmet Detaylarını Gör</span>
          <i className={`fas fa-chevron-${isOpen ? 'up' : 'down'} transition-transform`}></i>
        </button>

        <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-[1000px] opacity-100 mb-6' : 'max-h-0 opacity-0'}`}>
          <ul className="space-y-4">
            {pkg.features.map((feature, fIdx) => (
              <li key={fIdx} className="flex items-start gap-3">
                <i className={`${getFeatureIcon(feature)} mt-1 text-emerald-500 text-sm w-4 text-center`}></i>
                <span className="text-slate-600 text-sm sm:text-base">{feature}</span>
              </li>
            ))}
          </ul>

          {resolvedAddons.length > 0 && (
            <div className="mt-6 pt-4 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Bu Pakete Özel Eklentiler</h4>
              <ul className="space-y-2">
                {resolvedAddons.map((addon) => (
                  <li key={addon.id} className="flex items-center justify-between text-sm bg-slate-50 p-2 rounded-lg">
                    <span className="text-slate-600 font-medium">{addon.name}</span>
                    <span className="text-emerald-600 font-bold">+{addon.price} TL</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="mt-auto pt-4 border-t border-slate-100">
          <button 
            onClick={handleActionClick}
            className={`w-full text-center py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
              isPopular 
              ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/25 hover:-translate-y-0.5' 
              : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
            }`}
          >
            <i className="fab fa-whatsapp text-lg"></i>
            Bu Paketi Satın Al
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ServicePackages({ packages, extras, serviceName, phoneClean }: ServicePackagesProps) {
  if (!packages || packages.length === 0) return null;

  return (
    <section className="py-20 bg-slate-50 border-b border-slate-100 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-sky-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

      <div className="page-container-sm relative z-10">
        <div className="text-center mb-12">
          <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 text-sm font-semibold rounded-full mb-3">Fiyatlandırma</span>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">{serviceName} Paketleri</h2>
          <p className="text-slate-500 max-w-2xl mx-auto">İhtiyacınıza en uygun paketi seçin, detayları inceleyin ve hemen randevunuzu oluşturun.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 items-start">
          {packages.map((pkg, idx) => (
            <PackageCard 
              key={pkg.id || idx} 
              pkg={pkg} 
              serviceName={serviceName} 
              extras={extras}
              phoneClean={phoneClean}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
