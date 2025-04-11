// registers auth-related endpoints
// brings in Express router and Passport for authentication middleware
const express = require("express");
const passport = require("passport");

// imports controller functions
const {
  renderAuth,
  registerUser,
  logoutUser,
} = require("../controllers/auth.controller");

// instantiates a new Express router
const router = express.Router();

/* router.METHOD registers router-level middleware
each of these are route handlers, functions that respond to specific
HTTP requests
"/" - route path
page-rendering GET requests, do not call passport.authenticate("local")
they're not where credentials are submitted
renders the login/register page passed on the query string */
/* Request 1a: GET /auth?mode=register 
- route match: router.get("/auth", renderAuth)
- controller: auth.controller.js (renderAuth) 
- action: reads req.query.mode = "register"
- view: renders auth.ejs with mode="register" 

/* Request 1b: GET /auth?mode=login
- route match: router.get("/auth", renderAuth)
- controller: auth.controller.js (renderAuth) 
- action: reads req.query.mode = "login"
- view: renders auth.ejs with mode="login" */
router.get("/", renderAuth);

// handles registration and logout
/* Request 2a: POST /auth/register
- route match: router.post("/auth/register", registerUser)
- controller: auth.controller.js (registerUser) 
- action: 
-- reads req.body (name, email, password)
-- hashes password with bcrypt
-- creates new user in db via prisma.user.create()
- response: server redirects browser to /auth?mode=login */
router.post("/register", registerUser);

// Express session flow with Passport and Prisma session store (EPPSS)
/* processes login form submissions via Passport 
no separate loginUser controller is needed */
/* Request 2b: POST /auth/login
FIRST REQUEST W/ LOGIN , same as Request 2b
- i. client logs in/ Login request from client browser
-- route match: router.post("/auth/login", passport.authenticate("local"))
-- incoming request data sent by the client includes:
   req.body - HTTP POST body for form data from the client
   (needs parsing middleware above)
-- req.body - available request payload containingthe actual login form fields sent by the client 
              source is the form submission body/request body/data in an incoming HTTP POST request
   ex. /login with { email, password } in body 
       Client POSTs to /auth/login
       req.body = { email, password } 
- ii. middleware execution, before authentication
-- middleware: express-session (new session created, req.session initialized)
   no cookie -> new session created -> req.session initialized 
   express-session creates or loads session data, req.session, from Prisma session store 
   if the session ID extracted by express-session is valid express-session hydrates/
   populates req.session
-- middleware: passport.initialize()
-- middleware: passport.session() - no user yet, skips deserialization */
// routes login form to Passport
router.post(
  "/login",
  /* - iii. authentication middleware: passport.authenticate("local")
  -- LocalStrategy runs, uses req.body.email and req.body.password
  -- success (user validated via verifyCallback): user object returned */
  passport.authenticate("local", {
    /* iv. if passport.authenticate() successfully logs in a user,  
    - Passport runs serializeUser(user)
    -- serializeUser writes user identity into the session and is called only once, during 
       successful login
    -- req.session.passport contains { user: <user.id> }, stores user.id in req.session.passport.user
    --  req.session.passport.user - value that stores the user ID in session after login 
                                    managed by passport.serializeUser(), for session persistence, 
                                    should not be mutated
                                    needs passport and express-session middlewares
    - v. session finalization/ express-session on response
    -- req.user is not yet set by passport.session(), so it's undefined
    -- marks session as modified
    -- writes/saves the updated session to PrismaSessionStore
    -- server sends headers and body to browser, set-cookie: connect.sid=<session_id> 
       res.headers["Set-Cookie"] containing connect.sid=<session_id>, and browser stores that cookie
    - vi. response to client
    -- server redirects browser to /dashboard */
    successRedirect: "/dashboard",
    /* if passport.authenticate() fails, Request 1b instead */
    failureRedirect: "/auth?mode=login",
  })
);

/* Request 3: GET /dashboard is in page.routes.js
Request 4: GET /logout
- i. route match: router.get("/logout", logoutUser)
- ii. controller: auth.controller.js (logoutUser) 
- iii. action: calls req.logout() to remove req.user
- iv. response: server redirects browser to /auth?mode=login  */
router.get("/logout", logoutUser);

module.exports = router;
