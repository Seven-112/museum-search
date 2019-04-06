import { mount } from "enzyme";
import toJson from "enzyme-to-json";
import { MockedProvider, MockedResponse } from "react-apollo/test-utils";
import { GET_MUSEUM_LIST, MuseumList } from "../MuseumList";
// tslint:disable-next-line: no-var-requires
const wait = require("waait");

const mocks: MockedResponse[] = [
  {
    request: {
      query: GET_MUSEUM_LIST,
      variables: {
        query: "space"
      }
    },
    result: {
      data: {
        museums: {
          __typename: "MuseumSearchConnection",
          count: 99,
          edges: [
            {
              __typename: "MuseumSearchEdge",
              cursor: "13911",
              node: {
                __typename: "Museum",
                city: null,
                id: 13911,
                latitude: 43.6555,
                longitude: -70.26151,
                name: "SPACE GALLERY",
                state: null,
                streetAddress: null
              }
            },
            {
              __typename: "MuseumSearchEdge",
              cursor: "14897",
              node: {
                __typename: "Museum",
                city: null,
                id: 14897,
                latitude: 42.26345,
                longitude: -85.60829,
                name: "SPACE GALLERY",
                state: null,
                streetAddress: null
              }
            },
            {
              __typename: "MuseumSearchEdge",
              cursor: "16357",
              node: {
                __typename: "Museum",
                city: "BONNE TERRE",
                id: 16357,
                latitude: 37.92174,
                longitude: -90.55071,
                name: "SPACE MUSEUM",
                state: "MO",
                streetAddress: "116 E SCHOOL ST"
              }
            }
          ]
        }
      }
    }
  },
  {
    error: new Error("An error happened!"),
    request: {
      query: GET_MUSEUM_LIST,
      variables: {
        query: "Give me an error!"
      }
    }
  }
];

describe("MuseumList component", () => {
  function mountWithContext(element: JSX.Element) {
    return mount(<MockedProvider mocks={mocks}>{element}</MockedProvider>);
  }

  it("Renders initially with a loading indicator.", () => {
    const wrapper = mountWithContext(<MuseumList query="space" />);
    expect(
      toJson(wrapper.find("MuseumListInternal").children())
    ).toMatchSnapshot();
  });

  it("Renders the museum list.", async () => {
    const wrapper = mountWithContext(<MuseumList query="space" />);
    await wait(0);
    wrapper.update();
    expect(
      toJson(wrapper.find("MuseumListInternal").children())
    ).toMatchSnapshot();
  });

  it("Renders an error.", async () => {
    const wrapper = mountWithContext(<MuseumList query="Give me an error!" />);
    await wait(2);
    wrapper.update();
    expect(
      toJson(wrapper.find("MuseumListInternal").children())
    ).toMatchSnapshot();
  });
});
