export type CardType = "チャンネル" | "ライバー" | "イベント" | "ステージ";
export type Attr = "sol" | "luna" | "comet" | "stella" | "unk";
export type Col = "R" | "O" | "Y" | "G" | "B" | "I" | "V";

export type Card = {
  id: string;
  p: string; // 商品ID (SD01, BP01 ...)
  no: string; // カード番号。未発表なら ""
  rar: string;
  type: CardType;
  name: string;
  liver: string;
  attr: Attr;
  lv: number | null;
  pow: number | null;
  cols: Col[];
  tags: string[];
  key: string;
  fx: string; // 効果の要約
  parallel: string;
  x: string; // 公式Xの紹介ポストID
  img: string; // 公式Xに投稿された画像のURL
  sort: number;
  addedAt?: string;
};

export type CardData = {
  updatedAt: string;
  lastPostId?: string;
  cards: Card[];
};
