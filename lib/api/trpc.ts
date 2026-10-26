import { initTRPC, TRPCError } from '@trpc/server';
import { PrismaClient } from '@prisma/client';
import superjson from 'superjson';
import { ZodError } from 'zod';

const prisma = new PrismaClient();

export const createTRPCContext = async (opts: { headers: Headers }) => {
  const authHeader = opts.headers.get('authorization');
  const apiKey = authHeader?.replace('Bearer ', '');

  return {
    prisma,
    headers: opts.headers,
    apiKey,
    isAuthenticated: Boolean(apiKey && apiKey === process.env.NEXT_PUBLIC_API_KEY),
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

// Public procedures — no auth needed (brand selector, etc.)
export const publicProcedure = t.procedure;

// Protected procedures — require valid API key
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.isAuthenticated) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Invalid or missing API key',
    });
  }
  return next();
});

export const createCallerFactory = t.createCallerFactory;
