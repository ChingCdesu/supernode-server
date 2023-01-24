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
RUN npm i -g pnpm
COPY --from=build /code/dist /app/dist
COPY --from=build /code/package.json /app/package.json
COPY --from=build /code/pnpm-lock.yaml /app/pnpm-lock.yaml
COPY --from=build /code/native/build/Release /app/native/build/Release
RUN pnpm i --prod
WORKDIR /app
CMD ["pnpm", "start:prod"]
