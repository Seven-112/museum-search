import "bootstrap/dist/css/bootstrap.min.css";
import "leaflet/dist/leaflet.css";
import NextHead from "next/head";

interface HeadProps {
  title: string;
}

export function Head({ title }: HeadProps) {
  return (
    <NextHead>
      <meta charSet="UTF-8" />
      <title>{title}</title>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="icon" href="/static/favicon.ico" />
    </NextHead>
  );
}
