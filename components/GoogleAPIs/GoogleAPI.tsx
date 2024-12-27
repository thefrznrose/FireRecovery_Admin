export const fetchFileContent = async (fileId: string | null, accessToken: string): Promise<Blob> => {
    console.log(accessToken)
    if (!fileId) throw new Error("fileId cannot be null");
    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    if (!response.ok) throw new Error(`Error fetching file: ${response.statusText}`);
    return await response.blob();
  };
  
  export const extractFileId = (url: string) => {
    const match = url.match(/id=([a-zA-Z0-9-_]+)/);
    return match ? match[1] : null;
  };
  
  export const fetchSheetData = async (spreadsheetId: string, accessToken: String) => {
    console.log(accessToken)
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Form Responses 1`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    if (!response.ok) throw new Error("Error fetching sheet data");
    return await response.json();
  };
  
  export const deleteFile = async (fileId: string, accessToken: string) => {
    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    if (!response.ok) throw new Error("Error deleting file");
  };
  
  export const deletePhoto = async (
    photo: any,
    index: number,
    spreadsheetId: string,
    accessToken: string,
    setPhotos: React.Dispatch<React.SetStateAction<any[]>>
  ) => {
    console.log(accessToken)
    if (!spreadsheetId) {
      console.error("Spreadsheet ID is not defined. Please select a sheet first.");
      return;
    }
  
    const fileId = extractFileId(photo.fileLink);
    const isConfirmed = window.confirm(
      "Are you sure you want to delete this photo? This action cannot be undone."
    );
    if (!isConfirmed) return;
    if (!fileId) {
      console.error("File ID not found.");
      return;
    }
  
    try {
      // Delete the file from Google Drive
      await deleteFile(fileId, accessToken);
  
      // Delete the row from the spreadsheet
      const rowIndex = index + 2; // Spreadsheet rows are 1-indexed and include a header
      const sheetResponse = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Form Responses 1!A${rowIndex}:F${rowIndex}:clear`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!sheetResponse.ok) {
        const error = await sheetResponse.json();
        console.error("Google Sheets API Error:", error);
        return;
      }
  
      // Update state to remove the deleted photo
      setPhotos((prevPhotos) => prevPhotos.filter((_, i) => i !== index));
    } catch (error) {
      console.error("Error deleting photo:", error);
    }
  };
  
  // Load the Google Picker API
  export const loadPicker = (accessToken: string, gapiLoaded: boolean): void => {
    if (!gapiLoaded || !accessToken) {
      console.error("Google Picker API or Access Token not available");
      return;
    }
    window.gapi.load("picker", { callback: () => createPicker(accessToken) });
  };
  

const createPicker = (accessToken: string ) => {
    console.log(accessToken)
    if (!accessToken) return;
    const picker = new window.google.picker.PickerBuilder()
      .addView(
        new window.google.picker.DocsView()
          .setIncludeFolders(false) // Exclude folders
          .setMimeTypes("application/vnd.google-apps.spreadsheet") // Restrict to Google Sheets
          .setSelectFolderEnabled(false) // Disable folder selection
      )
      .setOAuthToken(accessToken)
      .setDeveloperKey(process.env.NEXT_PUBLIC_GOOGLE_API_KEY!)
      .setCallback(handlePickerResponse)
      .build();
    picker.setVisible(true);
  };

  const handlePickerResponse = async (response: any, accessToken: String, 
    setSpreadsheetId: React.Dispatch<React.SetStateAction<any[]>>) => {
        console.log(accessToken)
    if (response.action === "picked") {
      const selectedItems = response.docs;
      const selectedSheet = selectedItems.find((item: any) =>
        item.mimeType.includes("application/vnd.google-apps.spreadsheet")
      );
      if (selectedSheet) {
        console.log("Selected Google Sheet:", selectedSheet);
        const sheetId = selectedSheet.id;
        setSpreadsheetId(sheetId); // Save in state
        localStorage.setItem("spreadsheetId", sheetId); // Save to localStorage
        await fetchSheetData(sheetId, accessToken); // Fetch data from the selected sheet
      }
    }
  };

  export const fetchThumbnails = async (photoData: any[], accessToken: String) => {
    const thumbnails = await Promise.all(
      photoData.map(async (photo) => {
        const fileId = extractFileId(photo.fileLink);
        if (!fileId) {
          return { ...photo, thumbnailLink: "/fallback-image.png" }; // Default fallback
        }
  
        try {
          const res = await fetch(
            `https://www.googleapis.com/drive/v3/files/${fileId}?fields=thumbnailLink,name`,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            }
          );
          if (!res.ok) {
            console.error(`Error fetching thumbnail for file ID ${fileId}`);
            return { ...photo, thumbnailLink: "/fallback-image.png" }; // Fallback on error
          }
  
          const data = await res.json();
          return { ...photo, thumbnailLink: data.thumbnailLink || "/fallback-image.png" }; // Fallback if thumbnailLink is null
        } catch (error) {
          console.error(`Error fetching thumbnail for file ID ${fileId}:`, error);
          return { ...photo, thumbnailLink: "/fallback-image.png" }; // Fallback on exception
        }
      })
    );
    return thumbnails;
  };

  