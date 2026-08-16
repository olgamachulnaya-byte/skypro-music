import type { Track } from "@/data";

export type DateSort = "default" | "newest" | "oldest";

export interface TrackFilters {
  author: string | null;
  genre: string | null;
  dateSort: DateSort;
}

export const DEFAULT_TRACK_FILTERS: TrackFilters;
export function getUniqueOptions(values: readonly string[]): string[];
export function matchesTrackName(trackName: string, query: string): boolean;
export function sortTracksByDate(
  tracks: readonly Track[],
  dateSort: DateSort,
): Track[];
export function filterTracks(
  tracks: readonly Track[],
  query: string,
  filters: TrackFilters,
): Track[];
export function countActiveFilters(filters: TrackFilters): number;