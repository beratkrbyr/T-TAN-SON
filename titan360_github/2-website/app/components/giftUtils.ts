// Hediye kampanyası için saf (hook içermeyen) yardımcılar.
// Hem sunucu hem istemci bileşenlerinden güvenle import edilebilir.

export interface GiftCampaign {
  title: string;
  value: number;
  description: string;
  terms: string;
  endDate: Date | null;
  minM2: number;
  packageIds: string[];
  topbarText: string;
  ctaText: string;
}

export const GIFT_DEFAULTS = {
  title: "Koltuk Takımı Yıkama HEDİYE",
  value: 3000,
  description:
    "Seçili ev temizliği paketlerinde, 90 m² ve üzeri evlerde 3+2+1 koltuk takımı yıkama hizmeti bizden hediye.",
  terms:
    "Kampanya, seçili paketlerde ve belirtilen metrekare koşulunu sağlayan evlerde geçerlidir. Hediye kapsamı 3+2+1 koltuk takımı ile sınırlıdır. Antalya bölgesinde, randevu ve uygunluk durumuna göre geçerlidir. Başka kampanyalarla birleştirilemez.",
  minM2: 90,
  topbarText: "🎁 90 m² ve üzeri ev temizliğine 3.000 ₺ değerinde koltuk takımı yıkama HEDİYE!",
  ctaText: "Hediyemi Al",
};

/**
 * Kampanya içeriğini (website_content) okur.
 * Kampanya aktif değilse veya bitiş tarihi geçmişse null döner.
 */
export function parseGift(content: any): GiftCampaign | null {
  if (!content || content.gift_active !== true) return null;

  let endDate: Date | null = null;
  if (content.gift_end_date) {
    const d = new Date(`${content.gift_end_date}T23:59:59`);
    if (!isNaN(d.getTime())) endDate = d;
  }
  if (endDate && endDate.getTime() < Date.now()) return null;

  const minM2 = Number(content.gift_min_m2);
  const value = Number(content.gift_value);

  return {
    title: content.gift_title || GIFT_DEFAULTS.title,
    value: !isNaN(value) && value > 0 ? value : GIFT_DEFAULTS.value,
    description: content.gift_description || GIFT_DEFAULTS.description,
    terms: content.gift_terms || GIFT_DEFAULTS.terms,
    endDate,
    minM2: !isNaN(minM2) && minM2 > 0 ? minM2 : GIFT_DEFAULTS.minM2,
    packageIds: Array.isArray(content.gift_package_ids) ? content.gift_package_ids : [],
    topbarText: content.gift_topbar_text || GIFT_DEFAULTS.topbarText,
    ctaText: content.gift_cta_text || GIFT_DEFAULTS.ctaText,
  };
}

export function formatTL(n: number): string {
  return n.toLocaleString("tr-TR") + " ₺";
}

export function pushGiftEvent(event: string, params: Record<string, any> = {}) {
  if (typeof window === "undefined") return;
  const w = window as any;
  const dl = (w.dataLayer = w.dataLayer || []);
  dl.push({ event, ...params });
}
