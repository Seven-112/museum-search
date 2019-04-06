import { mount, shallow } from "enzyme";
import { Formik } from "formik";
import { MockedProvider } from "react-apollo/test-utils";
import { MuseumList } from "../../components/search/MuseumList";
import { MuseumSearchPage } from "../index";

describe("MuseumSearchPage component", () => {
  it("Shallow renders.", () => {
    const mockRouter = {
      query: {}
    };
    const wrapper = shallow(<MuseumSearchPage router={mockRouter as any} />);
    expect(wrapper).toMatchSnapshot("MuseumSearchPage shallow render.");
  });

  it("Performs a search using the search input.", () => {
    const mockRouterPush = jest.fn();

    const mockRouter = {
      push: mockRouterPush,
      query: {}
    };
    const wrapper = shallow(<MuseumSearchPage router={mockRouter as any} />);

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
    const wrapper = shallow(<MuseumSearchPage router={mockRouter as any} />);

    // The MuseumMap loaded dynamically, so it is selected as "LoadableComponent".
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
    const wrapper = shallow(<MuseumSearchPage router={mockRouter as any} />);

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
});
