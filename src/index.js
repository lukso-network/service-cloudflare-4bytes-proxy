addEventListener("fetch", (event) => {
  event.respondWith(handleRequest(event.request));
});

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,HEAD,OPTIONS",
  "Access-Control-Max-Age": "86400",
  "Access-Control-Allow-Headers": "content-type",
};

async function handleRequest(request) {
  const url = new URL(request.url);
  const signature =
    (url.searchParams && url.searchParams.get("hex_signature")) ||
    (url.pathname && url.pathname.substring(1));
  if (!signature) {
    return new Response("Missing signature", { status: 404, headers: cors });
  }
  if (!/(0x)?[0-9a-f]{8}/.test(signature)) {
    return new Response("Invalid request", { status: 500, headers: cors });
  }
  const value = await NAMESPACE.get(signature, { type: "json" });
  if (value === null) {
    try {
      const request = await fetch(
        `https://www.4byte.directory/api/v1/signatures/?format=json&hex_signature=${signature}`
      );
      if (request.status != 200) {
        return new Response(request.statusText, {
          status: request.status,
          headers: cors,
        });
      }
      const output = await request.json();
      if (output.count !== 0) {
        await NAMESPACE.put(signature, JSON.stringify(output));
        console.log(`cache miss and populated ${signature}`);
      } else {
        console.log(`cache miss and ignored (count == 0) ${signature}`);
      }
      return new Response(JSON.stringify(output), {
        headers: { "content-type": "application/json", ...cors },
      });
    } catch (err) {
      console.log(`cache miss failed ${signature}`);
      return new Response(err.message, { status: 500, headers: cors });
    }
  }
  console.log(`cache hit ${signature}`);
  return new Response(JSON.stringify(value), {
    headers: { "content-type": "application/json", ...cors },
  });
}
