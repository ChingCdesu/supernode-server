FROM node:lts-alpine as build
WORKDIR /code

RUN apk update --no-cache
RUN apk add g++ cmake ninja linux-headers git
RUN npm i -g cmake-js pnpm

COPY . .

RUN pnpm i
RUN pnpm run build

FROM node:lts-alpine
WORKDIR /app
RUN apk update --no-cache
RUN apk add bash
RUN npm i -g pnpm
COPY package.json pnpm-lock.yaml /app/
RUN pnpm i --prod
COPY --from=build /code/dist /app/dist
COPY --from=build /code/native/build/node-supernode.node /app/native/build/node-supernode.node
EXPOSE 8080
EXPOSE 7654/udp
CMD ["node", "dist/main"]
