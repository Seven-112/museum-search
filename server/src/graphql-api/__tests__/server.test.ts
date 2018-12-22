import { gql } from "apollo-server";
import { createTestClient } from "apollo-server-testing";
import { Client, SearchResponse, SearchParams } from "elasticsearch";
import { createServer } from "../createServer";

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
          id: 123,
          name: "space museum 1",
          legalName: "testLegalName",
          alternateName: "testAlternateName",
          museumType: "testType",
          institutionName: "testInstitutionName",
          streetAddress: "testAddress",
          city: "testCity",
          state: "testState",
          zipCode: "testZipCode",
          phoneNumber: "testNumber",
          latitude: 61.17925,
          longitude: -149.97254
        }
      },
      {
        _id: "555",
        _source: {
          id: 555,
          name: "space museum 2",
          legalName: "testLegalName2",
          alternateName: "testAlternateName2",
          museumType: "testType2",
          institutionName: "testInstitutionName2",
          streetAddress: "testAddress2",
          city: "testCity2",
          state: "testState2",
          zipCode: "testZipCode2",
          phoneNumber: "testNumber2",
          latitude: 61.1689,
          longitude: -149.76708
        }
      }
    ],
    total: 123
  }
} as SearchResponse<any>;

jest.mock("elasticsearch", () => ({
  Client: class {
    async search(params: SearchParams) {
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
