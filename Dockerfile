FROM node:22-alpine

WORKDIR /usr/src/app
ENV NODE_ENV=production

COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY routes ./routes
COPY app.js app.js
COPY bin/www bin/www

USER node
EXPOSE 3110
CMD ["node", "./bin/www"]
