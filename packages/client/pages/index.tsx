import { Field, Form, Formik } from "formik";
import { debounce } from "lodash";
import dynamic from "next/dynamic";
import { withRouter, WithRouterProps } from "next/router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Map } from "react-leaflet";
import { Head } from "../components/Head";
import { MuseumList } from "../components/search/MuseumList";
import {
  IBoundingBox,
  IMuseumMapProps,
  MoveHandler
} from "../components/search/MuseumMap";

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
  const leafletMap = useRef<Map>();

  const [boundingBox, setBoundingBox] = useState<IBoundingBox>();
  const [highlightedMuseum, setHighlightedMuseum] = useState<object>();

  // Memoize the debounced mapMove so that the debounce timeout is carried over on re-renders.
  // Re-rendering should not reset the debounce timeout.
  const onMapMove = useMemo(
    () => debounce<MoveHandler>(setBoundingBox, 200),
    []
  );

  function search({ q }: IMuseumSearchPageQuery) {
    router.push({
      pathname: "/",
      query: { q }
    });
  }

  function flyToMuseum({ latitude, longitude }: any) {
    leafletMap.current.leafletElement.flyTo([latitude, longitude], 15);
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
              onItemClick={flyToMuseum}
              onItemHover={setHighlightedMuseum}
              query={router.query.q || "museum"}
            />
          </div>
        </div>
        <div className="col-md-9 p-0">
          <MuseumMap
            boundingBox={boundingBox}
            highlightedMuseum={highlightedMuseum}
            leafletMapRef={leafletMap}
            query={router.query.q}
            onMove={onMapMove}
          />
        </div>
      </div>
    </div>
  );
}

export default withRouter(MuseumSearchPage);
