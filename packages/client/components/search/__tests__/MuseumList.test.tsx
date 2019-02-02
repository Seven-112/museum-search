import { MockedProvider, MockedResponse } from "react-apollo/test-utils";
import { GET_MUSEUM_LIST, MuseumList } from "../MuseumList";
import { mount } from "enzyme";
import toJson from "enzyme-to-json";
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
          edges: [
            {
              __typename: "MuseumSearchEdge",
              cursor: "13911",
              node: {
                __typename: "Museum",
                id: 13911,
                name: "SPACE GALLERY",
                streetAddress: null,
                city: null,
                state: null,
                latitude: 43.6555,
                longitude: -70.26151
              }
            },
            {
              __typename: "MuseumSearchEdge",
              cursor: "14897",
              node: {
                __typename: "Museum",
                id: 14897,
                name: "SPACE GALLERY",
                streetAddress: null,
                city: null,
                state: null,
                latitude: 42.26345,
                longitude: -85.60829
              }
            },
            {
              __typename: "MuseumSearchEdge",
              cursor: "16357",
              node: {
                __typename: "Museum",
                id: 16357,
                name: "SPACE MUSEUM",
                streetAddress: "116 E SCHOOL ST",
                city: "BONNE TERRE",
                state: "MO",
                latitude: 37.92174,
                longitude: -90.55071
              }
            }
          ],
          count: 99
        }
      }
    }
  },
  {
    request: {
      query: GET_MUSEUM_LIST,
      variables: {
        query: "Give me an error!"
      }
    },
    error: new Error("An error happened!")
  }
];

describe("MuseumList component", () => {
  function mountWithContext(element: JSX.Element) {
    return mount(<MockedProvider mocks={mocks}>{element}</MockedProvider>);
  }

  it("Renders initially with a loading indicator.", () => {
    const wrapper = mountWithContext(<MuseumList query="space" />);
    expect(toJson(wrapper.find("MuseumList").children())).toMatchSnapshot();
  });

  it("Renders the museum list.", async () => {
    const wrapper = mountWithContext(<MuseumList query="space" />);
    await wait(0);
    wrapper.update();
    expect(toJson(wrapper.find("MuseumList").children())).toMatchSnapshot();
  });

  it("Renders an error.", async () => {
    const wrapper = mountWithContext(<MuseumList query="Give me an error!" />);
    await wait(2);
    wrapper.update();
    expect(toJson(wrapper.find("MuseumList").children())).toMatchSnapshot();
  });
});
