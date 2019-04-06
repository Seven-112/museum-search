import { gql } from "apollo-server";
import { createTestClient } from "apollo-server-testing";
import { Client, SearchParams, SearchResponse } from "elasticsearch";
import { createServer } from "../../createServer";

const SPACE_MUSEUM_QUERY = gql`
  {
    museums(query: "space museum", first: 2) {
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

jest.mock("elasticsearch", () => ({
  Client: class {
    public async search(params: SearchParams) {
      expect(params.index).toEqual("museums");
      expect(params.size).toEqual(2);
      expect(params.body).toEqual({
        query: {
          multi_match: {
            query: "space museum"
          }
        }
      });
      return SPACE_MUSEUM_MOCK_ES_RESPONSE;
    }
  }
}));

const { query } = createTestClient(createServer({ esClient: new Client({}) }));

describe("museums query", () => {
  it("returns a MuseumConnection", async () => {
    expect(await query({ query: SPACE_MUSEUM_QUERY })).toMatchSnapshot();
  });
});
