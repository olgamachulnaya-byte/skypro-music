require("./register.cjs");

const test = require("node:test");
const assert = require("node:assert/strict");
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");
const SearchBar = require("../src/components/CenterBlock/SearchBar/SearchBar.tsx").default;
const Filter = require("../src/components/CenterBlock/Filter/Filter.tsx").default;
const Playlist = require("../src/components/CenterBlock/Playlist/Playlist.tsx").default;
const PlaylistHeader = require("../src/components/CenterBlock/Playlist/PlaylistHeader/PlaylistHeader.tsx").default;
const TrackLoader = require("../src/components/CenterBlock/TrackLoader/TrackLoader.tsx").default;

test("SearchBar renders a controlled accessible search field", () => {
  const html = renderToStaticMarkup(React.createElement(SearchBar, { value: "сон", onChange() {} }));
  assert.match(html, /type="search"/);
  assert.match(html, /aria-label="Поиск по названию трека"/);
  assert.match(html, /value="сон"/);
});

test("SearchBar passes the entered search query to its consumer", () => {
  let query = "";
  const searchBar = SearchBar({ value: "", onChange(value) { query = value; } });
  const input = searchBar.props.children[1];

  input.props.onChange({ target: { value: "сол" } });

  assert.equal(query, "сол");
});

test("Filter builds author and genre lists from original tracks", () => {
  const tracks = [{ author: "Анна", genre: ["Поп"], release_date: "2024-01-01" }];
  const html = renderToStaticMarkup(React.createElement(Filter, {
    tracks,
    value: { author: "Анна", genre: null, dateSort: "default" },
    onChange() {},
  }));
  assert.match(html, /исполнителю/);
  assert.match(html, /году выпуска/);
  assert.match(html, /жанру/);
  assert.match(html, /<span>1<\/span>/);
  assert.match(html, /Сбросить/);
});

test("PlaylistHeader renders all playlist columns", () => {
  const html = renderToStaticMarkup(React.createElement(PlaylistHeader));
  assert.match(html, /Трек/);
  assert.match(html, /Исполнитель/);
  assert.match(html, /Альбом/);
});

test("Playlist displays the empty-search message when no tracks match", () => {
  const html = renderToStaticMarkup(React.createElement(Playlist, { tracks: [] }));

  assert.match(html, /role="status"/);
  assert.match(html, /Нет подходящих треков/);
});

test("TrackLoader renders an accessible animated playlist placeholder", () => {
  const html = renderToStaticMarkup(React.createElement(TrackLoader));

  assert.match(html, /role="status"/);
  assert.match(html, /aria-live="polite"/);
  assert.match(html, /Загрузка треков/);
  assert.match(html, /Трек/);
  assert.equal((html.match(/aria-hidden="true"/g) ?? []).length, 1);
});