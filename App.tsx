import React, { useCallback, useMemo, useState } from "react";
import { FlatList, Pressable, RefreshControl, ScrollView, Text, TextInput, View, useWindowDimensions } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";
import { useFonts, DelaGothicOne_400Regular } from "@expo-google-fonts/dela-gothic-one";
import { ATTRS, DISPLAY, usePalette } from "./src/theme";
import { useCards } from "./src/useCards";
import { useDecks, setCount } from "./src/deck";
import { productById } from "./src/data/static";
import { countFilters, EMPTY, matches, MORE, SORTS, sortCards, type Filters, type SortKey } from "./src/filters";
import type { Card } from "./src/types";
import { CardTile } from "./src/components/CardTile";
import { CardDetail } from "./src/components/CardDetail";
import { FilterSheet } from "./src/components/FilterSheet";
import { SortSheet } from "./src/components/SortSheet";
import { RainbowBand } from "./src/components/ui";
import { LiversScreen, ProductsScreen } from "./src/screens";
import { RulesScreen } from "./src/RulesScreen";
import { DeckScreen } from "./src/DeckScreen";

type Tab = "cards" | "deck" | "rules" | "livers" | "products";
const TABS: { k: Tab; label: string; icon: string; color: string }[] = [
  { k: "cards", label: "カード", icon: "▤", color: "#ff4d7d" },
  { k: "deck", label: "デッキ", icon: "❖", color: "#ff8a3d" },
  { k: "rules", label: "ルール", icon: "✎", color: "#2fc27a" },
  { k: "livers", label: "ライバー", icon: "☺", color: "#30aef0" },
  { k: "products", label: "商品", icon: "◆", color: "#a160e6" },
];

