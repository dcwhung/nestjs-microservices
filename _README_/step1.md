<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

<p align="center">An example of building microservices with nestjs framework.

[<< BACK](../README.md) | [INDEX](../README.md) | [NEXT >>](./step2.md)
</p>


# Step 1: Project setup & dependencies installation

## 1. - Install dependencies

```bash
# -- [INSTALL] nestjs CLI -- 
$ npm i -g @nestjs/cli

# -- [INSTALL] other packages for project & microservices -- 
$ npm i @nestjs/common @nestjs/config @nestjs/microservices
$ npm i class-validator class-transformer
$ npm i cookie-parser @nestjs/mapped-types

# -- [INSTALL] nodemon -- 
$ npm i --save-dev nodemon ts-node
```


## 2.1 - Create project folder
```bash
# -- [CREATE] project folder name `nestjs-microservices` -- 
$ nest new nestjs-microservices
```

Command Result:
```sql
CREATE nestjs-microservices/.eslintrc.js (663 bytes)
CREATE nestjs-microservices/.prettierrc (51 bytes)
CREATE nestjs-microservices/README.md (3340 bytes)
CREATE nestjs-microservices/nest-cli.json (171 bytes)
CREATE nestjs-microservices/package.json (1951 bytes)
CREATE nestjs-microservices/tsconfig.build.json (97 bytes)
CREATE nestjs-microservices/tsconfig.json (546 bytes)
CREATE nestjs-microservices/src/app.controller.spec.ts (617 bytes)
CREATE nestjs-microservices/src/app.controller.ts (274 bytes)
CREATE nestjs-microservices/src/app.module.ts (249 bytes)
CREATE nestjs-microservices/src/app.service.ts (142 bytes)
CREATE nestjs-microservices/src/main.ts (208 bytes)
CREATE nestjs-microservices/test/app.e2e-spec.ts (630 bytes)
CREATE nestjs-microservices/test/jest-e2e.json (183 bytes)
```
```bash
✔ Installation in progress... ☕

🚀  Successfully created project nestjs-microservices
👉  Get started with the following commands:

$ cd nestjs-microservices
$ npm run start
```


## 2.2 - Setup nodemon
```bash
# -- [CREATE] nodemon.json under project folder with content below -- 
{
    "watch": ["src"],
    "ext": "ts",
    "ignore": ["src/**/*.spec.ts"],
    "exec": "ts-node -r tsconfig-paths/register src/main.ts"
}
```


## 3. - Create monorepo applications
```bash
# -- [CREATE] Service A application -- 
$ nest g app service-a
```

Command Result: 
```sql
-- Remove original application structure -- 
DELETE src/app.controller.spec.ts
DELETE src/app.controller.ts
DELETE src/app.module.ts
DELETE src/app.service.ts
DELETE src/main.ts
DELETE src
DELETE test/app.e2e-spec.ts
DELETE test/jest-e2e.json
DELETE test

-- Rebuild application structure into monorepo structure -- 
CREATE apps/nestjs-microservices/tsconfig.app.json (235 bytes)
CREATE apps/nestjs-microservices/src/app.controller.spec.ts (617 bytes)
CREATE apps/nestjs-microservices/src/app.controller.ts (274 bytes)
CREATE apps/nestjs-microservices/src/app.module.ts (249 bytes)
CREATE apps/nestjs-microservices/src/app.service.ts (142 bytes)
CREATE apps/nestjs-microservices/src/main.ts (208 bytes)
CREATE apps/nestjs-microservices/test/app.e2e-spec.ts (630 bytes)
CREATE apps/nestjs-microservices/test/jest-e2e.json (183 bytes)

-- Create application for Service A -- 
CREATE apps/service-a/tsconfig.app.json (224 bytes)
CREATE apps/service-a/src/main.ts (224 bytes)
CREATE apps/service-a/src/service-a.controller.spec.ts (684 bytes)
CREATE apps/service-a/src/service-a.controller.ts (305 bytes)
CREATE apps/service-a/src/service-a.module.ts (286 bytes)
CREATE apps/service-a/src/service-a.service.ts (147 bytes)
CREATE apps/service-a/test/jest-e2e.json (183 bytes)
CREATE apps/service-a/test/app.e2e-spec.ts (651 bytes)

-- Update dependencies -- 
UPDATE tsconfig.json (562 bytes)
UPDATE package.json (2079 bytes)
UPDATE nest-cli.json (907 bytes)
```

