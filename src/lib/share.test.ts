import { afterEach, describe, expect, it, vi } from "vitest";
import { buildShare, shareText } from "./share";

describe("buildShare", () => {
  it("puts game, day and result on one first line", () => {
    const out = buildShare({ game: "Hunch", dayNumber: 12, result: "4 tries", lines: ["a", "b"] });
    const [first, ...rest] = out.split("\n");
    expect(first).toBe("Hunch #12 · 4 tries");
    expect(rest.slice(0, 2)).toEqual(["a", "b"]);
    expect(rest[2]).toBe("");
  });
});

describe("shareText", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("returns cancelled when the share sheet is dismissed", async () => {
    vi.stubGlobal("navigator", {
      share: () => Promise.reject(new DOMException("x", "AbortError")),
    });
    expect(await shareText("hi")).toBe("cancelled");
  });
});
