import { Field, Form, Formik } from "formik";
import { debounce } from "lodash";
import dynamic from "next/dynamic";
import { withRouter, WithRouterProps } from "next/router";
import React from "react";
import { Head } from "../components/Head";
import { MuseumList } from "../components/search/MuseumList";
import { MoveHandler, MuseumMapProps } from "../components/search/MuseumMap";

interface MuseumSearchPageQuery {
  q?: string;
}

interface MuseumSearchPageState {
  boundingBox?: object;
}

/**
 * Makes this page non-vertically-scrollable.
 */
const MUSEUMSEARCH_PAGE_CSS = `
  html, body {
    margin: 0;
    height: 100%;
  }
  #__next {
    display: flex;
    flex-flow: column;
    height: 100%;
  }
`;

// Only load the MuseumMap component in the browser because Leaflet causes SSR to fail.
const MuseumMap = dynamic<MuseumMapProps>(
  (async () =>
    (await import("../components/search/MuseumMap")).MuseumMap) as any,
  { ssr: false }
);

export class MuseumSearchPage extends React.Component<
  WithRouterProps<MuseumSearchPageQuery>,
  MuseumSearchPageState
> {
  state: MuseumSearchPageState = {};

  search({ q }: MuseumSearchPageQuery) {
    const { router } = this.props;

    router.push({
      pathname: "/",
      query: { q }
    });
  }

  onMapMove = debounce<MoveHandler>(event => {
    const box = event.target.getBounds();

    this.setState({
      boundingBox: {
        top: box.getNorth(),
        left: box.getWest(),
        bottom: box.getSouth(),
        right: box.getEast()
      }
    });
  }, 200);

  render() {
    const { router } = this.props;
    const { boundingBox } = this.state;

    return (
      <div className="container-fluid p-0 d-flex flex-column flex-fill">
        <style>{MUSEUMSEARCH_PAGE_CSS}</style>
        <Head title="Museum Search" />
        <div className="flex-shrink-0">
          <h1 className="col-12">Museum Search</h1>
        </div>
        <div className="d-flex flex-row h-100">
          <div className="d-flex flex-column flex-grow-1 card">
            <div className="card-body flex-grow-0">
              <Formik
                initialValues={{ query: router.query.q }}
                onSubmit={values => this.search({ q: values.query })}
              >
                <Form>
                  <Field
                    className="form-control"
                    autoComplete="off"
                    name="query"
                    placeholder="Search..."
                  />
                </Form>
              </Formik>
            </div>
            <div style={{ overflowY: "scroll" }}>
              <MuseumList query={router.query.q || "museum"} />
            </div>
          </div>
          <div className="col-md-9 p-0">
            <MuseumMap
              boundingBox={boundingBox}
              query={router.query.q}
              onMove={this.onMapMove}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default withRouter(MuseumSearchPage);
