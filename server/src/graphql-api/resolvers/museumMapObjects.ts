import { IFieldResolver } from "graphql-tools";
import { ResolverContext } from "../types";
import { bounds } from "latlon-geohash";
import { Client } from "elasticsearch";

export const museumMapObjects: IFieldResolver<{}, ResolverContext> = async (
  _,
  { query, boundingBox },
  { esClient }
) => {
  const geoPointBuckets: any[] = await getMuseumBuckets({
    esClient,
    query,
    boundingBox
  });

  const boundingBoxesWithFewMuseums = getBoundingBoxesWithFewMuseums({
    geoPointBuckets
  });

  const museumHits = await getMuseumHits({
    esClient,
    query,
    boundingBoxesWithFewMuseums
  });

  const edges = getEdges({ geoPointBuckets, museumHits });

  return {
    edges
  };
};

const getMuseumBuckets = async ({
  esClient,
  query,
  boundingBox
}: {
  esClient: Client;
  query?: string;
  boundingBox?: any;
}) =>
  (await esClient.search({
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
            precision: getGeoHashPrecision({ boundingBox })
          },
          aggregations: {
            avgLatitude: {
              avg: {
                field: "latitude"
              }
            },
            avgLongitude: {
              avg: {
                field: "longitude"
              }
            }
          }
        }
      }
    }
  })).aggregations.museumsGrid.buckets;

/**
 * Decides the geohash precision based on the size of the client's map.
 */
export const getGeoHashPrecision = ({ boundingBox }: { boundingBox?: any }) => {
  const defaultPrecision = 2;

  if (!boundingBox) {
    return defaultPrecision;
  }

  const latDistance =
    boundingBox.topLeft.latitude - boundingBox.bottomRight.latitude;

  if (latDistance <= 0.1) {
    return 12;
  }
  if (latDistance <= 0.2) {
    return 7;
  }
  if (latDistance <= 0.5) {
    return 6;
  }
  if (latDistance <= 2) {
    return 5;
  }
  if (latDistance <= 10) {
    return 4;
  }
  if (latDistance <= 80) {
    return 3;
  }
  return defaultPrecision;
};

const getBoundingBoxesWithFewMuseums = ({
  geoPointBuckets
}: {
  geoPointBuckets: any[];
}) =>
  geoPointBuckets
    .filter(bucket => bucket.doc_count <= 1)
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

const getMuseumHits = async ({
  esClient,
  query,
  boundingBoxesWithFewMuseums
}: {
  esClient: Client;
  query?: string;
  boundingBoxesWithFewMuseums: any[];
}) => {
  if (!boundingBoxesWithFewMuseums.length) {
    return [];
  }

  return (await esClient.search({
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
};

const getEdges = ({
  geoPointBuckets,
  museumHits
}: {
  geoPointBuckets: any[];
  museumHits: any[];
}) => [
  ...geoPointBuckets
    .filter((bucket: any) => bucket.doc_count > 1)
    .map((bucket: any) => ({
      node: {
        latitude: bucket.avgLatitude.value,
        longitude: bucket.avgLongitude.value,
        geoHashKey: bucket.key,
        count: bucket.doc_count
      }
    })),
  ...museumHits.map(hit => ({
    node: hit._source,
    cursor: hit._id
  }))
];
