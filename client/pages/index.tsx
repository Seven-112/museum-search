import { Field, Form, Formik } from "formik";
import React from "react";
import Head from "../components/head";
import { MuseumList } from "../components/search/MuseumList";
import { MuseumListQuery } from "../components/search/MuseumListQuery";
import { MuseumMap } from "../components/search/MuseumMap";

export default class MuseumSearch extends React.Component {
  render() {
    return (
      <div className="container-fluid">
        <Head title="Museum Search" />
        <MuseumListQuery>
          {({ loading, error, data, refetch }) => (
            <div>
              <div className="row">
                <h1 className="col-12">Museum Search</h1>
              </div>
              <div className="row">
                <div className="col-md-3">
                  <div className="card card-body">
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
                    <MuseumList
                      loading={loading}
                      error={error && error.message}
                      museumConnection={data && data.museums}
                    />
                  </div>
                </div>
                <div className="col-md-9">
                  <MuseumMap />
                </div>
              </div>
            </div>
          )}
        </MuseumListQuery>
      </div>
    );
  }
}
