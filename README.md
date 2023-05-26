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
