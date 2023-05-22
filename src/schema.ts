import { makeExecutableSchema } from '@graphql-tools/schema';
import { typeDefinitions } from './typeDefinitions/types';
import { resolvers } from './resolvers/resolver';

export const schema = makeExecutableSchema({
  resolvers: [resolvers],
  typeDefs: [typeDefinitions]
});
