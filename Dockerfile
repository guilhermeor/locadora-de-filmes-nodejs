FROM node:8-alpine

RUN mkdir -p /user/src/app

WORKDIR /user/src/app

COPY package.json /usr/src/app/

RUN npm install

COPY . /usr/src/app

CMD [ "npm", "start" ]

EXPOSE 3000
