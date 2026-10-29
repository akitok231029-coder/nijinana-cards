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
 * 出典：公式の遊び方動画（YouTube SIRdMpMDPBI）、公式X（@NIJISANJI7CCG）のルール補足、公式HP。
 * 未確定の部分は「未発表」と明記する。
 */
const SECTIONS: Section[] = [
  {
    id: "goal", title: "ゲームの目的",
    items: [
      { t: "相手の「虹エリア」に、赤・橙・黄・緑・青・藍・紫の7色のカラーカードをそろえたプレイヤーが勝ちです。" },
      { t: "ライバーで相手のカラーカードを表にしていき（カラーコール）、自分の色を相手の世界に響かせていくゲームです。" },
    ],
  },
  {
    id: "cards", title: "カードの種類（5種類）",
    items: [
      { h: "チャンネルカード", t: "あなたの世界の起点。ゲーム中ずっと場にあり、効果を持ちます。" },
      { h: "ライバーカード", t: "ゲームの主役。アタックやカラーコールをして、相手の世界に色を響かせます。" },
      { h: "イベントカード", t: "使い切りで強力な効果を発揮します。" },
      { h: "ステージカード", t: "ライバーたちの力を引き出す、場に残るカード。" },
      { h: "カラーカード", t: "7色1枚ずつ。勝敗を左右するカードです。" },
      { h: "クラス", t: "チャンネル・ライバー・イベント・ステージには、ソル（太陽）・ルナ（月）・コメット（彗星）・ステラ（星）の4つのクラスがあります。カード右上のアイコンで見分けます。" },
    ],
  },
  {
    id: "items", title: "用意するもの",
    items: [
      { h: "カラーカード", t: "7色1枚ずつ。" },
      { h: "チャンネルカード", t: "1枚。" },
      { h: "デッキ", t: "チャンネルカードと同じクラスのカードで組んだ50枚。" },
    ],
  },
  {
    id: "setup", title: "ゲームの準備",
    items: [
      { h: "① カードを置く", t: "チャンネルカードを表向きに置きます。デッキとカラーカードはそれぞれシャッフルし、裏向きでそれぞれの場所に置きます（カラーカードを並べた列が「カラーライン」）。" },
      { h: "② 先攻・後攻", t: "じゃんけんなどで勝った方が、先攻か後攻を選びます。" },
      { h: "③ 手札を引く", t: "先攻はデッキの上から5枚、後攻は7枚を引いて手札にします。" },
      { h: "④ 引き直し", t: "先攻→後攻の順に、1回だけ引き直しができます。引き直すときは手札をすべてデッキに戻してシャッフルし、同じ枚数を引きます。" },
    ],
  },
  {
    id: "turn", title: "ターンの流れ",
    items: [
      { h: "① スタートフェイズ", t: "手札が5枚になるまでカードを引きます（すでに5枚以上あるときは1枚引けます）。その後、ヨコになっている自分のライバーをすべてタテにします。先攻・後攻とも、自分の1ターン目は行いません。" },
      { h: "② メインフェイズ", t: "カードをプレイします（下の「カードのプレイ」）。「起動メイン」の効果もここで使えます。" },
      { h: "③ アクションフェイズ", t: "タテの自分のライバーをヨコにして、アタックかカラーコールをします。タテのライバーが残っていれば、続けて何回でも行えます。先攻の1ターン目は行えません。" },
      { h: "④ セットフェイズ", t: "手札から1枚まで、カードをセットエリアに置けます。" },
      { h: "⑤ エンドフェイズ", t: "ターンの終了を宣言し、相手のターンになります。チャンネルカードによっては、ここで使える効果があります。" },
    ],
  },
  {
    id: "play", title: "カードのプレイ（メインフェイズ）",
    items: [
      { t: "カード左上の数字がレベル（Lv）です。レベルと同じ枚数のカードを、自分の手札かフィールドからログに置くと、そのカードをプレイできます。" },
      { t: "例：Lv3のカードは、手札などから3枚をログに置いてプレイします。Lv0のカードはコストなしでプレイできます。" },
      { h: "ライバーカード", t: "フィールドに登場します。「登場時」の効果はこのとき発動します。" },
      { h: "イベントカード", t: "ログに置いて効果を発動します。" },
      { h: "ステージカード", t: "ステージエリアに出します。" },
      { h: "セットエリアのカード", t: "前のターンまでにセットエリアに置いたカードも、手札と同じようにプレイできます。" },
    ],
  },
  {
    id: "call", title: "カラーコール",
    items: [
      { t: "アクションフェイズに、タテのライバーをヨコにして行います。" },
      { h: "① カードを選ぶ", t: "相手のカラーラインにあるカラーカードを1枚選び、表向きにします。" },
      { h: "② 色を比べる", t: "そのカラーカードの色を、コールしたライバーが持っていれば成功です（カード下部の7枠で色が付いている色）。" },
      { h: "③ 成功・失敗", t: "成功したら、そのカラーカードをカラーラインから虹エリアに置きます。失敗したら、表向きのままカラーラインに残ります。" },
      { t: "すでに表向きのカラーカードにもカラーコールできます。色が見えていれば、その色を持つライバーで確実に成功させられます。" },
      { t: "相手のターン中にカラーカードが表になると、そのプレイヤーのチャンネルカードの「トリガー」効果が発動することがあります。" },
    ],
  },
  {
    id: "battle", title: "アタックとバトル",
    items: [
      { t: "アクションフェイズに、タテの自分のライバーをヨコにして、相手のヨコになっているライバーにアタックできます（タテのライバーにはアタックできません）。" },
      { t: "アタックしたライバーとアタックされたライバーでバトルし、パワーが低い方のライバーをログに置きます。" },
      { t: "バトルに勝つと「バトル勝利時」の効果が発動します。" },
      { h: "ブロッカー", t: "相手がアタックかカラーコールをしたとき、ブロッカーを持つライバーをヨコにして割り込み、そのライバーとバトルさせられます。" },
    ],
  },
  {
    id: "sp", title: "SPコール",
    items: [
      { t: "カードの効果によって行うカラーコールです。手順はカラーコールと同じで、相手のカラーカードを1枚表向きにし、SPコールしたライバーの色と比べます。" },
      { t: "通常のカラーコールと違い、ブロッカーなどで止められません。" },
    ],
    image: { url: "https://pbs.twimg.com/media/HUuI1f8bAAAY3ZF?format=jpg&name=large", post: "2111019603069698342", caption: "公式のルール補足（SPコール）" },
  },
  {
    id: "effects", title: "効果のタイミング",
    items: [
      { h: "登場時", t: "そのカードがフィールドに登場したときに発動します。" },
      { h: "起動メイン", t: "自分のメインフェイズ中に、自分で使うタイミングを選んで発動します。「ターン1回」はそのターンに1度だけ。" },
      { h: "バトル勝利時", t: "そのライバーがバトルに勝ったときに発動します。" },
      { h: "カラーコール成功時", t: "カラーコールが成功したときに発動します。" },
      { h: "トリガー", t: "相手のターン中に、指定の色の自分のカラーカードが表になったときに発動します（チャンネルカードに多い効果）。" },
    ],
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
    id: "words", title: "場所と用語",
    items: [
      { h: "フィールド", t: "登場したライバーを置く場所。" },
      { h: "ステージエリア", t: "ステージカードを置く場所。" },
      { h: "セットエリア", t: "セットフェイズに手札から置いたカードの場所。次のターン以降のメインフェイズにプレイできます。" },
      { h: "カラーライン", t: "自分のカラーカード7枚を裏向きに並べた列。相手はここからカラーコールします。" },
      { h: "虹エリア", t: "カラーコールに成功したカラーカードが置かれる場所。ここに7色そろうと決着です。" },
      { h: "ログ", t: "プレイのコストに使ったカード、使ったイベント、バトルに負けたライバーなどが置かれる場所。効果でログからカードを登場させることもあります。" },
      { h: "タテ／ヨコ", t: "カードの向き。アタックやカラーコールをするとヨコになり、スタートフェイズでタテに戻ります。アタックできるのは相手のヨコのライバーだけです。" },
      { h: "パワー", t: "ライバー左下の数字。バトルではパワーが高い方が勝ちます。" },
      { h: "#タグ", t: "カード右下の「#JK」などの印。限定の条件や効果の対象になります。" },
      { h: "IRIS ONE（アイリスワン）", t: "デッキに1枚しか入れられない特別なカード。ブースター COLORS IGNITION から登場予定。" },
    ],
  },
  {
    id: "deck", title: "デッキ構築のきまり（このアプリでのチェック）",
    items: [
      { t: "チャンネルカード1枚＋デッキ50枚。デッキはチャンネルカードと同じクラスのカードだけで組みます。" },
      { t: "限定カードはチャンネルカードとの条件を満たすこと。IRIS ONEは1枚まで。" },
      { t: "同じカードの上限枚数は、動画では説明されていません。このアプリでは4枚を目安として注意を出しています。" },
    ],
  },
];

export function RulesScreen({ pal, updatedAt }: { pal: Palette; updatedAt: string }) {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const [zoom, setZoom] = useState<string | null>(null);
  const [open, setOpen] = useState<Record<string, boolean>>({ goal: true, turn: true, play: true, call: true });

  return (
    <>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 10, paddingBottom: 28 }}>
        <View style={{ backgroundColor: pal.accentSoft, borderRadius: 14, padding: 14, gap: 4 }}>
          <Title pal={pal} size={17}>にじななのルール</Title>
          <Text style={{ color: pal.fg, fontSize: 13, lineHeight: 20 }}>
            公式の遊び方動画（2026年10月28日公開）の説明をもとに、わかりやすくまとめたものです。同点のバトルなど動画で説明されていない細かい処理は、スターターデッキのルールシートで確認してください。
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
          <Btn label="公式の遊び方動画" pal={pal} onPress={() => Linking.openURL("https://www.youtube.com/watch?v=SIRdMpMDPBI")} />
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
