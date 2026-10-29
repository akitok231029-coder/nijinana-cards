import type { Attr, Col } from "./types";

/** 明るい配色のみ（ダークモードなし）。白地に虹色のアクセント。 */
const light = {
  bg: "#f5f7ff",
  surface: "#ffffff",
  fg: "#2a3160",
  muted: "#6e77a3",
  line: "#e2e7f6",
  accent: "#5a78ff",
  accentSoft: "#eaeeff",
  pink: "#ff6fa3",
  chip: "#eef1fb",
  scrim: "rgba(42,49,96,0.35)",
  unk: "#aab2cc",
  ok: "#16a36a",
  warn: "#e08a00",
  ng: "#e0365e",
};
export type Palette = typeof light;

export function usePalette(): Palette {
  return light;
}

export const COL7: Col[] = ["R", "O", "Y", "G", "B", "I", "V"];
export const COLOR: Record<Col, string> = {
  R: "#ff4d7d",
  O: "#ff8a3d",
  Y: "#f5bf1a",
  G: "#2fc27a",
  B: "#30aef0",
  I: "#5068e8",
  V: "#a160e6",
};
export const COL_NAME: Record<Col, string> = { R: "赤", O: "橙", Y: "黄", G: "緑", B: "青", I: "藍", V: "紫" };
/** 虹のグラデーション（ヘッダーの帯など） */
export const RAINBOW = COL7.map((c) => COLOR[c]) as [string, string, ...string[]];

export const ATTRS: Record<Attr, { label: string; color: string }> = {
  sol: { label: "ソル（太陽）", color: "#ff5c8a" },
  luna: { label: "ルナ（月）", color: "#4f7cf0" },
  comet: { label: "コメット（彗星）", color: "#22b7cf" },
  stella: { label: "ステラ（星）", color: "#f0b21a" },
  unk: { label: "未確認", color: "#aab2cc" },
};

export const TYPE_EN: Record<string, string> = {
  チャンネル: "CHANNEL",
  ライバー: "LIVER",
  イベント: "EVENT",
  ステージ: "STAGE",
};

export const DISPLAY = "DelaGothicOne_400Regular";
