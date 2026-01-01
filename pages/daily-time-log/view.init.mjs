import TimeLogApiClient from './TimeLogApiClient.mjs'
import DailyTimeLogView from './DailyTimeLogView.mjs'

export default async function init(window){
  const app = new TimeLogApiClient(window)
  await app.init()
  new DailyTimeLogView(window, app)
  return app
}
