"use client";

import { useMemo, useReducer } from "react";
import { initialPlayerState, playerReducer } from "./features/playerSlice";
import { PlayerStoreContext } from "./store";

export default function ReduxProvider({ children }: { children: React.ReactNode }) {
 const [player, dispatch] = useReducer(playerReducer, initialPlayerState);
  const value = useMemo(() => ({ state: { player }, dispatch }), [player]);

  return (
    <PlayerStoreContext.Provider value={value}>
      {children}
    </PlayerStoreContext.Provider>
  );
}