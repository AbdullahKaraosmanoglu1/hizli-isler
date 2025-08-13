FROM node:20 AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

RUN npm run build
RUN npx prisma generate

FROM node:20
WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /app/node_modules ./node_modules

COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY docker ./docker

RUN sed -i 's/\r$//' ./docker/entrypoint.sh

RUN mkdir -p /app/out/sftp

EXPOSE 5000
CMD ["node", "dist/main.js"]
