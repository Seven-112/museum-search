import { gql } from "apollo-server";
import { createTestClient } from "apollo-server-testing";
import { Client, SearchParams } from "elasticsearch";
import { createServer } from "../../createServer";

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

const MUSEUM_BUCKETS_MOCK_RESPONSE = {
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

const MUSEUMS_MOCK_RESPONSE = {
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

jest.mock("elasticsearch", () => ({
  Client: class {
    async search(params: SearchParams) {
      if (params.body.aggregations) {
        return MUSEUM_BUCKETS_MOCK_RESPONSE;
      } else {
        return MUSEUMS_MOCK_RESPONSE;
      }
    }
  }
}));

const { query } = createTestClient(createServer({ esClient: new Client({}) }));

// Spy on the Elasticsearch client's "search" method.
const search = jest.spyOn(require("elasticsearch").Client.prototype, "search");

// Spy on the museumMapObjects resolver's "getPrecision" method.
const getGeoHashPrecision = jest.spyOn(
  require("../museumMapObjects"),
  "getGeoHashPrecision"
);

describe("museumMapObjects resolver", () => {
  beforeEach(() => {
    search.mockClear();
    getGeoHashPrecision.mockClear();
  });

  it("returns a MuseumMapObjectsConnection when no query string or bounding box is provided", async () => {
    // Do the query.
    const response = await query({ query: MUSEUM_MAP_OBJECT_QUERY });

    // Check that the client search method was called twice with the correct args.
    expect(search).toBeCalledTimes(2);
    const [bucketsCall, museumsCall] = search.mock.calls;
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
    expect(search).toBeCalledTimes(2);
    const [bucketsCall, museumsCall] = search.mock.calls;
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
    // Latitude range over 10 should use precision 3.
    await query({
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
    expect(getGeoHashPrecision).lastReturnedWith(3);

    // Latitude range under 10 should use precision 4.
    await query({
      query: MUSEUM_MAP_OBJECT_QUERY,
      variables: {
        query: "museum",
        boundingBox: {
          topLeft: {
            latitude: 42.593532625649935,
            longitude: -101.77734375000001
          },
          bottomRight: {
            latitude: 33.18353672893615,
            longitude: -87.18750000000001
          }
        }
      }
    } as any);
    expect(getGeoHashPrecision).lastReturnedWith(4);
  });
});
