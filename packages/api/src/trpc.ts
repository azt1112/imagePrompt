import type { NextRequest } from "next/server";
import {initTRPC, TRPCError} from "@trpc/server";
import { getToken } from "next-auth/jwt";
import { ZodError } from "zod";

import { transformer } from "./transformer";

interface CreateContextOptions {
  req?: NextRequest;
  token?: any;
}

// Updated to use NextAuth JWT token
export const createTRPCContext = async (opts: {
  headers: Headers;
  req?: NextRequest;
  auth?: any;
}) => {
  let userId: string | null = null;
  
  if (opts.req) {
    const token = await getToken({ 
      req: opts.req, 
      secret: process.env.NEXTAUTH_SECRET 
    });
    userId = token?.sub || null;
  }
  
  return {
    userId,
    ...opts,
  };
};

export type TRPCContext = Awaited<ReturnType<typeof createTRPCContext>>;

export const t = initTRPC.context<TRPCContext>().create({
  transformer,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

export const createTRPCRouter = t.router;
export const procedure = t.procedure;
export const mergeRouters = t.mergeRouters;

const isAuthed = t.middleware(({ next, ctx }) => {
  if (!ctx.userId) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  // Make ctx.userId non-nullable in protected procedures
  return next({ ctx: { userId: ctx.userId } });
});


export const protectedProcedure = procedure.use(isAuthed);