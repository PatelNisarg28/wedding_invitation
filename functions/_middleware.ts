import type { Env } from './_lib'

const CANONICAL_HOST = 'nisarg-weds-devanshi.site'

/** Redirect www.nisarg-weds-devanshi.site to the canonical apex domain. */
export const onRequest: PagesFunction<Env> = async ({ request, next }) => {
  const url = new URL(request.url)
  if (url.hostname === `www.${CANONICAL_HOST}`) {
    url.hostname = CANONICAL_HOST
    return Response.redirect(url.toString(), 301)
  }
  return next()
}
