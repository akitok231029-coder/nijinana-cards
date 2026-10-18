import React from "react";
import { Pressable, StyleSheet, Text, View, type ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { COL7, COLOR, DISPLAY, RAINBOW, type Palette } from "../theme";
import type { Col } from "../types";

export function ColorBar({ cols, height = 12, style }: { cols: Col[]; height?: number; style?: ViewStyle }) {
  return (
    <View style={[{ flexDirection: "row", gap: 2, height }, style]} accessibilityLabel={`カラー ${cols.join(" ") || "なし"}`}>
      {COL7.map((c) => {
        const on = cols.includes(c);
        return (
          <View key={c} style={{ flex: 1, borderRadius: 3, backgroundColor: on ? COLOR[c] : "#edf0f8", alignItems: "center", justifyContent: "center" }}>
            {on && height >= 12 ? <Text style={{ color: "#fff", fontSize: height * 0.62, fontWeight: "700" }}>{c}</Text> : null}
          </View>
        );
      })}
    </View>
  );
}

export function RainbowBand({ height = 4 }: { height?: number }) {
  return <LinearGradient colors={RAINBOW} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ height }} />;
}

export function Badge({ label, pal, strong }: { label: string; pal: Palette; strong?: boolean }) {
  return (
    <View style={{ borderWidth: 1, borderColor: strong ? pal.accent : pal.line, backgroundColor: strong ? pal.accentSoft : "transparent", borderRadius: 4, paddingHorizontal: 5 }}>
      <Text style={{ fontSize: 10, fontWeight: "700", color: strong ? pal.accent : pal.fg }}>{label}</Text>
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
  const tint = color ?? pal.accent;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: on }}
      style={{ minHeight: 38, minWidth: color ? 46 : undefined, paddingHorizontal: 13, borderRadius: 999, borderWidth: 1.5, borderColor: on ? tint : color ?? pal.line, backgroundColor: on ? tint : pal.surface, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 }}
    >
      {dot ? <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: on ? "#fff" : dot }} /> : null}
      <Text style={{ color: on ? "#fff" : color ?? pal.fg, fontSize: 14, fontWeight: on || color ? "700" : "400" }}>{label}</Text>
    </Pressable>
  );
}

export function Btn({ label, onPress, pal, primary, danger, style, disabled }: { label: string; onPress: () => void; pal: Palette; primary?: boolean; danger?: boolean; style?: ViewStyle; disabled?: boolean }) {
  const bg = primary ? pal.accent : pal.surface;
  const border = primary ? pal.accent : danger ? pal.ng : pal.line;
  const fg = primary ? "#fff" : danger ? pal.ng : pal.fg;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      style={({ pressed }) => [{ minHeight: 46, paddingHorizontal: 16, borderRadius: 12, borderWidth: 1.5, borderColor: border, backgroundColor: bg, alignItems: "center", justifyContent: "center", opacity: disabled ? 0.4 : pressed ? 0.75 : 1 }, style]}
    >
      <Text style={{ color: fg, fontWeight: "700", fontSize: 14 }}>{label}</Text>
    </Pressable>
  );
}

export function Stepper({ value, onChange, pal, max = 99 }: { value: number; onChange: (n: number) => void; pal: Palette; max?: number }) {
  const btn = (label: string, next: number, disabled: boolean) => (
    <Pressable
      onPress={() => onChange(next)}
      disabled={disabled}
      accessibilityLabel={label === "+" ? "1枚増やす" : "1枚減らす"}
      style={({ pressed }) => ({ width: 38, height: 38, borderRadius: 19, backgroundColor: label === "+" ? pal.accent : pal.chip, alignItems: "center", justifyContent: "center", opacity: disabled ? 0.35 : pressed ? 0.7 : 1 })}
    >
      <Text style={{ color: label === "+" ? "#fff" : pal.fg, fontSize: 20, fontWeight: "700", lineHeight: 22 }}>{label}</Text>
    </Pressable>
  );
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
      {btn("−", value - 1, value <= 0)}
      <Text style={{ minWidth: 22, textAlign: "center", fontFamily: DISPLAY, fontSize: 17, color: value ? pal.fg : pal.muted }}>{value}</Text>
      {btn("+", value + 1, value >= max)}
    </View>
  );
}

export function Title({ children, pal, size = 18 }: { children: React.ReactNode; pal: Palette; size?: number }) {
  return <Text style={{ fontFamily: DISPLAY, fontSize: size, color: pal.fg, lineHeight: size * 1.35 }}>{children}</Text>;
}

export const s = StyleSheet.create({
  row: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 4 },
  kicker: { fontSize: 11, letterSpacing: 1, fontWeight: "700" },
});
