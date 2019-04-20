import { gql } from "apollo-server";
import { createTestClient } from "apollo-server-testing";
import { Client, SearchResponse } from "elasticsearch";
import { createServer } from "../../createServer";

const SPACE_MUSEUM_QUERY = gql`
  query spaceMuseumQuery(
    $query: String = "space museum"
    $location: Coordinate
  ) {
    museums(query: $query, location: $location, first: 2) {
      edges {
        cursor
        node {
          id
          name
          legalName
          alternateName
          museumType
          institutionName
          streetAddress
          city
          state
          zipCode
          phoneNumber
          latitude
          longitude
        }
      }
      count
    }
  }
`;

const SPACE_MUSEUM_MOCK_ES_RESPONSE = {
  hits: {
    hits: [
      {
        _id: "123",
        _source: {
          alternateName: "testAlternateName",
          city: "testCity",
          id: 123,
          institutionName: "testInstitutionName",
          latitude: 61.17925,
          legalName: "testLegalName",
          longitude: -149.97254,
          museumType: "testType",
          name: "space museum 1",
          phoneNumber: "testNumber",
          state: "testState",
          streetAddress: "testAddress",
          zipCode: "testZipCode"
        }
      },
      {
        _id: "555",
        _source: {
          alternateName: "testAlternateName2",
          city: "testCity2",
          id: 555,
          institutionName: "testInstitutionName2",
          latitude: 61.1689,
          legalName: "testLegalName2",
          longitude: -149.76708,
          museumType: "testType2",
          name: "space museum 2",
          phoneNumber: "testNumber2",
          state: "testState2",
          streetAddress: "testAddress2",
          zipCode: "testZipCode2"
        }
      }
    ],
    total: 123
  }
} as SearchResponse<any>;

const mockSearch = jest.fn(() => SPACE_MUSEUM_MOCK_ES_RESPONSE);

jest.mock("elasticsearch", () => ({
  Client: class {
    public search = mockSearch;
  }
}));

const { query } = createTestClient(createServer({ esClient: new Client({}) }));

describe("museums query", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("Returns a MuseumSearchConnection", async () => {
    const result = await query({ query: SPACE_MUSEUM_QUERY });
    expect(result).toMatchSnapshot();

    expect(mockSearch).lastCalledWith({
      body: {
        query: {
          multi_match: {
            operator: "and",
            query: "space museum"
          }
        }
      },
      index: "museums",
      size: 2
    });
  });

  it("Sends a geo-distance Elasticsearch query when location is specified.", async () => {
    await query({
      query: SPACE_MUSEUM_QUERY,
      variables: {
        location: { latitude: 39.6902721, longitude: -98.2425472 }
      }
    } as any);

    expect(mockSearch).lastCalledWith({
      body: {
        query: {
          multi_match: {
            operator: "and",
            query: "space museum"
          }
        },
        sort: [
          { _geo_distance: { location: { lat: 39.6902721, lon: -98.2425472 } } }
        ]
      },
      index: "museums",
      size: 2
    });
  });
});
