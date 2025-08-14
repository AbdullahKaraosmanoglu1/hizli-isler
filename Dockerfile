# ---- Build stage ----
FROM node:20 AS build
WORKDIR /app

COPY package*.json ./

COPY prisma ./prisma

RUN npm ci

COPY . .

RUN npx prisma generate

RUN npm run build

# ---- Runtime stage ----
FROM node:20-slim AS runtime
WORKDIR /app

RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci --omit=dev --ignore-scripts

COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma

RUN npx prisma generate

ENV NODE_ENV=production
EXPOSE 5000

CMD ["node", "dist/main.js"]
