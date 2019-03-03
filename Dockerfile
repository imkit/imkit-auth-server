FROM node:8-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
#COPY package.json .
# For npm@5 or later, copy package-lock.json as well
COPY package.json package-lock.json ./

RUN npm install

COPY routes ./routes
COPY app.js app.js
COPY bin/www bin/www

EXPOSE 3110
CMD [ "npm", "start" ]
