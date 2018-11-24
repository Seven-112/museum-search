import { Client } from "elasticsearch";
import { IResolvers } from "graphql-tools";

const esClient = new Client({
  host: process.env.ES_HOST
})

export const resolvers: IResolvers<{}, {}> = {
  Query: {
    museums: async (source, args) => {
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
    }
  }
};
