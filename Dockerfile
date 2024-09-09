FROM node:22-alpine3.19 AS build
WORKDIR /app
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
RUN apk add --update --no-cache \
    build-base \
    cairo-dev \
    jpeg-dev \
    pango-dev \
    giflib-dev \
    libtool \
    terminus-font \
    ttf-inconsolata \
    ttf-dejavu \
    font-noto \
    font-noto-cjk \
    ttf-font-awesome \
    font-noto-extra
COPY --chown=appuser:appgroup . .
RUN npm ci
USER appuser

ENTRYPOINT ["node", "--run", "start"]