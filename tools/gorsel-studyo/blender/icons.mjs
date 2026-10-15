import { readFileSync, writeFileSync } from "node:fs";
const ROOT = process.argv[2], OUT = process.argv[3];
const node = (name) => {
  let src = readFileSync(`${ROOT}/node_modules/lucide-react/dist/esm/icons/${name}.mjs`, "utf8");
  const alias = src.match(/export \{ default \} from '\.\/([\w-]+)\.mjs'/);
  if (alias) return node(alias[1]);
  return Function(`return ${src.match(/const __iconNode = (\[[\s\S]*?\]);\nconst /)[1]}`)();
};
for (const n of ["megaphone", "monitor", "search", "code", "smartphone", "badge-check", "shopping-cart", "palette", "share-2"]) {
  const inner = node(n).map(([t, a]) => `<${t} ${Object.entries(a).filter(([k]) => k !== "key").map(([k, v]) => `${k}="${v}"`).join(" ")}/>`).join("");
  writeFileSync(`${OUT}/${n}.svg`, `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2">${inner}</svg>`);
}
