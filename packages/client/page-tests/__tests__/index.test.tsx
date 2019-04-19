import { mount } from "enzyme";
import { Formik } from "formik";
import { MockedProvider } from "react-apollo/test-utils";
import { act } from "react-dom/test-utils";
import { Map } from "react-leaflet";
import { MuseumList } from "../../components/search/MuseumList";
import { MuseumMap } from "../../components/search/MuseumMap";
import { MuseumSearchPage } from "../../pages/index";

jest.mock("next/dynamic", () => () =>
  require("../../components/search/MuseumMap").MuseumMap
);

const MOCK_ROUTER = { query: {} } as any;

describe("MuseumSearchPage component", () => {
  it("Renders the museum search page.", () => {
    const wrapper = mount(
      <MockedProvider>
        <MuseumSearchPage router={MOCK_ROUTER} />
      </MockedProvider>
    );

    // Has the title.
    expect(wrapper.containsMatchingElement(<h1>Museum Search</h1>)).toEqual(
      true
    );
    // Has the search input.
    expect(wrapper.find("input[placeholder='Search...']").exists()).toEqual(
      true
    );
    // Has the museum list.
    expect(wrapper.find(MuseumList).exists()).toEqual(true);
    expect(wrapper.find(MuseumMap).exists()).toEqual(true);
  });

  it("Performs a search using the search input.", () => {
    const mockRouterPush = jest.fn();

    const mockRouter = {
      push: mockRouterPush,
      query: {}
    };
    const wrapper = mount(
      <MockedProvider>
        <MuseumSearchPage router={mockRouter as any} />
      </MockedProvider>
    );

    // Submit the search form.
    (wrapper.find(Formik).prop("onSubmit") as any)({ query: "space museum" });

    expect(mockRouterPush).toHaveBeenCalledTimes(1);
    expect(mockRouterPush).lastCalledWith({
      pathname: "/",
      query: { q: "space museum" }
    });
  });

  it("Performs a bounding-box search when the map is moved.", () => {
    // Un-debounce the onMapMove function for this test.
    jest.spyOn(require("lodash"), "debounce").mockImplementationOnce(fn => fn);

    const wrapper = mount(
      <MockedProvider>
        <MuseumSearchPage router={MOCK_ROUTER} />
      </MockedProvider>
    );

    act(() => {
      wrapper.find(MuseumMap).prop("onMove")({
        bottom: 3,
        left: 2,
        right: 4,
        top: 1
      });
    });

    wrapper.update();

    expect(wrapper.find(MuseumMap).prop("boundingBox")).toEqual({
      bottom: 3,
      left: 2,
      right: 4,
      top: 1
    });
  });

  it("Passes the search query into child components.", () => {
    const mockRouter = {
      query: { q: "zoo" }
    };
    const wrapper = mount(
      <MockedProvider>
        <MuseumSearchPage router={mockRouter as any} />
      </MockedProvider>
    );

    expect(wrapper.find(MuseumList).prop("query")).toEqual("zoo");
    expect(wrapper.find(MuseumMap).prop("query")).toEqual("zoo");
  });

  it("Resizes the list container after the page mounts and after the window resizes.", () => {
    (window.innerHeight as any) = 768;
    const wrapper = mount(
      <MockedProvider>
        <MuseumSearchPage router={MOCK_ROUTER} />
      </MockedProvider>
    );

    const listContainer = wrapper.find(".list-container").getDOMNode();

    // The list container's height should be the available space minus 1.
    // (Page elements' heights above the list are ignored for the test.)
    expect(listContainer.getAttribute("style")).toEqual(
      "overflow-y: scroll; height: 767px;"
    );

    // Test a window resize:
    (window.innerHeight as any) = 500;
    window.onresize(null);

    expect(listContainer.getAttribute("style")).toEqual(
      "overflow-y: scroll; height: 499px;"
    );
  });

  it("Passes a museum to the map to be highlighted when a museum in the list is hovered.", () => {
    const wrapper = mount(
      <MockedProvider>
        <MuseumSearchPage router={MOCK_ROUTER} />
      </MockedProvider>
    );

    const testMuseum = { latitude: 37.750982, longitude: -85.363281 };

    // Hover a list item.
    act(() => {
      wrapper
        .find(MuseumList)
        .props()
        .onItemHover(testMuseum);
    });

    wrapper.update();

    expect(wrapper.find(MuseumMap).prop("highlightedMuseum")).toBe(testMuseum);
  });

  it("Flies to a museum on the map when the museum's list item is clicked.", () => {
    const wrapper = mount(
      <MockedProvider>
        <MuseumSearchPage router={MOCK_ROUTER} />
      </MockedProvider>
    );

    const leafletMapRef: React.MutableRefObject<Map> = wrapper
      .find(MuseumMap)
      .prop("leafletMapRef") as React.MutableRefObject<Map>;

    // Spy on leaflet's flyTo function.
    const flyToSpy = jest.spyOn(leafletMapRef.current.leafletElement, "flyTo");

    const testMuseum = { latitude: 37.750982, longitude: -85.363281 };

    // Click a list item.
    act(() => {
      wrapper
        .find(MuseumList)
        .props()
        .onItemClick(testMuseum);
    });

    expect(flyToSpy).lastCalledWith([37.750982, -85.363281], 15);
  });
});
