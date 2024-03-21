FROM node:20-alpine AS development
WORKDIR usr/src/app
COPY package*.json .
RUN npm install
COPY . .
RUN npm run build

FROM node:20-alpine AS production
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
WORKDIR usr/src/app
COPY package*.json .
RUN npm ci --omit=dev
COPY --from=development usr/src/app/dist ./dist
COPY --from=development usr/src/app/prompts ./prompts

CMD ["node", "dist/index.js"]


