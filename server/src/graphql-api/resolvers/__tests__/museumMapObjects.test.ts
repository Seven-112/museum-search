import { gql } from "apollo-server";
import { createTestClient } from "apollo-server-testing";
import { Client, SearchParams } from "elasticsearch";
import { createServer } from "../../createServer";
import { isEqual } from "lodash";

const MUSEUM_MAP_OBJECT_QUERY = gql`
  query museumMapObjects($query: String, $boundingBox: GeoBoundingBoxInput) {
    museumMapObjects(query: $query, boundingBox: $boundingBox) {
      edges {
        ... on MuseumSearchEdge {
          node {
            __typename
            id
            name
            latitude
            longitude
          }
        }
        ... on GeoPointBucketEdge {
          node {
            __typename
            geoHashKey
            latitude
            longitude
            count
          }
        }
      }
    }
  }
`;

const MOCK_MUSEUM_BUCKETS_RESPONSE = {
  aggregations: {
    museumsGrid: {
      buckets: [
        {
          key: "dr4",
          doc_count: 931,
          avgLongitude: {
            value: -75.22248325696181
          },
          avgLatitude: {
            value: 40.11064952682348
          }
        },
        {
          key: "dr7",
          doc_count: 788,
          avgLongitude: {
            value: -73.81607840872053
          },
          avgLatitude: {
            value: 41.196299010727
          }
        },
        {
          key: "dr5",
          doc_count: 1,
          avgLongitude: {
            value: -74.01199078959803
          },
          avgLatitude: {
            value: 40.610638550789126
          }
        }
      ]
    }
  }
};

const MOCK_MUSEUMS_RESPONSE = {
  hits: {
    hits: [
      {
        _index: "museums",
        _type: "museum",
        _id: "5104",
        _score: 0,
        _source: {
          id: 5104,
          name: "OPERATION SAIL",
          legalName: "OPERATION SAIL INC",
          alternateName: null,
          museumType: "HISTORIC PRESERVATION",
          institutionName: null,
          streetAddress: "55 WATER ST",
          city: "NEW YORK",
          state: "NY",
          zipCode: "6902",
          phoneNumber: "2124222162",
          latitude: 40.70317,
          longitude: -74.00916,
          createdAt: "2018-11-25T22:48:02.000Z",
          updatedAt: "2018-11-25T22:48:02.000Z",
          location: {
            lat: 40.70317,
            lon: -74.00916
          }
        }
      }
    ]
  }
};

const mockSearch = jest.fn(async (params: SearchParams) => {
  if (params.body.aggregations) {
    return MOCK_MUSEUM_BUCKETS_RESPONSE;
  } else {
    return MOCK_MUSEUMS_RESPONSE;
  }
});

jest.mock("elasticsearch", () => ({
  Client: class {
    search = mockSearch;
  }
}));

const { query } = createTestClient(createServer({ esClient: new Client({}) }));

// Spy on the museumMapObjects resolver's "getGeoHashPrecision" method.
const getGeoHashPrecision = jest.spyOn(
  require("../museumMapObjects"),
  "getGeoHashPrecision"
);

