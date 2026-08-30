const ANALYTICS_URL = process.env.ANALYTICS_URL ?? 'https://analytics.joeyguerra.com'

export async function data(req) {
    return { analyticsUrl: ANALYTICS_URL }
}
