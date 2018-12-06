import ApolloClient from "apollo-boost";
import "isomorphic-fetch";
import App, { Container } from "next/app";
import React from "react";
import { ApolloProvider } from "react-apollo";

const client = new ApolloClient();

export default class MyApp extends App {
  static async getInitialProps({ Component, ctx }) {
    let pageProps = {};

    if (Component.getInitialProps) {
      pageProps = await Component.getInitialProps(ctx);
    }

    return { pageProps };
  }

  render() {
    const { Component, pageProps } = this.props;

    return (
      <ApolloProvider client={client}>
        <Container>
          <Component {...pageProps} />
        </Container>
      </ApolloProvider>
    );
  }
}
