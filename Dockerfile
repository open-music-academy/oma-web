FROM node:20.17.0-alpine3.20

ENV NODE_ENV "production"

WORKDIR /app

COPY package.json yarn.lock /app/

RUN apk --no-cache add curl git make gcc g++ python3 pkgconfig pixman-dev cairo-dev pango-dev libjpeg-turbo-dev giflib-dev \
    && yarn install --non-interactive --frozen-lockfile --check-files --production=true

COPY . /app/

CMD ["node", "--experimental-json-modules", "--experimental-loader", "@educandu/node-jsx-loader", "--enable-source-maps", "src/index.js"]
