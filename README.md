# LIBRARY-API
[![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB)](https://expressjs.com/)[![MongoDB](https://img.shields.io/badge/MongoDB-%234ea94b.svg?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)[![ESLint](https://img.shields.io/badge/ESLint-4B3263?style=for-the-badge&logo=eslint&logoColor=white)](https://eslint.org/)[![Lodash](https://img.shields.io/badge/Lodash-fff?style=for-the-badge&logo=Lodash)](https://lodash.com/)[![.ENV](https://img.shields.io/badge/.ENV-22272e?style=for-the-badge&logo=.env)](https://github.com/motdotla/dotenv#readme)[![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)

**LIBRARY API** is a REST API that provides endpoints for querying database.

## Documentation

List of available endpoints is described [HERE]()

## Installation

#### Clone the repo and install dependencies:

```bash
git clone https://github.com/michalszc/Library-api.git
cd Library-api
npm install
```

#### Set environment variables (.env):

```bash
NODE_ENV=development
PORT=8080
MONGO_URI=mongodb://127.0.0.1:27017/library
```

## Running in Development

```bash
npm run dev
```

## Running in Production

```bash
npm run start
```

## Lint

```bash
# lint code with ESLint
npm run eslint

# try to fix ESLint errors
npm run eslint:fix
```

## Test

```bash
# run all tests with jest
npm run test

# run all tests and watch for changes
npm run test:watch

# run all tests and report coverage information
npm run test:coverage
```

## Validate

```bash
# run lint and tests
npm run validate
```

## Logs

```bash
# show logs in production
pm2 logs
```

## Generate Documentation

```bash
# generate documentation
npm run docs
```

## Docker

```bash
# run container in development
npm run docker:dev

# run container in production
npm run docker:prod
```

## License
[![Licence](https://img.shields.io/github/license/michalszc/BrainfuckIDE?style=for-the-badge)](./LICENSE)
