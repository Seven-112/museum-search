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

  constructor(props) {
    super(props);

    // Apollo needs introspection data about fragment types or else it spams the console with errors.
    // See: validation and accurate fragment
    const fragmentMatcher = new IntrospectionFragmentMatcher({
      introspectionQueryResultData: fragmentTypes
    });
    const cache = new InMemoryCache({ fragmentMatcher });
    this.client = new ApolloClient({ cache });
  }

  public render() {
    const { Component, pageProps } = this.props;

    return (
      <ApolloProvider client={this.client}>
        <Container>
          <Component {...pageProps} />
        </Container>
      </ApolloProvider>
    );
  }
}
