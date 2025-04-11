// handles authentication logic
/* initializes Passport.js, defines the strategy (LocalStrategy), and implements
passport.serializeUser() and passport.deserializeUser() */
const passport = require("passport");
// Local Strategy is Passport's strategy for username/password authentication
const LocalStrategy = require("passport-local").Strategy;

// imports JS library to securely hash and compare passwords
const bcrypt = require("bcryptjs");
// imports database configuration
const prisma = require("../db/prisma");

/* first parameter to LocalStrategy constructor is options config object (optional) 
that defines custom field name, email, i.e. what fields to extract from req.body
(Passport expects username and password fields)
tells Passport to use req.body.email instead of default username */
const customField = { usernameField: "email" };

/* verifyCallback is function Passport uses to verify the user 
looks up the user by email, compares password, and 
calls done (null, user) if successful or calls done(null, false) if not */
const verifyCallback = async (email, password, done) => {
  try {
    // performs SELECT * FROM users WHERE email = ? LIMIT 1 behind the scenes
    const user = await prisma.user.findUnique({ where: { email } });
    /* if no user object found, complete authentication process
    done(error, user, info) - no error, no user object passed */
    if (!user) return done(null, false);
    /* if user object found, bcrypt compares inputted password with user object's 
    password property */
    const isMatch = await bcrypt.compare(password, user.password);
    // if no match - no error, no user object passed
    if (!isMatch) return done(null, false);
    // if there is a match, no error, a user object passed (lets user into the route)
    return done(null, user);
    // catch any errors with Express
  } catch (err) {
    // error gets passed to Passport
    return done(err);
  }
};

/* second parameter to LocalStrategy constructor is verifyCallback the verifies the 
user (queries database, checks password, etc.) 
creates a new Local Strategy */
const strategy = new LocalStrategy(customField, verifyCallback);

/* registers the strategy with Passport 
when I call passport.authenticate("local"), Passport will use the strategy I configured */
passport.use(strategy);

/* serializes the authenticated user into the session, via express-session and PrismaSessionStore
will run after login succeeds, inside passport.authenticate(...)
serializeUser stores user.id into the session, stores it as new user property */
passport.serializeUser((user, done) => {
  done(null, user.id);
});

/* deserializes the session back into a full user object on each request 
will run on every request when a valid session cookie, connect.sid is present 
this is how Passport rehydrates the loegged-in user across requests */
passport.deserializeUser(async (id, done) => {
  try {
    /* takes user id that was stored in the session (from req.session.passport.user) and 
    find it in the db */
    const user = await prisma.user.findUnique({ where: { id } });
    // populates req.user with user object from db
    done(null, user);
  } catch (err) {
    done(err);
  }
});

module.exports = passport;
