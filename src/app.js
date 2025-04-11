// import express, backend framework for Node.js
const express = require("express");

// authentication middleware
const passport = require("./middleware/passportConfig");

/* where sessions are physically stored
Prisma session store persists session data in Prisma-managed db, local 
PostgreSQL */
const sessionMiddleware = require("./middleware/sessionStore");

// gives access to variables set in .env via `process.env.VARIABLE_NAME`
require("dotenv").config();

// three routers/inline middleware applied in route definitions below
const pageRoutes = require("./routes/page.routes");
const authRoutes = require("./routes/auth.routes");
const fileRoutes = require("./routes/file.routes");

// call express to initialize the app variable, my Express server
const app = express();

// sets view engine and template directory
const path = require("node:path");

// app.set - sets app-level configuration
// views/ is the directory where EJS templates are stored
app.set("views", path.join(__dirname, "../views"));

// tells Express to use EJS for rendering views
app.set("view engine", "ejs");

// app.use - registers app-level middleware functions
// parses incoming HTTP request bodies, req.body, for API endpoints
// API endpoint - specific URL path in an app that accepts a request and sends back a response
app.use(express.urlencoded({ extended: true }));

// parses incoming JSON request bodies, req.body, used for API endpoints
app.use(express.json());

/* session-based authentication 
/* FIRST NON-AUTHENTICATED REQUEST, NOT LOGIN, same as Request 1a or Request 1b 
- i. express-session parses the incoming Cookie header for connect.sid, sees no cookie
     express-session creates a new session, req.session if the session ID is not valid
-- it generates a new session ID, and hydrates/populates req.session (assigns the 
  new session ID to req.session) 
-- saves the session to PrismaSessionStore, only if the session is modified during the request */
app.use(sessionMiddleware);

app.use(passport.initialize());

/* Passport middleware uses sessions from session store to maintain login status 
- ii. passport.session() looks for serialized user ID inside the session
-- passport.session() sees no req.session.passport.user because user has not logged in yet, 
   skips calling deserializeUser because req.session.passport.user not found
   and does not call serializerUser at all because no authentication has taken place
- iii. request proceeds unauthenticated, req.user is undefined */
app.use(passport.session());

// router-level middleware - route definitions that registers routers
app.use("/", pageRoutes);
app.use("/auth", authRoutes);
app.use("/files", fileRoutes);

const PORT = process.env.PORT;
// starts the server, tells it to listen for incoming request on specified port
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
