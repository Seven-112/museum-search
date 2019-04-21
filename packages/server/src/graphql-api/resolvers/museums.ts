import { IFieldResolver } from "graphql-tools";
import { IResolverContext } from "../types";

export const museums: IFieldResolver<{}, IResolverContext> = async (
  _,
  { first, location, query },
  { esClient }
) => {
  const { hits } = await esClient.search({
    body: {
      ...(query && {
        query: {
          multi_match: {
            operator: "and",
            query
          }
        }
      }),
      ...(location && {
        sort: [
          {
            _geo_distance: {
              location: {
                lat: location.latitude,
                lon: location.longitude
              }
            }
          }
        ]
      })
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
