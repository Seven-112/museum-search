import { db } from "../../sequelize/models";
import { MuseumAttributes } from "../../sequelize/models/museum";
import { buildMuseumsIndex } from "../buildMuseumsIndex";

// Create mock elasticsearch client functions.
const mockPing = jest.fn();
const mockExists = jest.fn(async () => false);
const mockCreate = jest.fn(async () => {});
const mockPutMapping = jest.fn(async () => {});
const mockClose = jest.fn();

const mockBulk = jest.fn(async () => {});

// Mock the elasticsearch index builder's usage of the elasticsearch Client.
jest.mock("elasticsearch", () => ({
  Client: class {
    close = mockClose;
    ping = mockPing;

    indices = {
      exists: mockExists,
      create: mockCreate,
      putMapping: mockPutMapping
    };

    bulk = mockBulk;
  }
}));

describe("buildMuseumsIndex", () => {
  // Return mock results for Museum's findAll query.
  const mockFindAllFromDb = jest
    .spyOn(db.Museum, "findAll")
    .mockImplementation(() => {
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

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("Builds the elasticsearch index.", async () => {
    // Run the index builder.
    await buildMuseumsIndex();

    expect(mockPing).toHaveBeenCalledTimes(1);
    expect(mockPing).lastCalledWith({});

    expect(mockExists.mock.calls.length).toEqual(1);
    expect(mockExists).lastCalledWith({ index: "museums" });

    expect(mockCreate.mock.calls.length).toEqual(1);
    expect(mockCreate).lastCalledWith({ index: "museums" });

    expect(mockPutMapping.mock.calls.length).toEqual(1);
    expect(mockPutMapping).lastCalledWith({
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

    expect(mockBulk).toHaveBeenCalledTimes(1);
    expect(mockBulk.mock.calls[0][0]).toMatchSnapshot("bulk operation");

    expect(mockClose).toHaveBeenCalledTimes(1);
  });

  it("Does not try to create the museums index if it already exists.", async () => {
    mockExists.mockReturnValueOnce(true);

    // Run the index builder.
    await buildMuseumsIndex();

    expect(mockCreate.mock.calls.length).toEqual(0);
  });

  it("Does not try to index museums if there are none in the database.", async () => {
    // For this test, the database will have no museums.
    mockFindAllFromDb.mockReturnValueOnce([]);

    // Run the index builder.
    await buildMuseumsIndex();

    expect(mockPing).toHaveBeenCalledTimes(1);
    expect(mockPing).lastCalledWith({});

    // Elasticsearch's bulk method should not have been called.
    expect(mockBulk).toHaveBeenCalledTimes(0);
  });
});
