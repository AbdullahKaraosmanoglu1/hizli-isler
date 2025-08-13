# ---- build stage ----
FROM node:20 AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# Build app and generate Prisma client during build
RUN npm run build
RUN npx prisma generate

# ---- run stage ----
FROM node:20
WORKDIR /app
ENV NODE_ENV=production

# Use node_modules from build (includes Prisma CLI and generated client)
COPY --from=build /app/node_modules ./node_modules

# App dist & scripts
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY docker ./docker

# fix CRLF if any
RUN sed -i 's/\r$//' ./docker/entrypoint.sh

# Output dir
RUN mkdir -p /app/out/sftp

EXPOSE 5000
CMD ["node", "dist/main.js"]
