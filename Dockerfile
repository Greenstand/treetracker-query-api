FROM node:16-alpine
WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH
RUN mkdir -p ./node_modules
COPY node_modules ./node_modules/
COPY package.json ./
COPY package-lock.json ./
COPY dist ./dist/
CMD [ "npm", "start" ]
