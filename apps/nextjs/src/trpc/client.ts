import { loggerLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";

import type { AppRouter } from "@saasfly/api";

export const trpc = createTRPCReact<AppRouter>();

export { type RouterInputs, type RouterOutputs } from "@saasfly/api";
