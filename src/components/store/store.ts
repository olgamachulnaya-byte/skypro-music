"use client";

import { createContext, useContext } from "react";
import type { Dispatch } from "react";
import type { PlayerAction, PlayerState } from "./features/playerSlice";

export interface RootState {
  player: PlayerState;
}

export const PlayerStoreContext = createContext<{
  state: RootState;
  dispatch: Dispatch<PlayerAction>;
} | null>(null);

function usePlayerStore() {
  const store = useContext(PlayerStoreContext);

  if (!store) {
    throw new Error("Player store hooks must be used inside ReduxProvider");
  }

  return store;
}

export function useAppDispatch() {
  return usePlayerStore().dispatch;
}

export function useAppSelector<T>(selector: (state: RootState) => T): T {
  return selector(usePlayerStore().state);
}