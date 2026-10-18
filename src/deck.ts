import { useCallback, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Deck } from "./types";

const KEY = "nijinana.decks.v1";
const CURRENT = "nijinana.currentDeck.v1";


export function useDecks() {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [currentId, setCurrentId] = useState<string>("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    Promise.all([AsyncStorage.getItem(KEY), AsyncStorage.getItem(CURRENT)])
      .then(([raw, cur]) => {
        if (raw) setDecks(JSON.parse(raw));
        if (cur) setCurrentId(cur);
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  const persist = useCallback((next: Deck[]) => {
    setDecks(next);
    AsyncStorage.setItem(KEY, JSON.stringify(next)).catch(() => {});
  }, []);

  const select = useCallback((id: string) => {
    setCurrentId(id);
    AsyncStorage.setItem(CURRENT, id).catch(() => {});
  }, []);

  const upsert = useCallback(
    (d: Deck) => {
      setDecks((cur) => {
        const exists = cur.some((x) => x.id === d.id);
        const next = exists ? cur.map((x) => (x.id === d.id ? d : x)) : [d, ...cur];
        AsyncStorage.setItem(KEY, JSON.stringify(next)).catch(() => {});
        return next;
      });
    },
    [],
  );

  const remove = useCallback(
    (id: string) => {
      setDecks((cur) => {
        const next = cur.filter((x) => x.id !== id);
        AsyncStorage.setItem(KEY, JSON.stringify(next)).catch(() => {});
        return next;
      });
    },
    [],
  );

  return { decks, loaded, currentId, select, upsert, remove, persist };
}

export * from "./deckLogic";
