# Treetracker Query API
   
This API exposes a RESTful interface to query the treetracker data, capture, planter and organization and others.

# Development toolkit

This repository was created from Greenstand's template for microservice projects.  This means it comes with many development tools that we use for development and deployment.  As a contributor to this repository, you should learn and use these tools.  They are outlined below.

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

Run the server with database settings:

```
DATABASE_URL=[...] npm run server
```

Please join our slack channel to get help with setting up the database.

# Workflow with Github

[check out here](https://github.com/Greenstand/treetracker-web-map-client#workflow-with-github)

# Architecture of this project

This project use multiple layer structure to build the whole system. Similar with MVC structure:

![layers](/layers.png "layers")


* **Protocol layer**

Wallet API offers RESTFul API interface based on HTTP protocol. We use Express to handle all HTTP requests.

The Express-routers work like the controller role in MVC, they receive the requests and parameters from client, and translate it and dispatch tasks to appropriate business objects. Then receive the result from them, translate to the 'view', the JSON response, to client.

* **Model layer**

The business model, most of the business logic is here. They are real object.

* **Service layer**

Both service layer and model layer are where all the business logic is located. Comparing to the Model , `service` object don't have state (stateless).  

Please put business logic code into service object when it is hard to put them into the `Model` file.

* **Repository layer**

Repository is responsible for communicate with the real database, this isolation brings flexibility for us, for example, we can consider replace the implementation of the storage infrastructure in the future.

All the SQL statements should be here.

# How to test

## Unit test

To run the unit tests:

```
npm run test-unit
```

## End to End test

All the end to end tests are located under folder `__tests__/e2e`, the test will run against the dev database.

To run the integration test:

Run tests:

```
npm run test-e2e
```

