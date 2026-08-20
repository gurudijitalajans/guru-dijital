# Guru Dijital Ajans — Web Sitesi

**unlock the next level** — [gurudijital.com.tr](https://www.gurudijital.com.tr)

Next.js 16 (App Router) + Tailwind CSS v4 + Motion (Framer Motion v12) ile geliştirilmiş, tamamen responsive kurumsal ajans sitesi.

## Sayfalar

| Rota | İçerik |
| --- | --- |
| `/` | Hero, hizmet bento grid'i, vaka istatistikleri, süreç, ürün vitrini, referans marquee + ödüller, CTA |
| `/hizmetler` | 6 hizmetin genel listesi |
| `/hizmetler/[slug]` | Her hizmet için SSG detay sayfası (katalog içeriğinden) |
| `/urunler` | Filtrelenebilir iş ürünleri vitrini |
| `/hakkimizda` | Biz Kimiz metni, sayılar, değerler, ödüller |
| `/iletisim` | İletişim kartları, doğrulamalı form (mailto), SSS |

## Geliştirme

```bash
npm install
npm run dev    # http://localhost:3000
npm run build  # production build
```

> Node.js bu makinede `~/.local/node` altına kuruludur. Yeni bir terminalde
> `export PATH="$HOME/.local/node/bin:$PATH"` çalıştırın (veya kalıcı olması
> için bu satırı `~/.zshrc` dosyanıza ekleyin).

## Vercel'e Deploy

1. Bu klasörü GitHub'a itin (`git remote add origin <repo-url> && git push -u origin main`).
2. [vercel.com/new](https://vercel.com/new) → repoyu import edin. Framework otomatik algılanır; ek ayar gerekmez.
3. Domain: Vercel → Settings → Domains → `gurudijital.com.tr` ekleyin ve DNS'te gösterilen A/CNAME kayıtlarını tanımlayın.

## İçerik güncelleme

Tüm metin/veri tek dosyada: `src/lib/data.ts` (hizmetler, referanslar, vaka istatistikleri, ürünler, iletişim bilgileri). Telefon/WhatsApp/adres alanları doldurulduğunda ilgili kartlar otomatik görünür.

Görseller: `public/work/` (katalogdan optimize edilmiş WebP'ler), logolar `public/logo-dark.png` & `public/logo-light.png`.
