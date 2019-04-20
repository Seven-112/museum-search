import { InMemoryCache, IntrospectionFragmentMatcher } from "apollo-boost";
import { mount } from "enzyme";
import { LatLngExpression } from "leaflet";
import { MockedProvider, MockedResponse } from "react-apollo/test-utils";
import { Map, Marker } from "react-leaflet";
import { fragmentTypes } from "../../../fragmentTypes";
import { GET_MUSEUM_MAP_OBJECTS, MuseumMap } from "../MuseumMap";
// tslint:disable-next-line: no-var-requires
const wait = require("waait");

/** An example of a bounding box with space museums in Florida. */
const FLORIDA_SPACE_MUSEUM_VARIABLES = {
  boundingBox: {
    bottom: 27.222883510268815,
    left: -82.01839881762265,
    right: -79.4503446184039,
    top: 29.284003336047167
  },
  query: "space"
};

const mocks: MockedResponse[] = [
  {
    request: {
      query: GET_MUSEUM_MAP_OBJECTS,
      variables: FLORIDA_SPACE_MUSEUM_VARIABLES
    },
    result: {
      data: {
        museumMapObjects: {
          __typename: "MuseumMapObjectsConnection",
          edges: [
            {
              __typename: "GeoPointBucketEdge",
              node: {
                __typename: "GeoPointBucket",
                count: 3,
                geoHashKey: "djnd",
                latitude: 28.60317611694336,
                longitude: -80.76131184895833
              }
            },
            {
              __typename: "GeoPointBucketEdge",
              node: {
                __typename: "GeoPointBucket",
                count: 2,
                geoHashKey: "djn9",
                latitude: 28.38445472717285,
                longitude: -80.68020248413086
              }
            },
            {
              __typename: "MuseumSearchEdge",
              node: {
                __typename: "Museum",
                id: 6563,
                latitude: 28.17638,
                longitude: -80.67145,
                name: "SPACE COAST KIDS DISCOVERY CENTER"
              }
            }
          ]
        }
      }
    }
  }
];

const DEFAULT_PROPS = {
  ...FLORIDA_SPACE_MUSEUM_VARIABLES,
  initialCenter: [38.810338, -98.323266] as LatLngExpression
};

describe("MuseumMap component", () => {
  const { anything, objectContaining } = expect;

  function mountWithContext(element: JSX.Element) {
    return mount(
      <MockedProvider
        mocks={mocks}
        cache={
          new InMemoryCache({
            fragmentMatcher: new IntrospectionFragmentMatcher({
              introspectionQueryResultData: fragmentTypes
            })
          })
        }
      >
        {element}
      </MockedProvider>
    );
  }

  it("Renders museum map objects.", async () => {
    const wrapper = mountWithContext(<MuseumMap {...DEFAULT_PROPS} />);
    await wait(2);
    wrapper.update();

    const markers = wrapper.find(Marker);
    expect(markers.length).toEqual(3);

    // Expect three markers: two buckets and one museum.

    expect(markers.at(0).props()).toEqual(
      objectContaining({
        icon: anything(),
        position: [28.60317611694336, -80.76131184895833]
      })
    );
    expect(markers.at(0).key()).toEqual("bucket_djnd");

    expect(markers.at(1).props()).toEqual(
      objectContaining({
        icon: anything(),
        position: [28.38445472717285, -80.68020248413086]
      })
    );
    expect(markers.at(1).key()).toEqual("bucket_djn9");

    expect(markers.at(2).props()).toEqual(
      objectContaining({
        icon: anything(),
        position: [28.17638, -80.67145]
      })
    );
    expect(markers.at(2).key()).toEqual("museum_6563");
  });

  it("Provides an onMove callback.", async () => {
    const onMove = jest.fn();

    const wrapper = mountWithContext(
      <MuseumMap {...DEFAULT_PROPS} onMove={onMove} />
    );
    await wait(0);
    wrapper.update();

    // Simulate a map move.
    const mockEvent = {
      target: {
        getBounds() {
          return {
            getEast: () => 4,
            getNorth: () => 1,
            getSouth: () => 3,
            getWest: () => 2
          };
        }
      }
    };
    wrapper.find(Map).prop("onmove")(mockEvent);

    expect(onMove).lastCalledWith({
      bottom: 3,
      left: 2,
      right: 4,
      top: 1
    });
  });

  it("Provides an optional onMove callback prop.", async () => {
    // Pass an undefined onMove prop.
    const wrapper = mountWithContext(
      <MuseumMap {...DEFAULT_PROPS} onMove={undefined} />
    );
    await wait(0);
    wrapper.update();

    // Simulate a map move.
    const mockEvent = {
      target: {
        getBounds() {
          return {
            getEast: () => 4,
            getNorth: () => 1,
            getSouth: () => 3,
            getWest: () => 2
          };
        }
      }
    };
    wrapper.find(Map).prop("onmove")(mockEvent);

    // Nothing should happen.
  });

  it("Provides a highlightedMarker prop to show a highlighted marker.", () => {
    const wrapper = mountWithContext(
      <MuseumMap
        {...DEFAULT_PROPS}
        highlightedMuseum={mocks[0].result.data.museumMapObjects.edges[2].node}
      />
    );

    expect(wrapper.find(Marker).props()).toEqual(
      objectContaining({
        icon: anything(),
        position: [28.17638, -80.67145]
      })
    );
  });

  it("Clamps lat/lon values to min/max.", async () => {
    const onMove = jest.fn();

    const wrapper = mountWithContext(
      <MuseumMap {...DEFAULT_PROPS} onMove={onMove} />
    );
    await wait(0);
    wrapper.update();

    // Simulate a map move with under min values.
    const mockEvent1 = {
      target: {
        getBounds() {
          return {
            getEast: () => -1000,
            getNorth: () => -1000,
            getSouth: () => -1000,
            getWest: () => -1000
          };
        }
      }
    };
    wrapper.find(Map).prop("onmove")(mockEvent1);

    expect(onMove).lastCalledWith({
      bottom: -90,
      left: -180,
      right: -180,
      top: -90
    });

    // Simulate a map move with over max values.
    const mockEvent2 = {
      target: {
        getBounds() {
          return {
            getEast: () => 500,
            getNorth: () => 500,
            getSouth: () => 500,
            getWest: () => 500
          };
        }
      }
    };
    wrapper.find(Map).prop("onmove")(mockEvent2);

    expect(onMove).lastCalledWith({
      bottom: 90,
      left: 180,
      right: 180,
      top: 90
    });
  });

  it("Provides a leaflet map ref.", () => {
    const refWrapper: { leafletMapRef: Map } = { leafletMapRef: null };

    mountWithContext(
      <MuseumMap
        {...DEFAULT_PROPS}
        leafletMapRef={node => (refWrapper.leafletMapRef = node)}
      />
    );

    expect(refWrapper.leafletMapRef.leafletElement).toBeTruthy();
  });

  it("Accepts an 'initialCenter' prop to set the initial center of the Leaflet Map.", () => {
    const initialCenter: LatLngExpression = [41.1235368, -107.2246636];

    const wrapper = mountWithContext(
      <MuseumMap {...DEFAULT_PROPS} initialCenter={initialCenter} />
    );

    expect(wrapper.find(Map).prop("center")).toBe(initialCenter);
  });
});
