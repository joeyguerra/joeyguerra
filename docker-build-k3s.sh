#!/bin/bash
set -e
npm version patch --no-git-tag-version
VERSION=$(node -p "require('./package.json').version")
sed -i '' -e "s|local/jbot-website:[0-9]*\.[0-9]*\.[0-9]*|local/jbot-website:$VERSION|g" charts/web/deployment.yaml
docker build --load -t local/jbot-website:$VERSION .
docker save "local/jbot-website:$VERSION" | limactl shell "${LIMA_INSTANCE:-k3s}" -- sudo k3s ctr images import -
