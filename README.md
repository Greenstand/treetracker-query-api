# Name of this microservice
   
Description of this microservice

# Development toolkit

This repository was created from Greenstand's template for microservice projects.  This means it comes with many development tools that we use for development and deployment.  As a contributor to this repository, you should learn and use these tools.  They are outlined below.

## db-migrate
## Conventional Commits
## husky
## prettier / lint
## github actions
## mocha


# Getting Started
  
## Project Setup

Open terminal and navigate to a folder to install this project:

```
git clone https://github.com/Greenstand/treetracker-repository-name.git

```
Install all necessary dependencies: 

```
npm install
```



### Database Setup

This repository using db-migrate to manage database migrations for its schema.

```
cd database/
db-migrate --env dev up
```

If you have not installed db-migrate globally, you can run:

```
cd database/
../node_modules/db-migrate/bin/db-migrate --env dev up
```

Documentation for db-migrate: https://db-migrate.readthedocs.io/en/latest/

# Architecture of this project

This project use multiple layer structure to build the whole system. Similar with MVC structure:

![layers](/layers.png "layers")


* **Protocol layer**

Wallet API offers RESTFul API interace based on HTTP protocol. We use Express to handle all HTTP requests.

The Express-routers work like the controller role in MVC, they receive the requests and parameters from client, and translate it and dispatch tasks to appropriate business objects. Then receive the result from them, translate to the 'view', the JSON response, to client.

* **Service layer**

Both service layer and model layer are where all the business logic is located. Comparing to the Model , `service` object don't have state (stateless).  

Please put business logic code into service object when it is hard to put them into the `Model` object.

Because we didn't use Factory or dependency injection to create object, so service layer also can be used as Factory to create `model` object.

* **Model layer**

The business model, major business logic is here. They are real object, in the perspective of object oriented programming: they have states, they have the method to do stuff. 

There are more discussion about this, check below selection.

* **Repository layer**

Repository is responsible for communicate with the real database, this isolation brings flexibility for us, for example, we can consider replace the implementation of the storage infrastructure in the future.

All the SQL statements should be here.



# How to test

## Unit test

To run the unit tests:

```
npm run test-unit
```

## Integration test

All the integration tests are located under folder `__tests__`

To run the integration test:

Run tests:

```
npm run test-integration
```

## Database seeding test
In order to efficiently run our integration tests, we rely on automated database seeding/clearing functions to mock database entries. To test these functions, run:

```
npm run test-seedDB
```

## Suggestion about how to run tests when developing

There is a command in the `package.json`:

```
npm run test-watch
```

By running test with this command, the tests would re-run if any code change happened. And with the `bail` argument, tests would stop when it met the first error, it might bring some convenience when developing.

NOTE: There is another command: `test-watch-debug`, it is the same with `test-watch`, except it set log's level to `debug`.

## Postman

Can also use Postman to test the API manually.

To run a local server with some seed data, run command:

```
npm run server-test
```

This command would run a API server locally, and seed some basic data into DB (the same with the data we used in the integration test).




