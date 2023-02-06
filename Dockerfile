FROM node:18.14.0-alpine3.16

EXPOSE 3000

ARG NODE_ENV
ENV NODE_ENV $NODE_ENV
ENV PORT 3000

WORKDIR /app

COPY package.json package-lock.json /app/

RUN npm i npm@9.4.1
RUN npm config set package-lock false
RUN npm i

COPY . /app/
