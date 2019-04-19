import { mount } from "enzyme";
import { MockedProvider, MockedResponse } from "react-apollo/test-utils";
import { GET_MUSEUM_LIST, IMuseumListProps, MuseumList } from "../MuseumList";
// tslint:disable-next-line: no-var-requires
const wait = require("waait");

const DEFAULT_PROPS: IMuseumListProps = {
  onItemClick: () => undefined,
  onItemHover: () => undefined
};

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

  it("Renders initially with a loading indicator.", async () => {
    const wrapper = mountWithContext(
      <MuseumList {...DEFAULT_PROPS} query="space" />
    );
    expect(wrapper.find(".list-group").text()).toEqual("Loading...");
  });

  it("Renders the museum list.", async () => {
    const wrapper = mountWithContext(
      <MuseumList {...DEFAULT_PROPS} query="space" />
    );
    await wait(0);
    wrapper.update();
    expect(
      wrapper
        .find("li strong")
        .first()
        .text()
    ).toEqual("SPACE GALLERY");
    expect(
      wrapper
        .find("li strong")
        .at(1)
        .text()
    ).toEqual("SPACE GALLERY");
    expect(
      wrapper
        .find("li strong")
        .at(2)
        .text()
    ).toEqual("SPACE MUSEUM");
  });

  it("Renders an error.", async () => {
    const wrapper = mountWithContext(
      <MuseumList {...DEFAULT_PROPS} query="Give me an error!" />
    );
    await wait(2);
    wrapper.update();
    expect(wrapper.find(".alert.alert-danger").text()).toEqual(
      "Network error: An error happened!"
    );
  });

  it("Provides an 'onItemHover' callback prop.", async () => {
    const mockOnHover = jest.fn();

    const wrapper = mountWithContext(
      <MuseumList {...DEFAULT_PROPS} onItemHover={mockOnHover} query="space" />
    );
    await wait(2);
    wrapper.update();

    const li = wrapper.find("li").first();

    li.props().onMouseEnter(null);
    expect(mockOnHover).lastCalledWith(
      expect.objectContaining({ name: "SPACE GALLERY" })
    );

    li.props().onMouseLeave(null);
    expect(mockOnHover).lastCalledWith(null);
  });

  it("Provides an 'onItemClick' callback prop.", async () => {
    const mockOnClick = jest.fn();

    const wrapper = mountWithContext(
      <MuseumList {...DEFAULT_PROPS} onItemClick={mockOnClick} query="space" />
    );

    await wait(2);
    wrapper.update();

    const li = wrapper.find("li").first();

    li.props().onClick(null);
    expect(mockOnClick).lastCalledWith(
      expect.objectContaining({ name: "SPACE GALLERY" })
    );
  });
});
