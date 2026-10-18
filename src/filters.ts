import type { Attr, Card, CardType, Col } from "./types";
import { isNew } from "./util";
import { normalize, readingOf } from "./kana";
import { COL7 } from "./theme";

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

/** 検索対象の文字列（読み込み時に1回だけ作る） */
const hayCache = new WeakMap<Card, string>();
function haystack(c: Card): string {
  let h = hayCache.get(c);
  if (h === undefined) {
    const parts = [c.name, c.liver, c.type, c.p, c.no, c.rar, c.key, c.fx, ...c.tags, c.kana ?? "", readingOf(c.name), readingOf(c.liver), ...c.tags.map(readingOf)];
    h = parts.map(normalize).join("|");
    hayCache.set(c, h);
  }
  return h;
}

export function matches(c: Card, f: Filters, query: string) {
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
  const words = query.split(/[\s　]+/).map(normalize).filter(Boolean);
  if (words.length) {
    const h = haystack(c);
    if (!words.every((w) => h.includes(w))) return false;
  }
  return true;
}

export function toggle<T>(arr: T[], v: T): T[] {
  return arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];
}

/* ---------- 並び替え ---------- */
export type SortKey = "no" | "type" | "color" | "lv" | "pow" | "name" | "new";
export const SORTS: { k: SortKey; label: string }[] = [
  { k: "no", label: "カードNo" },
  { k: "type", label: "カード種類" },
  { k: "color", label: "カラー" },
  { k: "lv", label: "Lv" },
  { k: "pow", label: "パワー" },
  { k: "name", label: "名前（あいうえお）" },
  { k: "new", label: "追加が新しい" },
];
const PROD_ORDER: Record<string, number> = { SD01: 1, SD02: 2, SD03: 3, SD04: 4, BP01: 5 };
const typeRank = (c: Card) => TYPES.indexOf(c.type);
/** 持っている最初の色の順（R→V）。同じなら色数が少ない順。色なしは最後。 */
const colorRank = (c: Card) => {
  if (!c.cols.length) return 999;
  const first = Math.min(...c.cols.map((k) => COL7.indexOf(k)));
  return first * 10 + c.cols.length;
};
const byNo = (a: Card, b: Card) =>
  (PROD_ORDER[a.p] ?? 9) - (PROD_ORDER[b.p] ?? 9) || (a.no ? 0 : 1) - (b.no ? 0 : 1) || (a.sort ?? 0) - (b.sort ?? 0) || a.id.localeCompare(b.id);
const nameKey = (c: Card) => normalize(c.kana || readingOf(c.name) || c.name);
const nullLast = (v: number | null | undefined, dir: number) => (v == null ? Number.POSITIVE_INFINITY : v * dir);

export function sortCards(list: Card[], key: SortKey, desc: boolean): Card[] {
  const d = desc ? -1 : 1;
  const cmp: Record<SortKey, (a: Card, b: Card) => number> = {
    no: (a, b) => d * byNo(a, b),
    type: (a, b) => d * (typeRank(a) - typeRank(b)) || byNo(a, b),
    color: (a, b) => d * (colorRank(a) - colorRank(b)) || byNo(a, b),
    lv: (a, b) => nullLast(a.lv, d) - nullLast(b.lv, d) || byNo(a, b),
    pow: (a, b) => nullLast(a.pow, d) - nullLast(b.pow, d) || byNo(a, b),
    name: (a, b) => d * nameKey(a).localeCompare(nameKey(b), "ja") || byNo(a, b),
    new: (a, b) => d * -((Date.parse(a.addedAt ?? "") || 0) - (Date.parse(b.addedAt ?? "") || 0)) || byNo(a, b),
  };
  return [...list].sort(cmp[key]);
}
