import { PrismaClient, User } from '@prisma/client';
import { YogaInitialContext } from 'graphql-yoga';
import { authenticateUser } from './auth';
import { pubSub } from './pubsub';

const prisma = new PrismaClient();

export type GraphQLContext = {
  prisma: PrismaClient;
  pubSub: typeof pubSub;
  currentUser: null | User;
  initialContext: YogaInitialContext;
};

export async function createContext(
  initialContext: YogaInitialContext
): Promise<GraphQLContext> {
  return {
    prisma,
    pubSub,
    initialContext,
    currentUser: await authenticateUser(prisma, initialContext.request)
  };
}
