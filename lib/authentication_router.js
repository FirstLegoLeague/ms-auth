
const Router = require('router')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const jwt = require('jsonwebtoken')
const url = require('url')

const { Logger } = require('@first-lego-league/ms-logger')

const { setCookies, redirect } = require('./common')

const TOKEN_KEY = 'auth-token'
const USERNAME_KEY = 'username'
const TOKEN_EXPIRATION = 24 * 60 * 60 * 1000 // day
const HOME_ROUTE = '/'

const router = new Router()
const logger = new Logger()

const secret = process.env.SECRET
const publicRoutes = ['/consume_token']

router.use(cookieParser())
router.use(bodyParser.json())
router.use(bodyParser.urlencoded({ extended: true }))

router.use((req, res, next) => {
  res.redirectToIdP = function () {
    // The new api is demanding a full URL (including protocol and domain) which
    // we don't get at this url. The IncommingMessage docs is still recommending
    // using url.parse
    // eslint-disable-next-line node/no-deprecated-api
    const { pathname } = url.parse(req.url)
    redirect(res, process.env.MODULE_IDENTITY_PROVIDER_URL +
      `/login?callbackUrl=${req.get('host')}${pathname}${pathname.endsWith('/') ? '' : '/'}consume_token`)
  }

  next()
})

router.use((req, res, next) => {
  // The new api is demanding a full URL (including protocol and domain) which
  // we don't get at this url. The IncommingMessage docs is still recommending
  // using this api.
  // eslint-disable-next-line node/no-deprecated-api
  if (publicRoutes.includes(url.parse(req.url).pathname)) {
    return next()
  }

  const existingAuthToken = req.headers[TOKEN_KEY] || req.cookies[TOKEN_KEY]
  try {
    jwt.verify(existingAuthToken, secret)
    next()
  } catch (err) {
    logger.info('Redirecting to Identity Provider: No auth token found.')
    res.redirectToIdP()
  }
})

router.use('/consume_token', (req, res) => {
  // The new api is demanding a full URL (including protocol and domain) which
  // we don't get at this url. The IncommingMessage docs is still recommending
  // using this api.
  // eslint-disable-next-line node/no-deprecated-api
  const token = url.parse(req.url, true).query.token || req.body.token
  if (!token) {
    logger.warn('Redirecting to Identity Provider: No auth token found.')
    res.redirectToIdP()
  } else {
    try {
      const verifiedUser = jwt.verify(token, secret)
      req.user = verifiedUser

      setCookies(res, {
        [USERNAME_KEY]: verifiedUser.username,
        [TOKEN_KEY]: token
      }, { maxAge: TOKEN_EXPIRATION })

      redirect(res, HOME_ROUTE)
    } catch (err) {
      logger.warn('Redirecting to Identity Provider: Found Illegal auth token.')
      res.redirectToIdP()
    }
  }
})

router.get('/logout', (req, res) => {
  setCookies(res, {
    [USERNAME_KEY]: '',
    [TOKEN_KEY]: ''
  }, { expires: new Date(1) })

  // The new api is demanding a full URL (including protocol and domain) which
  // we don't get at this url. The IncommingMessage docs is still recommending
  // using this api.
  // eslint-disable-next-line node/no-deprecated-api
  const { host, pathname } = url.parse(req.url)
  redirect(res, process.env.MODULE_IDENTITY_PROVIDER_URL +
    `/logout?callbackUrl=${host}${pathname.replace('logout', '')}consume_token`)
})

exports.router = router
