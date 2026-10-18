import { useColorScheme } from "react-native";
import type { Attr, Col } from "./types";

const light = {
  bg: "#f2f4f8",
  surface: "#ffffff",
  fg: "#1b2233",
  muted: "#5d6782",
  line: "#dce2ec",
  accent: "#2f5bd8",
  chip: "#e8edf7",
  scrim: "rgba(12,16,28,0.5)",
  unk: "#9aa3b8",
};
const dark: typeof light = {
  bg: "#0f131d",
  surface: "#181e2b",
  fg: "#e7ebf5",
  muted: "#9aa4bf",
  line: "#283044",
  accent: "#86a2ff",
  chip: "#222a3c",
  scrim: "rgba(0,0,0,0.6)",
  unk: "#6c7590",
};
export type Palette = typeof light;

export function usePalette(): Palette {
  return useColorScheme() === "dark" ? dark : light;
}

export const COL7: Col[] = ["R", "O", "Y", "G", "B", "I", "V"];
export const COLOR: Record<Col, string> = {
  R: "#e0245e",
  O: "#ef7a2a",
  Y: "#e2b006",
  G: "#19a463",
  B: "#1f9ad6",
  I: "#3a50c4",
  V: "#8a3fbf",
};

export const ATTRS: Record<Attr, { label: string; color: string }> = {
  sol: { label: "太陽（ソル）", color: "#d9365e" },
  luna: { label: "月（ルナ）", color: "#2c5cc5" },
  comet: { label: "彗星（コメット）", color: "#1f9fb8" },
  stella: { label: "星（ステラ）", color: "#d6a91e" },
  unk: { label: "未確認", color: "#9aa3b8" },
};

export const TYPE_EN: Record<string, string> = {
  チャンネル: "CHANNEL",
  ライバー: "LIVER",
  イベント: "EVENT",
  ステージ: "STAGE",
};

export const DISPLAY = "DelaGothicOne_400Regular";
