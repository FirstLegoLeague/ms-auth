[![npm](https://img.shields.io/npm/v/@first-lego-league/ms-auth.svg)](https://www.npmjs.com/package/@first-lego-league/ms-auth)
[![David Dependency Status](https://david-dm.org/FirstLegoLeague/ms-auth.svg)](https://david-dm.org/FirstLegoLeague/ms-auth)
[![David Dev Dependency Status](https://david-dm.org/FirstLegoLeague/ms-auth/dev-status.svg)](https://david-dm.org/FirstLegoLeague/ms-auth#info=devDependencies)
[![David Peer Dependencies Status](https://david-dm.org/FirstLegoLeague/ms-auth/peer-status.svg)](https://david-dm.org/FirstLegoLeague/ms-auth?type=peer)
[![Build status](https://ci.appveyor.com/api/projects/status/hppjrcyredan0xpd/branch/master?svg=true)](https://ci.appveyor.com/project/2roy999/ms-auth/branch/master)
[![GitHub](https://img.shields.io/github/license/FirstLegoLeague/ms-auth.svg)](https://github.com/FirstLegoLeague/ms-auth/blob/master/LICENSE)

## FIRST LEGO League Authentication & Authorization
Authentication and Authorization library using the Identity Provider module based on the _FIRST_ LEGO League TMS [Module Standard](https://github.com/FirstLegoLeagueIL/architecture/blob/master/module-standard/v1.0-SNAPSHOT.md#log-messages).

### Usage
The package has several routers for different tasks.

#### Authentication
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

### Contribution
To contribute to this repository, simply create a PR and set one of the Code Owners to be a reviewer.
Please notice the linting and UT, because they block merge.
Keep the package lightweight and easy to use.
Thank you for contributing!
