import type { Attr, Card, CardType, Col } from "./types";
import { isNew } from "./components/CardTile";

export type More = "detail" | "effect" | "SDR" | "parallel" | "new";
export const MORE: { k: More; label: string }[] = [
  { k: "detail", label: "効果・数値あり" },
  { k: "effect", label: "効果持ち" },
  { k: "SDR", label: "SDR" },
  { k: "parallel", label: "パラレルあり" },
  { k: "new", label: "新着（3日以内）" },
];
export const TYPES: CardType[] = ["チャンネル", "ライバー", "イベント", "ステージ"];

export type Filters = { prod: string; types: CardType[]; attrs: Attr[]; cols: Col[]; more: More[] };
export const EMPTY: Filters = { prod: "", types: [], attrs: [], cols: [], more: [] };

export const countFilters = (f: Filters) => (f.prod ? 1 : 0) + f.types.length + f.attrs.length + f.cols.length + f.more.length;

export function matches(c: Card, f: Filters, query: string) {
  const q = query.trim().toLowerCase().replace(/^[#＃]/, "");
  if (f.prod && c.p !== f.prod) return false;
  if (f.types.length && !f.types.includes(c.type)) return false;
  if (f.attrs.length && !f.attrs.includes(c.attr)) return false;
  if (f.cols.length && !f.cols.every((k) => c.cols.includes(k))) return false;
  const detailed = !!c.no;
  if (f.more.includes("detail") && !detailed) return false;
  if (f.more.includes("effect") && !(detailed && c.fx)) return false;
  if (f.more.includes("SDR") && c.rar !== "SDR") return false;
  if (f.more.includes("parallel") && !c.parallel) return false;
  if (f.more.includes("new") && !isNew(c)) return false;
  if (q) {
    const hay = [c.name, c.liver, c.type, c.p, c.no, c.rar, c.tags.join(" "), c.key, c.fx].join(" ").toLowerCase();
    if (!hay.includes(q)) return false;
  }
  return true;
}

export function toggle<T>(arr: T[], v: T): T[] {
  return arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];
}
