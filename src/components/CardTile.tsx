import React, { memo } from "react";
import { Pressable, Text, View } from "react-native";
import { Image } from "expo-image";
import { ATTRS, DISPLAY, TYPE_EN, type Palette } from "../theme";
import { productById } from "../data/static";
import type { Card } from "../types";
import { Badge, Code, ColorBar, s } from "./ui";

export const isNew = (c: Card) => !!c.addedAt && Date.now() - Date.parse(c.addedAt) < 3 * 864e5;

function CardTileBase({ card: c, pal, onPress, width }: { card: Card; pal: Palette; onPress: (c: Card) => void; width: number }) {
  const attr = ATTRS[c.attr] ?? ATTRS.unk;
  const liver = c.type === "ライバー";
  return (
    <Pressable
      onPress={() => onPress(c)}
      accessibilityRole="button"
      accessibilityLabel={`${c.name} ${c.type}${c.no ? " " + c.no : ""}`}
      style={({ pressed }) => ({ width, backgroundColor: pal.surface, borderRadius: 12, borderWidth: 1, borderColor: pal.line, overflow: "hidden", transform: [{ scale: pressed ? 0.97 : 1 }] })}
    >
      <View style={{ width: "100%", aspectRatio: 1, backgroundColor: attr.color }}>
        {c.img ? (
          <Image source={{ uri: c.img }} style={{ flex: 1 }} contentFit="cover" transition={150} recyclingKey={c.id} cachePolicy="memory-disk" />
        ) : (
          <View style={{ flex: 1, padding: 10, justifyContent: "flex-end" }}>
            <Text style={{ color: "rgba(255,255,255,0.85)", fontSize: 10, letterSpacing: 1.5, fontWeight: "700" }}>{TYPE_EN[c.type]}</Text>
            <Text style={{ color: "#fff", fontFamily: DISPLAY, fontSize: 17, lineHeight: 23 }} numberOfLines={2}>{c.name}</Text>
            <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 10, marginTop: 2 }}>画像は未公開</Text>
          </View>
        )}
        <View style={{ position: "absolute", top: 6, left: 6, flexDirection: "row", gap: 4 }}>
          <View style={{ backgroundColor: "rgba(0,0,0,0.6)", borderRadius: 6, minWidth: 26, height: 26, alignItems: "center", justifyContent: "center", paddingHorizontal: 5 }}>
            <Text style={{ color: "#fff", fontFamily: DISPLAY, fontSize: 14 }}>{c.lv ?? "–"}</Text>
          </View>
          {isNew(c) ? (
            <View style={{ backgroundColor: pal.accent, borderRadius: 6, paddingHorizontal: 6, justifyContent: "center" }}>
              <Text style={{ color: "#fff", fontSize: 10, fontWeight: "700" }}>NEW</Text>
            </View>
          ) : null}
        </View>
      </View>
      <View style={{ padding: 9, gap: 5 }}>
        <Text style={{ fontFamily: DISPLAY, fontSize: 15, lineHeight: 20, color: pal.fg }} numberOfLines={1}>{c.name}</Text>
        {liver && c.pow != null ? (
          <View style={{ gap: 4 }}>
            <Text style={{ fontFamily: DISPLAY, fontSize: 14, color: pal.fg }}>{c.pow.toLocaleString()}</Text>
            <ColorBar cols={c.cols} height={11} />
          </View>
        ) : (
          <Text style={{ fontSize: 11, color: pal.muted }}>{c.type}{c.fx && c.no ? "・効果あり" : ""}</Text>
        )}
        <View style={s.row}>
          <Code label={c.no || productById[c.p]?.code || c.p} pal={pal} />
          {c.rar ? <Badge label={c.rar} pal={pal} strong /> : null}
          {c.parallel ? <Badge label={c.parallel} pal={pal} /> : null}
        </View>
      </View>
    </Pressable>
  );
}
export const CardTile = memo(CardTileBase);
