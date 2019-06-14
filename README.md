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
