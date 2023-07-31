# Treetracker Query API

This API exposes a RESTful interface to query the treetracker data, capture, planter and organization and others.

One of query api's client is our web map app: https://github.com/Greenstand/treetracker-web-map-client/

# Development toolkit

This repository was created from Greenstand's template for microservice projects. This means it comes with many development tools that we use for development and deployment. As a contributor to this repository, you should learn and use these tools. They are outlined below.

- Conventional Commits
- husky
- prettier / lint
- github actions
- Jest
- TypeScript

# Getting Started

## Project Setup

Open terminal and navigate to a folder to install this project:

```
git clone https://github.com/Greenstand/treetracker-repository-name.git

```

Install all necessary dependencies:

```
npm ci
```

Run the server with database settings:

```
DATABASE_URL=[...] npm run dev
```

Please join our slack channel to get help with setting up the database.

# Workflow with Github

[check out here](https://github.com/Greenstand/treetracker-web-map-client#workflow-with-github)

# Development Specification

- Every endpoint should have a e2e test to cover the main use cases.

- For edge cases, we can use unit tests to test the edge cases, don't need to use e2e test to cover all cases, e2e just cover main workflow.

- Class name should be capitalized.

- Do not write SQL directly in `router` and `model` files, there is a function called `delegateRepository` can help to simplify some simple cases;

- Please use `loglevel` to replace `console.log`, and always use appropriate log level to log.

# Architecture of this project

This project use multiple layer structure to build the whole system. The architecture follows some principles of [Domain Driven Design](https://en.wikipedia.org/wiki/Domain-driven_design). And inspired by this article: https://medium.com/spotlight-on-javascript/domain-driven-design-for-javascript-developers-9fc3f681931a

We compose/build the model instance in a functional style, then execute the business.

- **Protocol layer**

I think we can also call it the Application Layer, a term in the DDD, the entry of this project.

This microservice offers RESTFul API interface based on HTTP protocol. We use Express to handle all HTTP requests.

The Express-routers work like the controller role in MVC, they receive the requests and parameters from client, and translate it and dispatch tasks to appropriate business models. Then receive the result from them, translate to the 'view', the JSON response, to client.

- **Model layer**

The business model, most of the business logic is here. We are considering put most of the business logic in the model layer. So it should be the thickest layer, including all the business logic, and build up the relationship between models(business).

- **Infrastructure layer**

  - **Repository layer**

    Repository is responsible for communicating with the real database.

    All the SQL statements should be here.

  - **Others**

    For example, the Message Queue.

# About the documentation/specification

We use OpenAPI 3.0 to document the API.

You can copy the yaml file and import to swagger-ui to see the API.

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

**If errors:**

```

DATABASE_URL is undefined

or

{ "code": 500,"message": "Unknown error (self signed certificate in certificate chain)" }
```

**Follows those steps:**

1- Go to the .env file, copy the DATABASE_URL with its value.

2- Add it with NODE_TLS_REJECT_UNAUTHORIZED='0' , npm run test-e2e, and run the tests.

For example:

```

DATABASE_URL=[the link provided] NODE_TLS_REJECT_UNAUTHORIZED='0' npm run test-e2e
```

.
.
.
.
.
.
.
