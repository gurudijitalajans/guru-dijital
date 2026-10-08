// HTML sahneleri headless Chrome ile 2x çözünürlükte PNG'ye çevirir.
// Kullanım: node render.mjs <filtre?>   (sahneler scenes.mjs'ten)
import { spawn } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { fileUrl } from "./lib.mjs";
import { SCENES } from "./scenes.mjs";

const OUT = fileURLToPath(new URL("./out/", import.meta.url));
mkdirSync(OUT, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const only = process.argv[2];
const DPR = Number(process.env.DPR || 2);

const port = 9300 + Math.floor(Math.random() * 600);
const chrome = spawn("/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", ["--headless=new", "--no-first-run", "--hide-scrollbars", "--allow-file-access-from-files", "--force-color-profile=srgb", `--remote-debugging-port=${port}`, `--user-data-dir=${OUT}.profile-${port}`, "about:blank"], { stdio: "ignore" });
try {
  let ver;
  for (let i = 0; i < 80 && !ver; i++) { try { const r = await fetch(`http://127.0.0.1:${port}/json/version`); if (r.ok) ver = await r.json(); } catch {} if (!ver) await sleep(250); }
  const ws = new WebSocket(ver.webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  let id = 0; const pending = new Map();
  ws.onmessage = (ev) => { const m = JSON.parse(ev.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } };
  const send = (method, params = {}, sessionId) => new Promise((res) => { const i = ++id; pending.set(i, res); ws.send(JSON.stringify({ id: i, method, params, sessionId })); });
  const { result: { targetId } } = await send("Target.createTarget", { url: "about:blank" });
  const { result: { sessionId } } = await send("Target.attachToTarget", { targetId, flatten: true });
  const s = (m, p) => send(m, p, sessionId);
  await s("Page.enable");
  await s("Runtime.enable");
  for (const sc of SCENES) {
    if (only && !sc.name.includes(only)) continue;
    const file = `${OUT}${sc.name}.html`;
    writeFileSync(file, sc.html);
    await s("Emulation.setDeviceMetricsOverride", { width: sc.w, height: sc.h, deviceScaleFactor: DPR, mobile: false });
    await s("Page.navigate", { url: fileUrl(file) });
    await sleep(900);
    await s("Runtime.evaluate", { expression: "document.fonts.ready.then(() => Promise.all([...document.images].map(i => i.decode().catch(() => {}))))", awaitPromise: true });
    await sleep(300);
    const r = await s("Page.captureScreenshot", { format: "png", captureBeyondViewport: false, clip: { x: 0, y: 0, width: sc.w, height: sc.h, scale: 1 } });
    if (!r.result) { console.log("HATA", sc.name, JSON.stringify(r.error)); continue; }
    writeFileSync(`${OUT}${sc.name}.png`, Buffer.from(r.result.data, "base64"));
    console.log("ok", sc.name);
  }
} finally {
  chrome.kill("SIGKILL");
}
