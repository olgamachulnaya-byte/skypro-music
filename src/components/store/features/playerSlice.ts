import type { Track } from "../../../data";

export interface PlayerState {
  currentTrack: Track | null;
  isPlaying: boolean;
}

export const initialPlayerState: PlayerState = {
  currentTrack: null,
  isPlaying: false,
};

export type PlayerAction =
  | { type: "player/setCurrentTrack"; payload: Track }
  | { type: "player/setIsPlaying"; payload: boolean };

export const setCurrentTrack = (track: Track): PlayerAction => ({
  type: "player/setCurrentTrack",
  payload: track,
});

export const setIsPlaying = (isPlaying: boolean): PlayerAction => ({
  type: "player/setIsPlaying",
  payload: isPlaying,
});

export function playerReducer(
  state: PlayerState,
  action: PlayerAction,
): PlayerState {
  switch (action.type) {
    case "player/setCurrentTrack":
      return { ...state, currentTrack: action.payload };
    case "player/setIsPlaying":
      return { ...state, isPlaying: action.payload };
  }
}