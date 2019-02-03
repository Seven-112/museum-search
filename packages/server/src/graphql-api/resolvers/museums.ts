import { IFieldResolver } from "graphql-tools";
import { ResolverContext } from "../types";

export const museums: IFieldResolver<{}, ResolverContext> = async (
  _,
  { first, query },
  { esClient }
) => {
  const { hits } = await esClient.search({
    index: "museums",
    size: first,
    body: {
      query: {
        multi_match: { query }
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
