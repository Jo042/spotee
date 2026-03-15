FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install

COPY . .

RUN rm -f tsconfig.build.tsbuildinfo && npm run build

EXPOSE 4000

CMD ["node", "dist/main.js"]