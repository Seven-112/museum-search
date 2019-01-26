import gql from "graphql-tag";
import { graphql } from "react-apollo";

/** MuseumList component props. */
interface MuseumListProps {
  query?: string;
}

/** MuseumList query response. */
interface MuseumListResponse {
  museums: any;
}

/** MuseumList query variables. */
interface MuseumListVariables {
  query?: string;
}

/** MuseumList query. */
const GET_MUSEUM_LIST = gql`
  query($query: String) {
    museums(query: $query, first: 50) {
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

/** Higher-order component to provide data from the GraphQL API to a React component. */
const withMuseumList = graphql<
  MuseumListProps,
  MuseumListResponse,
  MuseumListVariables
>(GET_MUSEUM_LIST, {
  options: ({ query }) => ({
    variables: {
      query
    }
  })
});

/** MuseumList component. */
export const MuseumList = withMuseumList(function MuseumList({
  data: { loading, error, museums }
}) {
  return (
    <ul className="list-group">
      {loading ? (
        "Loading..."
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : museums ? (
        museums.edges.map(edge => (
          <li key={edge.node.id} className="list-group-item">
            <strong>{edge.node.name}</strong>
            <div>{edge.node.streetAddress}</div>
            <div>
              {[edge.node.city, edge.node.state]
                .filter(it => it || false)
                .join(" - ")}
            </div>
          </li>
        ))
      ) : null}
    </ul>
  );
});
