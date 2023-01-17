FROM node:lts-alpine as build
WORKDIR /

RUN apk update --no-cache
RUN apk add g++ cmake ninja linux-headers git
RUN npm i -g cmake-js pnpm

RUN git clone https://github.com/ChingCdesu/supernode-server.git code

WORKDIR /code
RUN git submodule update --init
RUN pnpm i
RUN pnpm run build

FROM node:lts-alpine
RUN apk update --no-cache
RUN apk add bash
COPY --from=build /code/dist /app
WORKDIR /app
CMD ["node", "main.js"]
