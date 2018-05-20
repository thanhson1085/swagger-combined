#!/bin/bash
set -e

set +v
echo "TRAVIS_BRANCH=$TRAVIS_BRANCH"
echo "TRAVIS_EVENT_TYPE=$TRAVIS_EVENT_TYPE"
echo "TRAVIS_TAG=$TRAVIS_TAG"

docker build --tag $DOCKER_IMAGE .

set +v
if [ "$TRAVIS_EVENT_TYPE" == "push" ]; then
  if [ "$TRAVIS_BRANCH" == "develop" ] || [ "$TRAVIS_BRANCH" == "master" ]; then
    if [ "$TRAVIS_BRANCH" == "develop" ]; then docker tag $DOCKER_IMAGE $DOCKER_REPO:dev-latest; fi;
    if [ "$TRAVIS_BRANCH" == "master" ]; then docker tag $DOCKER_IMAGE $DOCKER_REPO:latest; fi;
    set -v
    docker login -u="$DOCKER_USERNAME" -p="$DOCKER_PASSWORD" quay.io;
    docker push $DOCKER_REPO;
  fi
fi
