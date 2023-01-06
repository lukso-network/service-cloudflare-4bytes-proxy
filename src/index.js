addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)
  const signature =
    (url.searchParams && url.searchParams.get('hex_signature')) ||
    (url.pathname && url.pathname.substring(1))
  if (!signature) {
    return new Response('Missing signature', { status: 404 })
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
      console.log(`cache miss and populated ${signature}`)
      return new Response(JSON.stringify(output), {
        headers: { 'content-type': 'application/json' },
      })
    } catch (err) {
        console.log(`cache miss failed ${signature}`)
      return new Response(err.message, { status: 500 })
    }
  }
  console.log(`cache hit ${signature}`)
  return new Response(JSON.stringify(value), {
    headers: { 'content-type': 'application/json' },
  })
}
