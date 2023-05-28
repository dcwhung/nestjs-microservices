<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

  <p align="center">An example of building microservices with nestjs framework.</p>

# Description

Step by step to show how to use nestjs framework to build a API-gateway communicating with 2 microservices A & B.

[Step 1: Project setup & dependencies installation](./_README_/step1.md)
1. Install dependencies
2. ...
    1. Create project folder 
    2. Setup nodemon
3. Create monorepo applications
4. Create common library
5. Rename folder & all paths from apps/nestjs-microservices to apps/api-gateway
6. Update ports of Services A & B for testing
7. Running the apps in 3 different terminals
8. Testing the apps with browser or Postman

[Step 2: Setup .env file & apply to apps](./_README_/step2.md)

1. Create .env file under /libs/common/
2. Create constants folder under /libs/common/ with constants.ts & index.ts
3. ...
    1. Update module files to retrieve port setting from .env file 
    2. Update main.ts files listening to port assigned in .env file
    3. Test applications updates 

[Step 3: Transform Services A & B as nestjs microservices](./_README_/step3.md)

1. Update transport layer from HTTP to TCP with service configuration
2. Remove original AppService usages from the AppModule & AppController file in each service folder
3. Update AppController to use the Microservice Message pattern to serve clients
4. Register the Services A & B in API-Gateway
5. Inject new services into API-Gateway AppService and create a method to query the Services A & B
6. Use the new method from the AppService in the AppController.
7. Running the apps in 3 different terminals
8. Testing the API-Gateway & Microservices A & B with browser or Postman

[Step 4: Abstraction](./_README_/step4-1.md)

1. [Abstraction of bootstrap() method in main.ts under all microservices](./_README_/step4-1.md)
2. [Abstraction of *.controller.ts under all microservices](./_README_/step4-2.md)
3. [Abstraction of *.module.ts under all microservices](./_README_/step4-3.md)
4. [Abstraction of pingService() method in all microservices](./_README_/step4-4.md)
