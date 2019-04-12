import { Client } from "elasticsearch";
import { IFieldResolver } from "graphql-tools";
import { bounds } from "latlon-geohash";
import { IResolverContext } from "../types";

/** The maximum geohash precision allowed by ElasticSearch. */
const MAX_GEOHASH_PRECISION = 12;

export const museumMapObjects: IFieldResolver<{}, IResolverContext> = async (
  _,
  { query, boundingBox },
  { esClient }
) => {
  const geoPointBuckets: any[] = await getMuseumBuckets({
    boundingBox,
    esClient,
    query
  });

  const boundingBoxesToUnpack = getBoundingBoxesToUnpack({
    geoPointBuckets
  });

  const museumHits = await getMuseumHits({
    boundingBoxesToUnpack,
    esClient,
    query
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
    body: {
      aggregations: {
        museumsGrid: {
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
          },
          geohash_grid: {
            field: "location",
            precision: getGeoHashPrecision({ boundingBox })
          }
        }
      },
      query: {
        bool: {
          filter: boundingBox
            ? {
                geo_bounding_box: {
                  location: boundingBox
                }
              }
            : undefined,
          must: query
            ? {
                multi_match: {
                  operator: "and",
                  query
                }
              }
            : undefined
        }
      }
    },
    index: "museums",
    size: 0
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

  const latDistance = boundingBox.top - boundingBox.bottom;

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
  return bucket.doc_count <= 1 || bucket.key.length === MAX_GEOHASH_PRECISION;
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
      bottom: sw.lat,
      left: sw.lon,
      right: ne.lon,
      top: ne.lat
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
    body: {
      query: {
        bool: {
          minimum_should_match: 1,
          must: query
            ? {
                multi_match: {
                  operator: "and",
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
          }))
        }
      }
    },
    index: "museums",
    size: 5000
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
          count: bucket.doc_count,
          geoHashKey: bucket.key,
          latitude: bucket.avgLatitude.value,
          longitude: bucket.avgLongitude.value
        }
      })),
    ...museumHits.map(hit => ({
      cursor: hit._id,
      node: hit._source
    }))
  ];
}
