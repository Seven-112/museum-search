import { server } from "./graphql-api/server";

require('dotenv').config();

// Start server.
server.listen().then(({ url }) => {
  console.log(`GraphQL API ready at ${url}`);
});
