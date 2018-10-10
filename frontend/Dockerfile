FROM node:10-alpine AS build
WORKDIR /app

# Install yarn
# Source https://yarnpkg.com/en/docs/install#debian-stable
# Note: node:10 already includes Yarn
#RUN curl -o- -L https://yarnpkg.com/install.sh | bash

# Make it as cache-able as possible
# Source: https://nodejs.org/en/docs/guides/nodejs-docker-webapp/
COPY internal ./internal
COPY package.json yarn.lock ./
RUN yarn install

# Dont forget to update .dockerignore
COPY . .
RUN yarn build


FROM nginx AS runtime
COPY nginx/nginx.conf /etc/nginx/nginx.conf
COPY nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/build/client /usr/share/nginx/html
EXPOSE 80/tcp
