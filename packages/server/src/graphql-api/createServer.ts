import { ApolloServer } from "apollo-server";
import { Client } from "elasticsearch";
import { resolvers } from "./resolvers";
import { typeDefs } from "./typeDefs";
import { ResolverContext } from "./types";

interface CreateServerParams {
  esClient: Client;
}

export function createServer({ esClient }: CreateServerParams) {
  return new ApolloServer({
    typeDefs,
    resolvers,
    context: { esClient } as ResolverContext
  });
}
