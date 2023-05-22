import { DateTimeTypeDefinition } from 'graphql-scalars';

export const typeDefinitions = `
  type Query {
    comment(id: ID!): Comment
    feed(
      filterNeedle: String
      skip: Int
      take: Int
      orderBy: LinkOrderByInput
      ): [Tweet!]!
    singleTweet(id: ID): Tweet
    me: User!
    users(filterNeedle: String): [User!]!
    getUser(userId: ID, filterNeedle: String): User!
  }

  type Comment {
    id: ID!
    body: String!
    tweet: Tweet!
    commentId: ID!
    commentReply: [Comment!]!
    postedBy: User!
  }
  
  type Vote {
    id: ID!
    tweet: Tweet
    user: User!
  }

  type Retweet {
    id: ID!
    tweet: Tweet
    user: User!
  }

type Subscription {
  newTweet: Tweet!
  newVote: Vote!
}

type Following {
  id: ID!
  name: String!
  avatar: String!
  followId: ID!
  user: User!
}

  type Mutation {
    postTweet(text: String!): Tweet!
    postCommentOnTweet(tweetId: ID!, body: String!): Comment
    replyComment(body: String!, tweetId: ID!, commentId: ID!): Comment
    vote(tweetId: ID!): Vote
    unLike(id: ID!): Vote
    retweet(tweetId: ID!): Retweet
    undoRetweet(id: ID!): Retweet
    signup(email: String!, password: String!, name: String!): AuthPayload
    login(email: String!, password: String!): AuthPayload
    followUser(followId: ID): User
    unFollowUser(followId: ID!): User
    createProfile(bio: String, location: String, website: String, avatar: String): Profile
    updateProfile(id: ID!, bio: String, location: String, website: String, avatar: String): Profile
  }

${DateTimeTypeDefinition}
  type Tweet {
    id: ID!
    text: String!
    comments: [Comment!]!
    postedBy: User
    votes: [Vote!]!
    retweet: [Retweet!]!
    createdAt: DateTime
  }

 type AuthPayload {
  token: String
  user: User
}
 
type User {
  id: ID!
  name: String!
  email: String!
  votes: [Vote!]!
  tweets: [Tweet!]!
  following: [User!]!
  followedBy: [User!]!
  profile: Profile
}

type Profile {
  id:        ID
  bio:       String
  location:  String
  website:   String
  avatar:    String
  userId:    Int  
  user:      User   
}

input LinkOrderByInput {
  description: Sort
  url: Sort
  createdAt: Sort
}
 
enum Sort {
  asc
  desc
}
`;
