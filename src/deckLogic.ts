import type { Card, Deck } from "./types";
import { COL7 } from "./theme";

/** デッキ構築のルール（公開情報に基づく。未発表のものは目安） */
export const DECK_SIZE = 50;
export const MAX_COPIES = 4; // 同じカード番号の上限。公式未発表のため目安（スターターデッキの構成から推定）

export const newDeckId = () => "d" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

export function setCount(d: Deck, cardId: string, n: number): Deck {
  const cards = { ...d.cards };
  if (n <= 0) delete cards[cardId];
  else cards[cardId] = n;
  return { ...d, cards, updatedAt: new Date().toISOString() };
}

export const total = (d: Deck) => Object.values(d.cards).reduce((a, b) => a + b, 0);

export type Issue = { level: "ng" | "warn"; text: string };

export function checkDeck(d: Deck, byId: Record<string, Card>): Issue[] {
  const out: Issue[] = [];
  const n = total(d);
  const ch = d.channel ? byId[d.channel] : undefined;
  if (!ch) out.push({ level: "ng", text: "チャンネルカードを選んでください" });
  if (n !== DECK_SIZE) out.push({ level: "ng", text: `デッキは${DECK_SIZE}枚ちょうど（今は${n}枚、${n < DECK_SIZE ? "あと" + (DECK_SIZE - n) + "枚" : n - DECK_SIZE + "枚多い"}）` });
  let iris = 0;
  for (const [id, cnt] of Object.entries(d.cards)) {
    const c = byId[id];
    if (!c) {
      out.push({ level: "warn", text: `データにないカード（${id}）が${cnt}枚入っています` });
      continue;
    }
    if (c.type === "チャンネル") out.push({ level: "ng", text: `${c.name}（チャンネル）はデッキに入れられません` });
    if (cnt > MAX_COPIES) out.push({ level: "warn", text: `${c.no || c.name} が${cnt}枚（同じカードは${MAX_COPIES}枚までが目安）` });
    if (/IRIS ?ONE|アイリスワン/i.test(c.key)) iris += cnt;
    if (/限定[:：]\s*同じ#/.test(c.key) && ch) {
      const share = c.tags.some((t) => ch.tags.includes(t));
      if (!share) out.push({ level: "ng", text: `${c.no || c.name} は「限定:同じ#」：チャンネル（${ch.name}）と同じ#がありません` });
    }
    if (!c.no) out.push({ level: "warn", text: `${c.name} は詳細未発表のカードです` });
  }
  if (iris > 1) out.push({ level: "ng", text: `IRIS ONE はデッキに1枚まで（今は${iris}枚）` });
  return out;
}

export function deckStats(d: Deck, byId: Record<string, Card>) {
  const lv: Record<string, number> = {};
  const col: Record<string, number> = Object.fromEntries(COL7.map((c) => [c, 0]));
  const type: Record<string, number> = {};
  for (const [id, cnt] of Object.entries(d.cards)) {
    const c = byId[id];
    if (!c) continue;
    const k = c.lv == null ? "?" : String(c.lv);
    lv[k] = (lv[k] ?? 0) + cnt;
    type[c.type] = (type[c.type] ?? 0) + cnt;
    c.cols.forEach((x) => (col[x] += cnt));
  }
  return { lv, col, type };
}

/** 共有用のデッキコード（例: NIJINANA:CH=NJ-SD01-001;NJ-SD01-002*4;...） */
export function toCode(d: Deck): string {
  const body = Object.entries(d.cards)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([id, n]) => `${id}*${n}`)
    .join(";");
  return `NIJINANA:${d.name ? "NAME=" + encodeURIComponent(d.name) + ";" : ""}CH=${d.channel};${body}`;
}

export function fromCode(code: string): Deck | null {
  const s = code.trim();
  if (!s.startsWith("NIJINANA:")) return null;
  const d: Deck = { id: newDeckId(), name: "読み込んだデッキ", channel: "", cards: {}, updatedAt: new Date().toISOString() };
  for (const part of s.slice(9).split(";")) {
    if (!part) continue;
    if (part.startsWith("NAME=")) d.name = decodeURIComponent(part.slice(5)) || d.name;
    else if (part.startsWith("CH=")) d.channel = part.slice(3);
    else {
      const m = part.match(/^(.+)\*(\d+)$/);
      if (m) d.cards[m[1]] = Math.min(99, Number(m[2]));
    }
  }
  return d;
}
