import gql from "graphql-tag";
import { Query, QueryProps } from "react-apollo";

type MuseumMapQueryProps = Partial<QueryProps<any, any>>;

const GET_MUSEUM_MAP_OBJECTS = gql`
  query museumMapObjects($query: String!, $boundingBox: GeoBoundingBoxInput) {
    museumMapObjects(query: $query, boundingBox: $boundingBox) {
      edges {
        ... on MuseumSearchEdge {
          node {
            __typename
            id
            name
            latitude
            longitude
          }
        }
        ... on GeoPointBucketEdge {
          node {
            __typename
            geoHashKey
            latitude
            longitude
            count
          }
        }
      }
    }
  }
`;

export const MuseumMapQuery: React.FunctionComponent<
  MuseumMapQueryProps
> = props => (
  <Query query={GET_MUSEUM_MAP_OBJECTS} {...props}>
    {result => props.children(result)}
  </Query>
);
