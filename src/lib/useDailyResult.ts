"use client";

import { useEffect, useState } from "react";
import { dayKey } from "./daily";
import { getResult, subscribe, type GameResult } from "./storage";

/** Today's saved result for a game. Null on the server and first paint, then synced after mount. */
export function useDailyResult(gameId: string): GameResult | null {
  const [result, setResult] = useState<GameResult | null>(null);

  useEffect(() => {
    const sync = () => setResult(getResult(gameId, dayKey()));
    sync();
    return subscribe(sync);
  }, [gameId]);

  return result;
}
