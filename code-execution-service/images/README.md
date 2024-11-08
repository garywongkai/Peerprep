# Docker Images for code execution
This folder holds docker images required for code execution.
As Github does not allow large file sizes, we cannot save the .tar files into the repository as they are too large (>100 MB). Github Large Files Storage (LFS) would work, but it requires an enterprise account to save into public repository forks.

Run the commands below in this current directory (`/images`) to download and save the docker images as tar files.

### Pull the images you need
    docker pull python:3.10-slim
    docker pull node:18-alpine
    docker pull golang:1.20-alpine
    docker pull ruby:3.1-alpine
    docker pull openjdk:17-alpine
    docker pull php:8.2-alpine

### Save the images to tar files
    docker save -o python-3.10-slim.tar python:3.10-slim
    docker save -o node-18-alpine.tar node:18-alpine
    docker save -o golang-1.20-alpine.tar golang:1.20-alpine
    docker save -o ruby-3.1-alpine.tar ruby:3.1-alpine
    docker save -o openjdk-17-alpine.tar openjdk:17-alpine
    docker save -o php-8.2-alpine.tar php:8.2-alpine

### Combined command
    docker pull python:3.10-slim && docker pull node:18-alpine && \
    docker pull golang:1.20-alpine && docker pull ruby:3.1-alpine && \
    docker pull openjdk:17-alpine && docker pull php:8.2-alpine && \
    docker save -o python-3.10-slim.tar python:3.10-slim && \
    docker save -o node-18-alpine.tar node:18-alpine && \
    docker save -o golang-1.20-alpine.tar golang:1.20-alpine && \
    docker save -o ruby-3.1-alpine.tar ruby:3.1-alpine && \
    docker save -o openjdk-17-alpine.tar openjdk:17-alpine && \
    docker save -o php-8.2-alpine.tar php:8.2-alpine
