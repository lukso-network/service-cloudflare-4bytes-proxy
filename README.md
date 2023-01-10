# service-cloudflare-4bytes-proxy

This is a little KV based cached for the 4bytes directory to decrease traffic on
the original site and allowing addition of CORS. Since the KV storage keeps the
used signature hashes we could easily point it to another source or use this as the source
by adding the JSON into the KV storage.
