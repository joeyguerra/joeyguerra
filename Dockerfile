FROM node:22-alpine3.19 AS build
WORKDIR /app
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
RUN apk add --update --no-cache
COPY --chown=appuser:appgroup . .
RUN npm ci
RUN chown -R appuser:appgroup /app
USER appuser

ENTRYPOINT ["node", "--run", "start"]