import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from '@seo-command-center/api';

export const trpc = createTRPCReact<AppRouter>();