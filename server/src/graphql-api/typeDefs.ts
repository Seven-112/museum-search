import { gql } from "apollo-server";

/**
 * GraphQL schema.
 */
export const typeDefs = gql`
  type Query {
    museums(query: String, first: Int): MuseumSearchConnection
    museumMapObjects(query: String): MuseumMapObjectsConnection
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
    latitude: Float
    longitude: Float
  }

  type MuseumSearchEdge {
    node: Museum
    cursor: String
  }

  type MuseumSearchConnection {
    edges: [MuseumSearchEdge]
    count: Int
  }

  type GeoPointBucket {
    geoHashKey: String
    count: Int
  }

  type GeoPointBucketEdge {
    node: GeoPointBucket
  }

  union MuseumMapObjectEdge = MuseumSearchEdge | GeoPointBucketEdge

  type MuseumMapObjectsConnection {
    edges: [MuseumMapObjectEdge]
  }
`;
