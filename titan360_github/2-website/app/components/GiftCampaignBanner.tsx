"use client";
import { useEffect, useState } from "react";
import { GiftCampaign, parseGift, formatTL, pushGiftEvent } from "./giftUtils";

const API = "https://titan-api-gcuw.onrender.com/api/website-content";

function useCountdown(end: Date | null) {
  const [left, setLeft] = useState<number | null>(null);
  useEffect(() => {
    if (!end) { setLeft(null); return; }
    const tick = () => setLeft(Math.max(0, end.getTime() - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [end]);
  if (left === null) return null;
  const s = Math.floor(left / 1000);
  return {
    d: Math.floor(s / 86400),
    h: Math.floor((s % 86400) / 3600),
    m: Math.floor((s % 3600) / 60),
    s: s % 60,
    done: left === 0,
  };
}

const Box = ({ v, l }: { v: number; l: string }) => (
  <div className="flex flex-col items-center bg-white/15 backdrop-blur-sm border border-white/25 rounded-xl px-3 py-2 min-w-[56px]">
    <span className="text-xl md:text-2xl font-extrabold tabular-nums leading-none">{String(v).padStart(2, "0")}</span>
    <span className="text-[10px] uppercase tracking-wider opacity-80 mt-1">{l}</span>
  </div>
);

/**
 * Hediye kampanyası banner'ı. Veriyi admin panelinden (website-content) dinamik çeker.
 * Kampanya pasif / süresi dolmuşsa hiçbir şey render etmez.
 */
export default function GiftCampaignBanner({ placement = "home" }: { placement?: string }) {
  const [gift, setGift] = useState<GiftCampaign | null>(null);
  const [phone, setPhone] = useState("905523637425");
  const [m2, setM2] = useState("");

  useEffect(() => {
    let alive = true;
    fetch(API)
      .then(r => (r.ok ? r.json() : {}))
      .then((data: any) => {
        if (!alive) return;
        setGift(parseGift(data));
        const wa = (data?.contact?.whatsapp || data?.contact?.phone || "").replace(/[^0-9]/g, "");
        if (wa) setPhone(wa);
      })
      .catch(() => {});
    return () => { alive = false; };
  }, []);

  const cd = useCountdown(gift?.endDate ?? null);
  if (!gift || (cd && cd.done)) return null;

  const handleClick = () => {
    pushGiftEvent("campaign_gift_click", { placement, gift_value: gift.value });
    const m2Text = m2 ? ` Evim yaklaşık ${m2} m2.` : "";
    const text = `Merhaba, ${gift.minM2} m2 ve üzeri ev temizliği + hediye koltuk takımı yıkama kampanyası hakkında bilgi almak istiyorum.${m2Text} - titan360.com.tr`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, "_blank");
  };

  return (
    <section className="px-4 py-6 md:py-10" data-testid="gift-campaign-banner">
      <div className="max-w-6xl mx-auto relative overflow-hidden rounded-3xl bg-gradient-to-br from-sky-700 via-sky-600 to-emerald-500 text-white shadow-2xl">
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-white/10 rounded-full blur-2xl" />
        <div className="absolute -bottom-20 -left-10 w-72 h-72 bg-emerald-300/20 rounded-full blur-3xl" />
        <div className="relative grid md:grid-cols-12 gap-6 items-center p-6 md:p-10">
          <div className="md:col-span-7">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-400 text-slate-900 text-xs font-extrabold uppercase tracking-wider shadow">
              <i className="fas fa-gift"></i> Hediye Kampanyası
            </span>
            <h2 className="mt-4 text-2xl md:text-4xl font-extrabold leading-tight">
              {gift.minM2} m² ve Üzeri Ev Temizliğine
              <span className="block text-amber-300">{gift.title}</span>
            </h2>
            <p className="mt-3 text-sky-50 text-sm md:text-base max-w-xl">{gift.description}</p>
            <div className="mt-4 flex items-center gap-3">
              <span className="text-lg line-through opacity-70">{formatTL(gift.value)}</span>
              <span className="px-3 py-1 rounded-lg bg-white text-emerald-700 font-extrabold text-sm">HEDİYE</span>
            </div>
          </div>

          <div className="md:col-span-5 flex flex-col items-stretch gap-4">
            {cd && (
              <div>
                <p className="text-xs uppercase tracking-wider opacity-80 mb-2">Kampanya bitimine kalan süre</p>
                <div className="flex gap-2">
                  <Box v={cd.d} l="Gün" />
                  <Box v={cd.h} l="Saat" />
                  <Box v={cd.m} l="Dk" />
                  <Box v={cd.s} l="Sn" />
                </div>
              </div>
            )}
            <input
              type="number"
              inputMode="numeric"
              min={0}
              value={m2}
              onChange={e => setM2(e.target.value)}
              placeholder="m² bilgisi (isteğe bağlı)"
              className="w-full px-4 py-3 rounded-xl text-slate-800 text-sm outline-none focus:ring-2 focus:ring-amber-300"
            />
            <button
              onClick={handleClick}
              id={`gtm-gift-${placement}`}
              data-gtm-event="campaign_gift_click"
              className="flex items-center justify-center gap-2 w-full py-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-extrabold text-base shadow-lg transition-all hover:-translate-y-0.5"
            >
              <i className="fab fa-whatsapp text-xl"></i> {gift.ctaText}
            </button>
          </div>
        </div>
        <p className="relative px-6 md:px-10 pb-5 text-[11px] leading-relaxed text-sky-100/80">* {gift.terms}</p>
      </div>
    </section>
  );
}
