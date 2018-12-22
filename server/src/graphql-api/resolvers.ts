import { IResolvers } from "graphql-tools";
import { museumMapObjects } from "./resolvers/museumMapObjects";
import { museums } from "./resolvers/museums";
import { ResolverContext } from "./types";

export const resolvers: IResolvers<{}, ResolverContext> = {
  Query: {
    museums,
    museumMapObjects
  },
  MuseumMapObjectEdge: {
    __resolveType(obj: any) {
      if (obj.node.geoHashKey) {
        return "GeoPointBucketEdge";
      } else {
        return "MuseumSearchEdge";
      }
    }
  }
};
