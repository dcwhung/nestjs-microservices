<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

<p align="center">An example of building microservices with nestjs framework.</p>

[<< BACK](./step5.md) | [INDEX](../README.md)

# Step 6: Dockerization

## 6.1.1 - Create DockerFile for API-Gateway


```Dockerfile
# -- [CREATE] /apps/api-gateway/Dockerfile -- 


# -- Create development environment -- 
FROM node:alpine as development

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

# -- Build process for API-Gateway -- 
RUN npm run build api-gateway

# -- Create production environment -- 
FROM node:alpine as production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --only=production

COPY . .

COPY --from=development /usr/src/app/dist ./dist

# -- Start API-Gateway -- 
CMD ["node", "dist/apps/api-gateway/main"]
```

## 6.1.2 - Create DockerFile for Microservices A & B

```Dockerfile
# -- [CREATE] /apps/service-a/Dockerfile -- 


# -- Create development environment -- 
FROM node:alpine as development

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

# -- Build process for Microservice A -- 
RUN npm run build service-a

# -- Create production environment -- 
FROM node:alpine as production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --only=production

COPY . .

COPY --from=development /usr/src/app/dist ./dist

# -- Start Microservice A -- 
CMD ["node", "dist/apps/service-a/main"]


# -- [CAUTION!!] Apply the same in service-b -- 
```

## 6.2 - Create .dockerignore under project root folder

```bash
# Versioning and metadata
.git
.gitignore
.dockerignore

# Build dependencies
dist.do
node_modules

# Environment (contains sensitive data)
*.env

# Misc
.eslintrc.js
.prettierrc
README.md
_README_
```

## 6.3 - Create docker-compose.yml under project root folder

```yml
services:
  # -- Container for API gateway Nestjs App -- 
  api-gateway:
    container_name: api-gateway
    build:
      context: .
      dockerfile: ./apps/api-gateway/Dockerfile
      target: development
    command: npm run start:dev api-gateway
    ports:
      - 8000:8000
    env_file:
      - './libs/common/.env'
    environment:
      - SERVICE_A_HOST=service-a
      - SERVICE_B_HOST=service-b
    volumes:
      - .:/usr/src/app
      - /usr/src/app/node_modules
    depends_on:
      - service-a
      - service-b
  
  # -- Container for Microservices A Nestjs App -- 
  service-a:
    container_name: microservice-a
    build:
      context: .
      dockerfile: ./apps/service-a/Dockerfile
      target: development
    command: npm run start:dev service-a
    env_file:
      - './libs/common/.env'
    environment:
      - SERVICE_A_HOST=service-a
    ports:
      - 8881:8881
    volumes:
      - .:/usr/src/app
      - /usr/src/app/node_modules
  
  # -- Container for Microservices B Nestjs App -- 
  service-b:
    container_name: microservice-b
    build:
      context: .
      dockerfile: ./apps/service-b/Dockerfile
      target: development
    command: npm run start:dev service-b
    env_file:
      - './libs/common/.env'
    environment:
      - SERVICE_B_HOST=service-b
      - MYSQL_TEST_DB_HOST=mysql-db
    ports:
      - 8882:8882
    volumes:
      - .:/usr/src/app
      - /usr/src/app/node_modules
```

## 6.4 - Build and start containers

```bash
docker-compose up --build -V
```

Expected log result in terminal after building the containers

