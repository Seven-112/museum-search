import gql from "graphql-tag";
import { Query, QueryProps } from "react-apollo";

type MuseumListQueryProps = Partial<QueryProps<any, any>>;

const GET_MUSEUM_LIST = gql`
  query($query: String! = "museum") {
    museums(query: $query, first: 200) {
      edges {
        node {
          id
          name
          streetAddress
          city
          state
          latitude
          longitude
        }
      }
      count
    }
  }
`;

export const MuseumListQuery: React.StatelessComponent<
  MuseumListQueryProps
> = props => (
  <Query query={GET_MUSEUM_LIST} {...props}>
    {result => props.children(result)}
  </Query>
);
