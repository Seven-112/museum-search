import { IResolvers } from "graphql-tools";
import { museums } from "./resolvers/museums";
import { bounds } from "latlon-geohash";
import { ResolverContext } from "./types";

export const resolvers: IResolvers<{}, ResolverContext> = {
  Query: {
    museums,
    async museumMapObjects(source, args, { esClient }) {
      const { query, boundingBox } = args;

      const { aggregations } = await esClient.search({
        index: "museums",
        size: 0,
        body: {
          query: {
            bool: {
              must: query
                ? {
                    multi_match: {
                      query
                    }
                  }
                : undefined,
              filter: boundingBox
                ? {
                    geo_bounding_box: {
                      location: {
                        top_left: [
                          boundingBox.topLeft.longitude,
                          boundingBox.topLeft.latitude
                        ],
                        bottom_right: [
                          boundingBox.bottomRight.longitude,
                          boundingBox.bottomRight.latitude
                        ]
                      }
                    }
                  }
                : undefined
            }
          },
          aggregations: {
            museumsGrid: {
              geohash_grid: {
                field: "location",
                precision: "3"
              }
            }
          }
        }
      });

      const buckets: any[] = aggregations.museumsGrid.buckets;

      const boundingBoxesWithFewMuseums = buckets
        .filter(bucket => bucket.doc_count <= 5)
        .map(bucket => bucket.key)
        .map(bounds)
        .map(bounds => ({
          top_left: {
            lat: bounds.ne.lat,
            lon: bounds.sw.lon
          },
          bottom_right: {
            lat: bounds.sw.lat,
            lon: bounds.ne.lon
          }
        }));

      const museumHits = (await esClient.search({
        index: "museums",
        size: 5000,
        body: {
          query: {
            bool: {
              must: query
                ? {
                    multi_match: {
                      query
                    }
                  }
                : undefined,
              should: boundingBoxesWithFewMuseums.map(box => ({
                bool: {
                  filter: {
                    geo_bounding_box: {
                      location: box
                    }
                  }
                }
              })),
              minimum_should_match: 1
            }
          }
        }
      })).hits.hits;

      const edges = [
        ...buckets
          .filter((bucket: any) => bucket.doc_count > 5)
          .map((bucket: any) => {
            const { ne, sw } = bounds(bucket.key);
            const latitude = (ne.lat + sw.lat) / 2;
            const longitude = (ne.lon + sw.lon) / 2;

            return {
              node: {
                latitude,
                longitude,
                geoHashKey: bucket.key,
                count: bucket.doc_count
              }
            };
          }),
        ...museumHits.map(hit => ({
          node: hit._source,
          cursor: hit._id
        }))
      ];

      return {
        edges
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
