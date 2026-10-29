import React from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ATTRS, COL7, COLOR, type Palette } from "../theme";
import { PRODUCTS } from "../data/static";
import { EMPTY, MORE, TYPES, toggle, type Filters } from "../filters";
import type { Attr } from "../types";
import { Btn, Chip, Title } from "./ui";

function Group({ title, children, pal }: { title: string; children: React.ReactNode; pal: Palette }) {
  return (
    <View style={{ gap: 8, marginBottom: 16 }}>
      <Text style={{ fontSize: 12, letterSpacing: 1, fontWeight: "700", color: pal.muted }}>{title}</Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>{children}</View>
    </View>
  );
}

export function FilterSheet({ visible, value, onChange, onClose, pal, resultCount }: {
  visible: boolean; value: Filters; onChange: (f: Filters) => void; onClose: () => void; pal: Palette; resultCount: number;
}) {
  const insets = useSafeAreaInsets();
  const f = value;
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={{ flex: 1, backgroundColor: pal.scrim }} onPress={onClose} accessibilityLabel="閉じる" />
      <View style={{ maxHeight: "85%", backgroundColor: pal.surface, borderTopLeftRadius: 18, borderTopRightRadius: 18, paddingTop: 8 }}>
        <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: pal.line, alignSelf: "center", marginBottom: 8 }} />
        <ScrollView contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: 8 }}>
          <View style={{ marginBottom: 12 }}><Title pal={pal} size={20}>絞り込み</Title></View>
          <Group title="商品" pal={pal}>
            <Chip label="すべて" on={!f.prod} onPress={() => onChange({ ...f, prod: "" })} pal={pal} />
            {PRODUCTS.map((p) => (
              <Chip key={p.id} label={p.kind === "スターターデッキ" ? `SD ${p.name}` : "ブースター"} on={f.prod === p.id} onPress={() => onChange({ ...f, prod: f.prod === p.id ? "" : p.id })} pal={pal} />
            ))}
          </Group>
          <Group title="種類" pal={pal}>
            {TYPES.map((t) => <Chip key={t} label={t} on={f.types.includes(t)} onPress={() => onChange({ ...f, types: toggle(f.types, t) })} pal={pal} />)}
          </Group>
          <Group title="クラス" pal={pal}>
            {(Object.keys(ATTRS) as Attr[]).map((k) => (
              <Chip key={k} label={ATTRS[k].label} dot={ATTRS[k].color} on={f.attrs.includes(k)} onPress={() => onChange({ ...f, attrs: toggle(f.attrs, k) })} pal={pal} />
            ))}
          </Group>
          <Group title="カラー（すべて持つ）" pal={pal}>
            {COL7.map((c) => <Chip key={c} label={c} color={COLOR[c]} on={f.cols.includes(c)} onPress={() => onChange({ ...f, cols: toggle(f.cols, c) })} pal={pal} />)}
          </Group>
          <Group title="そのほか" pal={pal}>
            {MORE.map((m) => <Chip key={m.k} label={m.label} on={f.more.includes(m.k)} onPress={() => onChange({ ...f, more: toggle(f.more, m.k) })} pal={pal} />)}
          </Group>
        </ScrollView>
        <View style={{ flexDirection: "row", gap: 8, paddingHorizontal: 18, paddingTop: 10, paddingBottom: insets.bottom + 12, borderTopWidth: 1, borderTopColor: pal.line }}>
          <Btn label="すべて解除" pal={pal} onPress={() => onChange(EMPTY)} style={{ flex: 1 }} />
          <Btn label={`${resultCount}枚を表示`} primary pal={pal} onPress={onClose} style={{ flex: 1 }} />
        </View>
      </View>
    </Modal>
  );
}
