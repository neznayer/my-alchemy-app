import { expect } from "bun:test";

import * as Cloudflare from "alchemy/Cloudflare";
import * as Test from "alchemy/Test/Bun";
import * as Effect from "effect/Effect";
import * as HttpBody from "effect/http/HttpBody";
import * as HttpClient from "effect/http/HttpClient";

import Stack from "../alchemy.run.ts";

const { test, beforeAll, afterAll, deploy, destroy } = Test.make({
  providers: Cloudflare.providers(),
  state: Cloudflare.state(),
});

const stack = beforeAll(deploy(Stack));

/**
 * Locally — CI is not set, so skipIf skips the destroy. You iterate fast against the live stack.
 * On CI — set CI=true and the stack is torn down automatically after tests complete.
 */
afterAll.skipIf(!process.env.CI)(destroy(Stack));

console.log("process.env.CI", process.env.CI);
test(
  "PUT and GET round-trip an object",
  Effect.gen(function* () {
    const { url } = yield* stack;

    const put = yield* HttpClient.put(`${url}/hello.txt`, { body: HttpBody.text("Hello, world!") });

    expect(put.status).toBe(201);

    const get = yield* HttpClient.get(`${url}/hello.txt`);

    expect(yield* get.text).toBe("Hello, world!");
  }),
);

test(
  "GET missing key returns 404",
  Effect.gen(function* () {
    const { url } = yield* stack;

    const response = yield* HttpClient.get(`${url}/no-such-key.txt`);

    expect(response.status).toBe(404);
  }),
);
