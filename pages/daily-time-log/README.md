# Daily Time Log

Team-based time log built on Juphjacs with NDJSON event sourcing.

Route: /daily-time-log.html

Core files:
- index.mjs: Juphjacs Page metadata
- EventStore.mjs: append/read/project NDJSON events
- TimeLogApp.mjs: minimal app API for users/clients/projects/roles/time
- data/event-log.ndjson: event log storage

Quick start in Node:
```sh
node -e "import('./pages/daily-time-log/TimeLogApp.mjs').then(async m => { const app = new m.default(global, process.cwd()); await app.init(); await app.createUser({ id: 'u1', name: 'Alice' }); await app.logTime({ id: 't1', userId: 'u1', projectId: 'p1', minutes: 60 }); console.log('events appended') })"
```
