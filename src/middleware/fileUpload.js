/* imports multer middleware which handles multipart/form-data used for 
file uploads */
const multer = require("multer");
/* imports the Cloudinary storage engine for Multer, adapter that streams
files directly from Multer to my Cloudinary account */
const { CloudinaryStorage } = require("multer-storage-cloudinary");
/* imports the vsAPI of the core Cloudinary library to configure and 
interact with Cloudinary services */
const cloudinary = require("cloudinary").v2;
// loads env variables
require("dotenv").config();

/* configures Cloudinary 
initialize Cloudinary using credentials from .env
env variables authenticate my app for uploading files and accessing my 
Cloudinary account */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/* configures Cloudinary storage for Multer 
creates a new storage configuration that uses Cloudinary */
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    // folder in my Cloudinary dashboard that will store all uploaded files
    folder: "uploads",
    // restricts uploads to specific file types
    allowed_format: ["jpg", "png", "pdf", "docx", "txt"],
    // defines the filename (public ID) for each upload
    public_id: (req, file) => {
      const timestamp = Date.now();
      /* originalname.split(".")[0] removes the extension
      _${timestamp} ensures uniqueness */
      return `${file.originalname.split(".")[0]}_${timestamp}`;
    },
  },
});

// initializes and exports the Multer middleware
const upload = multer({ storage });

module.exports = upload;
