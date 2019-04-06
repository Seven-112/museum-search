import { shallow } from "enzyme";
import toJson from "enzyme-to-json";
import { Head } from "../Head";

describe("Head component", () => {
  it("Renders.", () => {
    const wrapper = shallow(<Head title="Page Title" />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });
});
