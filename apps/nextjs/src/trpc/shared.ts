import {
  httpBatchLink,
  type HTTPBatchLinkOptions,
  type HTTPHeaders,
  type TRPCLink,
} from "@trpc/client";
import superjson from "superjson";

import type { AppRouter } from "@saasfly/api";

import { env } from "~/env.mjs";

const getBaseUrl = () => {
  if (typeof window !== "undefined") return "";
  const vc = env.NEXT_PUBLIC_APP_URL;
  if (vc) return vc;
  return `http://localhost:3000`;
};

// 使用与服务端相同的transformer配置
export const transformer = superjson;

const lambdas = [""];

export const endingLink = (opts?: {
  headers?: HTTPHeaders | (() => HTTPHeaders);
}) =>
  ((runtime) => {
    const sharedOpts = {
      headers: opts?.headers,
    } satisfies Partial<HTTPBatchLinkOptions>;

    const edgeLink = httpBatchLink({
      ...sharedOpts,
      url: `${getBaseUrl()}/api/trpc/edge`,
    })(runtime);
    const lambdaLink = httpBatchLink({
      ...sharedOpts,
      url: `${getBaseUrl()}/api/trpc/lambda`,
    })(runtime);

    return (ctx) => {
      const path = ctx.op.path.split(".") as [string, ...string[]];
      const endpoint = lambdas.includes(path[0]) ? "lambda" : "edge";

      const newCtx = {
        ...ctx,
        op: { ...ctx.op, path: path.join(".") },
      };
      return endpoint === "edge" ? edgeLink(newCtx) : lambdaLink(newCtx);
    };
  }) satisfies TRPCLink<AppRouter>;
