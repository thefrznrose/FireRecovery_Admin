
import { useEffect, } from "react";
import { Grid, Loader, Text, Button, Paper, Modal, Checkbox, } from "@mantine/core";
import {IconEye, IconFlag, IconHeart, IconTrash} from "@tabler/icons-react"
import LazyLoad from "react-lazyload";
import Image from "next/image";
import { useDataContext } from "@/public/static/DataContext/DataContext";
import Sidebar from "./Sidebar";
import PhotoItem from "./PhotoItem";

export default function PhotoGrid() {  
  const { 
    session,
    currentPage, setCurrentPage,
    hasMorePhotos, setHasMorePhotos,
    loading, setLoading,
    photos, setPhotos,
    sortedPhotos, setSortedPhotos,
    gapiLoaded, setGapiLoaded,
    isGoogleAuthenticated, setGoogleAuthenticated,
    spreadsheetId, setSpreadsheetId,
    sortOption, setSortOption,
    selectedForTimelapse, setSelectedForTimelapse,
    filteredPhotos, setFilteredPhotos,
    locationFilter, setLocationFilter,
    startDate, setStartDate,
    endDate, setEndDate,
    timeRange, setTimeRange,
    isLargeScreen, isMediumScreen, isSmallScreen,
    flaggedPhotos, setFlaggedPhotos,
    favoritePhotos, setFavoritePhotos,
    showFlaggedOnly, setShowFlaggedOnly,
      showFavoritesOnly, setShowFavoritesOnly,
  } = useDataContext();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMorePhotos && !loading) {
          setCurrentPage((prevPage) => prevPage + 1);
        }
      },
      { threshold: 1.0 }
    );
    const target = document.getElementById("scroll-target");
    if (target) observer.observe(target);
    return () => {
      if (target) observer.unobserve(target);
    };
  }, [hasMorePhotos, loading]);

// Replace or modify the existing filterPhotos function
const filterPhotos = () => {
  const start = startDate
    ? new Date(startDate.split("/").reverse().join("-"))
    : null;
  const end = endDate
    ? new Date(endDate.split("/").reverse().join("-"))
    : null;
    
  return photos.filter((photo) => {
    const photoDate = new Date(photo.uploadDate.split("/").reverse().join("-"));
    if (isNaN(photoDate.getTime())) {
      console.error(`Invalid photo upload date: ${photo.uploadDate}`);
      return false;
    }
    
    const timeParts = photo.uploadTime.match(/(\d+):(\d+):(\d+)\s(AM|PM)/);
    if (!timeParts) {
      console.error(`Invalid photo upload time: ${photo.uploadTime}`);
      return false; 
    }
    const hours = parseInt(timeParts[1], 10) % 12 + (timeParts[4] === "PM" ? 12 : 0);
    const minutes = parseInt(timeParts[2], 10);
    const photoTimeInMinutes = hours * 60 + minutes;
    
    const matchesLocation = !locationFilter || photo.location === locationFilter;
    const matchesDate = (!start || photoDate >= start) && (!end || photoDate <= end);
    const matchesTime = photoTimeInMinutes >= timeRange[0] && photoTimeInMinutes <= timeRange[1];
    const matchesFlagFilter = !showFlaggedOnly || flaggedPhotos.includes(photo.timestamp);
    const matchesFavoritesFilter = !showFavoritesOnly || favoritePhotos.includes(photo.timestamp);
    return matchesLocation && matchesDate && matchesTime && matchesFlagFilter && matchesFavoritesFilter;
  });
};

useEffect(() => {
  const results = filterPhotos();
  setFilteredPhotos(results);
}, [photos, timeRange, startDate, endDate, locationFilter, showFlaggedOnly, flaggedPhotos, showFavoritesOnly, favoritePhotos]);


  useEffect(() => {
    const sorted = [...filteredPhotos].sort((a, b) => {
      switch (sortOption) {
        case "time-asc":
          return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
        case "time-desc":
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        case "location-asc":
          return (a.location || "").localeCompare(b.location || "");
        case "location-desc":
          return (b.location || "").localeCompare(a.location || "");
        case "uploader-asc":
          return (a.uploaderName || "").localeCompare(b.uploaderName || "");
        case "uploader-desc":
          return (b.uploaderName || "").localeCompare(a.uploaderName || "");
        case "favorites-first":
          return (favoritePhotos.includes(b.timestamp) ? 1 : 0) - (favoritePhotos.includes(a.timestamp) ? 1 : 0);
        case "flagged-first":
          return (flaggedPhotos.includes(b.timestamp) ? 1 : 0) - (flaggedPhotos.includes(a.timestamp) ? 1 : 0);
        default:
          return 0;
      }
    });
  
    setSortedPhotos((prevSorted) => {
      if (JSON.stringify(prevSorted) === JSON.stringify(sorted)) {
        return prevSorted; 
      }
      return sorted;
    });
  
  }, [filteredPhotos, sortOption]);
  
