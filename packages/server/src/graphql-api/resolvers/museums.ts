import { IFieldResolver } from "graphql-tools";
import { IResolverContext } from "../types";

export const museums: IFieldResolver<{}, IResolverContext> = async (
  _,
  { first, query },
  { esClient }
) => {
  const { hits } = await esClient.search({
    body: {
      query: {
        multi_match: { query }
      }
    },
    index: "museums",
    size: first
  });

  return {
    count: hits.total,
    edges: hits.hits.map(hit => ({
      cursor: hit._id,
      node: hit._source
    }))
  };
};
