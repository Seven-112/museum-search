import { shallow } from "enzyme";
import { FunctionComponent } from "react";
import { ApolloProvider } from "react-apollo";
import MyApp from "../../pages/_app";

describe("MyApp component", () => {
  it("Renders the App wrapper.", () => {
    const mockPush = jest.fn();

    const mockRouter = {
      asPath: "/example-path?a=b",
      push: mockPush
    } as any;

    const TestComponent: FunctionComponent = () => <div />;

    const wrapper = shallow(
      <MyApp
        Component={TestComponent}
        pageProps={{ exampleProp: "exampleValue" }}
        router={mockRouter}
      />
    );

    // The first browser render should be empty.
    expect(wrapper.html()).toEqual(null);

    expect(mockPush).lastCalledWith("/example-path?a=b");
    // Normally the router would update the app wrapper, but the mock doesn't, so we force a
    // re-render in the test.
    wrapper.instance().forceUpdate();
    wrapper.update();

    // Renders the Apollo provider.
    expect(wrapper.find(ApolloProvider).exists()).toEqual(true);

    const innerComponent = wrapper.find(TestComponent);
    expect(innerComponent.prop("exampleProp")).toEqual("exampleValue");
  });
});
