import { Field, Form, Formik } from "formik";
import { debounce } from "lodash";
import dynamic from "next/dynamic";
import { withRouter, WithRouterProps } from "next/router";
import React, { useEffect, useRef, useState } from "react";
import { Head } from "../components/Head";
import { MuseumList } from "../components/search/MuseumList";
import { IMuseumMapProps, MoveHandler } from "../components/search/MuseumMap";

interface IMuseumSearchPageQuery {
  q?: string;
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

export function MuseumSearchPage({
  router
}: WithRouterProps<IMuseumSearchPageQuery>) {
  const listContainer = useRef<HTMLDivElement>();

  const [boundingBox, setBoundingBox] = useState<object>();
  const [highlightedMuseum, setHighlightedMuseum] = useState<object>();

  function onListItemHover(museum: object) {
    setHighlightedMuseum(museum);
  }

  const onMapMove = debounce<MoveHandler>(event => {
    const box = event.target.getBounds();

    setBoundingBox({
      bottom: box.getSouth(),
      left: box.getWest(),
      right: box.getEast(),
      top: box.getNorth()
    });
  }, 200);

  function search({ q }: IMuseumSearchPageQuery) {
    router.push({
      pathname: "/",
      query: { q }
    });
  }

  useEffect(() => {
    const resizeListContainer = () => {
      const listHeight =
        window.innerHeight -
        listContainer.current.getBoundingClientRect().top -
        1;
      listContainer.current.style.height = `${listHeight}px`;
    };

    window.onresize = resizeListContainer;
    resizeListContainer();
  });

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
              onSubmit={values => search({ q: values.query })}
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
            ref={listContainer}
            style={{ overflowY: "scroll" }}
          >
            <MuseumList
              onItemHover={onListItemHover}
              query={router.query.q || "museum"}
            />
          </div>
        </div>
        <div className="col-md-9 p-0">
          <MuseumMap
            boundingBox={boundingBox}
            highlightedMuseum={highlightedMuseum}
            query={router.query.q}
            onMove={onMapMove}
          />
        </div>
      </div>
    </div>
  );
}

export default withRouter(MuseumSearchPage);
