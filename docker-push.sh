#!/bin/bash
docker build -t poffm/museum-search-server:"$TRAVIS_TAG" -f Dockerfile.server .
docker build -t poffm/museum-search-client:"$TRAVIS_TAG" -f Dockerfile.client .

echo "$DOCKER_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin

docker push poffm/museum-search-server:"$TRAVIS_TAG"
docker push poffm/museum-search-client:"$TRAVIS_TAG"
