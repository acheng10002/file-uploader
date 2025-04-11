/* handles rendering the login/register form (renderAuth)
handles form submissions (registerUser, logoutUser) */
// imports Prisma Client from prisma.js wrapper
const prisma = require("../db/prisma");

// imports dependency for hashing pws securely before storing them in the db
const bcrypt = require("bcryptjs");

// controller functon to render login/register view based on mode query parameter
exports.renderAuth = (req, res) => {
  /* req.query property - mutable Express object that has optional key-value pairs, 
                          source is the query string of the URL in an incoming HTTP 
                          GET request 
                          ex. /auth?mode=login
   req.query.key - used for filtering with search terms, toggles, mode switching, or 
   config via URL */
  console.log(req.query.mode);

  /* ?mode is a query parameter and populates req.query
  reads ?mode=login or ?mode=register from the query string, defaults to login */
  const mode = req.query.mode || "login";

  // render view and send the resulting HTML as a response
  // renders auth.ejs and injects mode and title into the view
  res.render("auth", { title: mode === "login" ? "Login" : "Register", mode });
};

// controller function to extract submitted registration form data from body of the POST request
exports.registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  // hashes the password before storing it in the db
  const hashedPassword = await bcrypt.hash(password, 10);

  // inserts new user into the db
  await prisma.user.create({
    data: { name, email, password: hashedPassword },
  });

  // redirect client to a different URL
  // redirects user to the login screen after successful registration
  res.redirect("/auth?mode=login");
};

// logs the user out (same as Request 3) and redirects them to the login screen
exports.logoutUser = (req, res) => {
  /* passport.initialize() and passport.session() add req.logout() to the request object 
  - logs out the current user
  - removes req.user
  - removes req.session.passport.user 
  - marks the session as modified
  - saves the session */
  req.logout(() => {
    res.redirect("/auth?mode=login");
  });
};
