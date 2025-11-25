#!/bin/bash
set -e
npm version patch --no-git-tag-version
VERSION=$(node -p "require('./package.json').version")
sed -i '' -e "s|local/jbot-website:[0-9]*\.[0-9]*\.[0-9]*|local/jbot-website:$VERSION|g" charts/web/deployment.yaml
docker build -t local/jbot-website:$VERSION .
k3d image import local/jbot-website:$VERSION -c ${KUBE_CLUSTER:-local}
