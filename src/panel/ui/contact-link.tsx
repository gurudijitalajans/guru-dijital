/** E-posta ve telefonu tıklanabilir yapar (e-posta, arama ve WhatsApp); diğer değerler olduğu gibi döner */
export function contactValue(k: string, v: string): React.ReactNode {
  if (!v) return v;
  if (k === "E-posta") return <a href={`mailto:${v}`} className="text-accent">{v}</a>;
  if (k === "Telefon") {
    const digits = v.replace(/\D/g, "");
    const wa = digits.startsWith("90") ? digits : digits.startsWith("0") ? `9${digits}` : digits.length === 10 ? `90${digits}` : digits;
    return (
      <span className="flex flex-wrap gap-x-2">
        <a href={`tel:${v.replace(/\s/g, "")}`} className="text-accent">{v}</a>
        <a href={`https://wa.me/${wa}`} target="_blank" rel="noreferrer" className="text-accent">WhatsApp</a>
      </span>
    );
  }
  return v;
}
