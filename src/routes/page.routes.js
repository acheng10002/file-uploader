/* with page.controller.js, renders EJS views (HTML pages) for UI 
handles server-side rendering */
const express = require("express");
const { ensureAuthenticated } = require("../middleware/authMiddleware");
const {
  renderHome,
  renderDashboard,
  renderUpload,
} = require("../controllers/page.controller");

const router = express.Router();

/* public homepage 
- i. trigger client browser navigates to route
-- Express matches the route in this file
- ii. controller renders index.ejs view */
router.get("/", renderHome);

// dashboard (authenticated users)
/* Request 3/ after Request 2b: GET /dashboard (after login)
NEXT AUTHENTICATED REQUESTS 
- i. trigger
-- browser follows the redirect with a cookie, Cookie: connect.sid=<session_id>, or
   client browser sends a request containing a session cookie, connect.sid, it got from 
   express-session, to the server
   req.headers.cookie = connect.sid
-- req.headers.cookie - raw string of all cookies sent by browser, 
                        source is HTTP request header
                        does not need middleware
                        ex. connect.sid=sid=s%3Aabc123...
                        use it to debug session transmission 
- ii. middleware execution: express-session
-- server receives the cookie
-- express-session reads req.headers.cookie from the browser's request, extracts 
   the session ID, connect.sid, from that Cookie header 
-- express-ession runs PrismaSessionStore.get(session_id) which queries the db for the 
   session with that session ID
-- session is found via Prisma ORM, express-session loads req.session from db
-- ex. req.session = { passport: { user: 7 } } 
-- req.session - server-side object to persist per-user state managed by express-session
- iii. middleware execution : passport.session()
-- passport.session() looks for and reads serialized user ID
-- req.session.passport.user = user.id, passport.session calls deserializeUser(user.id)
-- deserializeUser uses session data to authenticate and populate/rehydrate req.user:
  → passport.deserializeUser(7) → retrieves, req.user = full user object from the db via 
    Prisma
  → ex. req.user = { id: 7, name: "Alice" }
-- req.user - full user object for current request, set by passport.deserializeUser()
-- req.user is attached to each request if the session is authenticated
-- req.user does not persist sessions 
- iv. custom middleware execution: ensureAuthenticated
-- checks req.isAuthenticated === true which allows the request to proceed
-- controller/route: proceeds to render dashboard 
-- request proceeds with authenticated content   
-- Passport makes authenticated user available to any route handler via req.user, routes 
  now have access to:
--- req.session (raw session data), loaded by express-session 
--- req.user (authenticated user), loaded by passport.session 
--- req.query, req.params, req.body 

Request 5: GET /dashboard (after logout)
Cookie: connect.sid=<session_id> still present
- i. middleware: express-session
-- loads session if it's still in db
- ii. middleware: passport.session()
-- sees no valid user
- iii. req.user = undefined
- iv. middleware: ensureAuthenticated
-- checks req.isAuthenticated === false
-- server redirects to /auth
- v. renders dashboard.ejs view */
router.get("/dashboard", ensureAuthenticated, renderDashboard);

/* Request 6: GET /files/upload 
- i. trigger client browser navigates to route
- ii. route match: express matches the route in this file
- iii. middleware: ensureAuthenticated
-- checks whether req.user is defined, as set by Passport via deserializeUser
-- if req.user is defined, proceed to renderUpload
-- if not, redirect to /auth 
- iv. controller renders upload.ejs view if user is authenticated */
router.get("/files/upload", ensureAuthenticated, renderUpload);

module.exports = router;
