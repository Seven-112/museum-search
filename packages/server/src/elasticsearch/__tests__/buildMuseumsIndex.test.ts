import { db } from "../../sequelize/models";
import { MuseumAttributes } from "../../sequelize/models/museum";
import { buildMuseumsIndex } from "../buildMuseumsIndex";

// Create mock elasticsearch client functions.
const ping = jest.fn();
const exists = jest.fn(async () => false);
const create = jest.fn(async () => {});
const putMapping = jest.fn(async () => {});

const bulk = jest.fn(async () => {});

// Mock the elasticsearch index builder's usage of the elasticsearch Client.
jest.mock("elasticsearch", () => ({
  Client: class {
    ping = ping;

    indices = {
      exists,
      create,
      putMapping
    };

    bulk = bulk;
  }
}));

let findAllSpy: jest.SpyInstance;

beforeAll(() => {
  // Return mock results for Museum's findAll query.
  findAllSpy = jest.spyOn(db.Museum, "findAll").mockImplementation(() => {
    // Create mock museum data.
    const mockData: MuseumAttributes[] = [
      {
        id: 1,
        name: "test museum 1",
        latitude: 10,
        longitude: 3
      },
      {
        id: 2,
        name: "test museum 2"
      }
    ];

    return mockData.map(data => db.Museum.build(data));
  });
});

afterAll(() => {
  // Restore the findAll spy.
  findAllSpy.mockRestore();
});

describe("build-elasticsearch-index", () => {
  it("builds the elasticsearch index", async () => {
    // Execute the index builder.
    await buildMuseumsIndex();

    expect(ping.mock.calls.length).toEqual(1);
    expect(ping.mock.calls[0][0]).toEqual({});

    expect(exists.mock.calls.length).toEqual(1);
    expect(exists.mock.calls[0][0]).toEqual({ index: "museums" });

    expect(create.mock.calls.length).toEqual(1);
    expect(create.mock.calls[0][0]).toEqual({ index: "museums" });

    expect(putMapping.mock.calls.length).toEqual(1);
    expect(putMapping.mock.calls[0][0]).toEqual({
      index: "museums",
      type: "museum",
      body: {
        museum: {
          properties: {
            location: {
              type: "geo_point"
            }
          }
        }
      }
    });

    expect(bulk.mock.calls.length).toEqual(1);
    expect(bulk.mock.calls[0][0]).toMatchSnapshot("bulk operation");
  });
});
