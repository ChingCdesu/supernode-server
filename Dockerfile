FROM node:lts as build
WORKDIR /code

RUN apt update
RUN apt install g++ cmake ninja-build git -y
RUN npm i -g cmake-js pnpm

COPY . .

RUN pnpm i && pnpm run build

FROM node:lts
WORKDIR /app
RUN npm i -g pnpm
COPY package.json pnpm-lock.yaml /app/
RUN pnpm i --prod
COPY --from=build /code/dist /app/dist
COPY --from=build /code/native/build/node-supernode.node /app/native/build/node-supernode.node
EXPOSE 8080
EXPOSE 7654/udp
CMD ["node", "dist/main"]
