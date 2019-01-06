import { Field, Form, Formik } from "formik";
import { debounce } from "lodash";
import dynamic from "next/dynamic";
import { withRouter, WithRouterProps } from "next/router";
import React from "react";
import Head from "../components/head";
import { MuseumList } from "../components/search/MuseumList";
import { MuseumListQuery } from "../components/search/MuseumListQuery";
import { MoveHandler, MuseumMapProps } from "../components/search/MuseumMap";
import { MuseumMapQuery } from "../components/search/MuseumMapQuery";

interface MuseumSearchPageQuery {
  q?: string;
  within?: string;
}

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

const MuseumMap = dynamic<MuseumMapProps>(
  (async () =>
    (await import("../components/search/MuseumMap")).MuseumMap) as any,
  { ssr: false }
);

class MuseumSearchPage extends React.Component<
  WithRouterProps<MuseumSearchPageQuery>
> {
  search({ q, within }: MuseumSearchPageQuery) {
    const { router } = this.props;

    router.push({
      pathname: "/index",
      query: {
        q: q || router.query.q,
        within: within || router.query.within
      }
    });
  }

  onMapMove = debounce<MoveHandler>(box => {
    this.search({
      within: JSON.stringify({
        topLeft: {
          latitude: box.getNorth(),
          longitude: box.getWest()
        },
        bottomRight: {
          latitude: box.getSouth(),
          longitude: box.getEast()
        }
      })
    });
  }, 200);

  render() {
    const { router } = this.props;

    return (
      <div className="container-fluid d-flex flex-column flex-fill">
        <style>{MUSEUMSEARCH_PAGE_CSS}</style>
        <Head title="Museum Search" />
        <div className="row flex-shrink-0">
          <h1 className="col-12">Museum Search</h1>
        </div>
        <MuseumListQuery variables={{ query: router.query.q || "museums" }}>
          {({ loading, error, data }) => (
            <div className="row flex-fill">
              <div className="col-md-3">
                <div className="card card-body h-100">
                  <Formik
                    initialValues={{ query: router.query.q }}
                    onSubmit={values => this.search({ q: values.query })}
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
                <MuseumMapQuery
                  variables={{
                    query: router.query.q || "",
                    boundingBox:
                      JSON.parse(router.query.within || null) || undefined
                  }}
                >
                  {({ data }) => (
                    <MuseumMap
                      onMove={this.onMapMove}
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

export default withRouter(MuseumSearchPage);
