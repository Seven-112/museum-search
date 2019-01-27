import { InMemoryCache, IntrospectionFragmentMatcher } from "apollo-boost";
import { mount } from "enzyme";
import { MockedProvider, MockedResponse } from "react-apollo/test-utils";
import { Map, Marker } from "react-leaflet";
import { fragmentTypes } from "../../../fragmentTypes";
import { GET_MUSEUM_MAP_OBJECTS, MuseumMap } from "../MuseumMap";
const wait = require("waait");

/** An example of a bounding box with space museums in Florida. */
const FLORIDA_SPACE_MUSEUM_VARIABLES = {
  query: "space",
  boundingBox: {
    top: 29.284003336047167,
    left: -82.01839881762265,
    bottom: 27.222883510268815,
    right: -79.4503446184039
  }
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
          edges: [
            {
              node: {
                __typename: "GeoPointBucket",
                geoHashKey: "djnd",
                latitude: 28.60317611694336,
                longitude: -80.76131184895833,
                count: 3
              },
              __typename: "GeoPointBucketEdge"
            },
            {
              node: {
                __typename: "GeoPointBucket",
                geoHashKey: "djn9",
                latitude: 28.38445472717285,
                longitude: -80.68020248413086,
                count: 2
              },
              __typename: "GeoPointBucketEdge"
            },
            {
              node: {
                __typename: "Museum",
                id: 6563,
                name: "SPACE COAST KIDS DISCOVERY CENTER",
                latitude: 28.17638,
                longitude: -80.67145
              },
              __typename: "MuseumSearchEdge"
            }
          ],
          __typename: "MuseumMapObjectsConnection"
        }
      }
    }
  }
];

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
    const wrapper = mountWithContext(
      <MuseumMap {...FLORIDA_SPACE_MUSEUM_VARIABLES} />
    );
    await wait(0);
    wrapper.update();

    const markers = wrapper.find(Marker);
    expect(markers.length).toEqual(3);

    // Expect three markers: two buckets and one museum.

    expect(markers.at(0).props()).toEqual(
      objectContaining({
        position: [28.60317611694336, -80.76131184895833],
        icon: anything()
      })
    );
    expect(markers.at(0).key()).toEqual("bucket_djnd");

    expect(markers.at(1).props()).toEqual(
      objectContaining({
        position: [28.38445472717285, -80.68020248413086],
        icon: anything()
      })
    );
    expect(markers.at(1).key()).toEqual("bucket_djn9");

    expect(markers.at(2).props()).toEqual(
      objectContaining({
        position: [28.17638, -80.67145],
        icon: anything()
      })
    );
    expect(markers.at(2).key()).toEqual("museum_6563");
  });

  it("Provides an onMove callback.", async () => {
    const onMove = jest.fn();

    const wrapper = mountWithContext(
      <MuseumMap {...FLORIDA_SPACE_MUSEUM_VARIABLES} onMove={onMove} />
    );
    await wait(0);
    wrapper.update();

    // Simulate a map move.
    const mockEvent = {};
    wrapper.find(Map).prop("onmove")(mockEvent);

    expect(onMove).lastCalledWith(mockEvent);
  });
});
