import { mount } from "enzyme";
import { Formik } from "formik";
import { MockedProvider } from "react-apollo/test-utils";
import { act } from "react-dom/test-utils";
import { MuseumList } from "../../components/search/MuseumList";
import { MuseumSearchPage } from "../../pages/index";

describe("MuseumSearchPage component", () => {
  it("Renders the museum search page.", () => {
    const mockRouter = {
      query: {}
    };
    const wrapper = mount(
      <MockedProvider>
        <MuseumSearchPage router={mockRouter as any} />
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
    // Has the museum map, which is loaded dynamically, so it is selected as "LoadableComponent".
    expect(wrapper.find("LoadableComponent").exists()).toEqual(true);
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

    const mockRouter = {
      query: {}
    };
    const wrapper = mount(
      <MockedProvider>
        <MuseumSearchPage router={mockRouter as any} />
      </MockedProvider>
    );

    act(() => {
      // The MuseumMap is loaded dynamically, so it is selected as "LoadableComponent".
      (wrapper.find("LoadableComponent").prop("onMove") as any)({
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
      });
    });

    wrapper.update();

    expect(wrapper.find("LoadableComponent").prop("boundingBox")).toEqual({
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

    // The MuseumMap loaded dynamically, so it is selected as "LoadableComponent".
    expect(wrapper.find("LoadableComponent").prop("query")).toEqual("zoo");
  });

  it("Resizes the list container after the page mounts and after the window resizes.", () => {
    (window.innerHeight as any) = 768;
    const mockRouter = {
      query: {}
    };
    const wrapper = mount(
      <MockedProvider>
        <MuseumSearchPage router={mockRouter as any} />
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
    const mockRouter = {
      query: {}
    };
    const wrapper = mount(
      <MockedProvider>
        <MuseumSearchPage router={mockRouter as any} />
      </MockedProvider>
    );

    const testMuseum = {};

    act(() => {
      wrapper
        .find(MuseumList)
        .props()
        .onItemHover(testMuseum);
    });

    wrapper.update();

    expect(wrapper.find("LoadableComponent").prop("highlightedMuseum")).toBe(
      testMuseum
    );
  });
});
