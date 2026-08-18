require("./register.cjs");

const test = require("node:test");
const assert = require("node:assert/strict");
const { ApiError, getTracks } = require("../src/lib/api.ts");

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