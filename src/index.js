addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)
  console.log(request.url)
  const signature =
    (url.searchParams && url.searchParams.get('hex_signature')) ||
    (url.pathname && url.pathname.substring(1))
  if (!signature) {
    return new Response('Invalid argument', { status: 404 })
  }
  const value = await NAMESPACE.get(signature, { type: 'json' })
  if (value === null) {
    try {
      const request = await fetch(
        `https://www.4byte.directory/api/v1/signatures/?hex_signature=${signature}`
      )
      if (request.status != 200) {
        return new Response(request.statusText(), { status: request.status })
      }
      const output = await request.json()
      await NAMESPACE.put(signature, JSON.stringify(output))
      return new Response(JSON.stringify(output), {
        headers: { 'content-type': 'application/json' },
      })
    } catch (err) {
      return new Response(err.message, { status: 500 })
    }
  }
  return new Response(JSON.stringify(value), {
    headers: { 'content-type': 'application/json' },
  })
}