```bash
# -- [CREATE] Service B application -- 
$ nest g app service-b
```

Command Result: 
```sql
-- Create application for Service B -- 
CREATE apps/service-b/tsconfig.app.json (224 bytes)
CREATE apps/service-b/src/main.ts (224 bytes)
CREATE apps/service-b/src/service-b.controller.spec.ts (684 bytes)
CREATE apps/service-b/src/service-b.controller.ts (305 bytes)
CREATE apps/service-b/src/service-b.module.ts (286 bytes)
CREATE apps/service-b/src/service-b.service.ts (147 bytes)
CREATE apps/service-b/test/jest-e2e.json (183 bytes)
CREATE apps/service-b/test/app.e2e-spec.ts (651 bytes)
```


## 4. - Create common library
```bash
# -- [CREATE] shared library /libs/common/ -- 
$ nest g library common
```

Command Result:
```sql
? What prefix would you like to use for the library (default: @app)? <Enter>

CREATE libs/common/tsconfig.lib.json (220 bytes)
CREATE libs/common/src/index.ts (67 bytes)
CREATE libs/common/src/common.module.ts (192 bytes)
CREATE libs/common/src/common.service.spec.ts (460 bytes)
CREATE libs/common/src/common.service.ts (90 bytes)
UPDATE nest-cli.json (1392 bytes)
UPDATE package.json (2197 bytes)
UPDATE tsconfig.json (686 bytes)
```

```bash
# -- [DELETE] Empty common library folder -- 
$ rm -Rf libs/common/src/*
```


## 5. - Rename folder & all paths from apps/nestjs-microservices to apps/api-gateway
```bash
# -- [RENAME] folder -- 
$ mv apps/nestjs-microservices apps/api-gateway

# -- [UPDATE] related files (nest-cli.json, package.json & ./apps/api-gateway/tsconfig.app.json) -- 
$ perl -i -pe 's|nestjs-microservices|api-gateway|g' nest-cli.json
$ perl -i -pe 's|apps/nestjs-microservices|apps/api-gateway|g' package.json
$ perl -i -pe 's|apps/nestjs-microservices|apps/api-gateway|g' ./apps/api-gateway/tsconfig.app.json
```

## 6. - Update ports of Services A & B for testing
```ts
/* -- [UPDATE] /apps/service-a/main.ts set app listen to 8881 port -- */
await app.listen(3001);

/* -- [UPDATE] /apps/service-b/main.ts set app listen to 8882 port -- */
await app.listen(3002);
```


## 7. - Running the apps in 3 different terminals
```bash
# -- Running api-gateway -- 
$ npm run start:dev api-gateway

# -- Running Service A -- 
$ npm run start:dev service-a

# -- Running Service B -- 
$ npm run start:dev service-b
```

Expected Command Result:
```sql
> nestjs-microservices@0.0.1 start:dev
> nest start --watch <target-service-name>

 Info  Webpack is building your sources...

webpack 5.82.1 compiled successfully in 550 ms
Type-checking in progress...
[Nest] 79035  - 05/24/2023, 11:03:57 PM     LOG [NestFactory] Starting Nest application...
[Nest] 79035  - 05/24/2023, 11:03:57 PM     LOG [InstanceLoader] ServiceAModule dependencies initialized +20ms
[Nest] 79035  - 05/24/2023, 11:03:57 PM     LOG [RoutesResolver] ServiceAController {/}: +28ms
[Nest] 79035  - 05/24/2023, 11:03:57 PM     LOG [RouterExplorer] Mapped {/, GET} route +6ms
[Nest] 79035  - 05/24/2023, 11:03:57 PM     LOG [NestApplication] Nest application successfully started +3ms
No errors found.
```

## 8. - Testing the apps with browser or Postman

After starting the applications, you can access to them via the following urls:

- API-Gateway - http://localhost:3000/
- Service A - http://localhost:3001/
- Service B - http://localhost:3002/

Expected result in browser:
```ts
Hello world!
```

