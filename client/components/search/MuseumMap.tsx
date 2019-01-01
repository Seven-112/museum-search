import { LatLngBounds, DivIconOptions, IconOptions } from "leaflet";
import "leaflet/dist/leaflet.css";
import React from "react";
import { MapProps, MarkerProps, TileLayerProps } from "react-leaflet";

type MoveHandler = (box: LatLngBounds) => void;

interface MuseumMapProps {
  museumMapObjects?: any;
  onMove?: MoveHandler;
}

interface MuseumMapState {
  /**
   * The map should only be rendered in a browser. SSR fails if react-leaflet is loaded on the server.
   */
  showMap: boolean;
}

let Map: React.ComponentClass<MapProps>;
let TileLayer: React.ComponentClass<TileLayerProps>;
let Marker: React.ComponentClass<MarkerProps>;
let point: Function;
let divIcon: (options: DivIconOptions) => any;
let icon: (options: IconOptions) => any;

function bucketMarkerIcon(count: number): any {
  const size = count < 100 ? "small" : count < 1000 ? "medium" : "large";

  return divIcon({
    html: `<div><span>${count}</span></div>`,
    className: `marker-cluster marker-cluster-${size}`,
    iconSize: point(40, 40)
  });
}

export class MuseumMap extends React.Component<MuseumMapProps, MuseumMapState> {
  state = {
    showMap: false
  };

  async componentDidMount() {
    // Load the actual leaflet imports in this method, which is only called in the browser.
    const Leaflet = require("leaflet");
    point = Leaflet.point;
    divIcon = Leaflet.divIcon;
    icon = Leaflet.icon;

    const reactLeaflet = require("react-leaflet");
    Map = reactLeaflet.Map;
    TileLayer = reactLeaflet.TileLayer;
    Marker = reactLeaflet.Marker;
    this.setState({ showMap: true });
  }

  render() {
    const { museumMapObjects, onMove } = this.props;

    return this.state.showMap ? (
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
                  icon={icon({
                    iconUrl: require("leaflet/dist/images/marker-icon.png"),
                    shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
                    iconAnchor: [13, 40],
                    popupAnchor: [0, -30]
                  })}
                />
              )
            )
          : []}
      </Map>
    ) : null;
  }
}
