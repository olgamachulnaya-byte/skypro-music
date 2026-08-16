/** @typedef {"default" | "newest" | "oldest"} DateSort */

/**
 * @typedef {object} TrackFilters
 * @property {string | null} author
 * @property {string | null} genre
 * @property {DateSort} dateSort
 */

/** @type {TrackFilters} */
export const DEFAULT_TRACK_FILTERS = {
  author: null,
  genre: null,
  dateSort: "default",
};

/**
 * @param {readonly string[]} values
 * @returns {string[]}
 */
export function getUniqueOptions(values) {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))].sort(
    (first, second) => first.localeCompare(second, "ru"),
  );
}

/**
 * @param {string} trackName
 * @param {string} query
 */
export function matchesTrackName(trackName, query) {
  const normalizedQuery = query.trim().toLocaleLowerCase("ru");
  return (
    normalizedQuery.length === 0 ||
    trackName.trim().toLocaleLowerCase("ru").startsWith(normalizedQuery)
  );
}

/**
 * @template {{ release_date: string }} T
 * @param {readonly T[]} tracks
 * @param {DateSort} dateSort
 * @returns {T[]}
 */
export function sortTracksByDate(tracks, dateSort) {
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

/**
 * @template {{ name: string, author: string, genre: string[], release_date: string }} T
 * @param {readonly T[]} tracks
 * @param {string} query
 * @param {TrackFilters} filters
 * @returns {T[]}
 */
export function filterTracks(tracks, query, filters) {
  const filteredTracks = tracks.filter(
    (track) =>
      matchesTrackName(track.name, query) &&
      (!filters.author || track.author === filters.author) &&
      (!filters.genre || track.genre.includes(filters.genre)),
  );

  return sortTracksByDate(filteredTracks, filters.dateSort);
}

/** @param {TrackFilters} filters */
export function countActiveFilters(filters) {
  return (
    Number(Boolean(filters.author)) +
    Number(Boolean(filters.genre)) +
    Number(filters.dateSort !== "default")
  );
}