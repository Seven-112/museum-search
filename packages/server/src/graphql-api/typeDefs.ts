import { gql } from "apollo-server";

/**
 * GraphQL schema.
 */
export const typeDefs = gql`
  type Query {
    museums(query: String, first: Int!): MuseumSearchConnection
    museumMapObjects(
      query: String
      boundingBox: GeoBoundingBoxInput
    ): MuseumMapObjectsConnection
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

  input GeoBoundingBoxInput {
    top: Float!
    left: Float!
    bottom: Float!
    right: Float!
  }

  type GeoPointBucket {
    latitude: Float
    longitude: Float
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
