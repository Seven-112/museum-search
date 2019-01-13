import { IFieldResolver } from "graphql-tools";
import { ResolverContext } from "../types";
import { bounds } from "latlon-geohash";
import { Client } from "elasticsearch";

/** The maximum geohash precision allowed by ElasticSearch. */
const MAX_GEOHASH_PRECISION = 12;

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

  const boundingBoxesToUnpack = getBoundingBoxesToUnpack({
    geoPointBuckets
  });

  const museumHits = await getMuseumHits({
    esClient,
    query,
    boundingBoxesToUnpack
  });

  const edges = getEdges({ geoPointBuckets, museumHits });

  return {
    edges
  };
};

/**
 * Get museum buckets, given a text query and a bounding box.
 */
async function getMuseumBuckets({
  esClient,
  query,
  boundingBox
}: {
  esClient: Client;
  query?: string;
  boundingBox?: any;
}) {
  const searchResult = await esClient.search({
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
  });

  return searchResult.aggregations.museumsGrid.buckets;
}

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

  // Decide the precision arbitrarily based on the distance between the bounding box's top and
  // bottom latitude.
  const precisionMappings = [
    { distance: 0.1, precision: MAX_GEOHASH_PRECISION },
    { distance: 0.2, precision: 7 },
    { distance: 0.5, precision: 6 },
    { distance: 2, precision: 5 },
    { distance: 5, precision: 4 },
    { distance: 80, precision: 3 }
  ];

  for (const mapping of precisionMappings) {
    if (latDistance <= mapping.distance) {
      return mapping.precision;
    }
  }

  return defaultPrecision;
};

function bucketShouldBeUnpacked(bucket: any): boolean {
  return bucket.doc_count <= 1 || bucket.key.length == MAX_GEOHASH_PRECISION;
}

/**
 * Decides which bounding boxes should be resolved to return all museum records, instead of returning
 * a geo-point bucket for that bounding box.
 *
 * The boxes should be unpacked when there is only 1 museum in it, or when the bucket has the maximum
 * geohash precision.
 */
function getBoundingBoxesToUnpack({
  geoPointBuckets
}: {
  geoPointBuckets: any[];
}) {
  return geoPointBuckets
    .filter(bucket => bucketShouldBeUnpacked(bucket))
    .map(bucket => bucket.key)
    .map(geohash => bounds(geohash))
    .map(({ ne, sw }) => ({
      top_left: {
        lat: ne.lat,
        lon: sw.lon
      },
      bottom_right: {
        lat: sw.lat,
        lon: ne.lon
      }
    }));
}

async function getMuseumHits({
  esClient,
  query,
  boundingBoxesToUnpack
}: {
  esClient: Client;
  query?: string;
  boundingBoxesToUnpack: any[];
}) {
  if (!boundingBoxesToUnpack.length) {
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
          should: boundingBoxesToUnpack.map(box => ({
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
}

function getEdges({
  geoPointBuckets,
  museumHits
}: {
  geoPointBuckets: any[];
  museumHits: any[];
}) {
  return [
    ...geoPointBuckets
      .filter((bucket: any) => !bucketShouldBeUnpacked(bucket))
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
}
