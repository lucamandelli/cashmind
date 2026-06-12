import { describe, it, expect, vi, beforeEach } from "vitest";
import { apiFetch, extractErrorMessage } from "./api";

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

function makeResponse(ok: boolean, body: unknown, status = ok ? 200 : 400): Response {
  return {
    ok,
    status,
    json: () => Promise.resolve(body),
  } as unknown as Response;
}

beforeEach(() => {
  mockFetch.mockReset();
});

describe("extractErrorMessage", () => {
  it("returns json.error when present", async () => {
    const res = makeResponse(false, { error: "Not allowed" });
    expect(await extractErrorMessage(res, "fallback")).toBe("Not allowed");
  });

  it("returns fallback when json has no error field", async () => {
    const res = makeResponse(false, {});
    expect(await extractErrorMessage(res, "fallback")).toBe("fallback");
  });

  it("returns fallback when json parse fails", async () => {
    const res = {
      ok: false,
      json: () => Promise.reject(new SyntaxError("bad json")),
    } as unknown as Response;
    expect(await extractErrorMessage(res, "fallback")).toBe("fallback");
  });
});

describe("apiFetch", () => {
  it("includes credentials: include on every request", async () => {
    mockFetch.mockResolvedValue(makeResponse(true, {}));
    await apiFetch("/api/test");
    expect(mockFetch).toHaveBeenCalledWith(
      "/api/test",
      expect.objectContaining({ credentials: "include" }),
    );
  });

  it("does not add Content-Type when no body", async () => {
    mockFetch.mockResolvedValue(makeResponse(true, {}));
    await apiFetch("/api/test");
    const [, init] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect((init.headers as Record<string, string>)?.["Content-Type"]).toBeUndefined();
  });

  it("adds Content-Type: application/json when a body is present", async () => {
    mockFetch.mockResolvedValue(makeResponse(true, {}));
    await apiFetch("/api/test", { method: "POST", body: JSON.stringify({ x: 1 }) });
    const [, init] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect((init.headers as Record<string, string>)?.["Content-Type"]).toBe("application/json");
  });

  it("throws with server error message on non-ok response", async () => {
    mockFetch.mockResolvedValue(makeResponse(false, { error: "Forbidden" }, 403));
    await expect(apiFetch("/api/test")).rejects.toThrow("Forbidden");
  });

  it("returns the response when ok", async () => {
    const fakeRes = makeResponse(true, { data: 42 });
    mockFetch.mockResolvedValue(fakeRes);
    const res = await apiFetch("/api/test");
    expect(res).toBe(fakeRes);
  });
});
