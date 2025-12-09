FROM node:25-alpine

RUN apk update && apk upgrade

RUN mkdir -p /app/node_modules && chown -R node:node /app

WORKDIR /app

COPY --chown=node:node package*.json ./

USER node

RUN npm install

COPY --chown=node:node public public
COPY --chown=node:node app.js app.js
COPY --chown=node:node bin bin
COPY --chown=node:node routes routes

EXPOSE 3000

CMD ["/bin/sh", "-c", "npm start 2>&1 | tee log.txt"]
