// Düz metin açıklamaları madde madde listeye çevirir.
// Önce satır sonu, noktalı virgül ve • ile böler. Tek parça kalırsa cümle sonlarından böler.
export function toBullets(text?: string | null): string[] {
  if (!text) return [];
  const clean = (s: string) => s.replace(/^[\s\-–*✓✔•]+/, "").trim();
  let parts = String(text).split(/\r?\n|;|•/).map(clean).filter(Boolean);
  if (parts.length <= 1) {
    parts = String(text)
      .split(/(?<=[.!?])\s+(?=[A-ZÇĞİÖŞÜ0-9])/)
      .map(clean)
      .filter(Boolean);
  }
  return parts;
}
