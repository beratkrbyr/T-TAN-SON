"use client";

import React, { useState } from 'react';

interface CleaningPackage {
  id: string;
  name: string;
  price: number;
  features: string[];
  is_popular?: boolean;
}

interface PackageComparisonProps {
  packages: CleaningPackage[];
  phoneClean: string;
}

// Dinamik ikon eşleştirici
const getFeatureIcon = (feature: string) => {
  const lower = feature.toLowerCase();
  if (lower.includes('cam') || lower.includes('pencere')) return 'fas fa-window-maximize';
  if (lower.includes('zemin') || lower.includes('parke') || lower.includes('yer')) return 'fas fa-broom';
  if (lower.includes('toz')) return 'fas fa-wind';
  if (lower.includes('banyo') || lower.includes('tuvalet') || lower.includes('wc')) return 'fas fa-bath';
  if (lower.includes('mutfak') || lower.includes('dolap') || lower.includes('fırın')) return 'fas fa-sink';
  if (lower.includes('derin') || lower.includes('detay')) return 'fas fa-search';
  if (lower.includes('balkon')) return 'fas fa-door-open';
  if (lower.includes('koltuk') || lower.includes('mobilya')) return 'fas fa-couch';
  if (lower.includes('halı') || lower.includes('kilim')) return 'fas fa-rug';
  if (lower.includes('buzdolabı') || lower.includes('beyaz eşya')) return 'fas fa-snowflake';
  if (lower.includes('dezenfektan') || lower.includes('hijyen')) return 'fas fa-shield-virus';
  if (lower.includes('kapı') || lower.includes('vestiyer')) return 'fas fa-door-closed';
  return 'fas fa-check-circle';
};

