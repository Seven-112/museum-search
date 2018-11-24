import { ApolloServer } from "apollo-server";
import { resolvers } from "./resolvers";
import { typeDefs } from "./typeDefs";

export const server = new ApolloServer({
  typeDefs,
  resolvers
});
