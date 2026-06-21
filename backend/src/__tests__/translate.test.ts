import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../index";

// Mock the fetch call to avoid real API calls in tests
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

describe("POST /api/translate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 400 when text is missing", async () => {
    const res = await request(app)
      .post("/api/translate")
      .send({ targetLanguage: "fr" });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Validation failed");
  });

  it("returns 400 when targetLanguage is unsupported", async () => {
    const res = await request(app)
      .post("/api/translate")
      .send({ text: "Hello", targetLanguage: "klingon" });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Validation failed");
  });

  it("returns 400 when text exceeds 5000 characters", async () => {
    const res = await request(app)
      .post("/api/translate")
      .send({ text: "a".repeat(5001), targetLanguage: "fr" });

    expect(res.status).toBe(400);
  });

  it("translates text successfully", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [[["Bonjour le monde", "Hello world"]], null, "en"],
    });

    const res = await request(app)
      .post("/api/translate")
      .send({ text: "Hello world", targetLanguage: "fr" });

    expect(res.status).toBe(200);
    expect(res.body.translation).toBe("Bonjour le monde");
    expect(res.body.detectedLanguage).toBe("en");
    expect(res.body.original).toBe("Hello world");
  });

  it("returns 502 when translation service fails", async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 503 });

    const res = await request(app)
      .post("/api/translate")
      .send({ text: "Hello", targetLanguage: "fr" });

    expect(res.status).toBe(502);
    expect(res.body.error).toBe("Translation service unavailable");
  });

  it("health endpoint returns ok", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
  });
});
