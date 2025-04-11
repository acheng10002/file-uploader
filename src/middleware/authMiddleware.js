/* protects routes by checking if req.user is set/rehydrated by Passport 
req - req object represents the incoming HTTP reqest
res - res object represents the HTTP response that will be sent back to the client
next - function that passes control to the next middleware */
exports.ensureAuthenticated = (req, res, next) => {
  // if user is authenticated, pass them onto the next middleware
  if (req.isAuthenticated()) {
    return next();
  }

  // if not, redirect unauthenticated user to /auth
  res.redirect("/auth");
};