const handleCheckboxChange = (photo: any) => {
  setSelectedForTimelapse((prev) => {
    const isSelected = prev.some((item) => item.timestamp === photo.timestamp);
    if (isSelected) {
      return prev.filter((item) => item.timestamp !== photo.timestamp);
    } else {
      return [...prev, photo];
    }
  });
};

const fetchPhotos = async (page: number) => {
  setLoading(true);
  try {
    const startIndex = (page - 1) * 10;
    const endIndex = page * 10;
    const newPhotos = photos.slice(startIndex, endIndex);
    if (newPhotos.length === 0) {
      setHasMorePhotos(false);
      return;
    }
    setFilteredPhotos((prevPhotos) => [...prevPhotos, ...newPhotos]);
  } catch (error) {
    console.error("Error fetching photos:", error);
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  fetchPhotos(currentPage);
}, [currentPage]);

useEffect(() => {
  const initializeGapiAndFetchSheet = async () => {
    const retryGapiLoad = () => {
      if (window.gapi) {
        setGapiLoaded(true);
      } else {
        setTimeout(retryGapiLoad, 1000); 
        return;
      }
    };
    retryGapiLoad();
    if (!session || !session.accessToken) {
      setTimeout(initializeGapiAndFetchSheet, 5000);
      return;
    }
    const storedSheetId = localStorage.getItem("spreadsheetId");
    if (storedSheetId) {
      setSpreadsheetId(storedSheetId);
      try {
        await fetchSheetData(storedSheetId);
      } catch (error) {
        console.error("Error fetching sheet data:", error);
        setGoogleAuthenticated(false)
        setTimeout(initializeGapiAndFetchSheet, 1000);
      }
    } else {
      // setGoogleAuthenticated(true)
    }
  };

  initializeGapiAndFetchSheet();
}, [session]);

  const deletePhoto = async (photo: any, index: number) => {
    if (!spreadsheetId) {
      console.error("Spreadsheet ID is not defined. Please select a sheet first.");
      return;
    }
    const fileId = extractFileId(photo.fileLink);
    const isConfirmed = window.confirm(
      "Are you sure you want to delete this photo? This action cannot be undone."
    );
    if (!isConfirmed) {
      return;
    }
    if (!fileId) {
      console.error("File ID not found.");
      return;
    }
    setLoading(true);
    try {
      const driveResponse = await fetch(
        `https://www.googleapis.com/drive/v3/files/${fileId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${session?.accessToken}`,
          },
        }
      );
      if (!driveResponse.ok) {
        const error = await driveResponse.json();
        console.error("Google Drive API Error:", error);
        setLoading(false);
        return;
      }
      const rowIndex = index + 2; 
      const sheetResponse = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Form Responses 1!A${rowIndex}:F${rowIndex}:clear`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session?.accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!sheetResponse.ok) {
        const error = await sheetResponse.json();
        console.error("Google Sheets API Error:", error);
        setLoading(false);
        return;
      }
      setPhotos((prevPhotos) => prevPhotos.filter((_, i) => i !== index));
    } catch (error) {
      console.error("Error deleting photo:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSheetMetadata = async (spreadsheetId: string) => {
    try {
      const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`,
        {
          headers: { Authorization: `Bearer ${session?.accessToken}` },
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Google Sheets API Metadata Error:", errorData);
        throw new Error(`Error fetching sheet metadata: ${JSON.stringify(errorData)}`);
      }
      
      const data = await response.json();
      console.log("Sheet metadata:", data);
      return data;
    } catch (error) {
      console.error("Exception in fetchSheetMetadata:", error);
      throw error;
    }
  };

  const handleFlagPhoto = async (photo: any, index: number) => {
    // Check if already flagged
      //TODO: this doesn't seem right
      // Using timestamp as the unique identifier for flagging - should probably see if we can use an id of some kind thats unique
    const isCurrentlyFlagged = flaggedPhotos.includes(photo.timestamp);
    
    // Toggle flag status locally first (for immediate UI feedback)
    if (isCurrentlyFlagged) {
      setFlaggedPhotos(prev => prev.filter(id => id !== photo.timestamp));
    } else {
      setFlaggedPhotos(prev => [...prev, photo.timestamp]);
    }
    
    // Only update Google Sheets if we have a spreadsheetId and session
    if (spreadsheetId && session?.accessToken) {
      try {
        setLoading(true);
        
        // First fetch the metadata to get sheet information
        const metadata = await fetchSheetMetadata(spreadsheetId);
        
        if (!metadata.sheets || metadata.sheets.length === 0) {
          throw new Error("No sheets found in the spreadsheet");
        }
        
        // Get the first sheet's title
        const firstSheetTitle = metadata.sheets[0].properties.title;
        console.log(`Using sheet: "${firstSheetTitle}" for flag update`);
        
        // Row index is +2 because spreadsheet is 1-indexed and has a header row
        const rowIndex = index + 2;
        
        // The value to put in the "Flagged" column
        const flagValue = isCurrentlyFlagged ? "" : "Yes";
        
        // Try to update using the actual sheet title first
        try {
          const response = await fetch(
            `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${firstSheetTitle}!G${rowIndex}:G${rowIndex}?valueInputOption=RAW`,
            {
              method: "PUT",
              headers: {
                Authorization: `Bearer ${session.accessToken}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                values: [[flagValue]]
              }),
            }
          );
          
          if (response.ok) {
            console.log("Flag status updated successfully");
            return;
          }
          
          // If that fails, fall back to index 0
          console.log("Updating by sheet name failed, trying index 0 instead");
        } catch (error) {
          console.log("Error updating by sheet name:", error);
        }
        
        // Fallback to index 0
        const fallbackResponse = await fetch(
          `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/0!G${rowIndex}:G${rowIndex}?valueInputOption=RAW`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${session.accessToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              values: [[flagValue]]
            }),
          }
        );
        
        if (!fallbackResponse.ok) {
          const error = await fallbackResponse.json();
          console.error("Google Sheets API Error (all attempts failed):", error);
        }
        
      } catch (error) {
        console.error("Error updating flag status:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleFavoritePhotos = async (photo: any, index: number) => {
    const isCurrentlyFavorite = favoritePhotos.includes(photo.timestamp);

    // Toggle favorite status locally first (for immediate UI feedback)
    if (isCurrentlyFavorite) {
      setFavoritePhotos(prev => prev.filter(id => id !== photo.timestamp));
    } else {
      setFavoritePhotos(prev => [...prev, photo.timestamp]);
    }

    // Only update Google Sheets if we have a spreadsheetId and session
    if (spreadsheetId && session?.accessToken) {
      try {
        setLoading(true);

        // First fetch the metadata to get sheet information
        const metadata = await fetchSheetMetadata(spreadsheetId);

        if (!metadata.sheets || metadata.sheets.length === 0) {
          throw new Error("No sheets found in the spreadsheet");
        }

        // Get the first sheet's title
        const firstSheetTitle = metadata.sheets[0].properties.title;
        console.log(`Using sheet: "${firstSheetTitle}" for favorite update`);

        // Row index is +2 because spreadsheet is 1-indexed and has a header row
        const rowIndex = index + 2;

        // The value to put in the "Favorite" column
        const favoriteValue = isCurrentlyFavorite ? "" : "Yes";

        // Try to update using the actual sheet title first
        try {
          const response = await fetch(
            `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${firstSheetTitle}!H${rowIndex}:H${rowIndex}?valueInputOption=RAW`,
            {
              method: "PUT",
              headers: {
                Authorization: `Bearer ${session.accessToken}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                values: [[favoriteValue]]
              }),
            }
          );

          if (response.ok) {
            console.log("Favorite status updated successfully");
            return;
          }

          // If that fails, fall back to index 0
          console.log("Updating by sheet name failed, trying index 0 instead");
        } catch (error) {
          console.log("Error updating by sheet name:", error);
        }

          // Fallback to index 0
          const fallbackResponse = await fetch(
              `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/0!H${rowIndex}:H${rowIndex}?valueInputOption=RAW`,
              {
                  method: "PUT",
                  headers: {
                      Authorization: `Bearer ${session.accessToken}`,
                      "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                      values: [[favoriteValue]]
                  }),
              }
          );

          if (!fallbackResponse.ok) {
              const error = await fallbackResponse.json();
              console.error("Google Sheets API Error (all attempts failed):", error);
          }

      } catch (error) {
          console.error("Error updating flag status:", error);
      } finally {
          setLoading(false);
      }
    }

  }
  
  const extractFileId = (url: string) => {
    const match = url.match(/id=([a-zA-Z0-9-_]+)/);
    return match ? match[1] : null;
  };

  const fetchSheetData = async (spreadsheetId: string) => {
    setLoading(true);
    try {
      const res = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Form Responses 1`,
        {
          headers: {
            Authorization: `Bearer ${session?.accessToken}`,
          },
        }
      );
      if (!res.ok) {
        setGoogleAuthenticated(false);
        const error = await res.json();
        console.error("Google Sheets API Error:", error);
        return;
      }
      if (res.status === 401) {
        console.error("Authentication expired or invalid.");
        setGoogleAuthenticated(false);
        setLoading(false);
        return;
      }
      const data = await res.json();
      if (data.values) {
        const photoData = data.values.slice(1).map((row: any) => ({
          timestamp: row[0],
          location: row[1],
          uploaderName: row[2],
          uploadDate: row[3],
          uploadTime: row[4],
          fileLink: row[5],
            flagged: row[6],
            favorite: row[7],
        }));
        const photosWithThumbnails = await fetchThumbnails(photoData);
        setPhotos(photosWithThumbnails);
        setGoogleAuthenticated(true)
      }
    } catch (error) {
      console.error("Error fetching Google Sheet data:", error);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchThumbnails = async (photoData: any[]) => {
  const thumbnails = await Promise.all(
    photoData.map(async (photo) => {
      const fileId = extractFileId(photo.fileLink);
      if (!fileId) {
        return { ...photo, thumbnailLink: "/fallback-image.png" }; 
      }
      try {
        const res = await fetch(
          `https://www.googleapis.com/drive/v3/files/${fileId}?fields=thumbnailLink,name`,
          {
            headers: {
              Authorization: `Bearer ${session?.accessToken}`,
            },
          }
        );
        if (!res.ok) {
          console.error(`Error fetching thumbnail for file ID ${fileId}`);
          return { ...photo, thumbnailLink: "/fallback-image.png" }; 
        }
        const data = await res.json();
        return { ...photo, thumbnailLink: data.thumbnailLink || "/fallback-image.png" }; 
      } catch (error) {
        console.error(`Error fetching thumbnail for file ID ${fileId}:`, error);
        return { ...photo, thumbnailLink: "/fallback-image.png" }; 
      }
    })
  );
  return thumbnails;
};

  return (
    <>
      <Grid>
        <Grid.Col span={2.75}>
          <Sidebar/>
        </Grid.Col>
        <Grid.Col span={9}>
          <Grid gutter="lg" columns={12}>
            {sortedPhotos.map((photo, index) => {
              const timelapseIndex = selectedForTimelapse.findIndex(
                  (item) => item.timestamp === photo.timestamp
              );
              return (
                  <PhotoItem
                      key={`${photo.name}-${index}`}
                      photo={photo}
                      index={index}
                      isSelected={timelapseIndex !== -1}
                      onCheckboxChange={handleCheckboxChange}
                      onDelete={deletePhoto}
                      onFlag={handleFlagPhoto}
                      onFavorite={handleFavoritePhotos}
                      isFlagged={flaggedPhotos.includes(photo.timestamp)}
                      isFavorite={favoritePhotos.includes(photo.timestamp)}
                  />
              );
            })}
            {hasMorePhotos && <div id="scroll-target" style={{ height: "1px" }} />}
            {loading && <Loader size="lg" style={{ margin: "2rem auto" }} />}
          </Grid>
          {loading && <Loader size="lg" style={{ margin: "2rem auto" }} />}
        </Grid.Col>
      </Grid>
    </>
  );
}