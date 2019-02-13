# museum-search
[![Build Status](https://travis-ci.org/PoffM/museum-search.svg?branch=master)](https://travis-ci.org/PoffM/museum-search)
[![Test Coverage](https://api.codeclimate.com/v1/badges/9e855a9c995a3c935ecd/test_coverage)](https://codeclimate.com/github/PoffM/museum-search/test_coverage)
[![Maintainability](https://api.codeclimate.com/v1/badges/9e855a9c995a3c935ecd/maintainability)](https://codeclimate.com/github/PoffM/museum-search/maintainability)

Multi-container application providing a UI and GraphQL API to search museum names and locations.

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

## Front-end application:

Go to \<dockerhost\> in your browser, where \<dockerhost\> is the host IP running docker. This could be localhost, or 192.168.99.100 for docker-machine on Windows.

## GraphQL Playground UI:

Go to \<dockerhost\>:4000 in your browser, where \<dockerhost\> is the host IP running docker. This could be localhost, or 192.168.99.100 for docker-machine on Windows.
