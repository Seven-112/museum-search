import { Field, Form, Formik } from "formik";
import React from "react";
import Head from "../components/head";
import { MuseumList } from "../components/search/MuseumList";
import { MuseumListQuery } from "../components/search/MuseumListQuery";
import { MuseumMap } from "../components/search/MuseumMap";
import { MuseumMapQuery } from "../components/search/MuseumMapQuery";

/**
 * Makes this page non-vertically-scrollable.
 */
const MUSEUMSEARCH_PAGE_CSS = `
  html, body {
    margin: 0;
    height: 100%
  }
  #__next {
    display: flex;
    flex-flow: column;
    height: 100%;
  }
`;

export default class MuseumSearch extends React.Component {
  render() {
    return (
      <div className="container-fluid d-flex flex-column flex-fill">
        <style>{MUSEUMSEARCH_PAGE_CSS}</style>
        <Head title="Museum Search" />
        <div className="row flex-shrink-0">
          <h1 className="col-12">Museum Search</h1>
        </div>
        <MuseumListQuery>
          {({ loading, error, data, refetch, variables }) => (
            <div className="row flex-fill">
              <div className="col-md-3">
                <div className="card card-body h-100">
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
                  <div style={{ overflowY: "scroll" }}>
                    <MuseumList
                      loading={loading}
                      error={error && error.message}
                      museumConnection={data && data.museums}
                    />
                  </div>
                </div>
              </div>
              <div className="col-md-9">
                <MuseumMapQuery variables={{ query: variables.query }}>
                  {({ data }) => (
                    <MuseumMap
                      museumMapObjects={data && data.museumMapObjects}
                    />
                  )}
                </MuseumMapQuery>
              </div>
            </div>
          )}
        </MuseumListQuery>
      </div>
    );
  }
}
