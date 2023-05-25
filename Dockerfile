FROM node:18

RUN npm install -g npm

WORKDIR /

COPY package\*.json ./
RUN npm install

COPY prisma/schema.prisma ./prisma/
RUN npx prisma generate

COPY . .

RUN npm run build
RUN npm run migrate:deploy

EXPOSE 4000
CMD ["npm","start"]
