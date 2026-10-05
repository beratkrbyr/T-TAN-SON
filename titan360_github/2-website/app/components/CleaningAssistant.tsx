"use client";
import { toWaNumber } from "./phoneUtils";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

type Opt = { id: string; label: string; icon?: string; desc?: string };

const API_SUBMIT = "https://titan-api-gcuw.onrender.com/api/submissions/public";

// Boyut etiketinden (örn. "80-130 m²", "130 m² ve üzeri") hediye uygunluğunu çıkarır.
// true = uygun, false = uygun değil, null = emin değil (kullanıcıya sorulur)
function giftEligibility(label: string, minM2: number): boolean | null {
  const nums = (label.match(/\d+/g) || []).map(Number);
  if (nums.length === 0) return null;
  const lower = Math.min(...nums);
  const upper = Math.max(...nums);
  if (nums.length === 1) return lower >= minM2;
  if (lower >= minM2) return true;
  if (upper < minM2) return false;
  return null;
}

const normalizePhone = (raw: string) => raw.replace(/[^\d+]/g, "");

export default function CleaningAssistant({
  phone,
  packages = [],
  name = "Asistan Zeynep",
  avatar = "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&q=80",
  welcomeText = "Size özel paketi bulalım mı? 👋",
  subtitle = "Size en uygun temizlik paketini bulacağım",
  color = "",
  position = "left",
  size = "medium",
  leadCapture = true,
  questionCondition = "",
  questionSize = "",
  questionServices = "",
  questionLocation = "",
  optionsCondition = "",
  optionsSize = "",
  optionsServices = "",
  giftMinM2 = 0,
}: {
  phone?: string,
  packages?: any[],
  name?: string,
  avatar?: string,
  welcomeText?: string,
  subtitle?: string,
  color?: string,
  position?: string,
  size?: string,
  leadCapture?: boolean,
  questionCondition?: string,
  questionSize?: string,
  questionServices?: string,
  questionLocation?: string,
  optionsCondition?: string,
  optionsSize?: string,
  optionsServices?: string,
  giftMinM2?: number
}) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  // 0: kapalı, 1: durum, 2: büyüklük, 6: hediye kontrol, 3: hizmet, 4: bölge, 7: iletişim, 5: sonuç
  const [step, setStep] = useState(0);
  const [showTooltip, setShowTooltip] = useState(false);

  // Selections
  const [condition, setCondition] = useState("");
  const [sizeLabel, setSizeLabel] = useState("");
  const [details, setDetails] = useState("");
  const [location, setLocation] = useState("");
  const [locationInput, setLocationInput] = useState("");
  const [giftOk, setGiftOk] = useState<boolean | null>(null);
  const [leadName, setLeadName] = useState("");
  const [leadPhone, setLeadPhone] = useState("");
  const [sending, setSending] = useState(false);

  const phoneNumber = phone || "+905523637425";
  const phoneClean = toWaNumber(phoneNumber);
  const accent = color || "var(--primary-color)";
  const hasGift = giftMinM2 > 0;

  const parseOptions = (raw: string, defaults: Opt[]): Opt[] => {
    if (!raw || !raw.trim()) return defaults;
    return raw.split(',').map((item, idx) => {
      const label = item.trim();
      return { id: `opt_${idx}`, label, icon: "fa-check-circle", desc: "" };
    }).filter(i => i.label);
  };

  const conditionOptions = parseOptions(optionsCondition, [
    { id: "esya", label: "Eşyalı ve Yaşanan Ev", icon: "fa-home" },
    { id: "bos", label: "Boş Ev - Yeni Taşınma", icon: "fa-boxes" },
    { id: "insaat", label: "İnşaat veya Tadilat Sonrası", icon: "fa-hard-hat" }
  ]);

  const sizeOptions = parseOptions(optionsSize, [
    { id: "kucuk", label: "0-80 m²", icon: "fa-compress-arrows-alt" },
    { id: "orta", label: "80-130 m²", icon: "fa-expand-arrows-alt" },
    { id: "buyuk", label: "130 m² ve Üzeri", icon: "fa-expand" }
  ]);

  const servicesOptions = parseOptions(optionsServices, [
    { id: "standart", label: "Sadece standart temizlik", desc: "Zeminler, toz alma, genel düzen", icon: "fa-broom" },
    { id: "detayli", label: "Standart + Fırın, Camlar", desc: "Daha detaylı ve derinlemesine", icon: "fa-search", },
    { id: "koltuk", label: "+ Koltuk-Yatak Yıkama", desc: "Koltuk ve yataklarınız da yıkansın", icon: "fa-couch" }
  ]);

  // Balon: oturum başına en fazla 2 kez gösterilir (rahatsız etmesin)
  useEffect(() => {
    if (isOpen) return;
    let count = 0;
    try { count = Number(sessionStorage.getItem("assistant_tip_count") || "0"); } catch (e) {}
    if (count >= 2) return;
    const show = () => {
      setShowTooltip(true);
      try { sessionStorage.setItem("assistant_tip_count", String(++count)); } catch (e) {}
      setTimeout(() => setShowTooltip(false), 5000);
    };
    const t1 = setTimeout(show, 4000);
    const t2 = setTimeout(() => { if (count < 2) show(); }, 45000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [isOpen]);

  // Paket önerisi: durum + büyüklük + seçilen hizmetten bir "seviye" çıkarır
  const getRecommendedPackage = () => {
    const d = details.toLowerCase();
    let level = 0;
    if (d.includes("koltuk") || d.includes("yatak") || d.includes("detay") || d.includes("fırın") || d.includes("cam")) level = 1;
    if (condition.toLowerCase().includes("inşaat") || condition.toLowerCase().includes("tadilat")) level = Math.max(level, 1);
    const biggest = sizeOptions.length > 0 && sizeLabel === sizeOptions[sizeOptions.length - 1].label;
    if (biggest) level = Math.max(level, 1);

    if (!packages || packages.length === 0) {
      return ["Standart Paket", "TİTAN Detaylı Paket"][level];
    }
    return packages[Math.min(level, packages.length - 1)].name;
  };

  const eligible = hasGift && giftOk === true;

  const buildSummary = () => {
    const lines = [
      `📍 Evin Durumu: ${condition}`,
      `📏 Büyüklük: ${sizeLabel}`,
      `🎯 Seçtiğim Hizmet: ${details}`,
      `🌍 Bölge: ${location || "Belirtilmedi"}`,
      `💡 Önerilen Paket: ${getRecommendedPackage()}`,
    ];
    if (eligible) lines.push(`🎁 Kampanya: ${giftMinM2} m² ve üzeri hediye koltuk yıkama`);
    return lines.join("\n");
  };

  const handleWhatsApp = () => {
    const who = leadName.trim() ? `\n👤 Ad Soyad: ${leadName.trim()}` : "";
    const msg = `Merhaba Titan 360 ekibi 👋\nWeb sitenizdeki asistan üzerinden bilgi almak istiyorum.\n\n${buildSummary()}${who}\n\nFiyat ve müsaitlik durumu hakkında destek rica ederim. - titan360.com.tr`;
    window.open(`https://wa.me/${phoneClean}?text=${encodeURIComponent(msg)}`, '_blank');
    resetAll();
  };

  const resetAll = () => {
    setIsOpen(false);
    setStep(0);
    setCondition(""); setSizeLabel(""); setDetails("");
    setLocation(""); setLocationInput("");
    setGiftOk(null); setLeadName(""); setLeadPhone("");
  };

  const submitLead = async () => {
    const digits = leadPhone.replace(/\D/g, "");
    if (!leadName.trim() || digits.length < 10) return;
    setSending(true);
    try {
      const res = await fetch(API_SUBMIT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "assistant",
          name: leadName.trim(),
          phone: normalizePhone(leadPhone),
          service: details,
          message: buildSummary(),
        }),
      });
      if (res.ok && typeof window !== "undefined") {
        const w = window as any;
        w.dataLayer = w.dataLayer || [];
        // Kişisel veri içermez; yalnızca asistan akışının tamamlandığını işaretler
        w.dataLayer.push({ event: "assistant_lead_success", service_type: details, package_name: getRecommendedPackage() });
        // Gerçek müşteri adayı (ad + telefon bırakıldı): standart dönüşüm event'i + Enhanced Conversions verisi
        const nameParts = leadName.trim().split(/\s+/);
        const address: any = nameParts.length === 1
          ? { first_name: nameParts[0] }
          : { first_name: nameParts.slice(0, -1).join(" "), last_name: nameParts[nameParts.length - 1] };
        const userData: any = { address };
        if (digits.startsWith("05") && digits.length === 11) userData.phone_number = "+90" + digits.substring(1);
        else if (digits.startsWith("5") && digits.length === 10) userData.phone_number = "+90" + digits;
        else if (digits.startsWith("90") && digits.length === 12) userData.phone_number = "+" + digits;
        w.dataLayer.push({ event: "lead_form_success", form_source: "assistant", service_type: details, user_data: userData });
      }
    } catch (e) {}
    setSending(false);
    setStep(5);
  };

  // Adım sırası ve ilerleme çubuğu
  const order = [1, 2, ...(hasGift ? [6] : []), 3, 4, ...(leadCapture ? [7] : [])];
  const progressIdx = order.indexOf(step);
  const progress = progressIdx >= 0 ? ((progressIdx + 1) / (order.length + 1)) * 100 : 0;

  const afterSize = (label: string) => {
    setSizeLabel(label);
    if (hasGift) {
      const r = giftEligibility(label, giftMinM2);
      if (r === null) { setGiftOk(null); setStep(6); return; }
      setGiftOk(r);
    }
    setStep(3);
  };

  const afterLocation = () => { setStep(leadCapture ? 7 : 5); };

  if (pathname?.startsWith("/admin")) return null;

  const sizeCls =
    size === "small" ? "w-12 h-12 sm:w-14 sm:h-14" :
    size === "large" ? "w-16 h-16 sm:w-20 sm:h-20" :
    "w-14 h-14 sm:w-16 sm:h-16";
  const isRight = position === "right";

  const OptionButton = ({ item, onClick }: { item: Opt, onClick: () => void }) => (
    <button
      onClick={onClick}
      className="assistant-opt w-full flex items-center gap-3 p-3.5 rounded-xl border-2 border-slate-100 bg-white text-left transition-all hover:shadow-md"
      style={{ ['--ac' as any]: accent }}
    >
      <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center shrink-0">
        <i className={`fas ${item.icon || "fa-check-circle"} text-base`}></i>
      </div>
      <div className="text-left">
        <span className="font-semibold text-slate-700 block leading-tight">{item.label}</span>
        {item.desc && <span className="text-xs text-slate-500">{item.desc}</span>}
      </div>
    </button>
  );

  const Back = ({ to }: { to: number }) => (
    <button onClick={() => setStep(to)} className="mt-4 text-sm text-slate-400 hover:text-slate-600 flex items-center gap-1">
      <i className="fas fa-arrow-left"></i> Geri
    </button>
  );

  return (
    <>
      <style>{`
        .assistant-opt:hover { border-color: var(--ac); background: color-mix(in srgb, var(--ac) 8%, white); }
        .assistant-opt:hover > div:first-child { background: color-mix(in srgb, var(--ac) 18%, white); color: var(--ac); }
      `}</style>

      {/* Mobilde alt çubuğun üstünde durur, balon ve buton küçük */}
      <div
        className="fixed z-40 flex flex-col"
        style={{
          [isRight ? 'right' : 'left']: '1rem',
          bottom: isRight ? 'calc(15.5rem)' : '5.25rem',
          alignItems: isRight ? 'flex-end' : 'flex-start',
        }}
      >
        <AnimatePresence>
          {showTooltip && !isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
              className="mb-3 bg-white text-slate-800 text-[13px] sm:text-sm font-semibold px-3.5 py-2 rounded-2xl shadow-xl border border-slate-100 relative cursor-pointer max-w-[220px]"
              onClick={() => { setIsOpen(true); if (step === 0) setStep(1); }}
            >
              {welcomeText}
              <div className={`absolute -bottom-2 ${isRight ? 'right-6' : 'left-6'} w-4 h-4 bg-white border-b border-r border-slate-100 transform rotate-45`}></div>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={() => { setIsOpen(true); if (step === 0) setStep(1); }}
          className={`relative ${sizeCls} rounded-full shadow-2xl overflow-hidden border-2 border-white hover:scale-105 transition-transform duration-300 bg-white`}
          aria-label={name}
        >
          <img src={avatar} alt="Müşteri Temsilcisi" className="w-full h-full object-cover" />
          <div className="absolute bottom-1 right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white shadow-sm"></div>
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              className="relative w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh]"
            >
              <div
                className="p-4 sm:p-5 text-white flex items-center gap-3"
                style={{ background: `linear-gradient(90deg, ${accent}, var(--secondary-color))` }}
              >
                <div className="relative w-11 h-11 rounded-full overflow-hidden border-2 border-white/30 shrink-0">
                  <img src={avatar} alt="Asistan" className="w-full h-full object-cover" />
                  <div className="absolute bottom-0.5 right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border border-white"></div>
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-base sm:text-lg leading-tight truncate">{name}</h3>
                  <p className="text-white/85 text-xs leading-tight">{subtitle}</p>
                </div>
                <button onClick={() => setIsOpen(false)} className="ml-auto w-8 h-8 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full transition-colors shrink-0" aria-label="Kapat">
                  <i className="fas fa-times"></i>
                </button>
              </div>

              {progress > 0 && (
                <div className="w-full bg-slate-100 h-1.5">
                  <motion.div className="h-full" style={{ background: accent }} initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.3 }} />
                </div>
              )}

              <div className="p-5 sm:p-6 overflow-y-auto flex-1">
                <AnimatePresence mode="wait">
                  {step === 1 && (
                    <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                      {hasGift && (
                        <div className="mb-4 flex items-center gap-2 rounded-xl bg-amber-50 border border-amber-200 px-3 py-2 text-xs font-semibold text-amber-800">
                          <i className="fas fa-gift"></i> {giftMinM2} m² ve üzeri evlere koltuk takımı yıkama HEDİYE!
                        </div>
                      )}
                      <h4 className="text-lg sm:text-xl font-bold text-slate-800 mb-4">{questionCondition || "Temizlenecek alanın durumu nedir?"}</h4>
                      <div className="space-y-2.5">
                        {conditionOptions.map((item) => (
                          <OptionButton key={item.id} item={item} onClick={() => { setCondition(item.label); setStep(2); }} />
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {step === 2 && (
                    <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                      <h4 className="text-lg sm:text-xl font-bold text-slate-800 mb-4">{questionSize || "Alanın büyüklüğü yaklaşık ne kadar?"}</h4>
                      <div className="space-y-2.5">
                        {sizeOptions.map((item) => (
                          <OptionButton key={item.id} item={item} onClick={() => afterSize(item.label)} />
                        ))}
                      </div>
                      <Back to={1} />
                    </motion.div>
                  )}

                  {step === 6 && (
                    <motion.div key="step6" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                      <h4 className="text-lg sm:text-xl font-bold text-slate-800 mb-2">Evinizin büyüklüğü {giftMinM2} m² ve üzeri mi?</h4>
                      <p className="text-sm text-slate-500 mb-4">{giftMinM2} m² ve üzeri evlerde koltuk takımı yıkama hediye kampanyamızdan yararlanabilirsiniz.</p>
                      <div className="space-y-2.5">
                        <OptionButton item={{ id: "g_yes", label: `Evet, ${giftMinM2} m² ve üzeri`, icon: "fa-gift" }} onClick={() => { setGiftOk(true); setStep(3); }} />
                        <OptionButton item={{ id: "g_no", label: `Hayır, ${giftMinM2} m²'den küçük`, icon: "fa-home" }} onClick={() => { setGiftOk(false); setStep(3); }} />
                      </div>
                      <Back to={2} />
                    </motion.div>
                  )}

                  {step === 3 && (
                    <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                      <h4 className="text-lg sm:text-xl font-bold text-slate-800 mb-4">{questionServices || "Hangi hizmeti almak istiyorsunuz?"}</h4>
                      <div className="space-y-2.5">
                        {servicesOptions.map((item) => (
                          <OptionButton key={item.id} item={item} onClick={() => { setDetails(item.label); setStep(4); }} />
                        ))}
                      </div>
                      <Back to={hasGift && giftEligibility(sizeLabel, giftMinM2) === null ? 6 : 2} />
                    </motion.div>
                  )}

                  {step === 4 && (
                    <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                      <h4 className="text-lg sm:text-xl font-bold text-slate-800 mb-2">{questionLocation || "Hangi ilçe / bölgede bulunuyorsunuz?"}</h4>
                      <p className="text-sm text-slate-500 mb-4">Hizmetin sağlanacağı adresi daha iyi anlayabilmemiz için bulunduğunuz bölgeyi belirtin.</p>
                      <div className="space-y-3">
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                            <i className="fas fa-map-marker-alt"></i>
                          </div>
                          <input
                            type="text"
                            className="w-full pl-10 pr-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:outline-none transition-colors"
                            style={{ borderColor: locationInput ? accent : undefined }}
                            placeholder="Örn: Konyaaltı / Liman Mah."
                            value={locationInput}
                            onChange={(e) => setLocationInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && locationInput.trim()) { setLocation(locationInput.trim()); afterLocation(); }
                            }}
                          />
                        </div>
                        <button
                          onClick={() => { if (locationInput.trim()) { setLocation(locationInput.trim()); afterLocation(); } }}
                          disabled={!locationInput.trim()}
                          className="w-full py-3 bg-slate-800 hover:bg-slate-900 disabled:bg-slate-300 text-white font-bold rounded-xl shadow-lg transition-all"
                        >
                          Devam Et
                        </button>
                      </div>
                      <Back to={3} />
                    </motion.div>
                  )}

                  {step === 7 && (
                    <motion.div key="step7" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                      <h4 className="text-lg sm:text-xl font-bold text-slate-800 mb-2">Size nasıl ulaşalım?</h4>
                      <p className="text-sm text-slate-500 mb-4">Adınızı ve telefonunuzu bırakın, ekibimiz teklifinizi hazırlasın. İsterseniz bu adımı atlayıp doğrudan WhatsApp'a geçebilirsiniz.</p>
                      <div className="space-y-3">
                        <input
                          type="text"
                          className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:outline-none"
                          placeholder="Ad Soyad"
                          value={leadName}
                          onChange={(e) => setLeadName(e.target.value)}
                        />
                        <input
                          type="tel"
                          inputMode="tel"
                          className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:outline-none"
                          placeholder="Telefon (05xx xxx xx xx)"
                          value={leadPhone}
                          onChange={(e) => setLeadPhone(e.target.value)}
                        />
                        <button
                          onClick={submitLead}
                          disabled={sending || !leadName.trim() || leadPhone.replace(/\D/g, "").length < 10}
                          className="w-full py-3 text-white font-bold rounded-xl shadow-lg transition-all disabled:opacity-50"
                          style={{ background: accent }}
                        >
                          {sending ? "Gönderiliyor..." : "Devam Et"}
                        </button>
                        <button onClick={() => setStep(5)} className="w-full text-sm text-slate-500 hover:text-slate-700 font-medium py-1">
                          Atla, doğrudan WhatsApp'a geç
                        </button>
                        <p className="text-[11px] text-slate-400 leading-snug">
                          Bilgileriniz teklif için sizinle iletişime geçmek amacıyla kullanılır.{" "}
                          <Link href="/gizlilik-politikasi" target="_blank" className="underline">Gizlilik Politikası</Link>
                        </p>
                      </div>
                      <Back to={4} />
                    </motion.div>
                  )}

                  {step === 5 && (
                    <motion.div key="step5" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-2">
                      <div
                        className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl shadow-inner border-4 border-white"
                        style={{ background: `color-mix(in srgb, ${accent} 15%, white)`, color: accent }}
                      >
                        <i className="fas fa-check"></i>
                      </div>
                      <h4 className="text-xl font-black text-slate-800 mb-1">Harika Seçim!</h4>
                      <p className="text-slate-500 text-sm mb-5">İhtiyacınıza en uygun paketi bulduk:</p>

                      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 mb-4 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1" style={{ background: accent }}></div>
                        <span className="block font-bold text-xs uppercase tracking-wide mb-1" style={{ color: accent }}>TAVSİYE EDİLEN</span>
                        <span className="text-xl font-black text-slate-800">{getRecommendedPackage()}</span>
                      </div>

                      {eligible && (
                        <div className="mb-4 flex items-center justify-center gap-2 rounded-xl bg-amber-50 border border-amber-200 px-3 py-2.5 text-sm font-bold text-amber-800">
                          <i className="fas fa-gift"></i> Koltuk takımı yıkama hediyeniz hazır!
                        </div>
                      )}

                      <button
                        onClick={handleWhatsApp}
                        className="w-full py-3.5 text-white font-bold rounded-xl shadow-lg transition-all hover:-translate-y-0.5 flex items-center justify-center gap-3 text-base"
                        style={{ background: accent }}
                      >
                        <i className="fab fa-whatsapp text-xl"></i> Hemen WhatsApp'tan Fiyat Al
                      </button>
                      <button onClick={() => { setStep(1); setLocation(""); setLocationInput(""); setGiftOk(null); }} className="mt-4 text-sm text-slate-400 hover:text-slate-600 font-medium">
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
