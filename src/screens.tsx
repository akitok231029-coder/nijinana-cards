import React, { useMemo, useState } from "react";
import { FlatList, Linking, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { COL7, COLOR, type Palette } from "./theme";
import { OFFICIAL_SITE, PRODUCTS, RULES, X_ACCOUNT } from "./data/static";
import type { Card } from "./types";
import { Btn, Code, Title, s } from "./components/ui";

const pad = { paddingHorizontal: 16 };

function Box({ pal, children }: { pal: Palette; children: React.ReactNode }) {
  return <View style={{ backgroundColor: pal.surface, borderWidth: 1, borderColor: pal.line, borderRadius: 12, padding: 14, gap: 8 }}>{children}</View>;
}

export function LiversScreen({ cards, pal, onPickLiver }: { cards: Card[]; pal: Palette; onPickLiver: (name: string) => void }) {
  const [q, setQ] = useState("");
  const all = useMemo(() => {
    const m = new Map<string, { name: string; prods: string[]; cards: number }>();
    PRODUCTS.forEach((p) => p.livers.forEach((l) => { if (!m.has(l)) m.set(l, { name: l, prods: [], cards: 0 }); m.get(l)!.prods.push(p.code); }));
    cards.forEach((c) => { const e = c.liver ? m.get(c.liver) : undefined; if (e) e.cards++; });
    return [...m.values()].sort((a, b) => b.cards - a.cards || b.prods.length - a.prods.length || a.name.localeCompare(b.name, "ja"));
  }, [cards]);
  const list = all.filter((l) => !q.trim() || l.name.includes(q.trim()));
  return (
    <FlatList
      data={list}
      keyExtractor={(l) => l.name}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{ ...pad, paddingBottom: 24, gap: 8 }}
      ListHeaderComponent={
        <View style={{ gap: 8, paddingTop: 12, paddingBottom: 4 }}>
          <TextInput value={q} onChangeText={setQ} placeholder="ライバー名で検索" placeholderTextColor={pal.muted} style={{ fontSize: 16, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1, borderColor: pal.line, borderRadius: 12, backgroundColor: pal.surface, color: pal.fg }} />
          <Text style={{ fontSize: 12, color: pal.muted }}>{list.length} 名 ／ 発表済み収録ライバー {all.length} 名</Text>
        </View>
      }
      renderItem={({ item: l }) => (
        <Box pal={pal}>
          <Text style={{ fontWeight: "700", fontSize: 15, color: pal.fg }}>{l.name}</Text>
          <View style={s.row}>{l.prods.map((p) => <Code key={p} label={p} pal={pal} />)}</View>
          {l.cards ? (
            <Pressable onPress={() => onPickLiver(l.name)} style={{ alignSelf: "flex-start", borderWidth: 1, borderColor: pal.line, borderRadius: 10, paddingHorizontal: 12, minHeight: 38, justifyContent: "center", backgroundColor: pal.bg }}>
              <Text style={{ fontWeight: "700", color: pal.fg, fontSize: 13 }}>公開カード {l.cards} 枚</Text>
            </Pressable>
          ) : <Text style={{ fontSize: 12, color: pal.muted }}>公開カードなし</Text>}
        </Box>
      )}
    />
  );
}

export function ProductsScreen({ cards, pal, onPickProduct }: { cards: Card[]; pal: Palette; onPickProduct: (id: string) => void }) {
  return (
    <ScrollView contentContainerStyle={{ ...pad, paddingVertical: 12, gap: 10 }}>
      {PRODUCTS.map((p) => {
        const all = cards.filter((c) => c.p === p.id);
        const det = all.filter((c) => c.no).length;
        return (
          <Box key={p.id} pal={pal}>
            <View style={s.row}><Code label={p.code} pal={pal} /><Text style={[s.kicker, { color: pal.muted }]}>{p.kind}</Text></View>
            <Title pal={pal}>{p.name}</Title>
            <Text style={{ color: pal.fg, fontSize: 13, lineHeight: 21 }}>
              発売日 2026年12月26日（土）{"\n"}予約開始 2026年11月27日（金）{"\n"}価格 {p.price}{"\n"}公開カード {all.length} 枚{det ? `（詳細判明 ${det} 枚）` : ""}
            </Text>
            <Text style={{ color: pal.muted, fontSize: 12 }}>収録ライバー（{p.livers.length}名）：{p.livers.join("／")}</Text>
            <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
              <Btn label="カードを見る" pal={pal} primary onPress={() => onPickProduct(p.id)} />
              <Btn label="公式ページ" pal={pal} onPress={() => Linking.openURL(p.url)} />
            </View>
          </Box>
        );
      })}
      <Box pal={pal}>
        <Text style={[s.kicker, { color: pal.muted }]}>周辺商品</Text>
        <Title pal={pal}>スリーブ Vol.1</Title>
        <Text style={{ color: pal.fg, fontSize: 13 }}>2026年12月26日（土）発売・各1,210円（税込）・64枚入り{"\n"}カードバック（メイン）／カードバック（カラー）／月ノ美兎／剣持刀也</Text>
      </Box>
    </ScrollView>
  );
}

export function RulesScreen({ pal, updatedAt }: { pal: Palette; updatedAt: string }) {
  return (
    <ScrollView contentContainerStyle={{ ...pad, paddingVertical: 12, gap: 10 }}>
      {RULES.map((r) => (
        <Box key={r.title} pal={pal}>
          <Title pal={pal} size={16}>{r.title}</Title>
          <Text style={{ color: pal.fg, fontSize: 14, lineHeight: 22 }}>{r.body}</Text>
          {r.showColors ? (
            <View style={s.row}>{COL7.map((c) => <View key={c} style={{ backgroundColor: COLOR[c], borderRadius: 3, paddingHorizontal: 9, paddingVertical: 2 }}><Text style={{ color: "#fff", fontWeight: "700" }}>{c}</Text></View>)}</View>
          ) : null}
          {r.link ? <Text style={{ color: pal.accent, fontSize: 13 }} onPress={() => Linking.openURL(r.link!.url)}>{r.link.label}</Text> : null}
        </Box>
      ))}
      <Text style={{ color: pal.muted, fontSize: 12, lineHeight: 19, marginTop: 6 }}>
        このアプリは公式X（@NIJISANJI7CCG）のカード紹介、公式HP、にじなな情報局10月号で公開された情報をまとめた非公式・個人用のツールです。公式のカードリストは「後日公開」。効果は要約なので、正確な文面は公式Xのポストで確認してください。カード画像の著作権は ©ANYCOLOR, Inc. ©TOMY に帰属します。データ更新：{updatedAt ? new Date(updatedAt).toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" }) : "—"}
      </Text>
      <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
        <Btn label="公式X" pal={pal} onPress={() => Linking.openURL(X_ACCOUNT)} />
        <Btn label="公式HP" pal={pal} onPress={() => Linking.openURL(OFFICIAL_SITE)} />
      </View>
    </ScrollView>
  );
}
