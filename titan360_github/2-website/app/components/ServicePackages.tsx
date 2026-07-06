import React from 'react';

interface ServicePackage {
  id: string;
  name: string;
  price: number;
  features: string[];
  is_popular?: boolean;
}

interface ServicePackagesProps {
  packages: ServicePackage[];
  serviceName: string;
  phoneClean: string;
  waLink: string;
}

export default function ServicePackages({ packages, serviceName, phoneClean, waLink }: ServicePackagesProps) {
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
          <p className="text-slate-500 max-w-2xl mx-auto">İhtiyacınıza en uygun paketi seçin, profesyonel temizliğin keyfini çıkarın. Gizli ücret veya sürpriz masraf yok.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 items-start">
          {packages.map((pkg, idx) => {
            const isPopular = pkg.is_popular;
            return (
              <div 
                key={pkg.id || idx} 
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
                  <ul className="space-y-4 mb-8 flex-1">
                    {pkg.features.map((feature, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-3">
                        <i className="fas fa-check-circle mt-1 text-emerald-500 text-sm"></i>
                        <span className="text-slate-600 text-sm sm:text-base">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <a 
                    href={isPopular ? waLink : "tel:" + phoneClean} 
                    target={isPopular ? "_blank" : undefined}
                    rel={isPopular ? "noopener noreferrer" : undefined}
                    className={`block w-full text-center py-4 rounded-xl font-bold transition-all ${
                      isPopular 
                      ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/25 hover:-translate-y-0.5' 
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                    }`}
                  >
                    {isPopular ? (
                      <><i className="fab fa-whatsapp mr-2"></i> WhatsApp'tan Seç</>
                    ) : (
                      <><i className="fas fa-phone mr-2"></i> Hemen Ara</>
                    )}
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