function Main() {
  const pal = usePalette();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { cards, updatedAt, status, refresh } = useCards();
  const decksApi = useDecks();
  const [tab, setTab] = useState<Tab>("cards");
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<Filters>(EMPTY);
  const [sortKey, setSortKey] = useState<SortKey>("no");
  const [desc, setDesc] = useState(false);
  const [sheet, setSheet] = useState<"" | "filter" | "sort">("");
  const [open, setOpen] = useState<Card | null>(null);

  const byId = useMemo(() => Object.fromEntries(cards.map((c) => [c.id, c])) as Record<string, Card>, [cards]);
  const list = useMemo(() => sortCards(cards.filter((c) => matches(c, filters, query)), sortKey, desc), [cards, filters, query, sortKey, desc]);
  const nFilters = countFilters(filters);
  const cols = width >= 900 ? 4 : width >= 600 ? 3 : 2;
  const gap = 10;
  const tileW = (width - 32 - gap * (cols - 1)) / cols;
  const onTap = useCallback((c: Card) => setOpen(c), []);

  const currentDeck = decksApi.decks.find((d) => d.id === decksApi.currentId);
  const deckHook = currentDeck && open
    ? { name: currentDeck.name, count: currentDeck.cards[open.id] ?? 0, onChange: (n: number) => decksApi.upsert(setCount(currentDeck, open.id, n)) }
    : undefined;

  const active: { label: string; clear: () => void }[] = [];
  if (filters.prod) active.push({ label: productById[filters.prod]?.code ?? filters.prod, clear: () => setFilters({ ...filters, prod: "" }) });
  filters.types.forEach((t) => active.push({ label: t, clear: () => setFilters({ ...filters, types: filters.types.filter((x) => x !== t) }) }));
  filters.attrs.forEach((a) => active.push({ label: ATTRS[a].label, clear: () => setFilters({ ...filters, attrs: filters.attrs.filter((x) => x !== a) }) }));
  filters.cols.forEach((c) => active.push({ label: "カラー " + c, clear: () => setFilters({ ...filters, cols: filters.cols.filter((x) => x !== c) }) }));
  filters.more.forEach((m) => active.push({ label: MORE.find((x) => x.k === m)!.label, clear: () => setFilters({ ...filters, more: filters.more.filter((x) => x !== m) }) }));

  const statusText =
    status === "loading" ? "更新を確認中…" :
    status === "error" ? "最新データを取得できませんでした" :
    status === "offline-only" ? "同梱データ" : "";
  const sortLabel = (SORTS.find((s) => s.k === sortKey)?.label ?? "").replace("（あいうえお）", "");
  const tabInfo = TABS.find((t) => t.k === tab)!;

  return (
    <View style={{ flex: 1, backgroundColor: pal.bg }}>
      <StatusBar style="dark" />
      {/* header */}
      <View style={{ paddingTop: insets.top, backgroundColor: pal.surface, borderBottomWidth: 1, borderBottomColor: pal.line }}>
        <RainbowBand height={5} />
        <View style={{ paddingHorizontal: 16, paddingTop: 10, paddingBottom: 8, flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", gap: 12 }}>
          <View style={{ flexShrink: 1 }}>
            <Text style={{ fontSize: 10, letterSpacing: 1, fontWeight: "700", color: pal.pink }}>NIJISANJI 7 Colors Card Game</Text>
            <Text style={{ fontFamily: DISPLAY, fontSize: 21, color: pal.fg, lineHeight: 28 }}>
              {tab === "cards" ? "にじなな カードリスト" : tabInfo.label}
            </Text>
          </View>
          <Text style={{ fontSize: 10, color: status === "error" ? pal.warn : pal.muted, textAlign: "right", maxWidth: 130 }}>{statusText}</Text>
        </View>
        {tab === "cards" ? (
          <View style={{ paddingHorizontal: 16, paddingBottom: 10, gap: 8 }}>
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="名前・#タグ・効果で検索（ひらがなOK）"
              placeholderTextColor={pal.muted}
              returnKeyType="search"
              style={{ fontSize: 16, paddingHorizontal: 14, paddingVertical: 9, borderWidth: 1.5, borderColor: pal.line, borderRadius: 12, backgroundColor: pal.bg, color: pal.fg }}
            />
            <View style={{ flexDirection: "row", gap: 8 }}>
              <Pressable onPress={() => setSheet("filter")} accessibilityRole="button" style={{ flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, borderWidth: 1.5, borderColor: nFilters ? pal.accent : pal.line, borderRadius: 12, minHeight: 42, backgroundColor: nFilters ? pal.accentSoft : pal.surface }}>
                <Text style={{ fontWeight: "700", color: nFilters ? pal.accent : pal.fg }}>絞り込み</Text>
                {nFilters ? <View style={{ backgroundColor: pal.accent, borderRadius: 10, minWidth: 20, height: 20, alignItems: "center", justifyContent: "center", paddingHorizontal: 5 }}><Text style={{ color: "#fff", fontSize: 11, fontWeight: "700" }}>{nFilters}</Text></View> : null}
              </Pressable>
              <Pressable onPress={() => setSheet("sort")} accessibilityRole="button" style={{ flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, borderWidth: 1.5, borderColor: pal.line, borderRadius: 12, minHeight: 42, backgroundColor: pal.surface }}>
                <Text style={{ fontWeight: "700", color: pal.fg }} numberOfLines={1}>並び：{sortLabel} {desc ? "↓" : "↑"}</Text>
              </Pressable>
            </View>
            {active.length ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
                {active.map((a) => (
                  <Pressable key={a.label} onPress={a.clear} style={{ backgroundColor: pal.accentSoft, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4, flexDirection: "row", gap: 6 }}>
                    <Text style={{ color: pal.accent, fontSize: 12, fontWeight: "700" }}>{a.label}</Text><Text style={{ color: pal.accent, fontSize: 12 }}>×</Text>
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
            refreshControl={<RefreshControl refreshing={status === "loading"} onRefresh={refresh} colors={[pal.accent]} tintColor={pal.accent} />}
            ListHeaderComponent={
              <Text style={{ fontSize: 12, color: pal.muted, marginBottom: 2 }}>
                {list.length} 枚表示 ／ 公開済み {cards.length} 枚{currentDeck ? `　・カードを開くと「${currentDeck.name}」に追加できます` : ""}
              </Text>
            }
            ListEmptyComponent={
              <View style={{ paddingVertical: 48, alignItems: "center", gap: 6 }}>
                <Text style={{ fontFamily: DISPLAY, fontSize: 17, color: pal.fg }}>該当するカードがありません</Text>
                <Text style={{ color: pal.muted }}>絞り込みや検索語を外してみてください。</Text>
              </View>
            }
            renderItem={({ item }) => <CardTile card={item} pal={pal} onPress={onTap} width={tileW} count={currentDeck?.cards[item.id]} />}
            initialNumToRender={8}
            windowSize={7}
          />
        ) : tab === "deck" ? (
          <DeckScreen pal={pal} cards={cards} byId={byId} decks={decksApi.decks} currentId={decksApi.currentId} select={decksApi.select} upsert={decksApi.upsert} remove={decksApi.remove} onOpenCard={setOpen} />
        ) : tab === "rules" ? (
          <RulesScreen pal={pal} updatedAt={updatedAt} />
        ) : tab === "livers" ? (
          <LiversScreen cards={cards} pal={pal} onPickLiver={(n) => { setQuery(n); setFilters(EMPTY); setTab("cards"); }} />
        ) : (
          <ProductsScreen cards={cards} pal={pal} onPickProduct={(id) => { setQuery(""); setFilters({ ...EMPTY, prod: id }); setTab("cards"); }} />
        )}
      </View>

      {/* tab bar */}
      <View style={{ flexDirection: "row", backgroundColor: pal.surface, borderTopWidth: 1, borderTopColor: pal.line, paddingBottom: insets.bottom }}>
        {TABS.map((t) => {
          const on = tab === t.k;
          return (
            <Pressable key={t.k} onPress={() => setTab(t.k)} accessibilityRole="tab" accessibilityState={{ selected: on }} style={{ flex: 1, height: 60, alignItems: "center", justifyContent: "center", gap: 2 }}>
              <View style={{ width: 40, height: 28, borderRadius: 14, backgroundColor: on ? t.color : "transparent", alignItems: "center", justifyContent: "center" }}>
                <Text style={{ fontSize: 16, color: on ? "#fff" : pal.muted }}>{t.icon}</Text>
              </View>
              <Text style={{ fontSize: 11, fontWeight: "700", color: on ? t.color : pal.muted }}>{t.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <FilterSheet visible={sheet === "filter"} value={filters} onChange={setFilters} onClose={() => setSheet("")} pal={pal} resultCount={list.length} />
      <SortSheet visible={sheet === "sort"} sortKey={sortKey} desc={desc} onChange={(k, d) => { setSortKey(k); setDesc(d); }} onClose={() => setSheet("")} pal={pal} />
      {open ? <CardDetail card={open} pal={pal} onClose={() => setOpen(null)} deck={deckHook} /> : null}
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
