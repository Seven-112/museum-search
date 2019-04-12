import { mount } from "enzyme";
import { LoadingSpinner } from "../LoadingSpinner";

describe("LoadingSpinner component", () => {
  it("Renders a loading spinner when the loading prop is true.", () => {
    const wrapper = mount(<LoadingSpinner loading={true} />);
    expect(
      wrapper.containsMatchingElement(
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="sr-only">Loading...</span>
          </div>
        </div>
      )
    ).toEqual(true);
  });
  it("Renders null when the loading prop is false.", () => {
    const wrapper = mount(<LoadingSpinner loading={false} />);
    expect(wrapper.html()).toEqual(null);
  });
});
