# base node image
FROM node:20-bullseye-slim as base

# Install PostgreSQL client
RUN apt-get update && apt-get install -y postgresql-client && rm -rf /var/lib/apt/lists/*

WORKDIR /remixapp

# Install all node_modules, including dev
FROM base as deps

COPY package.json package-lock.json ./
RUN npm install --include=dev

# Setup production node_modules
FROM base as production-deps

COPY --from=deps /remixapp/node_modules /remixapp/node_modules
COPY package.json package-lock.json ./
RUN npm prune --omit=dev

# Build the app
FROM base as build

COPY --from=deps /remixapp/node_modules /remixapp/node_modules
COPY . .
RUN npm run build

# Production image - only copy what's needed
FROM base as production

ENV NODE_ENV production

# Copy only production dependencies
COPY --from=production-deps /remixapp/node_modules /remixapp/node_modules

# Copy only the built files and necessary runtime files
COPY --from=build /remixapp/build /remixapp/build
COPY --from=build /remixapp/package.json /remixapp/package.json
COPY --from=build /remixapp/server.js /remixapp/server.js
COPY --from=build /remixapp/tsconfig.json /remixapp/tsconfig.json
COPY --from=build /remixapp/app/workers /remixapp/app/workers
COPY --from=build /remixapp/app/utils /remixapp/app/utils
COPY --from=build /remixapp/app/cache /remixapp/app/cache

CMD ["npm", "start"]