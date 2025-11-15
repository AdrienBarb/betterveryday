import { PostHog } from "posthog-node";

export const postHogClient = new PostHog(
  process.env.NEXT_PUBLIC_POSTHOG_KEY as string,
  {
    host: process.env.NEXT_PUBLIC_POSTHOG_HOST as string,
    flushAt: 1,
    flushInterval: 0,
  }
);

await postHogClient.shutdown();