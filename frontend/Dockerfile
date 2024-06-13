FROM node:20 as build-stage

WORKDIR /usr/src/app

COPY . .

RUN npm ci --omit=dev

RUN npm run build

FROM nginx:1.25-alpine AS serve-stage

COPY --from=build-stage /usr/src/app/build /usr/share/nginx/html