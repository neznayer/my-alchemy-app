import * as Alchemy from "alchemy";
import * as Cloudflare from "alchemy/Cloudflare";
import * as GitHub from "alchemy/GitHub";
import * as Output from "alchemy/Output";
import { Layer } from "effect";
import * as Effect from "effect/Effect";

import { Bucket } from "./src/bucket";
import Worker from "./src/worker";

export default Alchemy.Stack(
  "MyApp",
  {
    providers: Layer.mergeAll(Cloudflare.providers(), GitHub.providers()),
    state: Cloudflare.state(),
  },
  Effect.gen(function* () {
    const bucket = yield* Bucket;

    const worker = yield* Worker;

    if (process.env.PULL_REQUEST) {
      yield* GitHub.Comment("preview-comment", {
        owner: "neznayer",
        repository: "my-alchemy-app",
        issueNumber: Number(process.env.PULL_REQUEST),
        body: Output.interpolate`
              ## Preview Deployed

              **URL:** ${worker.url}

              Built from commit ${process.env.GITHUB_SHA?.slice(0, 7)}

              ---
              _This comment updates automatically with each push._
            `,
      });
    }

    return {
      bucketName: bucket.bucketName,
      url: worker.url,
    };
  }),
);
