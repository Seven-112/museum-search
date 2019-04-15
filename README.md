# museum-search
[![Build Status](https://travis-ci.org/PoffM/museum-search.svg?branch=master)](https://travis-ci.org/PoffM/museum-search)
[![Test Coverage](https://api.codeclimate.com/v1/badges/9e855a9c995a3c935ecd/test_coverage)](https://codeclimate.com/github/PoffM/museum-search/test_coverage)
[![Maintainability](https://api.codeclimate.com/v1/badges/9e855a9c995a3c935ecd/maintainability)](https://codeclimate.com/github/PoffM/museum-search/maintainability)

Multi-container application providing a UI and GraphQL API to search museum names and locations.

You can filter the search results in the list and map UI using a keyword search. Zoom
in on the map to get museum counts by more precise areas and see labeled pins on the map for
individual museums.

![Screenshot](/docs/screenshot.png)

## Stack

This application runs on a multi-container stack including:

* Front-end: My TypeScript/React application with a list+map UI using [react-apollo](https://github.com/apollographql/react-apollo) to query the back-end.
* Back-end: My TypeScript/Node.js application using [apollo-server](https://github.com/apollographql/apollo-server) to provide a GraphQL API for searching museums.
* ElasticSearch: A third-party search engine I use to search+filter museums by keyword and geospatial criteria.

## Continuous Integration / Continuous Delivery

This repo uses Travis for continuous integration.

On every commit and pull request, Travis runs the test suite, and reports success/failure and test
coverage. It sends the test reports to CodeClimate, which provides code quality analysis and test
coverage reports.

On every tagged commit to master, Travis builds and pushes the API and client docker images to
Docker Hub with the Git tag as the Docker tag.

[API Docker image](https://hub.docker.com/r/poffm/museum-search-server)

[Client Docker image](https://hub.docker.com/r/poffm/museum-search-client)

## To launch:

From this repo's top directory, run:

```bash
docker-compose up
```

This will launch the application with no data.

## To add data:

This can be done while the app is running.

1. Get "museums.csv" from https://www.kaggle.com/imls/museum-directory
2. Put museums.csv in the "data" directory at the top of this repo.
3. From this repo's top directory, run:

```
docker-compose run -e MUSEUMS_CSV=/data/museums.csv museum-api-migrate
```

- Note: The "/data/museums.csv" in this command refers to a path inside the museum-api-migrate container, but the "data" directory in this path is a volume that links to this repo's "data" directory. This is how the museum-api-migrate container can read the csv file that is pasted into this repo's data directory.

## Access the front-end application:

Go to \<dockerhost\> in your browser, where \<dockerhost\> is the host IP running docker. This could be localhost, or 192.168.99.100 for docker-machine on Windows.

## Access the GraphQL Playground UI:

Go to \<dockerhost\>:4000 in your browser, where \<dockerhost\> is the host IP running docker. This could be localhost, or 192.168.99.100 for docker-machine on Windows.
