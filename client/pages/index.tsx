import { Field, Form, Formik } from "formik";
import React from "react";
import Head from "../components/head";
import { MuseumList } from "../components/search/MuseumList";
import { MuseumListQuery } from "../components/search/MuseumListQuery";
import { MuseumMap } from "../components/search/MuseumMap";

export default class MuseumSearch extends React.Component {
  render() {
    return (
      <div className="container-fluid d-flex flex-column flex-fill">
        <style>
          {/* Makes this page non-vertically-scrollable */}
          {`
            html, body {
              margin: 0;
              height: 100%
            }
            #__next {
              display: flex;
              flex-flow: column;
              height: 100%;
            }
          `}
        </style>
        <Head title="Museum Search" />
        <div className="row flex-shrink-0">
          <h1 className="col-12">Museum Search</h1>
        </div>
        <MuseumListQuery>
          {({ loading, error, data, refetch }) => (
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
                  <div
                    className="h-100 flex-fill"
                    style={{ overflowY: "scroll" }}
                  >
                    <MuseumList
                      loading={loading}
                      error={error && error.message}
                      museumConnection={data && data.museums}
                    />
                  </div>
                </div>
              </div>
              <div className="col-md-9">
                <MuseumMap />
              </div>
            </div>
          )}
        </MuseumListQuery>
      </div>
    );
  }
}
