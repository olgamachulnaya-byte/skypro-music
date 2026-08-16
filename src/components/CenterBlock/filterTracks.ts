import type { Track } from "@/data";

export type DateSort = "default" | "newest" | "oldest";

export interface TrackFilters {
  author: string | null;
  genre: string | null;
  dateSort: DateSort;
}

export const DEFAULT_TRACK_FILTERS: TrackFilters = {
  author: null,
  genre: null,
  dateSort: "default",
};

export function getUniqueOptions(values: readonly string[]): string[] {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))].sort(
    (first, second) => first.localeCompare(second, "ru"),
  );
}

export function matchesTrackName(trackName: string, query: string): boolean {
  const normalizedQuery = query.trim().toLocaleLowerCase("ru");
  return (
    normalizedQuery.length === 0 ||
    trackName.trim().toLocaleLowerCase("ru").startsWith(normalizedQuery)
  );
}

export function sortTracksByDate(
  tracks: readonly Track[],
  dateSort: DateSort,
): Track[] {
  if (dateSort === "default") return [...tracks];

  const direction = dateSort === "newest" ? -1 : 1;
  return [...tracks].sort((first, second) => {
    const firstDate = Date.parse(first.release_date);
    const secondDate = Date.parse(second.release_date);
    const safeFirstDate = Number.isNaN(firstDate) ? 0 : firstDate;
    const safeSecondDate = Number.isNaN(secondDate) ? 0 : secondDate;
    return (safeFirstDate - safeSecondDate) * direction;
  });
}

export function filterTracks(
  tracks: readonly Track[],
  query: string,
  filters: TrackFilters,
): Track[] {
  const filteredTracks = tracks.filter(
    (track) =>
      matchesTrackName(track.name, query) &&
      (!filters.author || track.author === filters.author) &&
      (!filters.genre || track.genre.includes(filters.genre)),
  );

  return sortTracksByDate(filteredTracks, filters.dateSort);
}

export function countActiveFilters(filters: TrackFilters): number {
  return [filters.author, filters.genre, filters.dateSort !== "default"].filter(
    Boolean,
  ).length;
}