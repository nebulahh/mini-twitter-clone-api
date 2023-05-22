import { Prisma } from '@prisma/client';
import { GraphQLError } from 'graphql';
import { GraphQLContext } from '../context';
import { applySkipConstraints, applyTakeConstraints } from '../utils';

export const Query = {
  me(parent: unknown, args: object, context: GraphQLContext) {
    if (context.currentUser === null) {
      throw new Error('Unauthenticated!');
    }

    return context.currentUser;
  },
  users(
    parent: unknown,
    args: {
      filter?: string;
    },
    context: GraphQLContext
  ) {
    if (context.currentUser === null) {
      throw new Error('Unauthenticated!');
    }

    const where = args.filter
      ? {
          OR: [{ name: { contains: args.filter } }]
        }
      : {};

    const take = applyTakeConstraints({
      min: 1,
      max: 3,
      value: 3
    });

    return context.prisma.user.findMany({
      where,
      take
    });
    // return context.prisma.user.findMany()
  },

  feed: (
    parent: unknown,
    args: {
      filter?: string;
      skip?: number;
      take?: number;
      orderBy?: {
        text?: Prisma.SortOrder;
      };
    },
    context: GraphQLContext
  ) => {
    const where = args.filter
      ? {
          OR: [{ text: { contains: args.filter } }]
        }
      : {};

    const take = applyTakeConstraints({
      min: 1,
      max: 50,
      value: args.take ?? 30
    });

    const skip = applySkipConstraints({
      min: 1,
      max: 50,
      value: args.skip ?? 30
    });

    return context.prisma.tweet.findMany({
      where,
      skip,
      take,
      orderBy: args.orderBy
    });
  },

  async singleTweet(
    parent: unknown,
    args: { id: string },
    context: GraphQLContext
  ) {
    const postId = args.id;
    if (postId === null) {
      return Promise.reject(
        new GraphQLError(
          `Cannot post comment on non-existing tweet with id '${args.id}'.`
        )
      );
    }
    return context.prisma.tweet.findUnique({
      where: { id: Number(postId) }
    });
  },
  async getUser(
    parent: unknown,
    args: {
      userId?: string;
      filterNeedle?: string;
    },
    context: GraphQLContext
  ) {
    const ID = args.userId;
    if (ID === null) {
      return Promise.reject(new GraphQLError('You must provide an id.'));
    }

    return context.prisma.user.findUnique({
      where: {
        id: Number(ID)
      }
    });
  },
  async comment(
    parent: unknown,
    args: { id: string },
    context: GraphQLContext
  ) {
    const postId = parseInt(args.id);
    if (postId === null) {
      return Promise.reject(new GraphQLError(`You must provide an id.`));
    }

    return context.prisma.comment.findUnique({
      where: { id: Number(args.id) }
    });
  }
};
