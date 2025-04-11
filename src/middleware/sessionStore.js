/* handles session persistence
configures/wraps express-session to persist session data in the db using Prisma
instantiates PrismaSessionStore to store sessions in PostgreSQL DB via Prisma
specifies session settings (e.g. cookie expiration, session cleanup)
it reads and writes session records using Prisma ORM 
express-session sets and persists connect.sid in the cookie header of the 
browser's request, checks if the session ID is valid, 
if valid, loads the session data, if not valid, creates a new session */
const session = require("express-session");

const { PrismaSessionStore } = require("@quixo3/prisma-session-store");

// imports ORM
const prisma = require("../db/prisma");

// ensures user stays logged in across requests
const sessionMiddleware = session({
  store: new PrismaSessionStore(prisma, {
    // store cleans up expired sessions from the db every 2 minutes
    checkPeriod: 2 * 60 * 1000,

    // tells the store to use the session ID as the primary key in the db
    dbRecordIdIsSessionId: true,

    /* raw session ID is used as is, though I could provide a custom function
    to transform the session ID into a db-safe record ID */
    dbRecordIdFunction: undefined,
  }),

  // used to encrypt session data
  secret: process.env.SESSION_SECRET,

  // prevents saving session if nothing changed
  resave: false,

  // does not create sessions for unauthenticated visitors
  saveUninitialized: false,

  // sets session duration at 24 hours
  cookie: {
    maxAge: 1000 * 60 * 60 * 24,
  },
});

module.exports = sessionMiddleware;
