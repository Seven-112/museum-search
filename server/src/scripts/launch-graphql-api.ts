require('dotenv').config();

import { server } from "../graphql-api/server";

// Start server.
server.listen().then(({ url }) => {
  console.log(`GraphQL API ready at ${url}`);
});
