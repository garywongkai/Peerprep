# syntax=docker/dockerfile:1

# Comments are provided throughout this file to help you get started.
# If you need more help, visit the Dockerfile reference guide at
# https://docs.docker.com/go/dockerfile-reference/

# Want to help us make this template better? Share your feedback here: https://forms.gle/ybq9Krt8jtBL3iCk7

ARG NODE_VERSION=18.20.2
# 20.17.0

################################################################################
# Use node image for base image for all stages.
FROM node:${NODE_VERSION}-alpine as base
ARG NODE_ENV=development
ENV REACT_APP_ENV=${NODE_ENV}
# Set working directory for all build stages.
WORKDIR /app

COPY package*.json ./
# Installing pnpm is faster than using npm directly, needed only for this service as it is big
RUN npm install -g pnpm
RUN pnpm install
COPY . .

EXPOSE 3000
CMD ["npm", "start"]