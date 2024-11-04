FROM node:18.20.2-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .
EXPOSE 5002
CMD [ "npm", "start" ]
