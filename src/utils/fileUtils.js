exports.fetchFoldersAndFiles = async (userId, fileService) => {
  // uses req.user.id set by passport.deserializeUser()
  // calls a service method to retrieve all folders that belong to the current user
  const folders = await fileService.getUserFolders(userId);
  // calls a service method to retrieve all files that belong to the curent user
  const files = await fileService.getUserFiles(userId);
  return { folders, files };
};

exports.getUserFoldersAndStandaloneFiles = async (userId, fileService) => {
  const { folders, files: allFiles } = await exports.fetchFoldersAndFiles(
    userId,
    fileService
  );

  // creates a set containing all file IDs that are already associated with folders
  const fileIdsInFolders = new Set(
    /* folders - array of folder objects, each folder object containing a .files array
    folder.files.map(...) gets all file IDs within that folder
    flatMap(...) flattens all the arrays of file IDs into a single array 
    creates a Set of those file Ids for fast lookup */
    folders.flatMap((folder) => folder.files.map((file) => file.id))
  );

  /* allFiles - full list of the user's files
  .filter(...) keeps only the files whose IDs are not in fileIdsInFolders 
  returns an array of standalone files not assigned to any folder */
  const standaloneFiles = allFiles.filter(
    (file) => !fileIdsInFolders.has(file.id)
  );

  return { folders, standaloneFiles };
};
