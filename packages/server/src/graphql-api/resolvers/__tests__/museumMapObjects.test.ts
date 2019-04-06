import { gql } from "apollo-server";
import { createTestClient } from "apollo-server-testing";
import { Client, SearchParams } from "elasticsearch";
import { isEqual } from "lodash";
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

/** Real-world example of a bounding box with no museums. */
const EMPTY_BOUNDING_BOX = {
  bottom: 38.907974370742046,
  left: -94.47119146585467,
  right: -94.46789234876636,
  top: 38.909752622714755
};

const MOCK_MUSEUM_BUCKETS_RESPONSE = {
  aggregations: {
    museumsGrid: {
      buckets: [
        {
          avgLatitude: {
            value: 40.11064952682348
          },
          avgLongitude: {
            value: -75.22248325696181
          },
          doc_count: 931,
          key: "dr4"
        },
        {
          avgLatitude: {
            value: 41.196299010727
          },
          avgLongitude: {
            value: -73.81607840872053
          },
          doc_count: 788,
          key: "dr7"
        },
        {
          avgLatitude: {
            value: 40.610638550789126
          },
          avgLongitude: {
            value: -74.01199078959803
          },
          doc_count: 1,
          key: "dr5"
        }
      ]
    }
  }
};

const MOCK_EMPTY_MUSEUM_BUCKETS_RESPONSE = {
  aggregations: {
    museumsGrid: {
      buckets: []
    }
  }
};

const MOCK_MUSEUMS_RESPONSE = {
  hits: {
    hits: [
      {
        _id: "5104",
        _index: "museums",
        _score: 0,
        _source: {
          alternateName: null,
          city: "NEW YORK",
          createdAt: "2018-11-25T22:48:02.000Z",
          id: 5104,
          institutionName: null,
          latitude: 40.70317,
          legalName: "OPERATION SAIL INC",
          location: {
            lat: 40.70317,
            lon: -74.00916
          },
          longitude: -74.00916,
          museumType: "HISTORIC PRESERVATION",
          name: "OPERATION SAIL",
          phoneNumber: "2124222162",
          state: "NY",
          streetAddress: "55 WATER ST",
          updatedAt: "2018-11-25T22:48:02.000Z",
          zipCode: "6902"
        },
        _type: "museum"
      }
    ]
  }
};

const mockSearch = jest.fn(async (params: SearchParams) => {
  if (params.body.aggregations) {
    if (
      params.body.query.bool.filter &&
      isEqual(
        params.body.query.bool.filter.geo_bounding_box.location,
        EMPTY_BOUNDING_BOX
      )
    ) {
      return MOCK_EMPTY_MUSEUM_BUCKETS_RESPONSE;
    }
    return MOCK_MUSEUM_BUCKETS_RESPONSE;
  } else {
    return MOCK_MUSEUMS_RESPONSE;
  }
});

jest.mock("elasticsearch", () => ({
  Client: class {
    public search = mockSearch;
  }
}));

const { query } = createTestClient(createServer({ esClient: new Client({}) }));

// Spy on the museumMapObjects resolver's "getGeoHashPrecision" method.
const getGeoHashPrecision = jest.spyOn(
  // tslint:disable-next-line: no-var-requires
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
        boundingBox: {
          bottom: -0.7031073524364783,
          left: -150.20489340321566,
          right: -45.61504965321564,
          top: 65.14611484756375
        },
        query: "museum"
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

  it("returns a MuseumMapObjectsConnection with no edges when an empty bounding box is provided", async () => {
    // Do the query.
    const response = await query({
      query: MUSEUM_MAP_OBJECT_QUERY,
      variables: {
        boundingBox: EMPTY_BOUNDING_BOX
      }
    } as any);

    // Only one search should be performed because the first should return no results.
    expect(mockSearch).toBeCalledTimes(1);
    const [bucketsCall] = mockSearch.mock.calls;
    expect(bucketsCall).toMatchSnapshot(
      "Buckets search with empty bounding box."
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
          boundingBox,
          query: "museum"
        }
      } as any);
    }
    // Latitude range over 80 should use precision 2.
    await checkBoundingBoxQuery({
      bottom: -49.61070993807422,
      left: -178.06640625000003,
      right: 38.14453125000001,
      top: 67.47492238478702
    });
    expect(getGeoHashPrecision).lastReturnedWith(2);

    // Latitude range over 60 should use precision 3.
    await checkBoundingBoxQuery({
      bottom: -0.7031073524364783,
      left: -150.20489340321566,
      right: -45.61504965321564,
      top: 65.14611484756375
    });
    expect(getGeoHashPrecision).lastReturnedWith(3);

    // Latitude range 5-80 should use precision 3.
    await checkBoundingBoxQuery({
      bottom: 34.867904962568744,
      left: -102.16186523437501,
      right: -88.64868164062501,
      top: 42.17968819665963
    });
    expect(getGeoHashPrecision).lastReturnedWith(3);

    // Latitude range 2-5 should use precision 4.
    await checkBoundingBoxQuery({
      bottom: 36.9367208722872,
      left: -98.32763671875001,
      right: -91.571044921875,
      top: 40.58475654701271
    });
    expect(getGeoHashPrecision).lastReturnedWith(4);

    // Latitude range 2-5 should use precision 4.
    await checkBoundingBoxQuery({
      bottom: 36.9367208722872,
      left: -98.32763671875001,
      right: -91.571044921875,
      top: 40.58475654701271
    });
    expect(getGeoHashPrecision).lastReturnedWith(4);

    // Latitude range 0.5-2 should use precision 5.
    await checkBoundingBoxQuery({
      bottom: 38.108627664321276,
      left: -96.33636474609376,
      right: -92.95806884765626,
      top: 39.926588421909436
    });
    expect(getGeoHashPrecision).lastReturnedWith(5);

    // Latitude range 0.2-0.5 should use precision 6.
    await checkBoundingBoxQuery({
      bottom: 38.31957212925229,
      left: -90.75050354003908,
      right: -89.9059295654297,
      top: 38.77710492428489
    });
    expect(getGeoHashPrecision).lastReturnedWith(6);

    // Latitude range 0.1-0.2 should use precision 7.
    await checkBoundingBoxQuery({
      bottom: 38.528695999656605,
      left: -90.468807220459,
      right: -90.25766372680665,
      top: 38.643020136764996
    });
    expect(getGeoHashPrecision).lastReturnedWith(7);

    // Latitude range 0.1-0.2 should use precision 7.
    await checkBoundingBoxQuery({
      bottom: 38.604731093586445,
      left: -90.29800415039062,
      right: -90.2142333984375,
      top: 38.66185539919398
    });
    expect(getGeoHashPrecision).lastReturnedWith(12);
  });
});
