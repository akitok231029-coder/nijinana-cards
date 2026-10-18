import React from "react";
import { Modal, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { Palette } from "../theme";
import { SORTS, type SortKey } from "../filters";
import { Chip, Title } from "./ui";

export function SortSheet({ visible, sortKey, desc, onChange, onClose, pal }: {
  visible: boolean; sortKey: SortKey; desc: boolean; onChange: (k: SortKey, desc: boolean) => void; onClose: () => void; pal: Palette;
}) {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={{ flex: 1, backgroundColor: pal.scrim }} onPress={onClose} accessibilityLabel="閉じる" />
      <View style={{ backgroundColor: pal.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 18, paddingBottom: insets.bottom + 18, gap: 12 }}>
        <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: pal.line, alignSelf: "center" }} />
        <Title pal={pal} size={20}>並び替え</Title>
        <View style={{ gap: 2 }}>
          {SORTS.map((o) => {
            const on = o.k === sortKey;
            return (
              <Pressable key={o.k} onPress={() => onChange(o.k, desc)} accessibilityRole="radio" accessibilityState={{ selected: on }}
                style={{ flexDirection: "row", alignItems: "center", gap: 12, minHeight: 48, paddingHorizontal: 12, borderRadius: 12, backgroundColor: on ? pal.accentSoft : "transparent" }}>
                <View style={{ width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: on ? pal.accent : pal.line, alignItems: "center", justifyContent: "center" }}>
                  {on ? <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: pal.accent }} /> : null}
                </View>
                <Text style={{ fontSize: 15, color: pal.fg, fontWeight: on ? "700" : "400" }}>{o.label}</Text>
              </Pressable>
            );
          })}
        </View>
        <View style={{ flexDirection: "row", gap: 8 }}>
          <Chip label="↑ 昇順" on={!desc} onPress={() => onChange(sortKey, false)} pal={pal} />
          <Chip label="↓ 降順" on={desc} onPress={() => onChange(sortKey, true)} pal={pal} />
        </View>
        <Text style={{ color: pal.muted, fontSize: 12 }}>カラー順は、持っている色のうち最初の色（赤→紫）の順。色のないカードは最後になります。</Text>
      </View>
    </Modal>
  );
}
