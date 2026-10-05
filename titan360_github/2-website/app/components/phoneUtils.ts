/** WhatsApp (wa.me) için ülke kodlu, yalnızca rakamlardan oluşan numara üretir. 0552... -> 90552... */
export function toWaNumber(raw: string | undefined | null): string {
  const d = String(raw || "").replace(/[^0-9]/g, "");
  if (d.startsWith("90") && d.length === 12) return d;
  if (d.startsWith("0") && d.length === 11) return "90" + d.substring(1);
  if (d.length === 10 && d.startsWith("5")) return "90" + d;
  return d;
}