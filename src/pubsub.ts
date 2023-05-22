import { createPubSub } from '@graphql-yoga/subscription';
import { Tweet, Vote } from '@prisma/client';

export type PubSubChannels = {
  newTweet: [{ newTweet: Tweet }];
  newVote: [{ newVote: Vote }];
};

export const pubSub = createPubSub<PubSubChannels>();
