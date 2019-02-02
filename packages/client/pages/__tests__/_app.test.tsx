import { shallow } from "enzyme";
import Router from "next/router";
import { FunctionComponent } from "react";
import MyApp from "../_app";
import { ApolloProvider } from "react-apollo";

jest.mock("next/router", () => ({}));

describe("MyApp component", () => {
  it("Renders with the ApolloProvider.", () => {
    const TestComponent: FunctionComponent = () => <div />;

    const wrapper = shallow(
      <MyApp
        Component={TestComponent}
        pageProps={{ exampleProp: "exampleValue" }}
        router={Router}
      />
    );

    expect(wrapper.find(ApolloProvider).children()).toMatchSnapshot(
      "MyApp shallow render."
    );
  });
});
