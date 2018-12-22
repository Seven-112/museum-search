import { IResolvers } from "graphql-tools";
import { museums } from "./resolvers/museums";
import { ResolverContext } from "./types";

export const resolvers: IResolvers<{}, ResolverContext> = {
  Query: {
    museums
  }
};
