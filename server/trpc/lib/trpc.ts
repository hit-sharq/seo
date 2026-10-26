import { initTRPC, TRPCError } from '@trpc/server';
import { PrismaClient } from '@prisma/client';
import superjson from 'superjson';
import { ZodError } from 'zod';

const prisma = new PrismaClient();

export const createTRPCContext = async (opts: { headers: Headers }) => {
  return {
    prisma,
    headers: opts.headers,
  };
};

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError: error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  return next();
});

export const createCallerFactory = t.createCallerFactory;
