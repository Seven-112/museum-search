"use strict";

const path = require("path");
const xlsx = require("xlsx");

module.exports = {

  /**
   * Imports museum data from the Kaggle CSV file to the relational DB.
   * 
   * Get the CSV file at: https://www.kaggle.com/imls/museum-directory
   */
  up: (queryInterface) => {

    // Make sure that the MUSEUMS_CSV file is provided.
    const csvPath = process.env.MUSEUMS_CSV;
    if (!csvPath) {
      throw new Error("process.env.MUSEUMS_CSV must be set");
    }

    const workBook = xlsx.readFile(path.resolve(csvPath));
    const csvData = xlsx.utils.sheet_to_json(workBook.Sheets.Sheet1);

    const museums = csvData.map(row => ({
      name: row["Museum Name"],
      legalName: row["Legal Name"],
      alternateName: row["Alternate Name"],
      museumType: row["Museum Type"],
      institutionName: row["Institution Name"],
      streetAddress: row["Street Address (Physical Location)"],
      city: row["City (Physical Location)"],
      state: row["State (Physical Location)"],
      zipCode: row["Zip Code (Physical Location)"],
      phoneNumber: row["Phone Number"],
      latitude: row["Latitude"],
      longitude: row["Longitude"],
      createdAt: new Date(Date.now()),
      updatedAt: new Date(Date.now())
    }));

    return queryInterface.bulkInsert("Museums", museums);
  },

  down: (queryInterface) => {
    return queryInterface.bulkDelete("Museums", {});
  }
};
