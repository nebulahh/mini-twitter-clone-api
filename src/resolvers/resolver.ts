import type { GraphQLContext } from '../context';
import type { Tweet, User, Profile } from '@prisma/client';

import { DateTimeResolver } from 'graphql-scalars';
import { Query } from './query';
import { Mutation } from './mutations';

export const resolvers = {
  Subscription: {
    newVote: {
      subscribe: (parent: unknown, args: object, context: GraphQLContext) =>
        context.pubSub.subscribe('newVote')
    },

    newTweet: {
      subscribe: (parent: unknown, args: object, context: GraphQLContext) =>
        context.pubSub.subscribe('newTweet')
    }
  },
  Query,

  User: {
    tweets: (parent: User, args: object, context: GraphQLContext) =>
      context.prisma.user.findUnique({ where: { id: parent.id } }).tweets(),
    votes: (parent: User, args: object, context: GraphQLContext) =>
      context.prisma.user.findUnique({ where: { id: parent.id } }).votes(),
    profile: (parent: User, args: object, context: GraphQLContext) =>
      context.prisma.profile.findUnique({ where: { userId: parent.id } }),
    following: (parent: User, args: object, context: GraphQLContext) =>
      context.prisma.user.findUnique({ where: { id: parent.id } }).following(),
    followedBy: (parent: User, args: object, context: GraphQLContext) =>
      context.prisma.user.findUnique({ where: { id: parent.id } }).followedBy()
  },

  Tweet: {
    id: (parent: Tweet) => parent.id,
    text: (parent: Tweet) => parent.text,
    comments(parent: Tweet, args: object, context: GraphQLContext) {
      return context.prisma.comment.findMany({
        where: {
          tweetId: parent.id
        }
      });
    },
    postedBy(parent: Tweet, args: object, context: GraphQLContext) {
      if (!parent.postedById) {
        return null;
      }

      return context.prisma.tweet
        .findUnique({ where: { id: parent.id } })
        .postedBy();
    },
    votes: (parent: Tweet, args: object, context: GraphQLContext) =>
      context.prisma.tweet.findUnique({ where: { id: parent.id } }).votes(),
    retweet: (parent: Tweet, args: object, context: GraphQLContext) =>
      context.prisma.tweet.findUnique({ where: { id: parent.id } }).retweets()
  },

  Vote: {
    tweet: (parent: User, args: object, context: GraphQLContext) =>
      context.prisma.vote.findUnique({ where: { id: parent.id } }).tweet(),
    user: (parent: User, args: object, context: GraphQLContext) =>
      context.prisma.vote.findUnique({ where: { id: parent.id } }).user()
  },

  Retweet: {
    tweet: (parent: User, args: object, context: GraphQLContext) =>
      context.prisma.retweet.findUnique({ where: { id: parent.id } }).tweet(),
    user: (parent: User, args: object, context: GraphQLContext) =>
      context.prisma.retweet.findUnique({ where: { id: parent.id } }).user()
  },

  Comment: {
    tweet: (parent: User, args: object, context: GraphQLContext) =>
      context.prisma.comment.findUnique({ where: { id: parent.id } }).tweet(),
    postedBy: (parent: User, args: object, context: GraphQLContext) =>
      context.prisma.comment
        .findUnique({ where: { id: parent.id } })
        .postedBy(),
    commentReply: (parent: User, args: object, context: GraphQLContext) =>
      context.prisma.comment.findUnique({ where: { id: parent.id } }).comments()
  },

  Profile: {
    user: (parent: Profile, args: object, context: GraphQLContext) =>
      context.prisma.profile.findUnique({ where: { id: parent.id } }).user()
  },
  Mutation,
  DateTime: DateTimeResolver
};
