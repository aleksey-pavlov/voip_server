FROM node:17.9.1-buster as build

ARG CI_USER
ARG CI_PWD

WORKDIR /opt/diserver
COPY package.json .
COPY package-lock.json .
RUN npm install
COPY ./ .
RUN npm run build

FROM build as test
WORKDIR /opt/diserver
COPY --from=build /opt/diserver .
RUN npm run test

FROM keymetrics/pm2:18-buster
WORKDIR /opt/diserver
RUN apt-get update && apt-get install sox libsox-fmt-all -y
COPY --from=build /opt/diserver/build ./build/
COPY --from=build /opt/diserver/pm2.yaml .
COPY --from=build /opt/diserver/package.json .
COPY --from=build /opt/diserver/node_modules/ ./node_modules
EXPOSE 8080 
EXPOSE 8081