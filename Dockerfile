# ---- build stage ----
FROM node:20 AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
RUN npx prisma generate

# ---- run stage ----
FROM node:20
WORKDIR /app
ENV NODE_ENV=production

# 1) Prod bağımlılıklar
COPY package*.json ./
RUN npm ci --omit=dev

# 2) Prisma dosyalarını kopyala, SONRA generate
COPY --from=build /app/prisma ./prisma
RUN npx prisma generate

# 3) Uygulama çıktısı ve scriptler
COPY --from=build /app/dist ./dist
COPY docker ./docker

# (Windows satır sonu önlemi)
RUN sed -i 's/\r$//' ./docker/entrypoint.sh

# 4) Çıktı klasörü
RUN mkdir -p /app/out/sftp

EXPOSE 5000
CMD ["node", "dist/main.js"]
