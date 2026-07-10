"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CleaningAssistant({ 
  phone,
  packages = [],
  name = "Asistan Zeynep",
  avatar = "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&q=80",
  welcomeText = "Size özel paketi bulalım mı? 👋"
}: { 
  phone?: string,
  packages?: any[],
  name?: string,
  avatar?: string,
  welcomeText?: string
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(0); // 0: Start, 1: Step 1, 2: Step 2, 3: Step 3, 4: Step 4 (Location), 5: Result
  const [showTooltip, setShowTooltip] = useState(false);
  
  // Selections
  const [condition, setCondition] = useState("");
  const [size, setSize] = useState("");
  const [details, setDetails] = useState("");
  const [location, setLocation] = useState("");
  const [locationInput, setLocationInput] = useState("");

  const phoneNumber = phone || "+905523637425";
  const phoneClean = phoneNumber.replace(/[^0-9]/g, "");

  // Tooltip animation
  useEffect(() => {
    const timer = setInterval(() => {
      if (!isOpen) {
        setShowTooltip(true);
        setTimeout(() => setShowTooltip(false), 5000);
      }
    }, 15000);
    
    setTimeout(() => {
      if (!isOpen) setShowTooltip(true);
      setTimeout(() => setShowTooltip(false), 5000);
    }, 3000);

    return () => clearInterval(timer);
  }, [isOpen]);

  const getRecommendedPackage = () => {
    if (!packages || packages.length === 0) {
      if (details.includes("VIP") || details.includes("Koltuk")) return "Ultra VIP Paket";
      if (details.includes("Fırın") || condition.includes("İnşaat")) return "TİTAN Detaylı Paket";
      return "Standart Paket";
    }

    const isVip = details.includes("VIP") || details.includes("Koltuk");
    const isDetailed = details.includes("Fırın") || condition.includes("İnşaat");

    if (isVip && packages.length >= 3) {
      return packages[2].name;
    } else if (isDetailed && packages.length >= 2) {
      return packages[1].name;
    }
    return packages[0].name;
  };

  const handleWhatsApp = () => {
    const recommended = getRecommendedPackage();
    const locText = location || "Belirtilmedi";
    const msg = `Merhaba Titan 360 ekibi, web sitenizdeki asistan üzerinden paketimi belirledim. 👋\n\n📍 Evin Durumu: ${condition}\n📏 Büyüklük: ${size}\n🎯 Seçtiğim Detaylar: ${details}\n🌍 Konum: ${locText}\n\n💡 Önerilen Paket: ${recommended}\n\nBu paket için fiyatınızı ve müsaitlik durumunuzu öğrenebilir miyim?`;
    window.open(`https://wa.me/${phoneClean}?text=${encodeURIComponent(msg)}`, '_blank');
    setIsOpen(false);
    setStep(0);
    setLocation("");
    setLocationInput("");
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
        <AnimatePresence>
          {showTooltip && !isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
              className="mb-3 mr-2 bg-white text-slate-800 text-sm font-semibold px-4 py-2.5 rounded-2xl shadow-xl border border-slate-100 relative cursor-pointer"
              onClick={() => { setIsOpen(true); if (step === 0) setStep(1); }}
            >
              {welcomeText}
              <div className="absolute -bottom-2 right-4 w-4 h-4 bg-white border-b border-r border-slate-100 transform rotate-45"></div>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={() => {
            setIsOpen(true);
            if (step === 0) setStep(1);
          }}
          className="relative w-16 h-16 rounded-full shadow-2xl overflow-hidden border-2 border-white hover:scale-105 transition-transform duration-300 bg-white"
        >
          <img 
            src={avatar} 
            alt="Müşteri Temsilcisi" 
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-1 right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white shadow-sm"></div>
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-0">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="bg-gradient-to-r from-[var(--primary-color)] to-[var(--secondary-color)] p-5 text-white flex items-center gap-4">
                <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-white/30 shrink-0">
                  <img src={avatar} alt="Asistan" className="w-full h-full object-cover" />
                  <div className="absolute bottom-0.5 right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border border-white"></div>
                </div>
                <div>
                  <h3 className="font-bold text-lg leading-tight">{name}</h3>
                  <p className="text-white/80 text-xs">Size en uygun temizlik paketini bulacağım</p>
                </div>
                <button onClick={() => setIsOpen(false)} className="ml-auto w-8 h-8 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full transition-colors">
                  <i className="fas fa-times"></i>
                </button>
              </div>

              {step > 0 && step < 5 && (
                <div className="w-full bg-slate-100 h-1.5">
                  <motion.div 
                    className="h-full bg-emerald-500" 
                    initial={{ width: 0 }}
                    animate={{ width: `${(step / 4) * 100}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              )}

              <div className="p-6 overflow-y-auto flex-1">
                <AnimatePresence mode="wait">
                  {step === 1 && (
                    <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                      <h4 className="text-xl font-bold text-slate-800 mb-4">Temizlenecek alanın durumu nedir?</h4>
                      <div className="space-y-3">
                        {[
                          { id: "esya", label: "Eşyalı ve Yaşanan Ev", icon: "fa-home" },
                          { id: "bos", label: "Boş Ev - Yeni Taşınma", icon: "fa-boxes" },
                          { id: "insaat", label: "İnşaat veya Tadilat Sonrası", icon: "fa-hard-hat" }
                        ].map((item) => (
                          <button
                            key={item.id}
                            onClick={() => { setCondition(item.label); setStep(2); }}
                            className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-slate-100 hover:border-emerald-500 hover:bg-emerald-50 transition-all text-left group"
                          >
                            <div className="w-10 h-10 rounded-lg bg-slate-100 group-hover:bg-emerald-100 text-slate-500 group-hover:text-emerald-600 flex items-center justify-center transition-colors">
                              <i className={`fas ${item.icon} text-lg`}></i>
                            </div>
                            <span className="font-semibold text-slate-700">{item.label}</span>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {step === 2 && (
                    <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                      <h4 className="text-xl font-bold text-slate-800 mb-4">Alanın büyüklüğü yaklaşık ne kadar?</h4>
                      <div className="space-y-3">
                        {[
                          { id: "kucuk", label: "0-80 m²", icon: "fa-compress-arrows-alt" },
                          { id: "orta", label: "80-130 m²", icon: "fa-expand-arrows-alt" },
                          { id: "buyuk", label: "130 m² ve Üzeri", icon: "fa-expand" }
                        ].map((item) => (
                          <button
                            key={item.id}
                            onClick={() => { setSize(item.label); setStep(3); }}
                            className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-slate-100 hover:border-emerald-500 hover:bg-emerald-50 transition-all text-left group"
                          >
                            <div className="w-10 h-10 rounded-lg bg-slate-100 group-hover:bg-emerald-100 text-slate-500 group-hover:text-emerald-600 flex items-center justify-center transition-colors">
                              <i className={`fas ${item.icon} text-lg`}></i>
                            </div>
                            <span className="font-semibold text-slate-700">{item.label}</span>
                          </button>
                        ))}
                      </div>
                      <button onClick={() => setStep(1)} className="mt-4 text-sm text-slate-400 hover:text-slate-600 flex items-center gap-1">
                        <i className="fas fa-arrow-left"></i> Geri
                      </button>
                    </motion.div>
                  )}

                  {step === 3 && (
                    <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                      <h4 className="text-xl font-bold text-slate-800 mb-4">Hangi detaylar sizin için önemli?</h4>
                      <div className="space-y-3">
                        {[
                          { id: "standart", label: "Sadece standart temizlik", desc: "Zeminler, toz alma, genel düzen", icon: "fa-broom" },
                          { id: "detayli", label: "Standart + Fırın, Buzdolabı içi, Camlar, Balkon", desc: "Daha detaylı ve derinlemesine", icon: "fa-search" },
                          { id: "vip", label: "Her şey dahil VIP", desc: "Evinize değer katan en lüks temizlik", icon: "fa-crown" },
                          { id: "koltuk", label: "+ Koltuk-Yatak Yıkama eklentisi", desc: "Koltuk ve yataklarınız da yıkansın", icon: "fa-couch" }
                        ].map((item) => (
                          <button
                            key={item.id}
                            onClick={() => { setDetails(item.label); setStep(4); }}
                            className="w-full flex items-start gap-4 p-4 rounded-xl border-2 border-slate-100 hover:border-emerald-500 hover:bg-emerald-50 transition-all text-left group"
                          >
                            <div className="w-10 h-10 rounded-lg bg-slate-100 group-hover:bg-emerald-100 text-slate-500 group-hover:text-emerald-600 flex items-center justify-center shrink-0 mt-0.5 transition-colors">
                              <i className={`fas ${item.icon} text-lg`}></i>
                            </div>
                            <div className="text-left">
                              <span className="font-semibold text-slate-700 block mb-0.5">{item.label}</span>
                              <span className="text-xs text-slate-500">{item.desc}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                      <button onClick={() => setStep(2)} className="mt-4 text-sm text-slate-400 hover:text-slate-600 flex items-center gap-1">
                        <i className="fas fa-arrow-left"></i> Geri
                      </button>
                    </motion.div>
                  )}

                  {step === 4 && (
                    <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                      <h4 className="text-xl font-bold text-slate-800 mb-4">Hangi ilçe / bölgede bulunuyorsunuz?</h4>
                      <p className="text-sm text-slate-500 mb-4">Hizmetin sağlanacağı adresi daha iyi anlayabilmemiz için bulunduğunuz bölgeyi belirtin.</p>
                      
                      <div className="space-y-4">
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                            <i className="fas fa-map-marker-alt"></i>
                          </div>
                          <input 
                            type="text" 
                            className="w-full pl-10 pr-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:ring-0 transition-colors"
                            placeholder="Örn: Konyaaltı / Liman Mah."
                            value={locationInput}
                            onChange={(e) => setLocationInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && locationInput.trim()) {
                                setLocation(locationInput.trim());
                                setStep(5);
                              }
                            }}
                          />
                        </div>
                        
                        <button
                          onClick={() => { 
                            if(locationInput.trim()) {
                              setLocation(locationInput.trim());
                              setStep(5);
                            }
                          }}
                          disabled={!locationInput.trim()}
                          className="w-full py-3 bg-slate-800 hover:bg-slate-900 disabled:bg-slate-300 text-white font-bold rounded-xl shadow-lg transition-all"
                        >
                          Devam Et
                        </button>
                      </div>

                      <button onClick={() => setStep(3)} className="mt-4 text-sm text-slate-400 hover:text-slate-600 flex items-center gap-1">
                        <i className="fas fa-arrow-left"></i> Geri
                      </button>
                    </motion.div>
                  )}

                  {step === 5 && (
                    <motion.div key="step5" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-4">
                      <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5 text-emerald-500 text-4xl shadow-inner border-4 border-white">
                        <i className="fas fa-check"></i>
                      </div>
                      <h4 className="text-2xl font-black text-slate-800 mb-2">Harika Seçim!</h4>
                      <p className="text-slate-500 text-sm mb-6">İhtiyacınıza en uygun paketi bulduk:</p>
                      
                      <div className="bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 rounded-2xl p-5 mb-8 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500"></div>
                        <span className="block text-emerald-600 font-bold text-xs uppercase tracking-wide mb-1">TAVSİYE EDİLEN</span>
                        <span className="text-2xl font-black text-slate-800">{getRecommendedPackage()}</span>
                      </div>

                      <button
                        onClick={handleWhatsApp}
                        className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/30 transition-all hover:-translate-y-1 flex items-center justify-center gap-3 text-lg"
                      >
                        <i className="fab fa-whatsapp text-2xl"></i> Hemen WhatsApp'tan Fiyat Al
                      </button>
                      <button onClick={() => {setStep(1); setLocation(""); setLocationInput("");}} className="mt-5 text-sm text-slate-400 hover:text-slate-600 font-medium">
                        Baştan Başla
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
