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
          doc_count: 2,
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
      },
      {
        _index: "museums",
        _type: "museum",
        _id: "18747",
        _score: 0,
        _source: {
          id: 18747,
          name: "ABRAHAM STAATS HOUSE",
          legalName: "FRIENDS OF ABRAHAM STAATS HOUSE INC",
          alternateName: null,
          museumType: "HISTORY MUSEUM",
          institutionName: null,
          streetAddress: null,
          city: null,
          state: null,
          zipCode: null,
          phoneNumber: "7324695836",
          latitude: 40.5535,
          longitude: -74.52932,
          createdAt: "2018-11-25T22:48:02.000Z",
          updatedAt: "2018-11-25T22:48:02.000Z",
          location: {
            lat: 40.5535,
            lon: -74.52932
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

describe("museumMapObjects resolver", () => {
  it("returns a MuseumMapObjectsConnection when no query string or bounding box is provided", async () => {
    // Spy on the Elasticsearch client's "search" method.
    const search = jest.spyOn(
      require("elasticsearch").Client.prototype,
      "search"
    );

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
});
