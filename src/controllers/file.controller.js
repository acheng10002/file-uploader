/* with file.routes.js, handles API endpoints for file uploads, downloads, and
metadata storage 
file.controller.js handles JSON responses, not page rendering */
const fileService = require("../services/file.service");
const { fetchFoldersAndFiles } = require("../utils/fileUtils");

// creates a new folder (C)
exports.createFolder = async (req, res) => {
  try {
    // form data - extracts folderName from req.body
    const { folderName } = req.body;
    if (!folderName) return res.status(400).send("Folder name is required");

    // authenticated user - uses req.user.id set by passport.deserializeUser()
    // service call - calls a service method to save the fodler to the DB
    await fileService.createFolder(req.user.id, folderName);
    // redirects user to /dashboard after success
    res.redirect("../dashboard");
    // error handling
  } catch (error) {
    console.error("Error creating folder:", error);
    // sets the response's status code but does not end the req-res cycle
    res.status(500).render("error", { message: "Error creating folder" });
  }
};

// uploads a file, with optional folder selection
exports.uploadFile = async (req, res) => {
  if (req.body.folderId) {
    /* ensures folderId originally a string from form data is converted to an 
    integer for Prisma */
    req.body.folderId = parseInt(req.body.folderId);
  }
  try {
    /* if multer failed to attach req.file, reject the request with a 400 Bad Request 
    prevents attempting to persist invalid data */
    if (!req.file) return res.status(400).send("No file uploaded.");

    // calls service method to create a file and stores everything about it in the db
    await fileService.createFile({
      // extracts file metadata from req.file
      name: req.file.originalname,
      size: req.file.size,
      url: req.file.path,
      // gets the authenticated user ID via req.user
      userId: req.user.id,
      // allows selecting a folder
      folderId: req.body.folderId || null,
    });
    // redirects user to /dashboard after success
    res.redirect("/dashboard");
    // error handling
  } catch (error) {
    console.error("File upload failed:", error);
    res.status(500).render("error", { message: "File upload failed" });
  }
};

// gets all files for a user (R)
exports.getFiles = async (req, res) => {
  try {
    // uses a fileService to retrieve all folders and files
    const { files } = await fetchFoldersAndFiles(req.user.id, fileService);
    // renders files view, passing variables into the locals object
    res.render("files", { title: "My Files", files });
    // error handling
  } catch (error) {
    console.error("Failed to retrieve files:", error);
    res.status(500).render("error", { message: "Failed to retrieve files" });
  }
};

// renames a folder (U)
exports.updateFolder = async (req, res) => {
  try {
    /* req.params - dynamic route segments for route-based identifiers 
    req.params - mutable Express object that has optional key-value pairs, 
             source is the path parameters of the URL in an incoming HTTP GET, POST, 
             (etc.)request  
             ex. /users/123 
    req.params.id - used for route variables (to access dynamic segments in route paths), 
                    ID or identifiers in RESTful routes
    RESTFUL routes - standardized URL patterns used in web apps to perform CRUD operations 
                     on resouces via HTTP methods */
    // destructures folderId from req.params, getting the folder ID from the URL path
    const { folderId } = req.params;
    // destructures newName from req.body, getting the new folder name from the form
    const { newName } = req.body;
    // validates input
    if (!newName) return res.status(400).send("Folder name is required");
    // calls service method to update the folder in the db
    await fileService.updateFolder(folderId, req.user.id, newName);
    // redirect back to the dashboard after updating
    res.redirect("/dashboard");
    // error handling
  } catch (error) {
    console.error("Error updating folder:", error);
    res.status(500).render("error", { message: "Error updating folder" });
  }
};

// deletes a folder (D)
exports.deleteFolder = async (req, res) => {
  try {
    // destructures folderId from req.params, getting the folder ID from the URL path
    const { folderId } = req.params;
    // calls service method to delete the folder in the db
    await fileService.deleteFolder(folderId, req.user.id);
    // redirect back to the dashboard after deleting
    res.redirect("/dashboard");
    // error handling
  } catch (error) {
    console.error("Error deleting folder:", error);
    res.status(500).render("error", { message: "Error deleting folder" });
  }
};
