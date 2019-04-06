// Waits for data services to be up. This is used to delay scripts that depend
// on external services like MySQL and Elasticsearch until those services are up.

// tslint:disable-next-line: no-var-requires
require("dotenv").config();

// tslint:disable-next-line: no-var-requires
const waitOn = require("wait-on");

async function waitForElasticsearch() {
  console.log("Waiting for Elasticsearch...");
  await waitOn({
    resources: [`tcp:${process.env.ES_HOST}`]
  });
  console.log("Elasticsearch up.");
}

async function waitForDatabase() {
  console.log("Waiting for database...");
  await waitOn({
    resources: [`tcp:${process.env.DB_HOST}:3306`]
  });
  console.log("Database up.");
}

Promise.all([waitForElasticsearch(), waitForDatabase()]);
