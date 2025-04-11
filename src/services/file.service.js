/* service layer that encapsulates business logic and data access logic, 
separate from route/controller concerns */
const prisma = require("../db/prisma");

/* creates a folder 
inputs are authenticated user's ID and name of the folder the user wants 
to create */
exports.createFolder = async (userId, folderName) => {
  /* returns a promise that resolves to the newly created folder record 
  invokes Prisma Client's .create() method
  creates a new record in the Folder table in my db */
  return prisma.folder.create({
    /* data passed to Prisma to insert into the db
    maps to the fields in my Prisma schema */
    data: { name: folderName, userId },
  });
};

// renames a folder
exports.updateFolder = async (folderId, userId, newName) => {
  /* uses Prisma Client to query the Folder table */
  return prisma.folder.updateMany({
    // ensures the folder belongs to the authenticated user
    where: {
      id: parseInt(folderId),
      userId: userId,
    },
    /* data passed to Prisma to update the folder name in the db
    maps to the field in my Prisma schema */
    data: { name: newName },
  });
};

/* gets array of folders with their files for a user 
input is authenticated user's ID to scope results to them */
exports.getUserFolders = async (userId) => {
  /* uses Prisma Client to query the Folder table, retrieving all 
  matching records, array of folders */
  return prisma.folder.findMany({
    // filters folders where the userID field matches the current user
    where: { userId },
    // ensures each user only sees their own folders
    include: { files: true },
  });
};

// creates a file, optionally assigning it to a folder
exports.createFile = async (fileData) => {
  /* returns a promise that resolves to the newly created file record
  invokes Prisma Client's .create() method 
  creates a new record in the File table in my db */
  return prisma.file.create({
    /* data passed to Prisma to insert into the db 
    maps to the fields in my Prisma schema */
    data: {
      name: fileData.name,
      size: fileData.size,
      url: fileData.url,
      userId: fileData.userId,
      // file can belong to a folder or be standalone
      folderId: fileData.folderId ? parseInt(fileData.folderId) : null,
    },
  });
};

/* gets array of files for a user, including those inside folders 
input is authenticated user's ID to scope results to them */
exports.getUserFiles = async (userId) => {
  // uses Prisma Client to query the File table
  return prisma.file.findMany({
    // filters by user so only that user's files are returned
    where: { userId },
    // sorts results in reverse chronological order
    orderBy: { uploadedAt: "desc" },
  });
};

/* get files in a specific folder 
inputs are the id of the folder and the authenticated user's ID */
exports.getFilesInFolder = async (folderId, userId) => {
  // uses Prisma Client to query the File table
  return prisma.file.findMany({
    /* filters files by the specified folder, and ensures the user 
    only accesses their own files */
    where: { folderId, userId },
  });
};

/* deletes a folder and its files
inputs are the id of the folder to be deleted and the authenticated 
user's ID, ensures only the owner can delete the folder  */
exports.deleteFolder = async (folderId, userId) => {
  /* converts folderId string from the route param into an integer 
  ensures it matches the id column (which is type Int in Prisma schema) */
  const parsedId = parseInt(folderId);

  // delete files in this folder
  await prisma.file.deleteMany({
    where: { folderId: parsedId, userId },
  });

  /* allows safe deletion even if no record matches
  prevents exceptions if the folder doesn't exist or isn't owned by the user */
  return prisma.folder.deleteMany({
    where: {
      id: parsedId,
      // enforces that only the owner of the folder can delete it
      userId,
    },
  });
};
