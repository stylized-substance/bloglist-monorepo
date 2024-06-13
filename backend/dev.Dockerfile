FROM node:20

WORKDIR /usr/src/app

COPY . .

RUN npm install --legacy-peer-deps

EXPOSE 3003

CMD [ "npm", "run", "devDocker" ]
