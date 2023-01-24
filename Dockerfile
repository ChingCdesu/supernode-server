FROM node:lts-alpine as build
WORKDIR /

RUN apk update --no-cache
RUN apk add g++ cmake ninja linux-headers git
RUN npm i -g cmake-js pnpm

RUN git clone https://github.com/ChingCdesu/supernode-server.git code

WORKDIR /code
RUN git submodule update --init
COPY native/CMakeLists.txt /code/native/
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
COPY --from=build /code/native/build/ /app/native/build/
CMD ["pnpm", "start:prod"]
