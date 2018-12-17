import "leaflet/dist/leaflet.css";
import React from "react";
import { CircleMarkerProps, MapProps, TileLayerProps } from "react-leaflet";

interface MuseumMapProps {
  museumMapObjects?: any;
}

interface MuseumMapState {
  /**
   * The map should only be rendered in a browser. SSR fails if react-leaflet is loaded on the server.
   */
  showMap: boolean;
}

let Map: React.ComponentClass<MapProps>;
let TileLayer: React.ComponentClass<TileLayerProps>;
let CircleMarker: React.ComponentClass<CircleMarkerProps>;

export class MuseumMap extends React.Component<MuseumMapProps, MuseumMapState> {
  state = {
    showMap: false
  };

  async componentDidMount() {
    // Load the actual react-leaflet classes in this method, which is only called in the browser.
    const reactLeaflet = require("react-leaflet");
    Map = reactLeaflet.Map;
    TileLayer = reactLeaflet.TileLayer;
    CircleMarker = reactLeaflet.CircleMarker;
    this.setState({ showMap: true });
  }

  render() {
    const { museumMapObjects } = this.props;

    return this.state.showMap ? (
      <Map center={[38.810338, -98.323266]} zoom={4} className="h-100">
        <TileLayer
          attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {museumMapObjects
          ? museumMapObjects.edges.map(edge => (
              <CircleMarker
                key={`${edge.node.__typename}_${edge.node.id ||
                  edge.node.geoHashKey}`}
                center={[edge.node.latitude, edge.node.longitude]}
                radius={2}
              />
            ))
          : []}
      </Map>
    ) : null;
  }
}
