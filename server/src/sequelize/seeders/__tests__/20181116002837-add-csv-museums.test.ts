import { resolve } from "path";
const seeder = require("../20181116002837-add-csv-museums");

let dateNowSpy: jest.SpyInstance<() => number>;

beforeAll(() => {
  // Mock Date.now() so the test data is always created with the same date.
  dateNowSpy = jest.spyOn(Date, "now").mockImplementation(() => 1543096967033);
});

afterAll(() => {
  dateNowSpy.mockRestore();
});

describe("add-csv-museums seed", () => {
  it("inserts museums from the csv file when process.env.MUSEUMS_CSV is set", () => {
    const mockQueryInterface = {
      bulkInsert: jest.fn(async (tableName, museumData) => {
        expect(tableName).toEqual("Museums");
        expect(museumData).toMatchSnapshot();
        return { success: true };
      })
    };

    process.env.MUSEUMS_CSV = resolve(
      __dirname,
      "__testdata__",
      "test-museums.csv"
    );
    expect(seeder.up(mockQueryInterface)).resolves.toEqual({ success: true });
    expect(mockQueryInterface.bulkInsert.mock.calls.length).toEqual(1);

    delete process.env.MUSEUMS_CSV;
  });

  it("does not insert museums from the csv file when process.env.MUSEUMS_CSV is not set", () => {
    delete process.env.MUSEUMS_CSV;
    expect(() => {
      seeder.up();
    }).toThrowError("process.env.MUSEUMS_CSV must be set");
  });

  it("deletes all rows from the Museums table", () => {
    const mockQueryInterface = {
      bulkDelete: jest.fn(async (tableName, options) => {
        expect(tableName).toEqual("Museums");
        expect(options).toEqual({});
        return { success: true };
      })
    };

    expect(seeder.down(mockQueryInterface)).resolves.toEqual({ success: true });
  });
});
