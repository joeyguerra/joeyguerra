const ANALYTICS_URL = process.env.ANALYTICS_URL ?? 'https://analytics.joeyguerra.com'

export async function GET(req) {
    return { analyticsUrl: ANALYTICS_URL, base: process.env.BASE_PATH ?? '' }
}
