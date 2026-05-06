FROM node:20-alpine
WORKDIR /src/app
COPY package*.json ./
RUN npm ci
COPY . .

# Each microservice listens on its own port (4000-4003).
# Override the entrypoint with `docker run ... npm run start:user|book|cart|order`.
EXPOSE 4000 4001 4002 4003

CMD ["npm", "run", "start:user"]