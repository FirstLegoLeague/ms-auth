# SP

Service Provider library using jwt

## Usage

First, install the package:  
`npm install @first-lego-league/SP`

Or use yarn (prefered):  
`yarn add @first-lego-league/SP`

After the installation, you just need import it and add it to use it as a router. everything route that fits this router will be protected by the IdP:  
```javascript
app.use(require('SP'))
```

And dont forget to add to your configuration the Identity provider host:  
```json
{
	"idp": "http://your-idp-host:port"
}
```

If your service runs with the *launcher*, the launcher will provide it in the configuration parameter givven to your application.
