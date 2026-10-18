import React, { useState } from "react";
import { Linking, Modal, Pressable, ScrollView, Text, View, useWindowDimensions } from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COL7, COLOR, COL_NAME, type Palette } from "./theme";
import { OFFICIAL_SITE, XPOST, X_ACCOUNT } from "./data/static";
import { Btn, Title, s } from "./components/ui";

type Section = { id: string; title: string; items: { h?: string; t: string }[]; image?: { url: string; post: string; caption: string } };

/**
 * ルールの要約（自分の言葉でまとめたもの）。
 * 出典：公式X（@NIJISANJI7CCG）のルール補足、公式HP・にじなな情報局10月号、遊び方動画の内容を紹介したファンの解説記事。
 * 未確定の部分は「未発表」と明記する。
 */
const SECTIONS: Section[] = [
  {
    id: "goal", title: "ゲームの目的",
    items: [
      { t: "相手のカラーカードを集めて、赤・橙・黄・緑・青・藍・紫の7色をそろえ、虹を完成させたプレイヤーが勝ちです。" },
      { t: "ライバーやイベントで自分の「世界」を作り、相手の世界に自分の色を響かせていくイメージのゲームです。" },
    ],
  },
  {
    id: "items", title: "用意するもの",
    items: [
      { h: "チャンネルカード", t: "1枚。デッキの外に置き、ゲーム中ずっと効果を持つカード。デッキに入れられる「限定」カードの条件にもなります。" },
      { h: "デッキ", t: "ライバー・イベント・ステージで50枚。" },
      { h: "カラーカード", t: "R O Y G B I V の7色を1枚ずつ。" },
    ],
  },
  {
    id: "setup", title: "ゲームの準備",
    items: [
      { t: "デッキをよく切って手札を引きます。先攻は5枚、後攻は7枚。手札の引き直しもできます。" },
      { t: "カラーカードは自分の「カラーライン」に並べます。並べ方の細かい手順はルールシートで確認してください（公式の文章は未公開）。" },
    ],
  },
  {
    id: "turn", title: "ターンの流れ",
    items: [
      { h: "① スタート", t: "手札を補充し、ヨコになっている自分のライバーをタテに戻します。先攻の1ターン目は行いません。" },
      { h: "② メイン", t: "手札のライバーを登場させたり、イベント・ステージを使ったりして場を作ります。" },
      { h: "③ アクション", t: "ライバーで相手のライバーにアタックするか、カラーコールをします。先攻の1ターン目は行えません。" },
      { h: "④ セット", t: "手札から1枚まで、カードをセットエリアに置けます。" },
      { h: "⑤ エンド", t: "相手のターンになります。" },
    ],
  },
  {
    id: "call", title: "カラーコール",
    items: [
      { t: "相手のカラーラインにあるカラーカードを1枚選んで表にします。" },
      { t: "表になった色を、コールしたライバーが持っていれば（カード下部の7枠で色が付いている色）、そのカラーカードを獲得して自分の「にじエリア」に置きます。" },
      { t: "持っていない色なら、カラーカードは表のまま相手のカラーラインに残ります。" },
      { t: "カラーカードが表になると、相手のチャンネルカードの「トリガー」が発動することがあります。どの色を狙うかが駆け引きになります。" },
    ],
  },
  {
    id: "battle", title: "アタックとバトル",
    items: [
      { t: "アタックすると、相手のライバーとバトルします。勝ち負けの細かい判定方法は公式の文章が未公開のため、遊び方動画やルールシートで確認してください。" },
      { t: "「バトル勝利時」と書かれた効果は、そのライバーがバトルに勝った時に使えます。" },
    ],
  },
  {
    id: "sp", title: "SPコール",
    items: [
      { t: "カードの効果で行うカラーコールです。相手のカラーラインのカラーカード1枚を表にし、SPコールしたライバーの色と比べます（同じ色ならにじエリアへ、違う色なら表のまま残る）。" },
      { t: "通常のカラーコールと違い、ブロッカーなどで止められません。" },
    ],
    image: { url: "https://pbs.twimg.com/media/HUuI1f8bAAAY3ZF?format=jpg&name=large", post: "2111019603069698342", caption: "公式のルール補足（SPコール）" },
  },
  {
    id: "limit", title: "限定（デッキ構築の条件）",
    items: [
      { h: "限定:同じ#", t: "そのカードの#タグのどれか1つを、チャンネルカードも持っている場合だけデッキに入れられます。" },
      { h: "#タグ・カード名指定", t: "「限定:#学園」のように指定がある場合は、チャンネルカードがその#タグを持つ（またはその名前の）場合だけ入れられます。" },
    ],
    image: { url: "https://pbs.twimg.com/media/HUoxNQBbEAA5rnr?format=jpg&name=large", post: "2110642104284385531", caption: "公式のルール補足（限定）" },
  },
  {
    id: "words", title: "そのほかの用語",
    items: [
      { h: "Lv", t: "カード左上の数字。効果の「Lv2以下のライバー」などはこの数字を指します。" },
      { h: "パワー", t: "ライバー左下の数字。バトルの強さに関わります。" },
      { h: "カラー", t: "ライバー下部の7枠。色が付いている色を、そのライバーが「持っている」ことになります。" },
      { h: "属性アイコン", t: "カード右上のアイコン。公開済みは太陽（ソル）・月（ルナ）・彗星（コメット）・星（ステラ）。" },
      { h: "#タグ", t: "カード右下の「#JK」などの印。限定の条件や効果の対象になります。" },
      { h: "タテ／ヨコ", t: "カードの向き。アタックなどで使うとヨコになり、スタートフェイズでタテに戻ります。" },
      { h: "ログ", t: "カードが置かれる場所（いわゆる捨て札置き場）。効果で「ログに置く」カードや、ログから登場させる効果があります。" },
      { h: "にじエリア", t: "獲得したカラーカードを置く場所。ここに7色そろえるのが目標です。" },
      { h: "ブロッカー", t: "相手が攻撃かカラーコールをした時、このカードをヨコにして中止させ、このカードとバトルします。" },
      { h: "登場時", t: "そのライバーやカードを場に出した時に使える効果。" },
      { h: "起動メイン", t: "自分のメインフェイズに使える効果。「ターン1回」はそのターンに1度だけ。" },
      { h: "トリガー", t: "決まったタイミング（例：相手のターン中にカラーカードが表になった時）に自動で発動する効果。色の指定がある場合は、その色が表になった時。" },
      { h: "IRIS ONE（アイリスワン）", t: "デッキに1枚しか入れられない特別なカード。ブースター COLORS IGNITION から登場予定。" },
    ],
  },
  {
    id: "deck", title: "デッキ構築のきまり（このアプリでのチェック）",
    items: [
      { t: "チャンネルカード1枚＋デッキ50枚。" },
      { t: "同じカードは4枚まで（公式未発表。スターターデッキの構成からの目安としてチェックしています）。" },
      { t: "限定カードはチャンネルカードとの条件を満たすこと。IRIS ONEは1枚まで。" },
    ],
  },
];

