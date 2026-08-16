require("./register.cjs");

const test = require("node:test");
const assert = require("node:assert/strict");
const {
  countActiveFilters,
  filterTracks,
  getUniqueOptions,
  matchesTrackName,
  sortTracksByDate,
} = require("../src/components/CenterBlock/filterTracks.ts");

const track = (id, name, author, date, genre) => ({
  _id: id,
  name,
  author,
  release_date: date,
  genre,
  duration_in_seconds: 1,
  album: "",
  logo: null,
  track_file: "",
  stared_user: [],
});

const tracks = [
  track(1, "Солнечный свет", "Анна", "2020-01-01", ["Поп"]),
  track(2, "Сон", "Анна", "2023-01-01", ["Рок", "Поп"]),
  track(3, "Море", "Борис", "invalid", ["Рок"]),
];

test("getUniqueOptions removes blanks and duplicates and sorts values", () => {
  assert.deepEqual(getUniqueOptions([" Рок ", "", "Поп", "Рок"]), ["Поп", "Рок"]);
});

test("matchesTrackName matches only the beginning, ignoring whitespace and case", () => {
  assert.equal(matchesTrackName(" Солнечный свет", " сол "), true);
  assert.equal(matchesTrackName("Солнечный свет", "свет"), false);
  assert.equal(matchesTrackName("Солнечный свет", "   "), true);
});

test("sortTracksByDate supports default, newest, oldest and invalid dates", () => {
  assert.deepEqual(sortTracksByDate(tracks, "default").map((item) => item._id), [1, 2, 3]);
  assert.deepEqual(sortTracksByDate(tracks, "newest").map((item) => item._id), [2, 1, 3]);
  assert.deepEqual(sortTracksByDate(tracks, "oldest").map((item) => item._id), [3, 1, 2]);
  assert.notEqual(sortTracksByDate(tracks, "default"), tracks);
});

test("filterTracks combines search, author, genre and sorting", () => {
  const result = filterTracks(tracks, "со", {
    author: "Анна",
    genre: "Поп",
    dateSort: "newest",
  });
  assert.deepEqual(result.map((item) => item._id), [2, 1]);
  assert.deepEqual(
    filterTracks(tracks, "нет", { author: null, genre: null, dateSort: "default" }),
    [],
  );
  assert.deepEqual(
    filterTracks(tracks, "", { author: "Борис", genre: "Поп", dateSort: "default" }),
    [],
  );
  assert.deepEqual(
    filterTracks(tracks, "", { author: "Анна", genre: "Рок", dateSort: "default" }).map(
      (item) => item._id,
    ),
    [2],
  );
});

test("countActiveFilters includes only non-default conditions", () => {
  assert.equal(countActiveFilters({ author: null, genre: null, dateSort: "default" }), 0);
  assert.equal(countActiveFilters({ author: "Анна", genre: null, dateSort: "default" }), 1);
  assert.equal(countActiveFilters({ author: null, genre: "Поп", dateSort: "default" }), 1);
  assert.equal(countActiveFilters({ author: null, genre: null, dateSort: "newest" }), 1);
  assert.equal(countActiveFilters({ author: "Анна", genre: "Поп", dateSort: "oldest" }), 3);
});