import "leaflet/dist/leaflet.css";
import React from "react";
import { MapProps, TileLayerProps } from "react-leaflet";

interface MuseumMapProps {}

interface MuseumMapState {
  /**
   * The map should only be rendered in a browser. SSR fails if react-leaflet is loaded on the server.
   */
  showMap: boolean;
}

let Map: React.ComponentClass<MapProps>;
let TileLayer: React.ComponentClass<TileLayerProps>;

export class MuseumMap extends React.Component<MuseumMapProps, MuseumMapState> {
  state = {
    showMap: false
  };

  async componentDidMount() {
    // Load the actual react-leaflet classes in this method, which is only called in the browser.
    Map = require("react-leaflet").Map;
    TileLayer = require("react-leaflet").TileLayer;
    this.setState({ showMap: true });
  }

  render() {
    return Map ? (
      <Map>
        <TileLayer
          attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
      </Map>
    ) : null;
  }
}
