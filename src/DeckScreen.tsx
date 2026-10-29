import React, { useMemo, useState } from "react";
import { Alert, FlatList, Modal, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { Image } from "expo-image";
import * as Clipboard from "expo-clipboard";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ATTRS, COL7, COLOR, DISPLAY, type Palette } from "./theme";
import type { Card, Deck } from "./types";
import { DECK_SIZE, MAX_COPIES, checkDeck, deckStats, fromCode, newDeckId, setCount, toCode, total } from "./deck";
import { matches, sortCards, EMPTY, TYPES, toggle, type Filters } from "./filters";
import { Badge, Btn, Chip, Code, ColorBar, Stepper, Title, s } from "./components/ui";

type Props = {
  pal: Palette;
  cards: Card[];
  byId: Record<string, Card>;
  decks: Deck[];
  currentId: string;
  select: (id: string) => void;
  upsert: (d: Deck) => void;
  remove: (id: string) => void;
  onOpenCard: (c: Card) => void;
};

const Thumb = ({ c, pal, size = 52 }: { c?: Card; pal: Palette; size?: number }) =>
  c?.img ? (
    <Image source={{ uri: c.img }} style={{ width: size, height: size, borderRadius: 8, backgroundColor: pal.chip }} contentFit="cover" cachePolicy="memory-disk" />
  ) : (
    <View style={{ width: size, height: size, borderRadius: 8, backgroundColor: c ? ATTRS[c.attr].color : pal.chip, alignItems: "center", justifyContent: "center" }}>
      <Text style={{ color: "#fff", fontFamily: DISPLAY, fontSize: 14 }}>{c?.lv ?? "?"}</Text>
    </View>
  );

export function DeckScreen(p: Props) {
  const [editing, setEditing] = useState<string | null>(null);
  const deck = p.decks.find((d) => d.id === editing);
  if (deck) return <DeckEditor {...p} deck={deck} onBack={() => setEditing(null)} />;
  return <DeckList {...p} onEdit={(id) => { p.select(id); setEditing(id); }} />;
}

