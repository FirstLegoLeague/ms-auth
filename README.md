[![npm](https://img.shields.io/npm/v/@first-lego-league/ms-auth.svg)](https://www.npmjs.com/package/@first-lego-league/ms-auth)
[![codecov](https://codecov.io/gh/FirstLegoLeague/ms-auth/branch/master/graph/badge.svg)](https://codecov.io/gh/FirstLegoLeague/ms-auth)
[![Build status](https://ci.appveyor.com/api/projects/status/65scfycp2uyg83ri/branch/master?svg=true)](https://ci.appveyor.com/project/2roy999/ms-auth/branch/master)
[![GitHub](https://img.shields.io/github/license/FirstLegoLeague/ms-auth.svg)](https://github.com/FirstLegoLeague/ms-auth/blob/master/LICENSE)

[![David Dependency Status](https://david-dm.org/FirstLegoLeague/ms-auth.svg)](https://david-dm.org/FirstLegoLeague/ms-auth)
[![David Dev Dependency Status](https://david-dm.org/FirstLegoLeague/ms-auth/dev-status.svg)](https://david-dm.org/FirstLegoLeague/ms-auth#info=devDependencies)
[![David Peer Dependencies Status](https://david-dm.org/FirstLegoLeague/ms-auth/peer-status.svg)](https://david-dm.org/FirstLegoLeague/ms-auth?type=peer)

# FIRST LEGO League Authentication & Authorization
Authentication and Authorization package for interacting with the [IdP (Identity Provider) module](https://github.com/FirstLegoLeague/identity-provider), working according to the _FIRST_ LEGO League TMS [Module Standard authentication section](https://github.com/FirstLegoLeague/architecture/blob/master/module-standard/v1.0-SNAPSHOT.md#authentication).

## Logic
This package contains several middlewares, each with a specific function:
* The Autentication middleware: redirects to the IdP if the user data is not saved, and save the data to the request. Also recieves the data from the IdP.
* The Authorization middleware: sends status 403 if the user is not in the givven array parameter.
* The Development Autentication middleware: saves a fake username data to the request, as if the IdP did it.

## Usage
The package has several routers for different tasks.

### Authentication
Meant only to identify the user. If the user has no identification, it redirects them to the Identity Provider service:
```javascript
const Router = require('router')
const { authenticationMiddleware } = require('@first-lego-league/ms-auth')

const router = new Router()
router.use(authenticationMiddleware)
```
If you want a development version, which will not send you to the IdP, use:
```javascript
const Router = require('router')
const { authenticationDevMiddleware } = require('@first-lego-league/ms-auth')

const router = new Router()
router.use(authenticationDevMiddleware('username'))
```
Where the username is the identification of the user, no matter what.

### Autorization
Meant to define which roles can access each route: 
```javascript
const Router = require('router')
const { authorizationMiddleware } = require('@first-lego-league/ms-auth')

const router = new Router()
router.use('some_route', authorizationMiddleware(['roles', 'that', 'can', 'use', 'this', 'route']))
```

## Contribution
To contribute to this repository, simply create a PR and set one of the Code Owners to be a reviewer.
Please notice the linting and UT, because they block merge.
Keep the package lightweight and easy to use.
Thank you for contributing!
