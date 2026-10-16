"use client";

import { useEffect } from "react";

/* Harf-tire-harf: "e-posta", "E-Ticaret", "Shopify-ikas" */
const RE = /(\p{L})-(?=\p{L})/gu;
/* Kelime birleştirici (U+2060): görünmez, iki yanında satır kırılmasına izin vermez */
const WJ = "⁠";
const SKIP = new Set(["SCRIPT", "STYLE", "TEXTAREA", "INPUT", "CODE", "PRE", "NOSCRIPT"]);

function fix(node: Node) {
  if (node.nodeType === Node.TEXT_NODE) {
    const t = node.nodeValue ?? "";
    if (t.includes("-")) {
      const next = t.replace(RE, `$1-${WJ}`).replace(new RegExp(`-${WJ}${WJ}+`, "g"), `-${WJ}`);
      if (next !== t && !SKIP.has(node.parentElement?.tagName ?? "")) node.nodeValue = next;
    }
    return;
  }
  if (node.nodeType !== Node.ELEMENT_NODE || SKIP.has((node as Element).tagName)) return;
  const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
  for (let n = walker.nextNode(); n; n = walker.nextNode()) fix(n);
}

/**
 * Tireli kelimeler satır sonunda tireden bölünmesin ("e-" / "postanıza"). Outfit'te bölünmez
 * tire (U+2011) yok; tireden sonra kelime birleştirici eklenir. Hidrasyondan sonra çalışır,
 * sonradan gelen içeriği (sayfa geçişi, açılan paneller) de izler. Metnin görünümü değişmez.
 */
export function HyphenGuard() {
  useEffect(() => {
    fix(document.body);
    const mo = new MutationObserver((records) => {
      for (const r of records) {
        if (r.type === "characterData") fix(r.target);
        else r.addedNodes.forEach(fix);
      }
    });
    mo.observe(document.body, { childList: true, subtree: true, characterData: true });
    return () => mo.disconnect();
  }, []);
  return null;
}
