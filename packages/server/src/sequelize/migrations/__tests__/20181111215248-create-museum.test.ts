// tslint:disable-next-line: no-var-requires
const createMuseums = require("../20181111215248-create-museum");

const mockCreateTable = jest.fn();
const mockDropTable = jest.fn();

const mockQueryInterface = {
  createTable: mockCreateTable,
  dropTable: mockDropTable
};

// Mock the sequelize types as strings so they show up as type names instead of "[Function]" in snapshots.
const MOCK_SEQUELIZE_TYPES = {
  DATE: "DATE",
  DOUBLE: "DOUBLE",
  INTEGER: "INTEGER",
  STRING: "STRING"
};

describe("create museums table migration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("Creates the museums table.", () => {
    createMuseums.up(mockQueryInterface, MOCK_SEQUELIZE_TYPES);
    expect(mockCreateTable).toHaveBeenCalledTimes(1);
    // Migrations shouldn't change, so snapshots can enforce that.
    expect(mockCreateTable.mock.calls[0]).toMatchSnapshot(
      "create museums table migration."
    );
  });

  it("Drops the museums table.", () => {
    createMuseums.down(mockQueryInterface);
    expect(mockDropTable).toHaveBeenCalledTimes(1);
    expect(mockDropTable).lastCalledWith("Museums");
  });
});
