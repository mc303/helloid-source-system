# Add Dynamic React Admin CRUD Frontend for PostgREST

## Overview

This PR introduces a dynamic, containerized CRUD admin frontend based on React Admin that auto-generates resources and forms for all public tables exposed by your PostgREST API. It features:

- **Automatic discovery of tables/columns/relations** via PostgREST OpenAPI/OPTIONS
- **Auto-generated CRUD resources** including foreign key handling (Reference fields)
- **Modern, compact, fullscreen UI** with fixed header
- **Server-side pagination, filtering, and sorting**
- **Easy extensibility and minimal config** (`src/config.js`)
- **No authentication**
- **Dockerized for easy deployment**

## Usage

1. Build and run:
   ```sh
   docker build -t postgrest-dynamic-admin .
   docker run -p 8080:80 postgrest-dynamic-admin
   ```
2. Visit [http://localhost:8080](http://localhost:8080)

## Files Added

- `Dockerfile`
- `nginx.conf`
- `package.json`
- `public/index.html`
- `src/` (all frontend source code)

## Next Steps

- Customize or extend via `src/config.js` for labels/fields/overrides.
- Add advanced search features if desired.

Closes #1 if exists.

---

Let me know if you want to refine or add more details!