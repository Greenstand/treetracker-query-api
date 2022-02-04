FROM node:16-alpine
WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH
COPY node_modules ./node_modules/
COPY package.json ./
COPY package-lock.json ./
RUN npm ci
COPY dist ./dist/
CMD [ "npm", "start" ]
