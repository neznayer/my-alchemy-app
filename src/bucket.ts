import * as Cloudflare from "alchemy/Cloudflare";

// forceDestroy: true - allow to delete non-empty bucket. (since this bucket is only for testing)
export const Bucket = Cloudflare.R2.Bucket("Bucket", { forceDestroy: true });
