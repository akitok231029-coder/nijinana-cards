import React from "react";
import { Pressable, StyleSheet, Text, View, type ViewStyle } from "react-native";
import { COL7, COLOR, DISPLAY, type Palette } from "../theme";
import type { Col } from "../types";

export function ColorBar({ cols, height = 12, style }: { cols: Col[]; height?: number; style?: ViewStyle }) {
  return (
    <View style={[{ flexDirection: "row", gap: 2, height }, style]} accessibilityLabel={`カラー ${cols.join(" ") || "なし"}`}>
      {COL7.map((c) => {
        const on = cols.includes(c);
        return (
          <View key={c} style={{ flex: 1, borderRadius: 2, backgroundColor: on ? COLOR[c] : "rgba(127,127,140,0.18)", alignItems: "center", justifyContent: "center" }}>
            {on && height >= 12 ? <Text style={{ color: "#fff", fontSize: height * 0.62, fontWeight: "700" }}>{c}</Text> : null}
          </View>
        );
      })}
    </View>
  );
}

export function Badge({ label, pal, strong }: { label: string; pal: Palette; strong?: boolean }) {
  return (
    <View style={{ borderWidth: 1, borderColor: strong ? pal.fg : pal.line, borderRadius: 4, paddingHorizontal: 5 }}>
      <Text style={{ fontSize: 10, fontWeight: "700", color: pal.fg }}>{label}</Text>
    </View>
  );
}

export function Code({ label, pal }: { label: string; pal: Palette }) {
  return (
    <View style={{ backgroundColor: pal.chip, borderRadius: 4, paddingHorizontal: 5, paddingVertical: 1 }}>
      <Text style={{ fontSize: 10, color: pal.fg, fontVariant: ["tabular-nums"], fontFamily: "monospace" }}>{label}</Text>
    </View>
  );
}

export function Chip({ label, on, onPress, pal, color, dot }: { label: string; on: boolean; onPress: () => void; pal: Palette; color?: string; dot?: string }) {
  const fg = color ? (on ? "#fff" : color) : on ? pal.bg : pal.fg;
  const bg = color ? (on ? color : pal.surface) : on ? pal.fg : pal.surface;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: on }}
      style={{ minHeight: 38, minWidth: color ? 46 : undefined, paddingHorizontal: 13, borderRadius: 999, borderWidth: 1, borderColor: color ?? (on ? pal.fg : pal.line), backgroundColor: bg, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 }}
    >
      {dot ? <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: dot }} /> : null}
      <Text style={{ color: fg, fontSize: 14, fontWeight: color ? "700" : "400" }}>{label}</Text>
    </Pressable>
  );
}

export function Btn({ label, onPress, pal, primary, style }: { label: string; onPress: () => void; pal: Palette; primary?: boolean; style?: ViewStyle }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [{ minHeight: 46, paddingHorizontal: 16, borderRadius: 12, borderWidth: 1, borderColor: primary ? pal.fg : pal.line, backgroundColor: primary ? pal.fg : pal.bg, alignItems: "center", justifyContent: "center", opacity: pressed ? 0.7 : 1 }, style]}
    >
      <Text style={{ color: primary ? pal.bg : pal.fg, fontWeight: "700", fontSize: 14 }}>{label}</Text>
    </Pressable>
  );
}

export function Title({ children, pal, size = 18 }: { children: React.ReactNode; pal: Palette; size?: number }) {
  return <Text style={{ fontFamily: DISPLAY, fontSize: size, color: pal.fg, lineHeight: size * 1.35 }}>{children}</Text>;
}

export const s = StyleSheet.create({
  row: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 4 },
  kicker: { fontSize: 11, letterSpacing: 1, fontWeight: "700" },
});
