import { StatelessComponent } from "react";

export interface MuseumListProps {
  loading?: boolean;
  error?: string;
  museumConnection?: any;
}

/**
 * Presentational museum list component.
 */
export const MuseumList: StatelessComponent<MuseumListProps> = ({
  loading,
  error,
  museumConnection
}) => (
  <ul className="list-group">
    {loading ? (
      "Loading..."
    ) : error ? (
      <div className="alert alert-danger">{error}</div>
    ) : museumConnection ? (
      museumConnection.edges.map(edge => (
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
    ) : (
      undefined
    )}
  </ul>
);
