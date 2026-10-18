const OFFICIAL = "https://www.takaratomy.co.jp/products/nijisanji-7colors/";
export const XPOST = (id: string) => `https://x.com/NIJISANJI7CCG/status/${id}`;
export const X_ACCOUNT = "https://x.com/NIJISANJI7CCG";
export const OFFICIAL_SITE = OFFICIAL;

export type Product = {
  id: string;
  code: string;
  kind: string;
  name: string;
  price: string;
  url: string;
  livers: string[];
};

export const PRODUCTS: Product[] = [
  { id: "SD01", code: "NJ-SD01", kind: "スターターデッキ", name: "月ノ美兎", price: "1,650円（税込）", url: OFFICIAL + "products/26100702/", livers: ["月ノ美兎", "静凛", "樋口楓"] },
  { id: "SD02", code: "NJ-SD02", kind: "スターターデッキ", name: "葛葉", price: "1,650円（税込）", url: OFFICIAL + "products/26100702/", livers: ["葛葉", "イブラヒム", "エクス・アルビオ"] },
  { id: "SD03", code: "NJ-SD03", kind: "スターターデッキ", name: "笹木咲", price: "1,650円（税込）", url: OFFICIAL + "products/26100702/", livers: ["笹木咲", "本間ひまわり", "魔界ノりりむ"] },
  { id: "SD04", code: "NJ-SD04", kind: "スターターデッキ", name: "加賀美ハヤト", price: "1,650円（税込）", url: OFFICIAL + "products/26100702/", livers: ["加賀美ハヤト", "葉加瀬冬雪", "夜見れな"] },
  {
    id: "BP01", code: "NJ-BP01", kind: "ブースターパック", name: "COLORS IGNITION 虹の幕開け",
    price: "1パック9枚 440円／1BOX12パック 5,280円（税込）", url: OFFICIAL + "products/26100701/",
    livers: ["アルス・アルマル", "イブラヒム", "シェリン・バーガンディ", "でびでび・でびる", "リゼ・ヘルエスタ", "レイン・パターソン", "レン ゾット", "卯月コウ", "加賀美ハヤト", "家長むぎ", "花籠つばさ", "葛葉", "月ノ美兎", "剣持刀也", "皇れお", "笹木咲", "獅子堂あかり", "篠宮ゆの", "社築", "城瀬いすみ", "石神のぞみ", "赤羽葉子", "倉持めると", "早瀬走", "鷹宮リオン", "椎名唯華", "舞元啓介", "伏見ガク", "魔界ノりりむ", "魔使マオ", "夜見れな", "夕陽リリ", "葉加瀬冬雪", "葉山舞鈴"],
  },
];
export const productById = Object.fromEntries(PRODUCTS.map((p) => [p.id, p])) as Record<string, Product>;

export type Rule = { title: string; body: string; link?: { label: string; url: string }; showColors?: boolean };
export const RULES: Rule[] = [
  { title: "カラー（R O Y G B I V）", body: "ライバーカード下部の7色の枠。点灯している色が、そのライバーが持つ色です。", showColors: true },
  { title: "属性アイコン", body: "カード右上のアイコン。公開済みは太陽（ソル）・月（ルナ）・彗星（コメット）・星（ステラ）の4種。SD月ノ美兎は太陽、SD葛葉は月です。" },
  { title: "Lv", body: "カード左上の数字。効果の「Lv2以下のライバー」などはこの数字を指します。" },
  { title: "SPコール", body: "効果で行うカラーコール。相手のカラーラインのカラーカード1枚を表にし、SPコールしたライバーが持つ色ならにじエリアへ、持たない色なら表のままカラーラインに残ります。ブロッカーなどで中止されません。", link: { label: "公式Xのルール補足", url: XPOST("2111019603069698342") } },
  { title: "限定", body: "デッキ構築の条件。「限定:同じ#」は、チャンネルカードがそのカードの#タグのどれかを持つ場合だけデッキに入れられます。#タグやカード名を指定する限定もあります。", link: { label: "公式Xのルール補足", url: XPOST("2110642104284385531") } },
  { title: "ブロッカー", body: "相手が攻撃かカラーコールをした時、このカードをヨコにして中止させ、このカードとバトルします。" },
  { title: "IRIS ONE（アイリスワン）", body: "デッキに1枚しか入れられない特別なカード。ブースター COLORS IGNITION に登場予定。" },
  { title: "遊び方", body: "基本は「7色のカードを揃えて虹を架ける」。公式の遊び方動画で詳しく解説されています。", link: { label: "遊び方動画の告知ポスト", url: XPOST("2110327925497291256") } },
];
