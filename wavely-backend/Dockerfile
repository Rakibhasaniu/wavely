# build stage — compile TypeScript
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json yarn.lock* ./
RUN yarn install
COPY tsconfig.json ./
COPY src ./src
RUN yarn build

# runtime stage — production deps only, non-root user
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package.json yarn.lock* ./
RUN yarn install --production && yarn cache clean
COPY --from=build /app/dist ./dist
RUN mkdir -p uploads && chown -R node:node /app
USER node
EXPOSE 5000
CMD ["node", "dist/server.js"]
