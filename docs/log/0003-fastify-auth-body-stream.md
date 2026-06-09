---
type: log
status: current
updated: 2026-06-09
summary: toNodeHandler consumes the body stream before Better Auth can read it in Fastify — fix is auth.handler (Fetch API).
tags: [log, auth, fastify]
---

# 0003 — Fastify body stream consumed before auth handler

## Symptom

Sign-in returns `400 VALIDATION_ERROR: [body] Invalid input: expected object,
received undefined`. Correct credentials, correct endpoint, body present in the
browser request.

## Cause

Fastify's built-in JSON body parser runs as part of the request lifecycle and
reads the `request.raw` stream into `request.body` before the route handler is
called. When we pass `request.raw` to `toNodeHandler(auth)`, the stream is
already consumed — Better Auth sees an empty body.

## Fix

Replace `toNodeHandler` with `auth.handler` (Fetch API variant). Build a `Request`
object from the body Fastify has already parsed (`request.body`) and the headers
via `fromNodeHeaders`. `auth.handler` processes a standard Fetch `Request`, so no
stream conflict:

```ts
// apps/api/src/server.ts
app.route({
  method: ["GET", "POST"],
  url: "/auth/*",
  async handler(request, reply) {
    const url = new URL(request.url, `http://${request.headers.host}`);
    const req = new Request(url.toString(), {
      method: request.method,
      headers: fromNodeHeaders(request.headers),
      ...(request.body ? { body: JSON.stringify(request.body) } : {}),
    });
    const response = await auth.handler(req);
    reply.status(response.status);
    response.headers.forEach((value, key) => reply.header(key, value));
    return reply.send(response.body ? await response.text() : null);
  },
});
```

## Where

[[walking-skeleton]] · `apps/api/src/server.ts`
