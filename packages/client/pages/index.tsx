import { Field, Form, Formik } from "formik";
import { LatLngExpression } from "leaflet";
import { debounce } from "lodash";
import dynamic from "next/dynamic";
import { withRouter, WithRouterProps } from "next/router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Map } from "react-leaflet";
import { Coordinate, GeoBoundingBoxInput } from "../__generated__/globalTypes";
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
  const initialCenter: LatLngExpression = [38.810338, -98.323266];

  const listContainer = useRef<HTMLDivElement>();
  const leafletMap = useRef<Map>();

  const [boundingBox, setBoundingBox] = useState<GeoBoundingBoxInput>();
  const [highlightedMuseum, setHighlightedMuseum] = useState<object>();

  /** Coordinate from which to sort the museum list query by geo-distance. */
  const listSearchCoordinate: Coordinate = boundingBox
    ? {
        latitude: (boundingBox.top + boundingBox.bottom) / 2,
        longitude: (boundingBox.left + boundingBox.right) / 2
      }
    : {
        latitude: initialCenter[0],
        longitude: initialCenter[1]
      };

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
    leafletMap.current.leafletElement.flyTo([latitude, longitude], 15, {
      duration: 1
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
              location={listSearchCoordinate}
              onItemClick={flyToMuseum}
              onItemHover={setHighlightedMuseum}
              query={router.query.q}
            />
          </div>
        </div>
        <div className="col-md-9 p-0">
          <MuseumMap
            boundingBox={boundingBox}
            initialCenter={initialCenter}
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
