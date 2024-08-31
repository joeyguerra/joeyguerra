FROM node:20-alpine3.17 AS build
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
USER appuser

ENTRYPOINT ["npm", "start"]