import { shallow } from "enzyme";
import { Formik } from "formik";
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

  it("Performs a bounding-box search when the map is moved.", async () => {
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

  it("Passes the search query into child components.", async () => {
    const mockRouter = {
      query: { q: "zoo" }
    };
    const wrapper = shallow(<MuseumSearchPage router={mockRouter as any} />);

    expect(wrapper.find(MuseumList).prop("query")).toEqual("zoo");

    // The MuseumMap loaded dynamically, so it is selected as "LoadableComponent".
    expect(wrapper.find("LoadableComponent").prop("query")).toEqual("zoo");
  });
});
