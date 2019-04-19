import ApolloClient, {
  InMemoryCache,
  IntrospectionFragmentMatcher
} from "apollo-boost";
import "isomorphic-fetch";
import App, { Container } from "next/app";
import React from "react";
import { ApolloProvider } from "react-apollo";
import { fragmentTypes } from "../fragmentTypes";

export default class MyApp extends App {
  private client: ApolloClient<{}>;
  private hasMounted = false;

  constructor(props) {
    super(props);

    // Apollo needs introspection data about fragment types or else it spams the console with errors.
    const fragmentMatcher = new IntrospectionFragmentMatcher({
      introspectionQueryResultData: fragmentTypes
    });
    const cache = new InMemoryCache({ fragmentMatcher });
    this.client = new ApolloClient({ cache });
  }

  public componentDidMount() {
    this.hasMounted = true;

    // Reload the page after the App is mounted in the browser, because Next.js does not pass in
    // the URL query string on the initial browser-side render.
    // https://github.com/zeit/next.js/issues/2910
    this.props.router.push(this.props.router.asPath);
  }

  public render() {
    const { Component, pageProps } = this.props;

    return (
      !this.isFirstBrowserRender() && (
        <ApolloProvider client={this.client}>
          <Container>
            <Component {...pageProps} />
          </Container>
        </ApolloProvider>
      )
    );
  }

  private isFirstBrowserRender() {
    const isRunningInBrowser = typeof window !== "undefined";
    return isRunningInBrowser && !this.hasMounted;
  }
}
