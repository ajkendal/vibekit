export const onRequest = async ({ request, env }) => {
  const url = new URL(request.url)
  const forwarded = new URL(url.toString())
  forwarded.pathname = url.pathname.replace(/^\/api/, '') || '/'
  return env.API.fetch(new Request(forwarded.toString(), request))
}