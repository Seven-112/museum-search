import { divIcon, icon, LatLngBounds, point } from "leaflet";
import "leaflet/dist/leaflet.css";
import React from "react";
import { Map, Marker, TileLayer } from "react-leaflet";

type MoveHandler = (box: LatLngBounds) => void;

export interface MuseumMapProps {
  museumMapObjects?: any;
  onMove?: MoveHandler;
}

const museumMarkerIcon = icon({
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
  iconAnchor: [13, 40],
  popupAnchor: [0, -30]
});

function bucketMarkerIcon(count: number): any {
  const size = count < 100 ? "small" : count < 1000 ? "medium" : "large";

  return divIcon({
    html: `<div><span>${count}</span></div>`,
    className: `marker-cluster marker-cluster-${size}`,
    iconSize: point(40, 40)
  });
}

export const MuseumMap: React.FunctionComponent<MuseumMapProps> = ({
  museumMapObjects,
  onMove
}) => (
  <Map
    onmove={onMove && (e => onMove(e.target.getBounds()))}
    center={[38.810338, -98.323266]}
    zoom={4}
    className="h-100"
  >
    <TileLayer
      attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    />
    {museumMapObjects
      ? museumMapObjects.edges.map(edge =>
          edge.__typename == "GeoPointBucketEdge" ? (
            <Marker
              key={`bucket_${edge.node.geoHashKey}`}
              position={[edge.node.latitude, edge.node.longitude]}
              icon={bucketMarkerIcon(edge.node.count)}
            />
          ) : (
            <Marker
              key={`museum_${edge.node.id}`}
              position={[edge.node.latitude, edge.node.longitude]}
              icon={museumMarkerIcon}
            />
          )
        )
      : []}
  </Map>
);
