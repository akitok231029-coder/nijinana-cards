import type { Card } from "./types";

export const isNew = (c: Card) => !!c.addedAt && Date.now() - Date.parse(c.addedAt) < 3 * 864e5;
