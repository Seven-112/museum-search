import { IntrospectionResultData } from "apollo-boost";

/**
 * Fragment types as required by Apollo Client.
 * See: https://www.apollographql.com/docs/react/advanced/fragments.html#fragment-matcher
 */
export const fragmentTypes: IntrospectionResultData = {
  __schema: {
    types: [
      {
        kind: "UNION",
        name: "MuseumMapObjectEdge",
        possibleTypes: [
          {
            name: "MuseumSearchEdge"
          },
          {
            name: "GeoPointBucketEdge"
          }
        ]
      }
    ]
  }
};
