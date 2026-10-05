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

const two = (n: number) => String(n).padStart(2, "0");

/**
 * Hediye kampanyası banner'ı. Veriyi admin panelinden (website-content) dinamik çeker.
 * Kampanya pasif / süresi dolmuşsa hiçbir şey render etmez.
 * Stiller globals.css içindeki .gift-* sınıflarından gelir.
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
    <section className="gift-section" data-testid="gift-campaign-banner">
      <div className="page-container">
        <div className="gift-card">
          <div className="gift-left">
            <span className="gift-badge"><i className="fas fa-gift"></i> Hediye Kampanyası</span>
            <h2 className="gift-title">
              {gift.minM2} m² ve Üzeri Ev Temizliğine
              <span>{gift.title}</span>
            </h2>
            <p className="gift-desc">{gift.description}</p>
            <div className="gift-value">
              <s>{formatTL(gift.value)}</s>
              <b>HEDİYE</b>
            </div>
          </div>

          <div className="gift-right">
            {cd && (
              <div>
                <p className="gift-cd-label">Kampanya bitimine kalan süre</p>
                <div className="gift-cd">
                  <div><strong>{two(cd.d)}</strong><span>Gün</span></div>
                  <div><strong>{two(cd.h)}</strong><span>Saat</span></div>
                  <div><strong>{two(cd.m)}</strong><span>Dk</span></div>
                  <div><strong>{two(cd.s)}</strong><span>Sn</span></div>
                </div>
              </div>
            )}
            <input
              className="gift-input"
              type="number"
              inputMode="numeric"
              min={0}
              value={m2}
              onChange={e => setM2(e.target.value)}
              placeholder="Evinizin m² bilgisi (isteğe bağlı)"
            />
            <button
              className="gift-btn"
              onClick={handleClick}
              id={`gtm-gift-${placement}`}
              data-gtm-event="campaign_gift_click"
            >
              <i className="fab fa-whatsapp"></i> {gift.ctaText}
            </button>
          </div>

          <details className="gift-terms">
            <summary>Kampanya şartlarını gör ▾</summary>
            <p>{gift.terms}</p>
          </details>
        </div>
      </div>
    </section>
  );
}
