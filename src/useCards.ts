import { useCallback, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import bundled from "./data/cards.json";
import { DATA_URL } from "./config";
import type { Card, CardData } from "./types";

const CACHE_KEY = "nijinana.cards.v1";

function clean(d: CardData): CardData {
  const cards = (d.cards ?? [])
    .filter((c) => c && c.id && c.name)
    .map((c) => ({ ...c, cols: c.cols ?? [], tags: c.tags ?? [], img: c.img ?? "", fx: c.fx ?? "" }))
    .sort((a, b) => (a.sort ?? 9e9) - (b.sort ?? 9e9) || a.id.localeCompare(b.id));
  return { ...d, cards };
}
const newer = (a?: string, b?: string) => !!a && (!b || Date.parse(a) > Date.parse(b));

export type Status = "idle" | "loading" | "error" | "offline-only";

/** 同梱データ → 端末キャッシュ → GitHub の順に読み、新しいものを使う */
export function useCards() {
  const [data, setData] = useState<CardData>(() => clean(bundled as CardData));
  const [status, setStatus] = useState<Status>(DATA_URL ? "loading" : "offline-only");

  useEffect(() => {
    AsyncStorage.getItem(CACHE_KEY)
      .then((raw) => {
        if (!raw) return;
        const cached = clean(JSON.parse(raw));
        setData((cur) => (newer(cached.updatedAt, cur.updatedAt) ? cached : cur));
      })
      .catch(() => {});
  }, []);

  const refresh = useCallback(async () => {
    if (!DATA_URL) {
      setStatus("offline-only");
      return;
    }
    setStatus("loading");
    try {
      const res = await fetch(`${DATA_URL}?t=${Date.now()}`, { headers: { "Cache-Control": "no-cache" } });
      if (!res.ok) throw new Error(String(res.status));
      const remote = clean((await res.json()) as CardData);
      if (!remote.cards.length) throw new Error("empty");
      setData((cur) => (newer(remote.updatedAt, cur.updatedAt) || remote.cards.length !== cur.cards.length ? remote : cur));
      AsyncStorage.setItem(CACHE_KEY, JSON.stringify(remote)).catch(() => {});
      setStatus("idle");
    } catch {
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { cards: data.cards as Card[], updatedAt: data.updatedAt, status, refresh };
}
