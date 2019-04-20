import gql from "graphql-tag";
import { divIcon, LatLngExpression, LatLngTuple, point } from "leaflet";
import "leaflet/dist/leaflet.css";
import { clamp } from "lodash";
import React, { Ref } from "react";
import { graphql } from "react-apollo";
import { Map, Marker, TileLayer } from "react-leaflet";
import "../../style/MuseumMap.css";
import { LoadingSpinner } from "../loading-spinner/LoadingSpinner";

export type MoveHandler = (box: IBoundingBox) => void;

/** MuseumMap component props. */
export interface IMuseumMapProps {
  initialCenter: LatLngExpression;
  query?: string;
  boundingBox?: object;
  leafletMapRef?: Ref<Map>;
  onMove?: MoveHandler;
  highlightedMuseum?: any;
}

/** MuseumMap query response. */
interface IMuseumMapResponse {
  museumMapObjects?: any;
}

/** MuseumMap query variables. */
interface IMuseumMapVariables {
  query?: string;
  boundingBox?: object;
}

export interface IBoundingBox {
  bottom: number;
  left: number;
  right: number;
  top: number;
}

// tslint:disable-next-line: no-var-requires
const BLUE_MARKER_IMG = require("leaflet/dist/images/marker-icon.png");
// tslint:disable-next-line: no-var-requires
const RED_MARKER_IMG = require("../../img/marker-icon-red.png");

/** MuseumMapObjects query. */
export const GET_MUSEUM_MAP_OBJECTS = gql`
  query museumMapObjects($query: String, $boundingBox: GeoBoundingBoxInput) {
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

/** Higher-order component to provide data from the GraphQL API to a React component. */
const withMuseumMapObjects = graphql<
  IMuseumMapProps,
  IMuseumMapResponse,
  IMuseumMapVariables
>(GET_MUSEUM_MAP_OBJECTS, {
  options: ({ boundingBox, query }) => ({
    variables: {
      boundingBox,
      query
    }
  })
});

function museumMarkerIcon(museum: any, img: any) {
  return divIcon({
    className: "museum-marker",
    html: `
      <div style="width: 300px">
        <img src="${img}">
        <div><label>${museum.name}</label></div>
      </div>
    `,
    iconAnchor: [13, 40],
    popupAnchor: [0, -30]
  });
}

/** Marker icon for a cluster of museums. */
function bucketMarkerIcon(count: number): any {
  const size = count < 100 ? "small" : count < 1000 ? "medium" : "large";

  return divIcon({
    className: `marker-cluster marker-cluster-${size}`,
    html: `<div><span>${count}</span></div>`,
    iconSize: point(40, 40)
  });
}

function redHighlightMarker(museum?: any) {
  if (museum) {
    const position: LatLngTuple = [museum.latitude, museum.longitude];

    return (
      <Marker
        position={position}
        icon={museumMarkerIcon(museum, RED_MARKER_IMG)}
      />
    );
  }
  return null;
}

/** MuseumMap component. */
export const MuseumMap = withMuseumMapObjects(function MuseumMapInternal({
  data: { loading, museumMapObjects },
  highlightedMuseum,
  initialCenter,
  leafletMapRef,
  onMove
}) {
  const highlightMarker = redHighlightMarker(highlightedMuseum);

  function onMoveInternal(event) {
    if (!onMove) {
      return;
    }

    const leafletBox = event.target.getBounds();

    const boundingBox: IBoundingBox = {
      bottom: clamp(leafletBox.getSouth(), -90, 90),
      left: clamp(leafletBox.getWest(), -180, 180),
      right: clamp(leafletBox.getEast(), -180, 180),
      top: clamp(leafletBox.getNorth(), -90, 90)
    };

    onMove(boundingBox);
  }

  return (
    <div className="h-100">
      <div style={{ zIndex: 500 }} className="position-absolute w-100">
        <LoadingSpinner loading={loading} />
      </div>
      <Map
        center={initialCenter}
        className="h-100"
        onmove={onMoveInternal}
        ref={leafletMapRef}
        zoom={4}
      >
        <TileLayer
          attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          noWrap={true}
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MarkerGroup museumMapObjects={museumMapObjects} />
        {highlightMarker}
      </Map>
    </div>
  );
});

/**
 * Marker group component that only re-renders when the passed list of museums changes.
 */
class MarkerGroup extends React.Component<IMuseumMapResponse> {
  public render() {
    const { museumMapObjects } = this.props;

    return (
      <div>
        {museumMapObjects &&
          museumMapObjects.edges.map(edge => {
            switch (edge.__typename) {
              case "GeoPointBucketEdge":
                return (
                  <Marker
                    key={`bucket_${edge.node.geoHashKey}`}
                    position={[edge.node.latitude, edge.node.longitude]}
                    icon={bucketMarkerIcon(edge.node.count)}
                  />
                );
              case "MuseumSearchEdge":
                return (
                  <Marker
                    key={`museum_${edge.node.id}`}
                    position={[edge.node.latitude, edge.node.longitude]}
                    icon={museumMarkerIcon(edge.node, BLUE_MARKER_IMG)}
                  />
                );
            }
          })}
      </div>
    );
  }

  public shouldComponentUpdate({ museumMapObjects }: IMuseumMapResponse) {
    // Only render if the museum list is different.
    return museumMapObjects !== this.props.museumMapObjects;
  }
}