function PackageCard({ pkg, phoneClean, allFeatures }: { pkg: CleaningPackage; phoneClean: string; allFeatures: string[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const isPopular = pkg.is_popular;

  const handleWhatsApp = () => {
    if (typeof window !== 'undefined') {
      // @ts-ignore
      const dataLayer = window.dataLayer = window.dataLayer || [];
      dataLayer.push({
        event: 'package_purchase_click',
        package_name: pkg.name,
        package_price: pkg.price,
      });
    }

    const text = `Merhaba, ${pkg.name} hakkında bilgi almak istiyorum. Fiyat: ${pkg.price.toLocaleString("tr-TR")} TL.`;
    const url = `https://wa.me/${phoneClean.replace(/\s+/g, '')}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
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
          <span className="text-3xl sm:text-4xl font-extrabold text-slate-900">{pkg.price.toLocaleString("tr-TR")}</span>
          <span className="text-slate-500 font-medium mt-2">TL</span>
        </div>
        <p className="text-sm text-slate-400">Sabit Fiyat Garantisi</p>
      </div>

      <div className="p-6 sm:p-8 flex-1 flex flex-col">
        {/* Akordeon Toggle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          id={`gtm-package-details-${pkg.id}`}
          data-gtm-event="package_details_click"
          data-gtm-package={pkg.name}
          className="w-full mb-4 flex items-center justify-between text-sm font-semibold text-slate-700 hover:text-emerald-600 transition-colors"
        >
          <span>Hizmet Detaylarını Gör</span>
          <i className={`fas fa-chevron-${isOpen ? 'up' : 'down'} transition-transform`}></i>
        </button>

        <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-[1000px] opacity-100 mb-6' : 'max-h-0 opacity-0'}`}>
          <ul className="space-y-3">
            {pkg.features.map((feature, fIdx) => (
              <li key={fIdx} className="flex items-start gap-3">
                <i className={`${getFeatureIcon(feature)} mt-1 text-emerald-500 text-sm w-4 text-center`}></i>
                <span className="text-slate-600 text-sm sm:text-base">{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* WhatsApp Butonu */}
        <div className="mt-auto pt-4 border-t border-slate-100">
          <button
            onClick={handleWhatsApp}
            id={`gtm-package-buy-${pkg.id}`}
            data-gtm-event="package_buy_click"
            data-gtm-package={pkg.name}
            data-gtm-price={pkg.price}
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

export default function ServicePackages({ packages, phoneClean }: PackageComparisonProps) {
  if (!packages || packages.length === 0) return null;

  // Tüm paketlerdeki benzersiz özellikleri topla (karşılaştırma tablosu satırları)
  const allFeatures: string[] = [];
  packages.forEach(pkg => {
    pkg.features.forEach(f => {
      if (!allFeatures.includes(f)) allFeatures.push(f);
    });
  });

  return (
    <section className="py-20 bg-slate-50 border-b border-slate-100 relative overflow-hidden" id="paketler">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-sky-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 text-sm font-semibold rounded-full mb-3">Fiyatlandırma</span>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">Temizlik Paketlerimiz</h2>
          <p className="text-slate-500 max-w-2xl mx-auto">İhtiyacınıza en uygun paketi seçin, detayları karşılaştırın ve hemen randevunuzu oluşturun.</p>
        </div>

        {/* ===== KARŞILAŞTIRMA TABLOSU ===== */}
        {allFeatures.length > 0 && (
          <div className="mb-16">
            <h3 className="text-xl font-bold text-slate-700 text-center mb-6">Paket Karşılaştırması</h3>
            <div className="overflow-x-auto -mx-4 px-4 pb-4">
              <table className="w-full min-w-[600px] border-collapse bg-white rounded-2xl overflow-hidden shadow-lg border border-slate-200">
                <thead>
                  <tr>
                    <th className="text-left px-4 py-4 bg-slate-800 text-white font-semibold text-sm border-r border-slate-700 min-w-[200px]">
                      Temizlik Kalemleri
                    </th>
                    {packages.map((pkg) => (
                      <th
                        key={pkg.id}
                        className={`px-4 py-4 text-center font-bold text-sm min-w-[140px] border-r last:border-r-0 ${
                          pkg.is_popular
                            ? 'bg-emerald-600 text-white border-emerald-500'
                            : 'bg-slate-800 text-white border-slate-700'
                        }`}
                      >
                        <div>{pkg.name}</div>
                        <div className="text-xs font-normal mt-1 opacity-80">{pkg.price.toLocaleString("tr-TR")} TL</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {allFeatures.map((feature, rowIdx) => (
                    <tr
                      key={rowIdx}
                      className={`border-b border-slate-100 ${rowIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'} hover:bg-emerald-50/30 transition-colors`}
                    >
                      <td className="px-4 py-3 text-sm text-slate-700 font-medium border-r border-slate-100">
                        <div className="flex items-center gap-2">
                          <i className={`${getFeatureIcon(feature)} text-slate-400 text-xs w-4 text-center`}></i>
                          {feature}
                        </div>
                      </td>
                      {packages.map((pkg) => {
                        const hasFeature = pkg.features.includes(feature);
                        return (
                          <td
                            key={pkg.id}
                            className={`px-4 py-3 text-center border-r last:border-r-0 border-slate-100 ${
                              pkg.is_popular ? 'bg-emerald-50/20' : ''
                            }`}
                          >
                            {hasFeature ? (
                              <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-emerald-100 text-emerald-600">
                                <i className="fas fa-check text-sm"></i>
                              </span>
                            ) : (
                              <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-100 text-slate-300">
                                <i className="fas fa-minus text-sm"></i>
                              </span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
                {/* WhatsApp Satırı */}
                <tfoot>
                  <tr className="bg-slate-50 border-t-2 border-slate-200">
                    <td className="px-4 py-4 text-sm font-bold text-slate-700 border-r border-slate-100"></td>
                    {packages.map((pkg) => (
                      <td key={pkg.id} className="px-3 py-4 text-center border-r last:border-r-0 border-slate-100">
                        <button
                          onClick={() => {
                            if (typeof window !== 'undefined') {
                              // @ts-ignore
                              const dataLayer = window.dataLayer = window.dataLayer || [];
                              dataLayer.push({
                                event: 'package_table_buy_click',
                                package_name: pkg.name,
                                package_price: pkg.price,
                              });
                            }
                            const text = `Merhaba, ${pkg.name} hakkında bilgi almak istiyorum. Fiyat: ${pkg.price.toLocaleString("tr-TR")} TL.`;
                            window.open(`https://wa.me/${phoneClean.replace(/\s+/g, '')}?text=${encodeURIComponent(text)}`, '_blank');
                          }}
                          id={`gtm-table-buy-${pkg.id}`}
                          data-gtm-event="package_table_buy_click"
                          data-gtm-package={pkg.name}
                          className={`w-full py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                            pkg.is_popular
                              ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-md'
                              : 'bg-slate-200 hover:bg-slate-300 text-slate-800'
                          }`}
                        >
                          <i className="fab fa-whatsapp"></i>
                          Satın Al
                        </button>
                      </td>
                    ))}
                  </tr>
                </tfoot>
              </table>
            </div>
            <p className="text-center text-xs text-slate-400 mt-3">← Mobilde tabloyu kaydırarak tüm paketleri görebilirsiniz →</p>
          </div>
        )}

        {/* ===== PAKET KARTLARI ===== */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 items-start">
          {packages.map((pkg, idx) => (
            <PackageCard
              key={pkg.id || idx}
              pkg={pkg}
              phoneClean={phoneClean}
              allFeatures={allFeatures}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
