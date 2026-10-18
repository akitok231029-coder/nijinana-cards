import React, { useState } from "react";
import { Linking, Modal, Pressable, ScrollView, Text, View, useWindowDimensions } from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ATTRS, TYPE_EN, type Palette } from "../theme";
import { productById, XPOST } from "../data/static";
import type { Card } from "../types";
import { Badge, Btn, Code, ColorBar, Title, s } from "./ui";

function Row({ label, children, pal }: { label: string; children: React.ReactNode; pal: Palette }) {
  return (
    <View style={{ flexDirection: "row", gap: 14, paddingVertical: 5, borderBottomWidth: 1, borderBottomColor: pal.line }}>
      <Text style={{ width: 76, color: pal.muted, fontSize: 14 }}>{label}</Text>
      <View style={{ flex: 1, minWidth: 0 }}>{typeof children === "string" ? <Text style={{ color: pal.fg, fontSize: 14 }}>{children}</Text> : children}</View>
    </View>
  );
}

export function CardDetail({ card: c, pal, onClose }: { card: Card | null; pal: Palette; onClose: () => void }) {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const [zoom, setZoom] = useState(false);
  if (!c) return null;
  const p = productById[c.p];
  const attr = ATTRS[c.attr] ?? ATTRS.unk;
  const liver = c.type === "ライバー";
  const detailed = !!c.no;

  return (
    <Modal visible animationType="slide" onRequestClose={onClose} presentationStyle="pageSheet">
      <View style={{ flex: 1, backgroundColor: pal.surface }}>
        <View style={{ height: 6, backgroundColor: attr.color }} />
        <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}>
          {c.img ? (
            <Pressable onPress={() => setZoom(true)} accessibilityRole="imagebutton" accessibilityLabel="画像を拡大">
              <Image source={{ uri: c.img }} style={{ width: "100%", aspectRatio: 1, backgroundColor: pal.chip }} contentFit="contain" transition={150} cachePolicy="memory-disk" />
              <Text style={{ position: "absolute", right: 10, bottom: 10, color: "#fff", backgroundColor: "rgba(0,0,0,0.55)", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, fontSize: 12, overflow: "hidden" }}>タップで拡大</Text>
            </Pressable>
          ) : null}
          <View style={{ paddingHorizontal: 18, paddingTop: 14, gap: 10 }}>
            <Text style={[s.kicker, { color: pal.muted }]}>{TYPE_EN[c.type]}　{c.type}カード</Text>
            <Title pal={pal} size={24}>{c.name}</Title>
            <View>
              <Row label="収録" pal={pal}>{`${p?.code ?? c.p} ${p?.kind ?? ""}「${p?.name ?? ""}」`}</Row>
              {c.no ? (
                <Row label="番号" pal={pal}>
                  <View style={s.row}><Code label={c.no} pal={pal} />{c.rar ? <Badge label={c.rar} pal={pal} strong /> : null}</View>
                </Row>
              ) : null}
              <Row label="属性" pal={pal}>
                <View style={[s.row, { gap: 6 }]}><View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: attr.color }} /><Text style={{ color: pal.fg, fontSize: 14 }}>{attr.label}</Text></View>
              </Row>
              {c.type !== "チャンネル" ? <Row label="Lv" pal={pal}>{c.lv != null ? String(c.lv) : "未発表"}</Row> : null}
              {liver ? <Row label="パワー" pal={pal}>{c.pow != null ? c.pow.toLocaleString() : "未発表"}</Row> : null}
              {liver ? (
                <Row label="カラー" pal={pal}>
                  {detailed ? (c.cols.length ? <ColorBar cols={c.cols} height={18} style={{ maxWidth: 260 }} /> : "なし") : "未発表"}
                </Row>
              ) : null}
              {c.tags.length ? <Row label="#タグ" pal={pal}>{c.tags.map((t) => "#" + t).join("　")}</Row> : null}
              {c.key ? <Row label="キーワード" pal={pal}>{c.key}</Row> : null}
              {c.parallel ? <Row label="パラレル" pal={pal}>{c.parallel}</Row> : null}
            </View>
            {detailed ? (
              c.fx ? (
                <View style={{ backgroundColor: pal.chip, borderRadius: 10, padding: 12, gap: 4 }}>
                  <Text style={[s.kicker, { color: pal.muted }]}>効果（要約）</Text>
                  <Text style={{ color: pal.fg, fontSize: 15, lineHeight: 23 }}>{c.fx}</Text>
                </View>
              ) : (
                <Text style={{ color: pal.muted, fontSize: 13 }}>テキスト効果なし</Text>
              )
            ) : (
              <Text style={{ color: pal.muted, fontSize: 13 }}>Lv・パワー・効果は未発表です。{c.fx ? `（${c.fx}）` : ""}</Text>
            )}
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 4 }}>
              {c.x ? <Btn label="公式Xのポストを開く" primary pal={pal} onPress={() => Linking.openURL(XPOST(c.x))} /> : null}
              {p ? <Btn label="商品ページ" pal={pal} onPress={() => Linking.openURL(p.url)} /> : null}
              <Btn label="閉じる" pal={pal} onPress={onClose} />
            </View>
            {c.img ? <Text style={{ color: pal.muted, fontSize: 11 }}>画像は公式Xの投稿から表示しています。©ANYCOLOR, Inc. ©TOMY。開発中のデザインで製品版と異なる場合があります。</Text> : null}
          </View>
        </ScrollView>
      </View>

      <Modal visible={zoom} transparent animationType="fade" onRequestClose={() => setZoom(false)}>
        <Pressable style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.92)", alignItems: "center", justifyContent: "center" }} onPress={() => setZoom(false)} accessibilityLabel="閉じる">
          <ScrollView maximumZoomScale={4} minimumZoomScale={1} centerContent contentContainerStyle={{ flexGrow: 1, alignItems: "center", justifyContent: "center" }}>
            <Image source={{ uri: c.img }} style={{ width, height: Math.min(width, height) }} contentFit="contain" />
          </ScrollView>
          <Text style={{ color: "#fff", position: "absolute", bottom: insets.bottom + 20, fontSize: 13 }}>タップで閉じる</Text>
        </Pressable>
      </Modal>
    </Modal>
  );
}
