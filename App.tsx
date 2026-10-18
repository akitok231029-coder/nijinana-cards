import React, { useCallback, useMemo, useState } from "react";
import { FlatList, Pressable, RefreshControl, ScrollView, Text, TextInput, View, useWindowDimensions } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";
import { useFonts, DelaGothicOne_400Regular } from "@expo-google-fonts/dela-gothic-one";
import { ATTRS, COL7, COLOR, DISPLAY, usePalette } from "./src/theme";
import { useCards } from "./src/useCards";
import { productById } from "./src/data/static";
import { countFilters, EMPTY, matches, MORE, type Filters } from "./src/filters";
import type { Card } from "./src/types";
import { CardTile } from "./src/components/CardTile";
import { CardDetail } from "./src/components/CardDetail";
import { FilterSheet } from "./src/components/FilterSheet";
import { LiversScreen, ProductsScreen, RulesScreen } from "./src/screens";

type Tab = "cards" | "livers" | "products" | "rules";
const TABS: { k: Tab; label: string; icon: string }[] = [
  { k: "cards", label: "カード", icon: "▤" },
  { k: "livers", label: "ライバー", icon: "◉" },
  { k: "products", label: "商品", icon: "◇" },
  { k: "rules", label: "用語", icon: "≡" },
];

function Main() {
  const pal = usePalette();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { cards, updatedAt, status, refresh } = useCards();
  const [tab, setTab] = useState<Tab>("cards");
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<Filters>(EMPTY);
  const [sheet, setSheet] = useState(false);
  const [open, setOpen] = useState<Card | null>(null);

  const list = useMemo(() => cards.filter((c) => matches(c, filters, query)), [cards, filters, query]);
  const nFilters = countFilters(filters);
  const cols = width >= 900 ? 4 : width >= 600 ? 3 : 2;
  const gap = 10;
  const tileW = (width - 32 - gap * (cols - 1)) / cols;
  const onTap = useCallback((c: Card) => setOpen(c), []);

  const active: { label: string; clear: () => void }[] = [];
  if (filters.prod) active.push({ label: productById[filters.prod]?.code ?? filters.prod, clear: () => setFilters({ ...filters, prod: "" }) });
  filters.types.forEach((t) => active.push({ label: t, clear: () => setFilters({ ...filters, types: filters.types.filter((x) => x !== t) }) }));
  filters.attrs.forEach((a) => active.push({ label: ATTRS[a].label, clear: () => setFilters({ ...filters, attrs: filters.attrs.filter((x) => x !== a) }) }));
  filters.cols.forEach((c) => active.push({ label: "カラー " + c, clear: () => setFilters({ ...filters, cols: filters.cols.filter((x) => x !== c) }) }));
  filters.more.forEach((m) => active.push({ label: MORE.find((x) => x.k === m)!.label, clear: () => setFilters({ ...filters, more: filters.more.filter((x) => x !== m) }) }));

  const statusText =
    status === "loading" ? "更新を確認中…" :
    status === "error" ? "更新を取得できませんでした（保存済みデータを表示中）" :
    status === "offline-only" ? "同梱データを表示中" : "";

  return (
    <View style={{ flex: 1, backgroundColor: pal.bg }}>
      <StatusBar style="auto" />
      {/* header */}
      <View style={{ paddingTop: insets.top, backgroundColor: pal.surface, borderBottomWidth: 1, borderBottomColor: pal.line }}>
        <View style={{ flexDirection: "row", height: 4 }}>{COL7.map((c) => <View key={c} style={{ flex: 1, backgroundColor: COLOR[c] }} />)}</View>
        <View style={{ paddingHorizontal: 16, paddingTop: 10, paddingBottom: 8, flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", gap: 12 }}>
          <View>
            <Text style={{ fontSize: 10, letterSpacing: 1, fontWeight: "700", color: pal.muted }}>NIJISANJI 7 Colors Card Game</Text>
            <Text style={{ fontFamily: DISPLAY, fontSize: 21, color: pal.fg, lineHeight: 28 }}>にじなな カードリスト</Text>
          </View>
          <Text style={{ fontSize: 10, color: pal.muted, textAlign: "right", maxWidth: 130 }}>{statusText}</Text>
        </View>
        {tab === "cards" ? (
          <View style={{ paddingHorizontal: 16, paddingBottom: 10, gap: 8 }}>
            <View style={{ flexDirection: "row", gap: 8 }}>
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="名前・#タグ・効果で検索"
                placeholderTextColor={pal.muted}
                returnKeyType="search"
                clearButtonMode="while-editing"
                style={{ flex: 1, fontSize: 16, paddingHorizontal: 14, paddingVertical: 9, borderWidth: 1, borderColor: pal.line, borderRadius: 12, backgroundColor: pal.bg, color: pal.fg }}
              />
              <Pressable onPress={() => setSheet(true)} accessibilityRole="button" style={{ flexDirection: "row", alignItems: "center", gap: 6, borderWidth: 1, borderColor: pal.line, borderRadius: 12, paddingHorizontal: 14, minHeight: 44, backgroundColor: pal.surface }}>
                <Text style={{ fontWeight: "700", color: pal.fg }}>絞り込み</Text>
                {nFilters ? <View style={{ backgroundColor: pal.fg, borderRadius: 10, minWidth: 20, height: 20, alignItems: "center", justifyContent: "center", paddingHorizontal: 5 }}><Text style={{ color: pal.bg, fontSize: 11, fontWeight: "700" }}>{nFilters}</Text></View> : null}
              </Pressable>
            </View>
            {active.length ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
                {active.map((a) => (
                  <Pressable key={a.label} onPress={a.clear} style={{ backgroundColor: pal.chip, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4, flexDirection: "row", gap: 6 }}>
                    <Text style={{ color: pal.fg, fontSize: 12 }}>{a.label}</Text><Text style={{ color: pal.muted, fontSize: 12 }}>×</Text>
                  </Pressable>
                ))}
              </ScrollView>
            ) : null}
          </View>
        ) : null}
      </View>

      {/* body */}
      <View style={{ flex: 1 }}>
        {tab === "cards" ? (
          <FlatList
            key={cols}
            data={list}
            keyExtractor={(c) => c.id}
            numColumns={cols}
            columnWrapperStyle={{ gap }}
            contentContainerStyle={{ padding: 16, gap, paddingBottom: 24 }}
            keyboardDismissMode="on-drag"
            refreshControl={<RefreshControl refreshing={status === "loading"} onRefresh={refresh} tintColor={pal.muted} />}
            ListHeaderComponent={<Text style={{ fontSize: 12, color: pal.muted, marginBottom: 2 }}>{list.length} 枚表示 ／ 公開済み {cards.length} 枚（詳細判明 {cards.filter((c) => c.no).length} 枚）</Text>}
            ListEmptyComponent={
              <View style={{ paddingVertical: 48, alignItems: "center", gap: 6 }}>
                <Text style={{ fontFamily: DISPLAY, fontSize: 17, color: pal.fg }}>該当するカードがありません</Text>
                <Text style={{ color: pal.muted }}>絞り込みや検索語を外してみてください。</Text>
              </View>
            }
            renderItem={({ item }) => <CardTile card={item} pal={pal} onPress={onTap} width={tileW} />}
            initialNumToRender={8}
            windowSize={7}
          />
        ) : tab === "livers" ? (
          <LiversScreen cards={cards} pal={pal} onPickLiver={(n) => { setQuery(n); setFilters(EMPTY); setTab("cards"); }} />
        ) : tab === "products" ? (
          <ProductsScreen cards={cards} pal={pal} onPickProduct={(id) => { setQuery(""); setFilters({ ...EMPTY, prod: id }); setTab("cards"); }} />
        ) : (
          <RulesScreen pal={pal} updatedAt={updatedAt} />
        )}
      </View>

      {/* tab bar */}
      <View style={{ flexDirection: "row", backgroundColor: pal.surface, borderTopWidth: 1, borderTopColor: pal.line, paddingBottom: insets.bottom }}>
        {TABS.map((t) => {
          const on = tab === t.k;
          return (
            <Pressable key={t.k} onPress={() => setTab(t.k)} accessibilityRole="tab" accessibilityState={{ selected: on }} style={{ flex: 1, height: 58, alignItems: "center", justifyContent: "center", gap: 2 }}>
              <Text style={{ fontSize: 20, color: on ? pal.accent : pal.muted }}>{t.icon}</Text>
              <Text style={{ fontSize: 11, fontWeight: "700", color: on ? pal.fg : pal.muted }}>{t.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <FilterSheet visible={sheet} value={filters} onChange={setFilters} onClose={() => setSheet(false)} pal={pal} resultCount={list.length} />
      {open ? <CardDetail card={open} pal={pal} onClose={() => setOpen(null)} /> : null}
    </View>
  );
}

export default function App() {
  const [loaded] = useFonts({ DelaGothicOne_400Regular });
  if (!loaded) return null;
  return (
    <SafeAreaProvider>
      <Main />
    </SafeAreaProvider>
  );
}
