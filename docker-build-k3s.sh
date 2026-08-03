#!/bin/bash
set -e
export DOCKER_HOST="${DOCKER_HOST:-unix://${HOME}/.colima/default/docker.sock}"
VERSION=$(git rev-parse --short HEAD)
sed -i '' -e "s|local/jbot-website:[^ ]*|local/jbot-website:$VERSION|g" charts/web/deployment.yaml
docker build --load -t local/jbot-website:$VERSION .
docker save "local/jbot-website:$VERSION" | limactl shell "${LIMA_INSTANCE:-k3s}" -- sudo k3s ctr images import -
