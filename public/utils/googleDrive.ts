export const loadImagesFromFolder = async (folderId: string, accessToken: string) => {
    try {
      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files?q='${folderId}'+in+parents+and+mimeType='image/jpeg'&fields=files(id,name,webViewLink,thumbnailLink)`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
  
      const data = await response.json();
      console.log("Images in Folder:", data.files);
      return data.files;
    } catch (error) {
      console.error("Error loading images:", error);
    }
  };
  