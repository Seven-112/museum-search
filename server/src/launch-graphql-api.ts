import { ApolloServer, gql, IResolvers } from "apollo-server";
import { Client } from "elasticsearch";

require('dotenv').config();

// Get elasticsearch client.
const esClient = new Client({
  host: process.env.ES_HOST
});

// GraphQL schema.
const typeDefs = gql`
  type Query {
    museums(query: String, first: Int): MuseumSearchConnection
  }

  type Museum {
    id: Int
    name: String
    legalName: String
    alternateName: String
    museumType: String
    institutionName: String
    streetAddress: String
    city: String
    state: String
    zipCode: String
    phoneNumber: String
    latitude: Int
    longitude: Int
  }

  type MuseumSearchEdge {
    node: Museum
    cursor: String
    highlight: String
  }

  type MuseumSearchConnection {
    edges: [MuseumSearchEdge]
    count: Int
  }
`;

// GraphQL resolvers.
const resolvers: IResolvers<{}, {}> = {
  Query: {
    museums: async (source, args) => {
      const { hits } = await esClient.search({
        index: "museums",
        size: args.first || 100,
        body: {
          query: {
            multi_match: {
              query: args.query
            }
          },
          highlight: { fields: { "*": {} } }
        }
      });

      return {
        edges: hits.hits.map(hit => ({
          node: hit._source,
          cursor: hit._id,
          highlight: JSON.stringify(hit.highlight)
        })),
        count: hits.total
      };
    }
  }
};

// Configure server.
const server = new ApolloServer({
  typeDefs,
  resolvers
});

// Start server.
server.listen().then(({ url }) => {
  console.log(`GraphQL API ready at ${url}`);
});
