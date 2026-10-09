// Headless Chrome'u CDP ile süren küçük yardımcı (QA betikleri için)
import { spawn } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

export const BASE = process.env.QA_BASE || "http://localhost:3000";
export const OUT = process.env.QA_SHOTS || fileURLToPath(new URL("../../.qa-shots", import.meta.url));
mkdirSync(OUT, { recursive: true });
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export async function withPage({ width = 1440, height = 900, mobile = false } = {}, fn) {
  const port = 9900 + Math.floor(Math.random() * 90);
  const profile = fileURLToPath(new URL(`./.profile-${port}`, import.meta.url));
  const chrome = spawn("/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", ["--headless=new", "--no-first-run", "--hide-scrollbars", `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, "about:blank"], { stdio: "ignore" });
  try {
    let ver;
    for (let i = 0; i < 80 && !ver; i++) {
      try { const r = await fetch(`http://127.0.0.1:${port}/json/version`); if (r.ok) ver = await r.json(); } catch {}
      if (!ver) await sleep(250);
    }
    const ws = new WebSocket(ver.webSocketDebuggerUrl);
    await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
    let id = 0;
    const pending = new Map();
    ws.onmessage = (ev) => { const m = JSON.parse(ev.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } };
    const send = (method, params = {}, sessionId) => new Promise((res) => { const i = ++id; pending.set(i, res); ws.send(JSON.stringify({ id: i, method, params, sessionId })); });
    const { result: { targetId } } = await send("Target.createTarget", { url: "about:blank" });
    const { result: { sessionId } } = await send("Target.attachToTarget", { targetId, flatten: true });
    const s = (m, p) => send(m, p, sessionId);
    await s("Page.enable");
    await s("Runtime.enable");
    await s("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile });
    if (mobile) await s("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 5 });
    const evalJs = async (expression) => {
      const r = await s("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
      return r.result?.result?.value;
    };
    const page = {
      s,
      evalJs,
      goto: async (path, wait = 6000) => { await s("Page.navigate", { url: path.startsWith("http") ? path : BASE + path }); await sleep(wait); },
      /* Sayfayı adım adım kaydırıp görünür olunca beliren öğeleri tetikler, sonra başa döner */
      sweep: async (step = 600, wait = 150) => {
        const h = await evalJs("document.documentElement.scrollHeight");
        for (let y = 0; y < h; y += step) { await evalJs(`window.scrollTo(0, ${y})`); await sleep(wait); }
        await evalJs("window.scrollTo(0, 0)"); await sleep(400);
      },
      screenshot: async (file) => {
        const r = await s("Page.captureScreenshot", { format: "png" });
        writeFileSync(file, Buffer.from(r.result.data, "base64"));
      },
    };
    await fn(page);
  } finally {
    chrome.kill("SIGKILL");
  }
}
