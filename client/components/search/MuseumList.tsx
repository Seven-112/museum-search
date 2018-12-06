import { StatelessComponent } from "react";

export interface MuseumListProps {
  museumConnection: any;
}

/**
 * Presentational museum list component.
 */
export const MuseumList: StatelessComponent<MuseumListProps> = props => (
  <ul className="list-group">
    {props.museumConnection.edges.map(edge => (
      <li key={edge.node.id} className="list-group-item">
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
