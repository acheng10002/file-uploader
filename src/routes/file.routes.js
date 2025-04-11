/* with file.controller.js, handles API endpoints for file uploads, downloads, and
metadata storage 
file.routes.js exposes API endpoints for file and folder operations */
const express = require("express");
const upload = require("../middleware/fileUpload");
const { ensureAuthenticated } = require("../middleware/authMiddleware");
const {
  createFolder,
  uploadFile,
  getFiles,
  updateFolder,
  deleteFolder,
} = require("../controllers/file.controller");

const router = express.Router();

/* Request 7: POST /files/folder creates a new folder 
- i. client submits /files/folder form 
- ii. route match: express matches the route in this file
- iii. middleware: ensureAuthenticated
-- checks whether req.user is defined, as set by Passport via deserializeUser
-- if req.user is defined, proceed to createFolder
-- if not, redirect to /auth 
- iv. createFolder controller runs if user is authenticated */
router.post("/folder", ensureAuthenticated, createFolder);

/* Request 8: POST /files/upload uploads a file 
multer places the uploaded file in /uploads and makes it available via req.file
- i. client submits /files/upload form 
- ii. route match: express matches the route in this file
- iii. middleware: ensureAuthenticated
-- checks whether req.user is defined, as set by Passport via deserializeUser
-- if req.user is defined, proceeds
-- if not, redirect to /auth 
- iv. middleware: upload.single("file")
-- comes from multer, and handles file parsing
--- parses the multipart/form-data request body
--- extracts the file from name="file"
--- writes the file to my local upload directory (e.g., /uploads)
--- attaches the parsed file to req.file
--- parses other form fields like folderId into req.body 
- v. uploadFile controller runs if user is authenticated */
router.post("/upload", ensureAuthenticated, upload.single("file"), uploadFile);

/* Request 9: GET /files gets all the user's files and shows file details 
(name, size, upload time, and a download button)
- i. route match: express matches the route in this file
- ii. middleware: ensureAuthenticated
-- checks whether req.user is defined, as set by Passport via deserializeUser
-- if req.user is defined, proceed to getFoldersAndFiles
-- if not, redirect to /auth 
- iii. getFoldersAndFiles controller runs if user is authenticated 
  API route to get list of files and folders, fetches a user's uploaded files */
router.get("/", ensureAuthenticated, getFiles);

/* Request 10: POST /files/folder/update/:folderId renames a folder 
- i. client submits /files/folder/update/:folderId form 
-- :folderId is a route parameter and populates req.params
- ii. route match: express matches the route in this file
- iii. middleware: ensureAuthenticated
-- checks whether req.user is defined, as set by Passport via deserializeUser
-- if req.user is defined, proceed to updateFolder
-- if not, redirect to /auth 
- iv. updateFolder controller runs if user is authenticated */
router.post("/folder/update/:folderId", ensureAuthenticated, updateFolder);

/* Request 11: POST /files/folder/delete/:folderId deletes a folder
- i. client submits /files/folder/delete/:folderId form 
- ii. route match: express matches the route in this file
- iii. middleware: ensureAuthenticated
-- checks whether req.user is defined, as set by Passport via deserializeUser
-- if req.user is defined, proceed to deleteFolder
-- if not, redirect to /auth 
- iv. deleteFolder controller runs if user is authenticated */
router.post("/folder/delete/:folderId", ensureAuthenticated, deleteFolder);

module.exports = router;
