import { Field, Form, Formik } from "formik";
import gql from "graphql-tag";
import React from "react";
import { Query } from "react-apollo";
import Head from "../components/head";
import { MuseumList } from "../components/search/MuseumList";

const GET_MUSEUMS = gql`
  query($query: String! = "museum") {
    museums(query: $query, first: 200) {
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
        <Query query={GET_MUSEUMS}>
          {({ loading, error, data, refetch }) => (
            <div className="card col-md-3">
              <h1>Museum Search</h1>
              <Formik
                initialValues={{ query: "" }}
                onSubmit={values => refetch(values)}
              >
                <Form>
                  <Field
                    className="form-control form-group"
                    autoComplete="off"
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
