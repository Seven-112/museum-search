import { Field, Form, Formik } from "formik";
import { debounce } from "lodash";
import dynamic from "next/dynamic";
import { withRouter, WithRouterProps } from "next/router";
import React from "react";
import { Head } from "../components/Head";
import { MuseumList } from "../components/search/MuseumList";
import { IMuseumMapProps, MoveHandler } from "../components/search/MuseumMap";

interface IMuseumSearchPageQuery {
  q?: string;
}

interface IMuseumSearchPageState {
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
    height: 100%;
  }
`;

// Only load the MuseumMap component in the browser because Leaflet causes SSR to fail.
const MuseumMap = dynamic<IMuseumMapProps>(
  (async () =>
    (await import("../components/search/MuseumMap")).MuseumMap) as any,
  { ssr: false }
);

export class MuseumSearchPage extends React.Component<
  WithRouterProps<IMuseumSearchPageQuery>,
  IMuseumSearchPageState
> {
  public state: IMuseumSearchPageState = {};

  private listContainer: HTMLDivElement;

  private onMapMove = debounce<MoveHandler>(event => {
    const box = event.target.getBounds();

    this.setState({
      boundingBox: {
        bottom: box.getSouth(),
        left: box.getWest(),
        right: box.getEast(),
        top: box.getNorth()
      }
    });
  }, 200);

  public componentDidMount() {
    const resizeListContainer = () => {
      if (this.listContainer) {
        const listHeight =
          window.innerHeight -
          this.listContainer.getBoundingClientRect().top -
          1;
        this.listContainer.style.height = `${listHeight}px`;
      }
    };

    window.onresize = resizeListContainer;
    resizeListContainer();
  }

  public render() {
    const { router } = this.props;
    const { boundingBox } = this.state;

    return (
      <div className="container-fluid">
        <style>{MUSEUMSEARCH_PAGE_CSS}</style>
        <Head title="Museum Search" />
        <div>
          <h1>Museum Search</h1>
        </div>
        <div className="row">
          <div className="col-md-3 p-0 card">
            <div className="card-body">
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
            <div
              className="list-container"
              ref={node => (this.listContainer = node)}
              style={{ overflowY: "scroll" }}
            >
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

  private search({ q }: IMuseumSearchPageQuery) {
    const { router } = this.props;

    router.push({
      pathname: "/",
      query: { q }
    });
  }
}

export default withRouter(MuseumSearchPage);
