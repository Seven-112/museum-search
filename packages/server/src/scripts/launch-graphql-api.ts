require("dotenv").config();

import { createServer } from "../graphql-api/createServer";
import { Client } from "elasticsearch";

const esClient = new Client({
  host: process.env.ES_HOST
});

// Start server.
createServer({ esClient })
  .listen()
  .then(({ url }) => {
    console.log(`GraphQL API ready at ${url}`);
  });
