import { Field, Form, Formik } from "formik";
import gql from "graphql-tag";
import React from "react";
import { Query } from "react-apollo";
import Head from "../components/head";
import { MuseumList } from "../components/search/MuseumList";

const GET_MUSEUMS = gql`
  query($query: String! = "museum") {
    museums(query: $query, first: 500) {
      edges {
        node {
          id
          name
          streetAddress
          city
          state
          latitude
          longitude
        }
        cursor
      }
      count
    }
  }
`;

export default class MuseumSearch extends React.Component {
  render() {
    return (
      <div className="container-fluid">
        <Head title="Museum search" />
        <h1>Museum Search</h1>
        <Query query={GET_MUSEUMS}>
          {({ loading, error, data, refetch }) => (
            <div>
              <Formik
                initialValues={{ query: "" }}
                onSubmit={values => refetch(values)}
              >
                <Form>
                  <Field
                    className="form-control"
                    autoComplete="off"
                    style={{ width: 460 }}
                    name="query"
                  />
                </Form>
              </Formik>
              {loading ? (
                "Loading..."
              ) : error ? (
                <div className="alert alert-danger">{error.message}</div>
              ) : (
                <MuseumList museumConnection={data.museums || []} />
              )}
            </div>
          )}
        </Query>
      </div>
    );
  }
}
