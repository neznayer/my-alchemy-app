import * as Cloudflare from "alchemy/Cloudflare";
import { Layer } from "effect";
import * as Effect from "effect/Effect";
import { HttpServerRequest } from "effect/http/HttpServerRequest";
import * as HttpServerResponse from "effect/http/HttpServerResponse";

import { Bucket } from "./bucket";

export default Cloudflare.Worker(
  "Worker",
  {
    main: import.meta.url,
    dev: {
      port: 3000,
    },
    compatibility: {
      date: "2026-08-25",
    },
  },
  Effect.gen(function* () {
    const bucket = yield* Cloudflare.R2.ReadWriteBucket(Bucket);

    return {
      fetch: Effect.gen(function* () {
        const request = yield* HttpServerRequest;
        const key = request.url.split("/").pop()!;

        if (request.method === "PUT") {
          yield* bucket.put(key, request.stream, {
            contentLength: Number(request.headers["content-length"] ?? 0),
          });
          return HttpServerResponse.empty({ status: 201 });
        }

        const object = yield* bucket.get(key).pipe(Effect.withSpan("load.key"));

        if (object === null) {
          return HttpServerResponse.text("Not found", { status: 404 });
        }

        const text = yield* object.text();

        return HttpServerResponse.text(text);
      }).pipe(
        Effect.catchTag("R2Error", (error) =>
          Effect.succeed(HttpServerResponse.text(error.message, { status: 500 })),
        ),
      ),
    };
  }).pipe(
    Effect.provide(Layer.mergeAll(Cloudflare.R2.ReadWriteBucketBinding, Cloudflare.Telemetry())),
  ),
);