```powershell
Attaching to api-gateway, microservice-a, microservice-b
api-gateway     | 
api-gateway     | > nestjs-microservices@0.0.1 start:dev
microservice-a  | 
microservice-b  | 
microservice-b  | > nestjs-microservices@0.0.1 start:dev
microservice-b  | > nest start --watch service-b
microservice-b  | 
api-gateway     | > nest start --watch api-gateway
microservice-a  | > nestjs-microservices@0.0.1 start:dev
microservice-a  | > nest start --watch service-a
microservice-a  | 
api-gateway     | 
api-gateway     | 
api-gateway     |  Info  Webpack is building your sources...
api-gateway     | 
api-gateway     | webpack 5.82.1 compiled successfully in 13468 ms
api-gateway     | Type-checking in progress...
microservice-a  | 
microservice-a  |  Info  Webpack is building your sources...
microservice-a  | 
microservice-b  | 
microservice-b  |  Info  Webpack is building your sources...
microservice-b  | 
api-gateway     | [Nest] 43  - 05/29/2023, 9:26:33 PM     LOG [NestFactory] Starting Nest application...
api-gateway     | [Nest] 43  - 05/29/2023, 9:26:50 PM     LOG [InstanceLoader] ConfigHostModule dependencies initialized +15618ms
api-gateway     | [Nest] 43  - 05/29/2023, 9:26:50 PM     LOG [InstanceLoader] ConfigModule dependencies initialized +483ms
api-gateway     | [Nest] 43  - 05/29/2023, 9:26:50 PM     LOG [InstanceLoader] ConfigModule dependencies initialized +1ms
api-gateway     | [Nest] 43  - 05/29/2023, 9:26:51 PM     LOG [ - TcpModule - ] 📝 Registering microservice for SERVICE_A at tcp://service-a:38881
api-gateway     | [Nest] 43  - 05/29/2023, 9:26:51 PM     LOG [ - TcpModule - ] 📝 Registering microservice for SERVICE_B at tcp://service-b:38882
api-gateway     | [Nest] 43  - 05/29/2023, 9:26:51 PM     LOG [InstanceLoader] TcpModule dependencies initialized +158ms
api-gateway     | [Nest] 43  - 05/29/2023, 9:26:51 PM     LOG [InstanceLoader] ClientsModule dependencies initialized +0ms
api-gateway     | [Nest] 43  - 05/29/2023, 9:26:52 PM     LOG [InstanceLoader] AppModule dependencies initialized +166ms
microservice-a  | webpack 5.82.1 compiled successfully in 64373 ms
microservice-a  | Type-checking in progress...
microservice-b  | webpack 5.82.1 compiled successfully in 79745 ms
microservice-b  | Type-checking in progress...
api-gateway     | [Nest] 43  - 05/29/2023, 9:28:01 PM     LOG [RoutesResolver] AppController {/api}: +68826ms
api-gateway     | [Nest] 43  - 05/29/2023, 9:28:01 PM     LOG [RouterExplorer] Mapped {/api/ping-all, GET} route +547ms
api-gateway     | [Nest] 43  - 05/29/2023, 9:28:01 PM     LOG [RoutesResolver] SvcAppController {/api}: +103ms
api-gateway     | [Nest] 43  - 05/29/2023, 9:28:01 PM     LOG [RouterExplorer] Mapped {/api/ping-a, GET} route +38ms
api-gateway     | [Nest] 43  - 05/29/2023, 9:28:01 PM     LOG [RoutesResolver] SvcAppController {/api}: +0ms
api-gateway     | [Nest] 43  - 05/29/2023, 9:28:01 PM     LOG [RouterExplorer] Mapped {/api/ping-b, GET} route +2ms
api-gateway     | [Nest] 43  - 05/29/2023, 9:28:02 PM     LOG [NestApplication] Nest application successfully started +751ms
api-gateway     | [Nest] 43  - 05/29/2023, 9:28:02 PM     LOG [ - API Gateway/bootstrap - ] 🚀 Running on: http://localhost:8000/api
api-gateway     | No errors found.
microservice-a  | [Nest] 42  - 05/29/2023, 9:29:59 PM     LOG [NestFactory] Starting Nest application...
microservice-a  | [Nest] 42  - 05/29/2023, 9:29:59 PM     LOG [InstanceLoader] ConfigHostModule dependencies initialized +158ms
microservice-a  | [Nest] 42  - 05/29/2023, 9:29:59 PM     LOG [InstanceLoader] ConfigModule dependencies initialized +4ms
microservice-a  | [Nest] 42  - 05/29/2023, 9:29:59 PM     LOG [InstanceLoader] ServiceAModule dependencies initialized +46ms
microservice-a  | [Nest] 42  - 05/29/2023, 9:30:02 PM     LOG [NestMicroservice] Nest microservice successfully started +3131ms
microservice-a  | [Nest] 42  - 05/29/2023, 9:30:02 PM     LOG [ - SERVICE_A/bootstrap - ] 👂🏼 Listening to tcp://service-a:38881
microservice-a  | [Nest] 42  - 05/29/2023, 9:30:03 PM     LOG [RoutesResolver] ServiceAController {/}: +646ms
microservice-a  | [Nest] 42  - 05/29/2023, 9:30:03 PM     LOG [RouterExplorer] Mapped {/ping, GET} route +5ms
microservice-a  | [Nest] 42  - 05/29/2023, 9:30:03 PM     LOG [NestApplication] Nest application successfully started +5ms
microservice-a  | [Nest] 42  - 05/29/2023, 9:30:03 PM     LOG [ - SERVICE_A/bootstrap - ] 🚀 Running on: http://localhost:8881/
microservice-b  | [Nest] 43  - 05/29/2023, 9:30:11 PM     LOG [NestFactory] Starting Nest application...
microservice-b  | [Nest] 43  - 05/29/2023, 9:30:12 PM     LOG [InstanceLoader] ConfigHostModule dependencies initialized +1062ms
microservice-b  | [Nest] 43  - 05/29/2023, 9:30:12 PM     LOG [InstanceLoader] ConfigModule dependencies initialized +15ms
microservice-b  | [Nest] 43  - 05/29/2023, 9:30:12 PM     LOG [InstanceLoader] ServiceBModule dependencies initialized +18ms
microservice-b  | [Nest] 43  - 05/29/2023, 9:30:13 PM     LOG [NestMicroservice] Nest microservice successfully started +633ms
microservice-b  | [Nest] 43  - 05/29/2023, 9:30:13 PM     LOG [ - SERVICE_B/bootstrap - ] 👂🏼 Listening to tcp://service-b:38882
microservice-b  | [Nest] 43  - 05/29/2023, 9:30:14 PM     LOG [RoutesResolver] ServiceBController {/}: +850ms
microservice-b  | [Nest] 43  - 05/29/2023, 9:30:14 PM     LOG [RouterExplorer] Mapped {/ping, GET} route +67ms
microservice-b  | [Nest] 43  - 05/29/2023, 9:30:14 PM     LOG [NestApplication] Nest application successfully started +229ms
microservice-b  | [Nest] 43  - 05/29/2023, 9:30:14 PM     LOG [ - SERVICE_B/bootstrap - ] 🚀 Running on: http://localhost:8882/
microservice-a  | No errors found.
microservice-b  | No errors found.
```


## 6.5 - Testing the API-Gateway & Microservices A & B with browser or Postman

After starting the containers, you can access to the API-Gateway with http://localhost:8000/api/ping-all.

Expected log result in terminal:

```powershell
api-gateway     | [Nest] 43  - 05/29/2023, 9:37:59 PM     LOG [ - HTTP Request - ] GET /api/ping-all 200
api-gateway     | [Nest] 43  - 05/29/2023, 9:38:00 PM     LOG [ - API Gateway/AppController - ] /ping-all:: Try to ping all microservices.
api-gateway     | [Nest] 43  - 05/29/2023, 9:38:00 PM     LOG [ - API Gateway/SvcAppService - ] Sending out TCP request to ping SERVICE_A
api-gateway     | [Nest] 43  - 05/29/2023, 9:38:00 PM     LOG [ - API Gateway/SvcAppService - ] Sending out TCP request to ping SERVICE_B
microservice-a  | [Nest] 42  - 05/29/2023, 9:38:04 PM     LOG [ - SERVICE_A/ServiceAController - ] Someone ping me and I need to pong back~
microservice-b  | [Nest] 43  - 05/29/2023, 9:38:04 PM     LOG [ - SERVICE_B/ServiceBController - ] Someone ping me and I need to pong back~
```