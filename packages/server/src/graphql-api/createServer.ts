import { ApolloServer } from "apollo-server";
import { Client } from "elasticsearch";
import { resolvers } from "./resolvers";
import { typeDefs } from "./typeDefs";
import { IResolverContext } from "./types";

interface ICreateServerParams {
  esClient: Client;
}

export function createServer({ esClient }: ICreateServerParams) {
  return new ApolloServer({
    context: { esClient } as IResolverContext,
    resolvers,
    typeDefs
  });
}
