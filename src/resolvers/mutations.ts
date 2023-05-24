import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { GraphQLError } from 'graphql';
import { APP_SECRET } from '../auth';
import { GraphQLContext } from '../context';
import { hash, verify } from 'argon2';
import { sign } from 'jsonwebtoken';

export const Mutation = {
  async createProfile(
    parent: unknown,
    args: {
      bio: string;
      location: string;
      website: string;
      avatar: string;
    },
    context: GraphQLContext
  ) {
    const userId = context.currentUser?.id;
    if (!context.currentUser) {
      throw new GraphQLError('You must login before creating a profile!');
    }

    const newProfile = await context.prisma.profile.create({
      data: {
        ...args,
        user: { connect: { id: userId } }
      }
    });

    return newProfile;
  },

  async updateProfile(
    parent: unknown,
    args: {
      id: number;
      bio: string;
      location: string;
      website: string;
      avatar: string;
    },
    context: GraphQLContext
  ) {
    if (!context.currentUser) {
      throw new GraphQLError('You must login in order to update a profile!');
    }

    const updateProfile = await context.prisma.profile.update({
      data: {
        bio: args.bio,
        location: args.location,
        website: args.website,
        avatar: args.avatar
      },
      where: {
        userId: Number(args.id)
      }
    });

    return updateProfile;
  },

  async retweet(
    parent: unknown,
    args: { tweetId: string },
    context: GraphQLContext
  ) {
    if (!context.currentUser) {
      throw new GraphQLError('You must login in order to use retweet!');
    }

    const userId = context.currentUser.id;

    const retweet = await context.prisma.retweet.findUnique({
      where: {
        tweetId_userId: {
          tweetId: Number(args.tweetId),
          userId: userId
        }
      }
    });

    if (retweet !== null) {
      return retweet;
    }

    const newRetweet = await context.prisma.retweet.create({
      data: {
        user: { connect: { id: userId } },
        tweet: { connect: { id: Number(args.tweetId) } }
      }
    });

    return newRetweet;
  },

  async undoRetweet(
    parent: unknown,
    args: { id: string },
    context: GraphQLContext
  ) {
    if (!context.currentUser) {
      throw new GraphQLError('You must login in order to use upvote!').toJSON;
    }

    return await context.prisma.retweet.delete({
      where: { id: parseInt(args.id) },
      select: { id: true }
    });
  },

  async vote(
    parent: unknown,
    args: { tweetId: string },
    context: GraphQLContext
  ) {
    if (!context.currentUser) {
      throw new GraphQLError('You must login in order to use upvote!');
    }

    const userId = context.currentUser.id;

    const newVote = await context.prisma.vote.create({
      data: {
        user: { connect: { id: userId } },
        tweet: { connect: { id: Number(args.tweetId) } }
      }
    });

    context.pubSub.publish('newVote', { newVote });
    return newVote;
  },

  async unLike(parent: unknown, args: { id: string }, context: GraphQLContext) {
    if (!context.currentUser) {
      throw new GraphQLError('You must login in order to use upvote!').toJSON;
    }

    return await context.prisma.vote.delete({
      where: { id: parseInt(args.id) },
      select: { id: true }
    });
  },

  async signup(
    parent: unknown,
    args: { email: string; password: string; name: string },
    context: GraphQLContext
  ) {
    if (!args.email || !args.name || !args.password) {
      throw new Error('You must fill all fields');
    }

    const checkForUser = await context.prisma.user.findUnique({
      where: { email: args.email }
    });

    if (checkForUser) {
      throw new Error('That user already exists');
    }
    const password = await hash(args.password);

    const user = await context.prisma.user.create({
      data: {
        email: args.email,
        name: args.name,
        password
      }
    });

    const token = sign({ userId: user.id }, APP_SECRET);

    return { token, user };
  },

  async login(
    parent: unknown,
    args: { email: string; password: string },
    context: GraphQLContext
  ) {
    if (!args.email || !args.password) {
      throw new Error('You must fill the inputs');
    }
    if (args.password.length <= 5) {
      throw new Error('Password to short');
    }
    const user = await context.prisma.user.findUnique({
      where: { email: args.email }
    });

    if (!user) {
      throw new Error('No such user found');
    }

    const valid = await verify(user.password, args.password);
    if (!valid) {
      throw new Error('Invalid password');
    }
    console.log(user);
    // context.initialContext.request.
    const token = sign({ userId: user.id }, APP_SECRET);
    return { token, user };
  },

  async postTweet(
    parent: unknown,
    args: { text: string },
    context: GraphQLContext
  ) {
    if (context.currentUser === null) {
      return {
        message: 'Unauthenticated!'
      };
    }
    if (args.text.length === 0) {
      return Promise.reject(new GraphQLError(`Cannot provide an empty tweet.`));
    }
    const newTweet = await context.prisma.tweet.create({
      data: {
        text: args.text,
        postedBy: { connect: { id: context.currentUser.id } }
      }
    });
    context.pubSub.publish('newTweet', { newTweet });

    return newTweet;
  },

  async replyComment(
    parent: unknown,
    args: {
      body: string;
      tweetId: string;
      commentId: string;
    },
    context: GraphQLContext
  ) {
    if (!context.currentUser) {
      throw new Error('Unauthenticated!');
    }
    const postId = parseInt(args.tweetId);
    if (postId === null) {
      return Promise.reject(new GraphQLError(`You must provide an id.`));
    }

    if (args.body.length === 0) {
      return Promise.reject(
        new GraphQLError(`Cannot provide an empty comment'.`)
      );
    }

    const newReplyToComment = await context.prisma.comment
      .create({
        data: {
          tweet: { connect: { id: Number(args.tweetId) } },
          body: args.body,
          postedBy: { connect: { id: context.currentUser.id } },
          comment: { connect: { id: Number(args.commentId) } }
        }
      })
      .catch((err: unknown) => {
        if (
          err instanceof PrismaClientKnownRequestError &&
          err.code === 'P2003'
        ) {
          return Promise.reject(
            new GraphQLError(
              `Cannot post comment on non-existing tweet with id '${args.tweetId}'.`
            )
          );
        }
        return Promise.reject(err);
      });

    return newReplyToComment;
  },

  async postCommentOnTweet(
    parent: unknown,
    args: { tweetId: string; body: string },
    context: GraphQLContext
  ) {
    try {
      if (context.currentUser === null) {
        throw new Error('Unauthenticated!');
      }

      const postId = parseInt(args.tweetId);
      if (postId === null) {
        return Promise.reject(new GraphQLError(`You must provide an id.`));
      }

      if (args.body.length === 0) {
        return Promise.reject(
          new GraphQLError(`Cannot provide an empty comment'.`)
        );
      }
      const newComment = await context.prisma.comment
        .create({
          data: {
            tweet: { connect: { id: Number(args.tweetId) } },
            body: args.body,
            postedBy: { connect: { id: context.currentUser.id } }
          }
        })
        .catch((err: unknown) => {
          if (
            err instanceof PrismaClientKnownRequestError &&
            err.code === 'P2003'
          ) {
            return Promise.reject(
              new GraphQLError(
                `Cannot post comment on non-existing tweet with id '${args.tweetId}'.`
              )
            );
          }
          return Promise.reject(err);
        });

      return newComment;
    } catch (error: any) {
      return error;
    }
  },

  async followUser(
    parent: unknown,
    args: {
      followId: string;
    },
    context: GraphQLContext
  ) {
    try {
      const currUser = context.currentUser?.id;
      if (context.currentUser === null) {
        throw new Error('Unauthenticated!');
      }

      const postId = args.followId;
      if (postId === null) {
        return Promise.reject(new GraphQLError(`You must provide an id.`));
      }

      if (Number(currUser) === Number(args.followId)) {
        throw new GraphQLError('You cannot follow yourself');
      }

      Promise.all([
        await context.prisma.user.update({
          where: {
            id: Number(args.followId)
          },
          data: {
            followedBy: { connect: { id: currUser } }
          }
        }),
        await context.prisma.user.update({
          where: {
            id: Number(currUser)
          },
          data: {
            following: { connect: { id: Number(args.followId) } }
          }
        })
      ]).then((res1) => {
        return res1;
      });
    } catch (error: any) {
      return error;
    }
  },
  async unFollowUser(
    parent: unknown,
    args: {
      followId: string;
    },
    context: GraphQLContext
  ) {
    try {
      if (context.currentUser === null) {
        throw new Error('Unauthenticated!');
      }

      const userId = args.followId;
      if (userId === null) {
        return Promise.reject(new GraphQLError(`You must provide an id.`));
      }

      return await context.prisma.user.update({
        where: {
          id: context.currentUser.id
        },
        data: {
          following: {
            disconnect: {
              id: Number(args.followId)
            }
          }
        }
      });
    } catch (error: any) {
      return error;
    }
  }
};
