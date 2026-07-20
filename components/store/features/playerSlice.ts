import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Track } from "../../../data"; 

interface PlayerState {
  currentTrack: Track | null;
  isPlaying: boolean;
}

const initialState: PlayerState = {
  currentTrack: null,
  isPlaying: false,
};

const playerSlice = createSlice({
  name: "player",
  initialState,
  reducers: {
    setCurrentTrack: (state, action: PayloadAction<Track>) => {
      state.currentTrack = action.payload;
    },
    setIsPlaying: (state, action: PayloadAction<boolean>) => {
      state.isPlaying = action.payload;
    },
  },
});

export const { setCurrentTrack, setIsPlaying } = playerSlice.actions;
export const playerReducer = playerSlice.reducer;