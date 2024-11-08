# Docker Images for code execution
This folder holds docker images required for code execution.
As Github does not allow large file sizes, we cannot save the .tar files into the repository as they are too large (>100 MB). Github Large Files Storage (LFS) would work, but it requires an enterprise account to save into public repository forks.

Run the commands below in this current directory (`/images`) to download and save the docker images as tar files.

### Pull the images you need
    docker pull python:3.8-slim
    docker pull node:alpine
    docker pull golang:alpine
    docker pull ruby:alpine
    docker pull openjdk:alpine
    docker pull php:alpine

### Save the images to tar files
    docker save -o python-3.8-slim python:3.8-slim
    docker save -o node-alpine.tar node:alpine
    docker save -o golang-alpine.tar golang:alpine
    docker save -o ruby-alpine.tar ruby:alpine
    docker save -o openjdk-alpine.tar openjdk:alpine
    docker save -o php-alpine.tar php:alpine

### Combined command
    docker pull python:3.8-slim && docker pull node:alpine && \
    docker pull golang:alpine && docker pull ruby:alpine && \
    docker pull openjdk:alpine && docker pull php:alpine && \
    docker save -o python-3.8-slim.tar python:3.8-slim && \
    docker save -o node-alpine.tar node:alpine && \
    docker save -o golang-alpine.tar golang:alpine && \
    docker save -o ruby-alpine.tar ruby:alpine && \
    docker save -o openjdk-alpine.tar openjdk:alpine && \
    docker save -o php-alpine.tar php:alpine
