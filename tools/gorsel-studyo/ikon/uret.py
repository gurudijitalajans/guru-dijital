"""Guru ürün uygulama simgeleri (düz): aynı g silueti, başında ürüne özgü oyuk; ürün renginde gradyan.
   cd tools/gorsel-studyo/ikon && python3 uret.py ../../../public/products/icons
   outer.txt / tr.txt: public/brand/mark-navy.svg yolunun göz hariç dış biçimi ve dönüşümü."""
import sys
outer = open("outer.txt").read(); tr = open("tr.txt").read()
OUT = sys.argv[1]
S = 600 / 138.3
ox = 512 - S * (121.8 + 138.3 / 2) + 14; oy = 512 - S * (218.7 + 138.3 / 2) + 6
URUNLER = {
    # renkler: üst, orta, alt (ürün temalarından)
    "guru-chatbot": (("#5fb0fb", "#2f7be6", "#1846b8"), "".join(f'<circle cx="{x}" cy="264" r="6.4" fill="#000"/>' for x in (166, 187, 208))),
    "guru-crm": (("#9aa6ff", "#5f6ef2", "#2b3aa8"), '<circle cx="187" cy="252.5" r="9.2" fill="#000"/><path d="M167.5 283.5c0-11.2 8.7-17.5 19.5-17.5s19.5 6.3 19.5 17.5z" fill="#000"/>'),
    # ilerleme halkası: süreç kontrol altında
    "guru-operation": (("#5fdbea", "#1aa9c4", "#0b5f8a"), '<path d="M187 246.5A17.5 17.5 0 1 1 169.5 264" fill="none" stroke="#000" stroke-width="7" stroke-linecap="round"/><circle cx="187" cy="264" r="5" fill="#000"/>'),
    # iş çantası: işletme
    "guru-business": (("#4f8ff0", "#1d4fb0", "#0a2463"), '<path d="M179 253v-5a3.5 3.5 0 0 1 3.5-3.5h9a3.5 3.5 0 0 1 3.5 3.5v5" fill="none" stroke="#000" stroke-width="5" stroke-linecap="round"/><rect x="164.5" y="252.5" width="45" height="30" rx="7" fill="#000"/><rect x="164.5" y="265" width="45" height="3.6" fill="#fff"/>'),
}
for slug, ((c1, c2, c3), cut) in URUNLER.items():
    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">
<defs>
  <linearGradient id="bg" x1="0" y1="0" x2=".35" y2="1"><stop offset="0" stop-color="{c1}"/><stop offset=".55" stop-color="{c2}"/><stop offset="1" stop-color="{c3}"/></linearGradient>
  <radialGradient id="hl" cx=".25" cy=".08" r=".75"><stop offset="0" stop-color="#fff" stop-opacity=".42"/><stop offset=".55" stop-color="#fff" stop-opacity="0"/></radialGradient>
  <radialGradient id="sh" cx=".7" cy="1.05" r=".7"><stop offset="0" stop-color="#011441" stop-opacity=".45"/><stop offset="1" stop-color="#011441" stop-opacity="0"/></radialGradient>
  <mask id="m" maskUnits="userSpaceOnUse" x="0" y="0" width="1024" height="1024"><rect width="1024" height="1024" fill="#000"/>
    <g transform="translate({ox:.2f},{oy:.2f}) scale({S:.4f})"><path fill="#fff" transform="{tr}" d="{outer}"/>{cut}</g></mask>
  <filter id="ds" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="14" stdDeviation="18" flood-color="#011441" flood-opacity=".35"/></filter>
  <clipPath id="sq"><rect width="1024" height="1024" rx="232"/></clipPath>
</defs>
<g clip-path="url(#sq)">
  <rect width="1024" height="1024" fill="url(#bg)"/><rect width="1024" height="1024" fill="url(#sh)"/><rect width="1024" height="1024" fill="url(#hl)"/>
  <g filter="url(#ds)"><rect width="1024" height="1024" fill="#fff" mask="url(#m)"/></g>
  <rect x="3" y="3" width="1018" height="1018" rx="229" fill="none" stroke="#fff" stroke-opacity=".22" stroke-width="6"/>
</g>
</svg>'''
    open(f"{OUT}/{slug}.svg", "w").write(svg)
    print("ok", slug)
