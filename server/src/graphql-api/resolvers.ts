import { Client } from "elasticsearch";
import { IResolvers } from "graphql-tools";

const esClient = new Client({
  host: process.env.ES_HOST
});

export const resolvers: IResolvers<{}, {}> = {
  Query: {
    async museums(source, args) {
      const { hits } = await esClient.search({
        index: "museums",
        size: args.first || 100,
        body: {
          query: {
            multi_match: {
              query: args.query
            }
          }
        }
      });

      return {
        edges: hits.hits.map(hit => ({
          node: hit._source,
          cursor: hit._id
        })),
        count: hits.total
      };
    },
    async museumMapObjects(source, args) {
      const { aggregations } = await esClient.search({
        index: "museums",
        size: 0,
        body: {
          aggregations: {
            museumsGrid: {
              geohash_grid: {
                field: "location",
                precision: "1000km"
              }
            }
          }
        }
      });

      return {
        edges: aggregations.museumsGrid.buckets.map((bucket: any) => ({
          node: { geoHashKey: bucket.key, count: bucket.doc_count }
        }))
      };
    }
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
