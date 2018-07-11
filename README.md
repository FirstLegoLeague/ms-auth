# MS-Authentication

Authentication and Authorization library using the Identity Provider module based on the MS (Module Standard)

## Usage

First, install the package:  
`npm install @first-lego-league/ms-auth`

Or use yarn (prefered):  
`yarn add @first-lego-league/ms-auth`

After the installation, you just need import it and add it to use it as a router. everything route that fits this router will be protected by the IdP:  
```javascript
const { authenticationMiddleware } = require('@first-lego-league/ms-auth')
app.use(authenticationMiddleware)
```
And for dev servers (Faking an authentication cookie):
```javascript
const { authenticationDevMiddleware } = require('@first-lego-league/ms-auth')
app.use(authenticationDevMiddleware)
```
For authorization of some users, you can use:
```javascript
const { authorizationMiddleware } = require('@first-lego-league/ms-auth')
app.use(authorizationMiddleware(arrayOfAuthorizedUsers))
```

## Development
1. Fork this repository
2. make some changes
3. create a Pull Request
4. Wait for a CR from the code owner
5. make sure everything is well
6. merge

A few things to notice while developing:
* Use `yarn` not `npm`
* Follow javascript standard as described [here](https://standardjs.com/)
* Keep the package lightweight and easy to use
* Don't break API if not neccessary
* Be creative and have fun
