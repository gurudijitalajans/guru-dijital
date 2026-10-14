// Fotoğraf yerine kullanılan çizimler (SVG): manzara, mimari, ürün şişesi, tabak...
// Hepsi vektör; her boyutta keskin.

/* Gün batımı koyu: gökyüzü, güneş, deniz, adalar, ışık yolu */
export function sunset(w, h, { sky = ["#f6c99a", "#f1a07a", "#b9687a", "#3b3f74"], sea = ["#33406f", "#1c2550"], sun = "#ffe3b0" } = {}) {
  const hz = h * 0.62;
  return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid slice" style="display:block">
  <defs>
    <linearGradient id="sk" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="${sky[0]}"/><stop offset=".35" stop-color="${sky[1]}"/><stop offset=".7" stop-color="${sky[2]}"/><stop offset="1" stop-color="${sky[3]}"/></linearGradient>
    <linearGradient id="se" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${sea[0]}"/><stop offset="1" stop-color="${sea[1]}"/></linearGradient>
    <radialGradient id="su"><stop offset="0" stop-color="${sun}"/><stop offset=".55" stop-color="${sun}" stop-opacity=".9"/><stop offset="1" stop-color="${sun}" stop-opacity="0"/></radialGradient>
    <linearGradient id="pa" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${sun}" stop-opacity=".9"/><stop offset="1" stop-color="${sun}" stop-opacity="0"/></linearGradient>
  </defs>
  <rect width="${w}" height="${hz + 2}" fill="url(#sk)"/>
  <circle cx="${w * 0.62}" cy="${hz - h * 0.02}" r="${h * 0.2}" fill="url(#su)"/>
  <circle cx="${w * 0.62}" cy="${hz - h * 0.01}" r="${h * 0.075}" fill="${sun}"/>
  <path d="M0 ${hz} L${w * 0.08} ${hz - h * 0.07} L${w * 0.16} ${hz - h * 0.04} L${w * 0.26} ${hz - h * 0.1} L${w * 0.38} ${hz - h * 0.02} L${w * 0.42} ${hz} Z" fill="#4a3a63" opacity=".85"/>
  <path d="M${w * 0.78} ${hz} L${w * 0.86} ${hz - h * 0.05} L${w * 0.93} ${hz - h * 0.03} L${w} ${hz - h * 0.08} L${w} ${hz} Z" fill="#4a3a63" opacity=".7"/>
  <rect y="${hz}" width="${w}" height="${h - hz}" fill="url(#se)"/>
  <polygon points="${w * 0.6},${hz} ${w * 0.64},${hz} ${w * 0.72},${h} ${w * 0.52},${h}" fill="url(#pa)" opacity=".55"/>
  ${Array.from({ length: 14 }, (_, i) => `<rect x="${w * (0.5 + ((i * 37) % 30) / 100)}" y="${hz + (i + 1) * (h - hz) / 16}" width="${w * (0.03 + (i % 3) * 0.015)}" height="2" rx="1" fill="${sun}" opacity="${0.5 - i * 0.025}"/>`).join("")}
  </svg>`;
}

/* Taş ev cephesi + zeytin ağacı silueti (otel odaları için) */
export function stoneRoom(w, h, { wall = "#e9dccb", shade = "#d3c2ab", accent = "#8aa07a" } = {}) {
  return `<svg width="${w}" height="${h}" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" style="display:block">
  <rect width="400" height="300" fill="${wall}"/>
  <rect x="0" y="210" width="400" height="90" fill="${shade}"/>
  <rect x="120" y="60" width="160" height="150" rx="80" ry="80" fill="#bcd2df"/>
  <rect x="120" y="135" width="160" height="75" fill="#bcd2df"/>
  <rect x="120" y="60" width="160" height="150" rx="80" fill="none" stroke="#fff" stroke-width="6"/>
  <line x1="200" y1="62" x2="200" y2="210" stroke="#fff" stroke-width="5"/>
  <line x1="122" y1="140" x2="278" y2="140" stroke="#fff" stroke-width="5"/>
  <rect x="60" y="190" width="280" height="44" rx="8" fill="#fbf7f1"/>
  <rect x="70" y="176" width="70" height="26" rx="8" fill="#f0e6d8"/><rect x="150" y="176" width="70" height="26" rx="8" fill="#f0e6d8"/>
  <path d="M330 210 C320 150 350 120 360 100 C370 130 390 150 380 210 Z" fill="${accent}"/>
  <rect x="352" y="200" width="16" height="30" rx="3" fill="#c9a77d"/>
  </svg>`;
}

/* Soyut cam formlar (klinik / teknoloji) */
export function blobs(w, h, { a = "#bfe3ff", b = "#6aa8ff", c = "#ffffff", bg = "#eaf4ff" } = {}) {
  return `<svg width="${w}" height="${h}" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" style="display:block">
  <defs>
    <radialGradient id="b1" cx=".35" cy=".3"><stop offset="0" stop-color="${c}"/><stop offset=".6" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></radialGradient>
    <radialGradient id="b2" cx=".4" cy=".35"><stop offset="0" stop-color="${c}"/><stop offset="1" stop-color="${a}"/></radialGradient>
    <filter id="bl"><feGaussianBlur stdDeviation="6"/></filter>
  </defs>
  <rect width="400" height="300" fill="${bg}"/>
  <ellipse cx="300" cy="250" rx="140" ry="40" fill="${b}" opacity=".18" filter="url(#bl)"/>
  <circle cx="270" cy="150" r="92" fill="url(#b1)"/>
  <circle cx="150" cy="200" r="48" fill="url(#b2)"/>
  <circle cx="345" cy="70" r="26" fill="url(#b2)"/>
  <path d="M60 80 q40 -40 80 0 t80 0" fill="none" stroke="${c}" stroke-width="10" stroke-linecap="round" opacity=".8"/>
  </svg>`;
}

/* Diş simgesi (klinik) */
export const tooth = (s = 120, c = "#ffffff", st = "#7fb1ff") =>
  `<svg width="${s}" height="${s}" viewBox="0 0 100 100"><path d="M30 12c-12 0-20 10-20 24 0 12 5 18 8 30 3 13 5 22 12 22 7 0 7-16 12-16h16c5 0 5 16 12 16 7 0 9-9 12-22 3-12 8-18 8-30 0-14-8-24-20-24-8 0-12 5-20 5S38 12 30 12z" fill="${c}" stroke="${st}" stroke-width="3"/></svg>`;

/* Mimari: cam cepheli iki kule, alacakaranlık (inşaat) */
export function building(w, h, { sky = ["#0d1c3d", "#3a5a8a"], glass = "#9fc3e8", frame = "#11192b" } = {}) {
  const tower = (x, y, tw, th, floors, cols, id) => {
    let g = `<rect x="${x}" y="${y}" width="${tw}" height="${th}" fill="url(#cw${id})"/>`;
    for (let f = 1; f < floors; f++) g += `<rect x="${x}" y="${(y + (th / floors) * f).toFixed(1)}" width="${tw}" height="1.6" fill="${frame}" opacity=".85"/>`;
    for (let c = 1; c < cols; c++) g += `<rect x="${(x + (tw / cols) * c).toFixed(1)}" y="${y}" width=".8" height="${th}" fill="${frame}" opacity=".55"/>`;
    /* yanan pencereler */
    for (let k = 0; k < floors * cols * 0.16; k++) {
      const f = (k * 7 + id * 3) % floors, c = (k * 5 + id) % cols;
      g += `<rect x="${(x + (tw / cols) * c + 1).toFixed(1)}" y="${(y + (th / floors) * f + 2).toFixed(1)}" width="${(tw / cols - 2).toFixed(1)}" height="${(th / floors - 3.5).toFixed(1)}" fill="#ffd89a" opacity="${0.35 + (k % 4) * 0.12}"/>`;
    }
    return g + `<rect x="${x}" y="${y}" width="${tw}" height="${th}" fill="url(#rf)"/><rect x="${x - 2}" y="${y - 6}" width="${tw + 4}" height="6" fill="${frame}"/>`;
  };
  return `<svg width="${w}" height="${h}" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" style="display:block">
  <defs><linearGradient id="bs" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${sky[0]}"/><stop offset=".7" stop-color="${sky[1]}"/><stop offset="1" stop-color="#e9b98a"/></linearGradient>
  <linearGradient id="cw1" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${glass}"/><stop offset=".55" stop-color="#2c4a7a"/><stop offset="1" stop-color="#16243f"/></linearGradient>
  <linearGradient id="cw2" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${glass}" stop-opacity=".9"/><stop offset=".6" stop-color="#253d66"/><stop offset="1" stop-color="#131f37"/></linearGradient>
  <linearGradient id="rf" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".45" stop-color="#fff" stop-opacity=".22"/><stop offset=".55" stop-color="#fff" stop-opacity="0"/></linearGradient></defs>
  <rect width="400" height="300" fill="url(#bs)"/>
  <path d="M0 262 L40 250 L70 256 L110 244 L150 252 L200 246 L260 254 L310 242 L360 250 L400 246 V300 H0Z" fill="#1c2a45" opacity=".7"/>
  ${tower(210, 40, 96, 260, 30, 8, 1)}
  ${tower(318, 110, 58, 190, 20, 5, 2)}
  ${tower(150, 150, 50, 150, 16, 4, 2)}
  <rect x="0" y="286" width="400" height="14" fill="#0a0f1c"/>
  ${[30, 60, 95, 330, 372].map((x, i) => `<ellipse cx="${x}" cy="${282 - (i % 2) * 4}" rx="${14 + (i % 3) * 3}" ry="${18 + (i % 2) * 4}" fill="#0f1a2c"/>`).join("")}
  </svg>`;
}

/* Kahve fincanı (uygulama / kafe) */
export const cup = (s = 160, { body = "#ffffff", coffee = "#6b3f2a", saucer = "#f3ece4" } = {}) =>
  `<svg width="${s}" height="${s}" viewBox="0 0 100 100"><ellipse cx="50" cy="82" rx="40" ry="9" fill="${saucer}"/><path d="M22 38h50l-5 34c-1 6-6 10-12 10H39c-6 0-11-4-12-10z" fill="${body}"/><path d="M72 46c10 0 12 14 0 16" fill="none" stroke="${body}" stroke-width="6"/><ellipse cx="47" cy="38" rx="25" ry="6" fill="${coffee}"/><path d="M40 22c-3-5 3-7 0-12M52 22c-3-5 3-7 0-12" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" opacity=".7"/></svg>`;

/* Kozmetik şişesi (damlalıklı) */
export const bottle = (s = 200, { glass = "#f4e9e2", cap = "#2b2b33", label = "#ffffff", text = "LYA" } = {}) => {
  const id = "b" + Math.round(s * 10) + glass.slice(1, 4);
  return `<svg width="${s * 0.5}" height="${s}" viewBox="0 0 50 100"><defs><linearGradient id="${id}" x1="0" x2="1"><stop offset="0" stop-color="#000" stop-opacity=".08"/><stop offset=".25" stop-color="#fff" stop-opacity=".55"/><stop offset=".55" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".14"/></linearGradient></defs>
  <path d="M19 4c0-2 2-4 6-4s6 2 6 4v14H19z" fill="${cap}"/><rect x="17" y="17" width="16" height="9" rx="2" fill="#c8a978"/>
  <path d="M14 30c0-3 3-5 6-5h10c3 0 6 2 6 5l4 8v52c0 5-4 9-9 9H19c-5 0-9-4-9-9V38z" fill="${glass}"/>
  <path d="M14 30c0-3 3-5 6-5h10c3 0 6 2 6 5l4 8v52c0 5-4 9-9 9H19c-5 0-9-4-9-9V38z" fill="url(#${id})"/>
  <rect x="14" y="52" width="22" height="26" rx="2" fill="${label}" opacity=".92"/><text x="25" y="66" text-anchor="middle" font-family="Didot,serif" font-size="6.5" letter-spacing="1.4" fill="${cap}">${text}</text><text x="25" y="72.5" text-anchor="middle" font-family="Outfit" font-size="2.6" letter-spacing=".6" fill="${cap}" opacity=".7">SERUM · 30 ML</text></svg>`;
};

/* Tekstil: katlanmış havlu yığını */
export const towels = (w = 240, colors = ["#f3e7d9", "#c9d8e6", "#e8cfc4"]) =>
  `<svg width="${w}" height="${w * 0.75}" viewBox="0 0 200 150">${colors
    .map((c, i) => `<g transform="translate(${20 + i * 4} ${100 - i * 34})"><rect width="160" height="34" rx="10" fill="${c}"/><rect y="24" width="160" height="10" rx="5" fill="#000" opacity=".06"/>${Array.from({ length: 7 }, (_, k) => `<line x1="${12 + k * 22}" y1="6" x2="${12 + k * 22}" y2="28" stroke="#fff" stroke-width="2" opacity=".35"/>`).join("")}</g>`)
    .join("")}</svg>`;
