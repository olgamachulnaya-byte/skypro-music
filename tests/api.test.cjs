require("./register.cjs");

const test = require("node:test");
const assert = require("node:assert/strict");
const { ApiError, getTracks } = require("../src/lib/api.ts");
const { tracksData } = require("../src/data.ts");

test("getTracks exposes catalog API errors instead of hiding them", async () => {
  const originalFetch = global.fetch;
  global.fetch = async () =>
    new Response(JSON.stringify({ detail: "Каталог временно недоступен" }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    });

  try {
    await assert.rejects(
      getTracks(),
      (error) =>
        error instanceof ApiError &&
        error.status === 503 &&
        error.message === "Каталог временно недоступен",
    );
  } finally {
    global.fetch = originalFetch;
  }
});

test("getTracks falls back to bundled tracks for an incompatible catalog response", async () => {
  const originalFetch = global.fetch;
  global.fetch = async () =>
    new Response(JSON.stringify([{ id: 1, title: "Old API track" }]), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  try {
    const tracks = await getTracks();

    assert.deepEqual(tracks, tracksData);
    assert.notEqual(tracks, tracksData);
    assert.notEqual(tracks[0].genre, tracksData[0].genre);
  } finally {
    global.fetch = originalFetch;
  }
});