describe("museumMapObjects resolver", () => {
  beforeEach(() => {
    mockSearch.mockClear();
    getGeoHashPrecision.mockClear();
  });

  it("returns a MuseumMapObjectsConnection when no query string or bounding box is provided", async () => {
    // Do the query.
    const response = await query({ query: MUSEUM_MAP_OBJECT_QUERY });

    // Check that the client search method was called twice with the correct args.
    expect(mockSearch).toBeCalledTimes(2);
    const [bucketsCall, museumsCall] = mockSearch.mock.calls;
    expect(bucketsCall).toMatchSnapshot("Buckets search with no arguments.");
    expect(museumsCall).toMatchSnapshot("Museums search with no arguments.");

    // Check that the GraphQL response is correct.
    expect(response).toMatchSnapshot("museumMapObjects with no args response.");
  });

  it("returns a MuseumMapObjectsConnection when a query string and bounding box are provided", async () => {
    // Do the query.
    const response = await query({
      query: MUSEUM_MAP_OBJECT_QUERY,
      variables: {
        query: "museum",
        boundingBox: {
          topLeft: {
            latitude: 65.14611484756375,
            longitude: -150.20489340321566
          },
          bottomRight: {
            latitude: -0.7031073524364783,
            longitude: -45.61504965321564
          }
        }
      }
    } as any);

    // Check that the client search method was called twice with the correct args.
    expect(mockSearch).toBeCalledTimes(2);
    const [bucketsCall, museumsCall] = mockSearch.mock.calls;
    expect(bucketsCall).toMatchSnapshot(
      "Buckets search with query string and bounding box args."
    );
    expect(museumsCall).toMatchSnapshot(
      "Museums search with query string and bounding box args."
    );

    // Check that the GraphQL response is correct.
    expect(response).toMatchSnapshot(
      "museumMapObjects with query string and bounding box args response."
    );
  });

  it("aggregates at a higher geohash precision when the bounding box is smaller.", async () => {
    async function checkBoundingBoxQuery(boundingBox: any) {
      await query({
        query: MUSEUM_MAP_OBJECT_QUERY,
        variables: {
          query: "museum",
          boundingBox
        }
      } as any);
    }
    // Latitude range over 80 should use precision 2.
    await checkBoundingBoxQuery({
      topLeft: {
        latitude: 67.47492238478702,
        longitude: -178.06640625000003
      },
      bottomRight: {
        latitude: -49.61070993807422,
        longitude: 38.14453125000001
      }
    });
    expect(getGeoHashPrecision).lastReturnedWith(2);

    // Latitude range over 60 should use precision 3.
    await checkBoundingBoxQuery({
      topLeft: {
        latitude: 65.14611484756375,
        longitude: -150.20489340321566
      },
      bottomRight: {
        latitude: -0.7031073524364783,
        longitude: -45.61504965321564
      }
    });
    expect(getGeoHashPrecision).lastReturnedWith(3);

    // Latitude range 5-80 should use precision 3.
    await checkBoundingBoxQuery({
      topLeft: {
        latitude: 42.17968819665963,
        longitude: -102.16186523437501
      },
      bottomRight: {
        latitude: 34.867904962568744,
        longitude: -88.64868164062501
      }
    });
    expect(getGeoHashPrecision).lastReturnedWith(3);

    // Latitude range 2-5 should use precision 4.
    await checkBoundingBoxQuery({
      topLeft: {
        latitude: 40.58475654701271,
        longitude: -98.32763671875001
      },
      bottomRight: {
        latitude: 36.9367208722872,
        longitude: -91.571044921875
      }
    });
    expect(getGeoHashPrecision).lastReturnedWith(4);

    // Latitude range 2-5 should use precision 4.
    await checkBoundingBoxQuery({
      topLeft: {
        latitude: 40.58475654701271,
        longitude: -98.32763671875001
      },
      bottomRight: {
        latitude: 36.9367208722872,
        longitude: -91.571044921875
      }
    });
    expect(getGeoHashPrecision).lastReturnedWith(4);

    // Latitude range 0.5-2 should use precision 5.
    await checkBoundingBoxQuery({
      topLeft: {
        latitude: 39.926588421909436,
        longitude: -96.33636474609376
      },
      bottomRight: {
        latitude: 38.108627664321276,
        longitude: -92.95806884765626
      }
    });
    expect(getGeoHashPrecision).lastReturnedWith(5);

    // Latitude range 0.2-0.5 should use precision 6.
    await checkBoundingBoxQuery({
      topLeft: {
        latitude: 38.77710492428489,
        longitude: -90.75050354003908
      },
      bottomRight: {
        latitude: 38.31957212925229,
        longitude: -89.9059295654297
      }
    });
    expect(getGeoHashPrecision).lastReturnedWith(6);

    // Latitude range 0.1-0.2 should use precision 7.
    await checkBoundingBoxQuery({
      topLeft: {
        latitude: 38.643020136764996,
        longitude: -90.468807220459
      },
      bottomRight: {
        latitude: 38.528695999656605,
        longitude: -90.25766372680665
      }
    });
    expect(getGeoHashPrecision).lastReturnedWith(7);

    // Latitude range 0.1-0.2 should use precision 7.
    await checkBoundingBoxQuery({
      topLeft: {
        latitude: 38.66185539919398,
        longitude: -90.29800415039062
      },
      bottomRight: {
        latitude: 38.604731093586445,
        longitude: -90.2142333984375
      }
    });
    expect(getGeoHashPrecision).lastReturnedWith(12);
  });
});
