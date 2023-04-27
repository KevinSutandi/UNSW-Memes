FROM --platform=$BUILDPLATFORM node:lts-alpine

WORKDIR /app

COPY package*.json ./
COPY ./src ./src
COPY ./img ./img
COPY dataStore.json dataStore.json

RUN npm install \
    && npm install -g serve 

ENV IP 0.0.0.0
ENV PORT 23232

EXPOSE 23232

CMD ["npm", "start"]
