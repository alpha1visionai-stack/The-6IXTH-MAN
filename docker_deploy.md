# Deploying "The 6IXTH MAN" on Hetzner with Docker

Since you have a sophisticated setup with Caddy, N8N, and OpenWebUI, here is exactly how to integrate this app.

## 1. Prepare the Server
You need to upload the app code to your server.
Assuming your code lives at `/opt/dockers/the-6ixth-man` (or similar).

## 2. Updated Docker Compose
Add this service to your `docker-compose.yml`.

> [!CAUTION]
> **API Key Safety**: Since Vite builds static apps, the API key is "baked in" to the Javascript file during build time. Even using `environment` vars in Docker technically bakes them into the static JS files. Anyone visiting your site can see the key in their browser Network tab.
> **Recommendation**: For a private server behind Caddy with Caddy Basic Auth (optional), this is fine. For a public site, be aware.

```yaml
  the-6ixth-man:
    build:
      context: ./path/to/the-6ixth-man  # Change this to where you put the folders
      dockerfile: Dockerfile
      args:
        # Pass your ENV vars here so they get baked into the build
        VITE_GOOGLE_API_KEY: "YOUR_KEY_HERE" 
        VITE_GOOGLE_MODEL: "gemini-2.0-flash-exp"
        VITE_GOOGLE_VOICE: "Charon"
        VITE_AI_LANGUAGE: "en"
        VITE_AI_STYLE: "la_slang"
    container_name: the-6ixth-man
    restart: unless-stopped
    networks:
      - caddy_network
```

## 3. Update Caddyfile
Since you manage Caddy manually (`./Caddyfile`), adds this entry:

```caddyfile
# Replace with your desired domain
chat.alpha-vision-ai.de {
    reverse_proxy the-6ixth-man:80
}
```

## 4. Deploy
Run this on your server:

```bash
# 1. Pull/Build the new container
docker-compose build the-6ixth-man

# 2. Start it up
docker-compose up -d the-6ixth-man

# 3. Reload Caddy (if you changed Caddyfile)
docker-compose restart caddy
```

## Troubleshooting
- **WebSocket Errors**: Caddy handles WebSockets automatically, so `wss://` connections to Google from the client should work fine (they go directly from the Browser -> Google, bypassing your server anyway).
- **Microphone Permissions**: The site **MUST** be served over HTTPS for the browser to allow microphone access. Caddy does this automatically with Let's Encrypt.