export function RulesScreen({ pal, updatedAt }: { pal: Palette; updatedAt: string }) {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const [zoom, setZoom] = useState<string | null>(null);
  const [open, setOpen] = useState<Record<string, boolean>>({ goal: true, turn: true, call: true });

  return (
    <>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 10, paddingBottom: 28 }}>
        <View style={{ backgroundColor: pal.accentSoft, borderRadius: 14, padding: 14, gap: 4 }}>
          <Title pal={pal} size={17}>にじななのルール</Title>
          <Text style={{ color: pal.fg, fontSize: 13, lineHeight: 20 }}>
            公式の情報をもとに、わかりやすくまとめたものです。公式ルールブックの文章はまだ公開されていないため、細かい処理はスターターデッキのルールシートと公式の遊び方動画で確認してください。
          </Text>
        </View>

        {SECTIONS.map((sec) => {
          const isOpen = !!open[sec.id];
          return (
            <View key={sec.id} style={{ backgroundColor: pal.surface, borderWidth: 1, borderColor: pal.line, borderRadius: 14, overflow: "hidden" }}>
              <Pressable onPress={() => setOpen({ ...open, [sec.id]: !isOpen })} accessibilityRole="button" accessibilityState={{ expanded: isOpen }}
                style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 14, minHeight: 52 }}>
                <Title pal={pal} size={16}>{sec.title}</Title>
                <Text style={{ color: pal.accent, fontSize: 18, fontWeight: "700" }}>{isOpen ? "−" : "+"}</Text>
              </Pressable>
              {isOpen ? (
                <View style={{ paddingHorizontal: 14, paddingBottom: 14, gap: 10 }}>
                  {sec.id === "goal" ? (
                    <View style={[s.row, { gap: 4 }]}>
                      {COL7.map((c) => (
                        <View key={c} style={{ backgroundColor: COLOR[c], borderRadius: 6, paddingHorizontal: 9, paddingVertical: 3 }}>
                          <Text style={{ color: "#fff", fontWeight: "700" }}>{c} {COL_NAME[c]}</Text>
                        </View>
                      ))}
                    </View>
                  ) : null}
                  {sec.items.map((it, i) => (
                    <View key={i} style={{ gap: 2 }}>
                      {it.h ? <Text style={{ color: pal.accent, fontWeight: "700", fontSize: 14 }}>{it.h}</Text> : null}
                      <Text style={{ color: pal.fg, fontSize: 14, lineHeight: 22 }}>{it.t}</Text>
                    </View>
                  ))}
                  {sec.image ? (
                    <Pressable onPress={() => setZoom(sec.image!.url)} accessibilityRole="imagebutton" accessibilityLabel={`${sec.image.caption}を拡大`} style={{ gap: 4 }}>
                      <Image source={{ uri: sec.image.url }} style={{ width: "100%", aspectRatio: 16 / 9, borderRadius: 10, backgroundColor: pal.chip }} contentFit="contain" cachePolicy="memory-disk" transition={150} />
                      <Text style={{ color: pal.muted, fontSize: 11 }}>{sec.image.caption}（タップで拡大）©ANYCOLOR, Inc.</Text>
                    </Pressable>
                  ) : null}
                </View>
              ) : null}
            </View>
          );
        })}

        <Text style={{ color: pal.muted, fontSize: 12, lineHeight: 19, marginTop: 4 }}>
          このアプリは公開情報をまとめた非公式・個人用ツールです。カード画像の権利は ©ANYCOLOR, Inc. ©TOMY に帰属します。データ更新：{updatedAt ? new Date(updatedAt).toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" }) : "—"}
        </Text>
        <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
          <Btn label="遊び方動画（公式X）" pal={pal} onPress={() => Linking.openURL(XPOST("2110327925497291256"))} />
          <Btn label="公式X" pal={pal} onPress={() => Linking.openURL(X_ACCOUNT)} />
          <Btn label="公式HP" pal={pal} onPress={() => Linking.openURL(OFFICIAL_SITE)} />
        </View>
      </ScrollView>

      <Modal visible={!!zoom} transparent animationType="fade" onRequestClose={() => setZoom(null)}>
        <Pressable style={{ flex: 1, backgroundColor: "rgba(20,24,48,0.94)", alignItems: "center", justifyContent: "center" }} onPress={() => setZoom(null)} accessibilityLabel="閉じる">
          <ScrollView horizontal maximumZoomScale={4} minimumZoomScale={1} centerContent contentContainerStyle={{ alignItems: "center", justifyContent: "center" }}>
            {zoom ? <Image source={{ uri: zoom }} style={{ width: Math.max(width, height) * 0.98, height: (Math.max(width, height) * 0.98 * 9) / 16 }} contentFit="contain" /> : null}
          </ScrollView>
          <Text style={{ color: "#fff", position: "absolute", bottom: insets.bottom + 20, fontSize: 13 }}>横にスクロールして読めます・タップで閉じる</Text>
        </Pressable>
      </Modal>
    </>
  );
}
