import type { Track } from "../../../data";
import { updateTrackFavoriteState } from "@/lib/favorites";

export interface PlayerState {
  currentTrack: Track | null;
  currentPlaylist: Track[];
  catalogTracks: Track[];
  isPlaying: boolean;
}

export const initialPlayerState: PlayerState = {
  currentTrack: null,
  currentPlaylist: [],
  catalogTracks: [],
  isPlaying: false,
};

export type PlayerAction =
  | { type: "player/setCurrentTrack"; payload: Track }
  | { type: "player/setCurrentPlaylist"; payload: Track[] }
  | { type: "player/setCatalogTracks"; payload: Track[] }
  | {
      type: "player/updateFavorite";
      payload: { trackId: string | number; userId: string; favorite: boolean };
    }
  | { type: "player/setIsPlaying"; payload: boolean };

export const setCurrentTrack = (track: Track): PlayerAction => ({
  type: "player/setCurrentTrack",
  payload: track,
});

export const setCurrentPlaylist = (playlist: Track[]): PlayerAction => ({
  type: "player/setCurrentPlaylist",
  payload: playlist,
});

export const setCatalogTracks = (tracks: Track[]): PlayerAction => ({
  type: "player/setCatalogTracks",
  payload: tracks,
});

export const setIsPlaying = (isPlaying: boolean): PlayerAction => ({
  type: "player/setIsPlaying",
  payload: isPlaying,
});

export const updateFavorite = (
  trackId: string | number,
  userId: string,
  favorite: boolean,
): PlayerAction => ({
  type: "player/updateFavorite",
  payload: { trackId, userId, favorite },
});

export function playerReducer(
  state: PlayerState,
  action: PlayerAction,
): PlayerState {
  switch (action.type) {
    case "player/setCurrentTrack":
      return { ...state, currentTrack: action.payload };
    case "player/setCurrentPlaylist":
      return { ...state, currentPlaylist: action.payload };
   case "player/setCatalogTracks":
      return { ...state, catalogTracks: action.payload };
      case "player/updateFavorite": {
      const matchesTrack = (track: Track) =>
        String(track._id) === String(action.payload.trackId);
      const updateTrack = (track: Track) =>
        matchesTrack(track)
          ? updateTrackFavoriteState(
              track,
              action.payload.userId,
              action.payload.favorite,
            )
          : track;

      return {
        ...state,
        currentTrack:
          state.currentTrack && matchesTrack(state.currentTrack)
            ? updateTrack(state.currentTrack)
            : state.currentTrack,
        currentPlaylist: state.currentPlaylist.map(updateTrack),
        catalogTracks: state.catalogTracks.map(updateTrack),
      };
    }
    case "player/setIsPlaying":
      return { ...state, isPlaying: action.payload };
    default:
      return state;
    }
}