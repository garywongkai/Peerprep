# Use Node.js as the base image
FROM node:18.15.0-alpine

# Set the working directory in the container
WORKDIR /peerprep

# Copy package.json and yarn.lock to the container
COPY package.json ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Install dependencies
RUN npm install

# Copy the app's source code to the container
COPY . .

# Build the React app
RUN npm build

# Serve the build
CMD ["npx", "serve", "-s", "build"]
