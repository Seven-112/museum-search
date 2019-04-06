// tslint:disable-next-line: no-var-requires
require("dotenv").config();

import { Client } from "elasticsearch";
import { createServer } from "../graphql-api/createServer";

const esClient = new Client({
  host: process.env.ES_HOST
});

// Start server.
createServer({ esClient })
  .listen()
  .then(({ url }) => {
    console.log(`GraphQL API ready at ${url}`);
  });
