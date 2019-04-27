import { ApolloServer } from "apollo-server";
import { Client } from "elasticsearch";
import { readFileSync } from "fs";
import { join } from "path";
import { resolvers } from "./resolvers";
import { IResolverContext } from "./types";

interface ICreateServerParams {
  esClient: Client;
}

const typeDefs = readFileSync(join(__dirname, "schema.gql")).toString() as any;

export function createServer({ esClient }: ICreateServerParams) {
  return new ApolloServer({
    context: { esClient } as IResolverContext,
    resolvers,
    typeDefs
  });
}
