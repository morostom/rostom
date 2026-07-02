// contact.js — build a WhatsApp deep link from an Egyptian phone number.
// Accepts "01005851199", "1005851199", "+20 100 585 1199" → wa.me/20100...

export function waLink(phone, text) {
  const d = (phone || '').replace(/\D/g, '');
  if (!d) return null;
  let intl = d;
  if (d.startsWith('20')) intl = d;             // already has country code
  else if (d.startsWith('0')) intl = '20' + d.slice(1);
  else intl = '20' + d;                          // bare local number
  const q = text ? `?text=${encodeURIComponent(text)}` : '';
  return `https://wa.me/${intl}${q}`;
}
