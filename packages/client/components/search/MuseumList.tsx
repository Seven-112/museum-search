import gql from "graphql-tag";
import { graphql } from "react-apollo";
import { LoadingSpinner } from "../loading-spinner/LoadingSpinner";
import {
  MuseumListQuery,
  MuseumListQueryVariables
} from "./__generated__/MuseumListQuery";

/** MuseumList component props. */
export interface IMuseumListProps extends MuseumListQueryVariables {
  onItemHover: (hoveredItem: object) => void;
  onItemClick: (hoveredItem: object) => void;
}

/** MuseumList query. */
export const GET_MUSEUM_LIST = gql`
  query MuseumListQuery($query: String, $location: Coordinate) {
    museums(query: $query, location: $location, first: 50) {
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
  IMuseumListProps,
  MuseumListQuery,
  MuseumListQueryVariables
>(GET_MUSEUM_LIST, {
  options: ({ location, query }) => ({
    variables: {
      location,
      query
    }
  })
});

/** MuseumList component. */
export const MuseumList = withMuseumList(function MuseumListInternal({
  data: { loading, error, museums },
  onItemClick,
  onItemHover
}) {
  return (
    <ul className="list-group">
      <style jsx={true}>{`
        .list-group-item:hover {
          background-color: gainsboro;
          cursor: pointer;
        }
      `}</style>
      <LoadingSpinner loading={loading} />
      {error && <div className="alert alert-danger">{error.message}</div>}
      {museums &&
        museums.edges.map(edge => (
          <li
            key={edge.node.id}
            className="list-group-item"
            onClick={() => onItemClick(edge.node)}
            onMouseEnter={() => onItemHover(edge.node)}
            onMouseLeave={() => onItemHover(null)}
          >
            <strong>{edge.node.name}</strong>
            <div>{edge.node.streetAddress}</div>
            <div>
              {[edge.node.city, edge.node.state]
                .filter(it => it || false)
                .join(" - ")}
            </div>
          </li>
        ))}
    </ul>
  );
});
