import { IFieldResolver } from "graphql-tools";
import { ResolverContext } from "../types";

export const museums: IFieldResolver<{}, ResolverContext> = async (
  _,
  args,
  { esClient }
) => {
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
};
