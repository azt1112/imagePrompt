import type {NextRequest} from "next/server";
import {fetchRequestHandler} from "@trpc/server/adapters/fetch";

import {createTRPCContext} from "@saasfly/api";
import {edgeRouter} from "@saasfly/api/edge";
import { getServerSession } from "next-auth";
import { simpleAuthOptions } from "@saasfly/auth/simple-nextauth";

// export const runtime = "edge";
const createContext = async (req: NextRequest) => {
    const session = await getServerSession(simpleAuthOptions);
    return createTRPCContext({
        headers: req.headers,
        req: req,
        auth: session,
    });
};

const handler = (req: NextRequest) =>
    fetchRequestHandler({
        endpoint: "/api/trpc/edge",
        router: edgeRouter,
        req: req,
        createContext: () => createContext(req),
        onError: ({error, path}) => {
            console.log("Error in tRPC handler (edge) on path", path);
            console.error(error);
        },
    });

export {handler as GET, handler as POST};
