import { shallow } from "enzyme";
import { Head } from "../Head";
import toJson from "enzyme-to-json";

describe("Head component", () => {
  it("Renders.", () => {
    const wrapper = shallow(<Head title="Page Title" />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });
});
