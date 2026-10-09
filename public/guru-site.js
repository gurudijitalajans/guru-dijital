/*!
 * Guru Panel site kodu: sohbet balonu ve talep formu.
 * <script src="https://PANEL/guru-site.js" data-key="SITE_ANAHTARI" async></script>
 * Talep formu için sayfaya: <div data-guru-form></div>
 * data-sohbet="kapali" ile yalnız form kullanılır.
 */
(function () {
  var s = document.currentScript || document.querySelector('script[src*="guru-site.js"][data-key]');
  if (!s || window.__guruSite) return;
  window.__guruSite = true;
  var key = s.getAttribute("data-key");
  if (!key) return;
  var base = new URL(s.src, location.href).origin;
  var page = encodeURIComponent(location.href.slice(0, 200));
  var q = "?k=" + encodeURIComponent(key) + "&p=" + page;

  function css(el, rules) {
    for (var k in rules) el.style.setProperty(k, rules[k]);
  }

  /* Sohbet balonu: kapalıyken küçük çerçeve, açılınca büyür (telefonda tam ekran) */
  var chat = null;
  function size(open) {
    if (!chat) return;
    var phone = window.innerWidth < 640;
    if (!open) css(chat, { width: "96px", height: "96px", right: "0", bottom: "0", top: "auto", left: "auto" });
    else if (phone) css(chat, { width: "100%", height: "100%", right: "0", bottom: "0", top: "0", left: "0" });
    else css(chat, { width: "420px", height: Math.min(700, window.innerHeight) + "px", right: "0", bottom: "0", top: "auto", left: "auto" });
  }
  if (s.getAttribute("data-sohbet") !== "kapali") {
    chat = document.createElement("iframe");
    /* Masaüstünde pencere köşeli kart, telefonda tam ekran açılır */
    chat.src = base + "/gomulu/sohbet" + q + (window.innerWidth < 640 ? "&g=m" : "&g=d");
    chat.title = "Sohbet";
    chat.setAttribute("allowtransparency", "true");
    css(chat, { position: "fixed", border: "0", background: "transparent", "color-scheme": "normal", "z-index": "2147483000" });
    size(false);
    (document.body || document.documentElement).appendChild(chat);
  }

  /* Talep formları */
  var forms = [];
  function mountForms() {
    var boxes = document.querySelectorAll("[data-guru-form]:not([data-guru-hazir])");
    for (var i = 0; i < boxes.length; i++) {
      var box = boxes[i];
      box.setAttribute("data-guru-hazir", "1");
      var f = document.createElement("iframe");
      f.src = base + "/gomulu/form" + q;
      f.title = "İletişim formu";
      css(f, { width: "100%", height: "560px", border: "0", background: "transparent", "color-scheme": "normal" });
      box.appendChild(f);
      forms.push(f);
    }
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mountForms);
  else mountForms();

  window.addEventListener("message", function (e) {
    if (e.origin !== base || !e.data || typeof e.data !== "object") return;
    if (e.data.guru === "sohbet" && chat && e.source === chat.contentWindow) size(Boolean(e.data.open));
    if (e.data.guru === "form-yukseklik") {
      for (var i = 0; i < forms.length; i++) if (forms[i].contentWindow === e.source) forms[i].style.height = Math.max(200, Number(e.data.h) || 0) + "px";
    }
  });
})();