/* ---------------- 一覧 ---------------- */
function DeckList({ pal, decks, byId, upsert, currentId, onEdit }: Props & { onEdit: (id: string) => void }) {
  const [importing, setImporting] = useState(false);
  const [code, setCode] = useState("");
  const create = () => {
    const d: Deck = { id: newDeckId(), name: `デッキ ${decks.length + 1}`, channel: "", cards: {}, updatedAt: new Date().toISOString() };
    upsert(d);
    onEdit(d.id);
  };
  const doImport = () => {
    const d = fromCode(code);
    if (!d) { Alert.alert("読み込めませんでした", "「NIJINANA:」で始まるデッキコードを貼り付けてください。"); return; }
    upsert(d); setImporting(false); setCode(""); onEdit(d.id);
  };
  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 10, paddingBottom: 28 }}>
      <View style={{ flexDirection: "row", gap: 8 }}>
        <Btn label="＋ 新しいデッキ" primary pal={pal} onPress={create} style={{ flex: 1 }} />
        <Btn label="コードから読み込む" pal={pal} onPress={() => setImporting(!importing)} style={{ flex: 1 }} />
      </View>
      {importing ? (
        <View style={{ gap: 8, backgroundColor: pal.surface, borderRadius: 12, borderWidth: 1, borderColor: pal.line, padding: 12 }}>
          <TextInput value={code} onChangeText={setCode} placeholder="NIJINANA:… を貼り付け" placeholderTextColor={pal.muted} multiline
            style={{ minHeight: 70, fontSize: 14, color: pal.fg, borderWidth: 1, borderColor: pal.line, borderRadius: 10, padding: 10, textAlignVertical: "top" }} />
          <Btn label="読み込む" primary pal={pal} onPress={doImport} disabled={!code.trim()} />
        </View>
      ) : null}
      {decks.length === 0 ? (
        <View style={{ alignItems: "center", paddingVertical: 40, gap: 6 }}>
          <Title pal={pal} size={17}>デッキはまだありません</Title>
          <Text style={{ color: pal.muted, textAlign: "center" }}>「新しいデッキ」から作り始めましょう。{"\n"}チャンネルカード1枚と、デッキ{DECK_SIZE}枚を選びます。</Text>
        </View>
      ) : null}
      {decks.map((d) => {
        const n = total(d);
        const ch = byId[d.channel];
        const ng = checkDeck(d, byId).filter((i) => i.level === "ng").length;
        return (
          <Pressable key={d.id} onPress={() => onEdit(d.id)} style={({ pressed }) => ({ flexDirection: "row", gap: 12, alignItems: "center", backgroundColor: pal.surface, borderRadius: 14, borderWidth: d.id === currentId ? 2 : 1, borderColor: d.id === currentId ? pal.accent : pal.line, padding: 12, opacity: pressed ? 0.8 : 1 })}>
            <Thumb c={ch} pal={pal} size={56} />
            <View style={{ flex: 1, gap: 3 }}>
              <Title pal={pal} size={16}>{d.name}</Title>
              <Text style={{ color: pal.muted, fontSize: 12 }}>{ch ? `チャンネル：${ch.name}` : "チャンネル未選択"}</Text>
              <View style={s.row}>
                <Badge label={`${n}/${DECK_SIZE}枚`} pal={pal} strong={n === DECK_SIZE} />
                {ng ? <Text style={{ color: pal.ng, fontSize: 12, fontWeight: "700" }}>要確認 {ng}件</Text> : <Text style={{ color: pal.ok, fontSize: 12, fontWeight: "700" }}>OK</Text>}
                {d.id === currentId ? <Text style={{ color: pal.accent, fontSize: 12, fontWeight: "700" }}>・編集中のデッキ</Text> : null}
              </View>
            </View>
            <Text style={{ color: pal.muted, fontSize: 22 }}>›</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

/* ---------------- 編集 ---------------- */
function DeckEditor({ pal, deck, cards, byId, upsert, remove, onBack, onOpenCard }: Props & { deck: Deck; onBack: () => void }) {
  const [picker, setPicker] = useState(false);
  const [chPicker, setChPicker] = useState(false);
  const [copied, setCopied] = useState(false);
  const n = total(deck);
  const issues = useMemo(() => checkDeck(deck, byId), [deck, byId]);
  const stats = useMemo(() => deckStats(deck, byId), [deck, byId]);
  const ch = byId[deck.channel];
  const rows = useMemo(() => sortCards(Object.keys(deck.cards).map((id) => byId[id]).filter(Boolean) as Card[], "type", false), [deck, byId]);
  const missing = Object.keys(deck.cards).filter((id) => !byId[id]);
  const change = (id: string, k: number) => upsert(setCount(deck, id, k));
  const lvKeys = Object.keys(stats.lv).sort((a, b) => (a === "?" ? 99 : +a) - (b === "?" ? 99 : +b));
  const lvMax = Math.max(1, ...Object.values(stats.lv));
  const colMax = Math.max(1, ...Object.values(stats.col));

  const copy = async () => {
    try { await Clipboard.setStringAsync(toCode(deck)); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { Alert.alert("コピーできませんでした"); }
  };
  const del = () =>
    Alert.alert("デッキを削除", `「${deck.name}」を削除します。元に戻せません。`, [
      { text: "やめる", style: "cancel" },
      { text: "削除する", style: "destructive", onPress: () => { remove(deck.id); onBack(); } },
    ]);

  return (
    <>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 28 }} keyboardShouldPersistTaps="handled">
        <Pressable onPress={onBack} style={{ alignSelf: "flex-start", paddingVertical: 4 }} accessibilityRole="button">
          <Text style={{ color: pal.accent, fontWeight: "700", fontSize: 15 }}>‹ デッキ一覧</Text>
        </Pressable>
        <TextInput value={deck.name} onChangeText={(t) => upsert({ ...deck, name: t, updatedAt: new Date().toISOString() })} placeholder="デッキ名"
          style={{ fontFamily: DISPLAY, fontSize: 22, color: pal.fg, borderBottomWidth: 2, borderBottomColor: pal.accentSoft, paddingVertical: 4 }} />

        {/* チャンネル */}
        <Pressable onPress={() => setChPicker(true)} style={{ flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: pal.surface, borderRadius: 14, borderWidth: 1, borderColor: pal.line, padding: 12 }}>
          <Thumb c={ch} pal={pal} size={60} />
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={[s.kicker, { color: pal.accent }]}>チャンネルカード</Text>
            <Title pal={pal} size={16}>{ch ? ch.name : "タップして選ぶ"}</Title>
            {ch ? <Text style={{ color: pal.muted, fontSize: 12 }}>{ch.tags.map((t) => "#" + t).join(" ")}</Text> : null}
          </View>
          <Text style={{ color: pal.muted, fontSize: 22 }}>›</Text>
        </Pressable>

        {/* 枚数とチェック */}
        <View style={{ backgroundColor: pal.surface, borderRadius: 14, borderWidth: 1, borderColor: pal.line, padding: 14, gap: 10 }}>
          <View style={{ flexDirection: "row", alignItems: "baseline", justifyContent: "space-between" }}>
            <Text style={[s.kicker, { color: pal.muted }]}>デッキ枚数</Text>
            <Text style={{ fontFamily: DISPLAY, fontSize: 22, color: n === DECK_SIZE ? pal.ok : pal.fg }}>{n}<Text style={{ fontSize: 14, color: pal.muted }}> / {DECK_SIZE}</Text></Text>
          </View>
          <View style={{ height: 8, borderRadius: 4, backgroundColor: pal.chip, overflow: "hidden" }}>
            <View style={{ width: `${Math.min(100, (n / DECK_SIZE) * 100)}%`, height: "100%", backgroundColor: n > DECK_SIZE ? pal.ng : n === DECK_SIZE ? pal.ok : pal.accent }} />
          </View>
          {issues.length === 0 ? (
            <Text style={{ color: pal.ok, fontWeight: "700" }}>デッキの条件を満たしています</Text>
          ) : (
            issues.slice(0, 8).map((i, k) => (
              <Text key={k} style={{ color: i.level === "ng" ? pal.ng : pal.warn, fontSize: 13 }}>{i.level === "ng" ? "● " : "▲ "}{i.text}</Text>
            ))
          )}
          {issues.length > 8 ? <Text style={{ color: pal.muted, fontSize: 12 }}>ほか {issues.length - 8} 件</Text> : null}
        </View>

        {/* 分布 */}
        {n ? (
          <View style={{ backgroundColor: pal.surface, borderRadius: 14, borderWidth: 1, borderColor: pal.line, padding: 14, gap: 12 }}>
            <Text style={[s.kicker, { color: pal.muted }]}>種類</Text>
            <View style={s.row}>{TYPES.filter((t) => t !== "チャンネル").map((t) => <Badge key={t} label={`${t} ${stats.type[t] ?? 0}`} pal={pal} />)}</View>
            <Text style={[s.kicker, { color: pal.muted }]}>Lv分布</Text>
            <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 6, height: 76 }}>
              {lvKeys.map((k) => (
                <View key={k} style={{ alignItems: "center", gap: 3, flex: 1 }}>
                  <Text style={{ fontSize: 11, color: pal.fg }}>{stats.lv[k]}</Text>
                  <View style={{ width: "70%", height: (stats.lv[k] / lvMax) * 44, borderRadius: 4, backgroundColor: pal.accent }} />
                  <Text style={{ fontSize: 11, color: pal.muted }}>{k === "?" ? "未" : "Lv" + k}</Text>
                </View>
              ))}
            </View>
            <Text style={[s.kicker, { color: pal.muted }]}>カラー（その色を持つカードの枚数）</Text>
            <View style={{ gap: 4 }}>
              {COL7.map((c) => (
                <View key={c} style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <Text style={{ width: 14, fontWeight: "700", color: COLOR[c] }}>{c}</Text>
                  <View style={{ flex: 1, height: 10, borderRadius: 5, backgroundColor: pal.chip, overflow: "hidden" }}>
                    <View style={{ width: `${(stats.col[c] / colMax) * 100}%`, height: "100%", backgroundColor: COLOR[c] }} />
                  </View>
                  <Text style={{ width: 22, textAlign: "right", fontSize: 12, color: stats.col[c] ? pal.fg : pal.ng, fontVariant: ["tabular-nums"] }}>{stats.col[c]}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        {/* 中身 */}
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <Title pal={pal} size={17}>デッキの中身</Title>
          <Btn label="＋ カードを追加" primary pal={pal} onPress={() => setPicker(true)} />
        </View>
        {rows.length === 0 && !missing.length ? <Text style={{ color: pal.muted }}>まだカードがありません。「カードを追加」から選びましょう。</Text> : null}
        {rows.map((c) => (
          <View key={c.id} style={{ flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: pal.surface, borderRadius: 12, borderWidth: 1, borderColor: pal.line, padding: 8 }}>
            <Pressable onPress={() => onOpenCard(c)}><Thumb c={c} pal={pal} /></Pressable>
            <Pressable onPress={() => onOpenCard(c)} style={{ flex: 1, gap: 3 }}>
              <Text style={{ fontWeight: "700", color: pal.fg, fontSize: 14 }} numberOfLines={1}>{c.name}</Text>
              <View style={s.row}>
                {c.no ? <Code label={c.no} pal={pal} /> : null}
                <Text style={{ fontSize: 11, color: pal.muted }}>{c.type}{c.lv != null ? ` Lv${c.lv}` : ""}{c.pow != null ? ` ${c.pow}` : ""}</Text>
              </View>
              {c.cols.length ? <ColorBar cols={c.cols} height={8} style={{ maxWidth: 140 }} /> : null}
            </Pressable>
            <Stepper value={deck.cards[c.id] ?? 0} onChange={(k) => change(c.id, k)} pal={pal} />
          </View>
        ))}
        {missing.map((id) => (
          <View key={id} style={{ flexDirection: "row", alignItems: "center", gap: 10, padding: 8 }}>
            <Text style={{ flex: 1, color: pal.warn }}>{id}（データにないカード）× {deck.cards[id]}</Text>
            <Btn label="外す" pal={pal} onPress={() => change(id, 0)} />
          </View>
        ))}

        <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap", marginTop: 6 }}>
          <Btn label={copied ? "コピーしました" : "デッキコードをコピー"} pal={pal} onPress={copy} />
          <Btn label="削除" danger pal={pal} onPress={del} />
        </View>
        <Text style={{ color: pal.muted, fontSize: 12 }}>デッキはこのスマホの中に保存されます。デッキコードを使うと、別の端末でも読み込めます。同じカードの上限（{MAX_COPIES}枚）は公式未発表のため目安です。</Text>
      </ScrollView>

      <CardPicker visible={picker} onClose={() => setPicker(false)} pal={pal} cards={cards.filter((c) => c.type !== "チャンネル" && (!ch || ch.attr === "unk" || c.attr === "unk" || c.attr === ch.attr))} counts={deck.cards} onChange={change} title={ch && ch.attr !== "unk" ? `カードを追加（${ATTRS[ch.attr].label.split("（")[0]}のみ）` : "カードを追加"} />
      <CardPicker visible={chPicker} onClose={() => setChPicker(false)} pal={pal} cards={cards.filter((c) => c.type === "チャンネル")} counts={{}} title="チャンネルカードを選ぶ"
        onPick={(c) => { upsert({ ...deck, channel: c.id, updatedAt: new Date().toISOString() }); setChPicker(false); }} selectedId={deck.channel} />
    </>
  );
}

/* ---------------- カード選択 ---------------- */
function CardPicker({ visible, onClose, pal, cards, counts, onChange, onPick, selectedId, title }: {
  visible: boolean; onClose: () => void; pal: Palette; cards: Card[]; counts: Record<string, number>;
  onChange?: (id: string, n: number) => void; onPick?: (c: Card) => void; selectedId?: string; title: string;
}) {
  const insets = useSafeAreaInsets();
  const [q, setQ] = useState("");
  const [f, setF] = useState<Filters>(EMPTY);
  const list = useMemo(() => sortCards(cards.filter((c) => matches(c, f, q)), "no", false), [cards, f, q]);
  const sum = Object.values(counts).reduce((a, b) => a + b, 0);
  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose} presentationStyle="pageSheet">
      <View style={{ flex: 1, backgroundColor: pal.bg, paddingTop: 12 }}>
        <View style={{ paddingHorizontal: 16, gap: 8, paddingBottom: 8 }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <Title pal={pal} size={19}>{title}</Title>
            <Btn label={onPick ? "閉じる" : `完了（${sum}枚）`} primary={!onPick} pal={pal} onPress={onClose} />
          </View>
          <TextInput value={q} onChangeText={setQ} placeholder="名前・#タグ・効果で検索（ひらがなOK）" placeholderTextColor={pal.muted}
            style={{ fontSize: 16, paddingHorizontal: 14, paddingVertical: 9, borderWidth: 1, borderColor: pal.line, borderRadius: 12, backgroundColor: pal.surface, color: pal.fg }} />
          {!onPick ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
              {TYPES.filter((t) => t !== "チャンネル").map((t) => <Chip key={t} label={t} on={f.types.includes(t)} onPress={() => setF({ ...f, types: toggle(f.types, t) })} pal={pal} />)}
              {COL7.map((c) => <Chip key={c} label={c} color={COLOR[c]} on={f.cols.includes(c)} onPress={() => setF({ ...f, cols: toggle(f.cols, c) })} pal={pal} />)}
            </ScrollView>
          ) : null}
        </View>
        <FlatList
          data={list}
          keyExtractor={(c) => c.id}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 20, gap: 8 }}
          ListEmptyComponent={<Text style={{ color: pal.muted, textAlign: "center", paddingVertical: 30 }}>該当するカードがありません</Text>}
          renderItem={({ item: c }) => {
            const sel = selectedId === c.id;
            const body = (
              <>
                <Thumb c={c} pal={pal} size={56} />
                <View style={{ flex: 1, gap: 3 }}>
                  <Text style={{ fontWeight: "700", color: pal.fg, fontSize: 14 }} numberOfLines={1}>{c.name}</Text>
                  <View style={s.row}>
                    {c.no ? <Code label={c.no} pal={pal} /> : <Text style={{ fontSize: 11, color: pal.muted }}>{c.p}・詳細未発表</Text>}
                    {c.rar ? <Badge label={c.rar} pal={pal} /> : null}
                    <Text style={{ fontSize: 11, color: pal.muted }}>{c.lv != null ? `Lv${c.lv}` : ""}{c.pow != null ? ` ${c.pow}` : ""}</Text>
                  </View>
                  {c.cols.length ? <ColorBar cols={c.cols} height={8} style={{ maxWidth: 140 }} /> : c.tags.length ? <Text style={{ fontSize: 11, color: pal.muted }}>{c.tags.map((t) => "#" + t).join(" ")}</Text> : null}
                </View>
              </>
            );
            return onPick ? (
              <Pressable onPress={() => onPick(c)} style={{ flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: sel ? pal.accentSoft : pal.surface, borderRadius: 12, borderWidth: sel ? 2 : 1, borderColor: sel ? pal.accent : pal.line, padding: 8 }}>
                {body}
                {sel ? <Text style={{ color: pal.accent, fontWeight: "700" }}>選択中</Text> : null}
              </Pressable>
            ) : (
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: counts[c.id] ? pal.accentSoft : pal.surface, borderRadius: 12, borderWidth: 1, borderColor: counts[c.id] ? pal.accent : pal.line, padding: 8 }}>
                {body}
                <Stepper value={counts[c.id] ?? 0} onChange={(k) => onChange?.(c.id, k)} pal={pal} />
              </View>
            );
          }}
        />
      </View>
    </Modal>
  );
}
