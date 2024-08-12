FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
RUN npm install @nestjs/cli

COPY . .
RUN chmod +x ./node_modules/.bin/nest
RUN npx nest build

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/package*.json /app/
COPY --from=builder /app/dist /app/dist

RUN npm install --only=production

EXPOSE 3000

CMD ["node", "dist/main"]
