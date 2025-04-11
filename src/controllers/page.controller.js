/* with page.routes.js, renders EJS views (HTML pages) for UI 
handles server-side rendering */
const fileService = require("../services/file.service");
const { getUserFoldersAndStandaloneFiles } = require("../utils/fileUtils");

// renders homepage passing in title as locals object
exports.renderHome = (req, res) => {
  res.render("index", { title: "File Uploader App" });
};

// renders dashboard
exports.renderDashboard = async (req, res) => {
  try {
    /* fetches folders and files, deduplicates by extracting folder-contained files, 
    and filters for standalone files */
    const { folders, standaloneFiles } = await getUserFoldersAndStandaloneFiles(
      req.user.id,
      fileService
    );
    // renders dashboard, passing it variables in the locals object
    res.render("dashboard", {
      title: "Dashboard",
      user: req.user,
      folders,
      files: standaloneFiles,
    });
    // error handling
  } catch (error) {
    console.error("Error rendering dashboard:", error);
    res.status(500).render("error", { message: "Error loading dashboard" });
  }
};

exports.renderUpload = async (req, res) => {
  try {
    // uses req.user.id set by passport.deserializeUser()
    // calls a service method to retrieve all folders that belong to the current user
    const folders = await fileService.getUserFolders(req.user.id);
    // renders the upload form, passing it folders in the locals object
    res.render("upload", { title: "Upload File", folders });
    // error handling
  } catch (error) {
    console.error("Error rendering upload page:", error);
    res.status(500).render("error", { message: "Failed to load upload view" });
  }
};
