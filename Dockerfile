FROM node:18.14.0-alpine

WORKDIR /app

COPY package*.json ./
COPY ./src ./src
COPY ./img ./img
COPY dataStore.json dataStore.json

RUN npm install \
    && npm install -g serve 

EXPOSE 23232

CMD ["npm", "start"]