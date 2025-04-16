FROM node:23-slim

WORKDIR /usr/src/app

COPY package.json yarn.lock ./

RUN yarn install

COPY . .

RUN yarn build

RUN npm rebuild bcrypt --update-binary

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 CMD node -e "const http = require('http'); const options = { host: 'localhost', port: 3000, path: '/health', timeout: 2000 }; const request = http.request(options, (res) => { process.exit(res.statusCode === 200 ? 0 : 1); }); request.on('error', (err) => process.exit(1)); request.end();"

EXPOSE 3000

CMD ["node", "dist/main"]