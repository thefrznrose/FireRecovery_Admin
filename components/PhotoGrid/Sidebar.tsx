import React, { useState } from "react";
import {
  Button,
  Checkbox,
  Divider,
  Flex,
  Loader,
  Modal,
  Paper,
  RangeSlider,
  Select,
  Text,
  TextInput,
} from "@mantine/core";
import GoogleSignInButton from "../GoogleAPIs/GoogleSignInButton";
import { IconClockHour9, IconLayersIntersect, IconTableImport } from "@tabler/icons-react";
import { useDataContext } from "@/public/static/DataContext/DataContext";

export default function Sidebar() {
  const {
    session,
    isGoogleAuthenticated,
    photos,
    sortOption,
    locationFilter,
    timeRange,
    startDate,
    endDate,
    selectedForTimelapse,
    filteredPhotos,
    sortedPhotos,
    setProcessedImageCount,
    setProcessingModalOpen,
    setSelectedForTimelapse,
    setLoading,
    setSortOption,
    setLocationFilter,
    setTimeRange,
    setStartDate,
    setEndDate,
    isLargeScreen,
    isMediumScreen,
    isSmallScreen,
    gapiLoaded,
    setSpreadsheetId,
    setGoogleAuthenticated,
    setPhotos,
    isProcessingModalOpen,
    processedImageCount,
    flaggedPhotos,
    setFlaggedPhotos,
      setFavoritePhotos,
    showFlaggedOnly,
    setShowFlaggedOnly,
    showFavoritesOnly,
    setShowFavoritesOnly,
    // isProcessingModalOpen,
  } = useDataContext(); // Import state and handlers from DataContext
  
  const [fetchProgress, setFetchProgress] = useState(0);
  const [totalImages, setTotalImages] = useState(0);
  const [isFetching, setIsFetching] = useState(false);

  const handleSelectAll = () => {
    if (selectedForTimelapse.length === filteredPhotos.length) {
      // If all photos are selected, deselect all
      setSelectedForTimelapse([]);
    } else {
      // Otherwise, select all photos
      console.log(sortedPhotos)
      setSelectedForTimelapse([...sortedPhotos]);
    }
  };
  
  const extractFileId = (url: string) => {
    console.log("🔍 Actual fileLink content:", url);
    
    // New regex pattern for /file/d/FILE_ID/view format
    const filePathMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (filePathMatch) {
      return filePathMatch[1];
    }
    
    // Keep original regex as fallback for other formats
    const paramMatch = url.match(/id=([a-zA-Z0-9-_]+)/);
    return paramMatch ? paramMatch[1] : null;
  };

  const fetchFileContent = async (fileId: string | null): Promise<Blob> => {
    if (!fileId) {
      throw new Error("fileId cannot be null");
    }
    console.log(`Fetching full-resolution image for File ID: ${fileId}`);
    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
      {
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      }
    );
    if (!response.ok) {
      console.error(`Error fetching file ${fileId}: ${response.statusText}`);
      throw new Error(`Error fetching file: ${response.statusText}`);
    }
    console.log(`Successfully fetched full-resolution image for File ID: ${fileId}`);
    return await response.blob();
  };

  const loadPicker = () => {
    if (!gapiLoaded || !session?.accessToken) {
      console.log("gapi", gapiLoaded)
      console.log("access token", session?.accessToken)
      console.error("Google Picker API or Access Token not available");
      return;
    }
    window.gapi.load("picker", { callback: createPicker });
  };

  const createPicker = () => {
    if (!session?.accessToken) return;
    const picker = new window.google.picker.PickerBuilder()
      .addView(
        new window.google.picker.DocsView()
          .setIncludeFolders(false) // Exclude folders
          .setMimeTypes("application/vnd.google-apps.spreadsheet") // Restrict to Google Sheets
          .setSelectFolderEnabled(false) // Disable folder selection
      )
      .setOAuthToken(session.accessToken)
      .setDeveloperKey(process.env.NEXT_PUBLIC_GOOGLE_API_KEY!)
      .setCallback(handlePickerResponse)
      .build();
    picker.setVisible(true);
  };

  const handlePickerResponse = async (response: any) => {
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
        await fetchSheetData(sheetId); // Fetch data from the selected sheet
      }
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
  
  const fetchSheetData = async (spreadsheetId: string) => {
  setLoading(true);
  try {
    // First fetch the metadata to get sheet information
    const metadata = await fetchSheetMetadata(spreadsheetId);
    
    if (!metadata.sheets || metadata.sheets.length === 0) {
      throw new Error("No sheets found in the spreadsheet");
    }
    
    // Get the first sheet's title
    const firstSheetTitle = metadata.sheets[0].properties.title;
    console.log(`Using sheet: "${firstSheetTitle}"`);
    
    // Try to fetch using the actual sheet title first
    try {
      const res = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${firstSheetTitle}`,
        {
          headers: {
            Authorization: `Bearer ${session?.accessToken}`,
          },
        }
      );
      
      if (res.ok) {
        const data = await res.json();
        processSheetData(data);
        return;
      }
      
      // If that fails, fall back to index 0
      console.log("Fetching by sheet name failed, trying index 0 instead");
    } catch (error) {
      console.log("Error fetching by sheet name:", error);
    }
    
    // Fallback to index 0
    const fallbackRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/0`,
      {
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      }
    );
    
    if (!fallbackRes.ok) {
      setGoogleAuthenticated(false);
      const error = await fallbackRes.json();
      console.error("Google Sheets API Error (all attempts failed):", error);
      return;
    }
    
    const data = await fallbackRes.json();
    processSheetData(data);
    
  } catch (error) {
    console.error("Error fetching Google Sheet data:", error);
    setGoogleAuthenticated(false);
  } finally {
    setLoading(false);
  }
};
  
  const processSheetData = async (data: any) => {
    if (data.values) {
      const photoData = data.values.slice(1).map((row: any) => ({
        timestamp: row[0], // Assuming timestamp is in column A
        location: row[1], // Assuming location is in column B
        uploaderName: row[2], // Assuming uploader name is in column C
        uploadDate: row[3], // Assuming upload date is in column D
        uploadTime: row[4], // Assuming upload time is in column E
        fileLink: row[5], // Assuming file link is in column F
        flagged: row[6], // Assuming flagged is in column G
        favorites: row[7], // Assuming favorites is in column H
      }));
  
      const photosWithThumbnails = await fetchThumbnails(photoData);
      setPhotos(photosWithThumbnails);
      console.log(photosWithThumbnails);
      setGoogleAuthenticated(true);
      const initialFlagged = photosWithThumbnails
        .filter(photo => photo.flagged)
        .map(photo => photo.timestamp);
      setFlaggedPhotos(initialFlagged);
      const initialFavorites = photosWithThumbnails
          .filter(photo => photo.favorites)
            .map(photo => photo.timestamp);
      setFavoritePhotos(initialFavorites);
    } else {
      console.error("No values found in the sheet data");
      setGoogleAuthenticated(false);
    }
  };

  const fetchThumbnails = async (photoData: any[]) => {
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
                Authorization: `Bearer ${session?.accessToken}`,
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

  const handleGenerateTimelapse = async (): Promise<void> => {
    console.log("🚀 Starting timelapse generation process");
    console.log(`💾 Selected images count: ${selectedForTimelapse.length}`);
    
    if (selectedForTimelapse.length === 0) {
      console.warn("⚠️ No images selected for timelapse");
      alert("No images selected for timelapse.");
      return;
    }
    
    console.log("📷 Selected images:", selectedForTimelapse);
    setFetchProgress(0);
    setTotalImages(selectedForTimelapse.length);
    setProcessedImageCount(0);
    setProcessingModalOpen(true);
    setLoading(true);
    
    try {
      console.log("🎨 Creating canvas element");
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        console.error("❌ Failed to get 2D context for canvas");
        throw new Error("Failed to get 2D context for canvas.");
      }
      console.log("✅ Canvas context obtained");
      
      console.log("🎬 Setting up MediaRecorder");
      const chunks: Blob[] = [];
      let streamCreated = false;
      
      try {
        const stream = canvas.captureStream(5);
        streamCreated = true;
        console.log("✅ Stream created successfully", stream);
        
        console.log("📼 Creating MediaRecorder with codec: video/webm; codecs=vp8");
        const recorder = new MediaRecorder(stream, { mimeType: "video/webm; codecs=vp8" });
        console.log("✅ MediaRecorder created:", recorder.state);
        
        recorder.ondataavailable = (e: BlobEvent) => {
          console.log(`📊 Data available event: ${e.data.size} bytes`);
          if (e.data.size > 0) {
            console.log(`➕ Adding ${e.data.size} bytes to chunks array`);
            chunks.push(e.data);
          }
        };
        
        console.log("▶️ Starting recorder");
        recorder.start();
        console.log("✅ Recorder started:", recorder.state);
        
        const loadImage = (blob: Blob): Promise<HTMLImageElement> => {
          console.log(`🖼️ Loading image from blob: ${blob.size} bytes, type: ${blob.type}`);
          return new Promise((resolve, reject) => {
            const img = new window.Image();
            img.onload = () => {
              console.log(`✅ Image loaded successfully: ${img.width}x${img.height}`);
              resolve(img);
            };
            img.onerror = (err) => {
              console.error("❌ Image loading error:", err);
              reject(err);
            };
            img.src = URL.createObjectURL(blob);
            console.log("🔗 Image URL created:", img.src);
          });
        };
        
        console.log("🔄 Starting to fetch images");
        setIsFetching(true);
        
        console.log("📊 Beginning Promise.all for image fetching");
        const preFetchedImages = await Promise.all(
          selectedForTimelapse.map(async (photo, index) => {
            console.log(`🔍 Processing photo ${index + 1}/${selectedForTimelapse.length}:`, photo);
            const fileId = extractFileId(photo.fileLink);
            console.log(`🆔 Extracted file ID: ${fileId}`);
            
            if (!fileId) {
              console.error("❌ Invalid file ID for photo:", photo);
              return null;
            }
            
            try {
              console.log(`📥 Fetching content for file ID: ${fileId}`);
              const blob = await fetchFileContent(fileId);
              console.log(`✅ Content fetched: ${blob.size} bytes, type: ${blob.type}`);
              
              setFetchProgress((prev) => {
                console.log(`📊 Fetch progress: ${prev + 1}/${selectedForTimelapse.length}`);
                return prev + 1;
              });
              
              console.log(`🖼️ Loading image for file ID: ${fileId}`);
              const img = await loadImage(blob);
              console.log(`✅ Image loaded: ${img.width}x${img.height}`);
              return img;
            } catch (error) {
              console.error(`❌ Error processing image ${index + 1}:`, error);
              return null;
            }
          })
        ).then((images) => {
          const validImages = images.filter((img) => img);
          console.log(`📊 Images fetched: ${validImages.length}/${selectedForTimelapse.length} successful`);
          return validImages;
        });
        
        console.log("✅ All images fetched and loaded");
        setIsFetching(false);
        
        console.log("🎞️ Beginning timelapse creation");
        const displayDuration = 2 * 1000;
        const fps = 30;
        const totalFramesPerImage = Math.ceil((displayDuration / 1000) * fps);
        console.log(`⚙️ Configuration: ${displayDuration}ms per image, ${fps}fps, ${totalFramesPerImage} frames per image`);
        
        console.log(`🎬 Processing ${preFetchedImages.length} images`);
        for (let i = 0; i < preFetchedImages.length; i++) {
          const img = preFetchedImages[i];
          console.log(`📷 Processing image ${i + 1}/${preFetchedImages.length}`);
          
          if (!img) {
            console.warn(`⚠️ Skipping null image at index ${i}`);
            continue;
          }
          
          console.log(`🖼️ Adjusting canvas size to ${img.naturalWidth}x${img.naturalHeight}`);
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          
          console.log(`🎞️ Drawing ${totalFramesPerImage} frames for image ${i + 1}`);
          for (let frame = 0; frame < totalFramesPerImage; frame++) {
            if (frame === 0 || frame === totalFramesPerImage - 1) {
              console.log(`🎬 Drawing frame ${frame + 1}/${totalFramesPerImage} for image ${i + 1}`);
            }
            
            ctx.clearRect(0, 0, 10000, 10000);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            
            await new Promise((resolve) => requestAnimationFrame(resolve));
          }
          
          setProcessedImageCount((prev) => {
            console.log(`📊 Processed image count: ${prev + 1}/${preFetchedImages.length}`);
            return prev + 1;
          });
        }
        
        console.log("🛑 Stopping recorder");
        recorder.stop();
        console.log("✅ Recorder stopped");
        
        console.log("⏳ Waiting for final video blob");
        const videoBlob = await new Promise<Blob>((resolve) => {
          recorder.onstop = () => {
            console.log(`📼 Recorder stopped event, ${chunks.length} chunks available`);
            const blob = new Blob(chunks, { type: "video/webm" });
            console.log(`✅ Final video blob created: ${blob.size} bytes`);
            resolve(blob);
          };
        });
        
        console.log("🔗 Creating download URL for video");
        const videoUrl = URL.createObjectURL(videoBlob);
        console.log("📥 Preparing download link");
        const downloadLink = document.createElement("a");
        downloadLink.href = videoUrl;
        downloadLink.download = "timelapse.webm";
        console.log("🖱️ Simulating download click");
        downloadLink.click();
        console.log("✅ Timelapse generation completed successfully");
        
      } catch (streamError) {
        console.error("❌ Error with stream or recorder:", streamError);
        if (!streamCreated) {
          console.error("💔 Failed to create canvas capture stream. This might be due to browser support issues or security restrictions.");
        }
        throw streamError;
      }
      
    } catch (error) {
      console.error("❌ Error generating timelapse:", error);
      console.error("Error details:", {
        name: error instanceof Error ? error.name : "Unknown",
        message: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : "No stack trace"
      });
    } finally {
      console.log("🧹 Cleaning up resources");
      setLoading(false);
      setProcessingModalOpen(false);
      console.log("🏁 Timelapse generation process ended");
    }
  };

  return (
    <Paper
      withBorder
      style={{
        padding: "2rem",
        boxShadow: "sm",
        height: "100vh", // Full viewport height
        overflowY: "auto", // Enable vertical scrolling
        position: "sticky", // Keeps sidebar fixed during scroll
        top: 0,
        backgroundColor: "#f9f9f9", // Optional: Light background
      }}
    >
        {session && isGoogleAuthenticated ? (
        <div>
          <Flex
            // direction={isSmallScreen ? "column" : "row"} // Stack on smaller screens
            align={isSmallScreen ? "stretch" : "center"} // Align items based on screen size
            justify="space-between"
            gap="md"
          >
            <GoogleSignInButton /> 
            <Button 
              onClick={loadPicker}
              size="sm"
              style={{
                marginTop: "1rem",
                marginLeft: "3rem"
              }}
              leftSection={<IconTableImport/>}
            >
              Import Sheet
            </Button>
          </Flex>
          
        </div>
      ) : (
        <>
        <GoogleSignInButton />
        <Button 
          onClick={loadPicker}
          size="sm"
          style={{
            marginTop: "1rem",
            marginLeft: "3rem"
          }}
          leftSection={<IconTableImport/>}
        >
          Import Sheet
        </Button>
        </> 
      )}
      <Divider my="md" />
      <Text size="xl" mb="md" style={{ fontWeight: 600 }}>
        Filters:
      </Text>
      <Select
        label="Sort By:"
        placeholder="Select sorting"
        data={[
          { value: "location-asc", label: "Location (A-Z)" },
          { value: "location-desc", label: "Location (Z-A)" },
          { value: "time-asc", label: "Taken Time/Date (Oldest First)" },
          { value: "time-desc", label: "Taken Time/Date (Newest First)" },
          { value: "uploader-asc", label: "Uploader Name (A-Z)" },
          { value: "uploader-desc", label: "Uploader Name (Z-A)" },
          { value: "favorites-first", label: "Favorites First" },
          { value: "flagged-first", label: "Flagged First" },
        ]}
        value={sortOption}
        onChange={setSortOption}
      />
      <Select
      label="Location:"
      placeholder="Select location"
      data={[
        ...new Set(photos.map((photo) => photo.location)), // Unique locations
      ].map((location) => ({ value: location, label: location }))}
      value={locationFilter}
      onChange={setLocationFilter}
      style={{ marginBottom: "1rem", marginTop: "1rem" }}
    />
    <Flex>
      <TextInput
        label="Start Date (mm/dd/yyyy):"
        placeholder="e.g., 01/01/2024"
        value={startDate}
        onChange={(e) => setStartDate(e.currentTarget.value)}
        style={{paddingRight: "1rem"}}
        // onBlur={filterByDateRange} // Trigger filtering when focus is lost
      />

      <TextInput
        label="End Date (mm/dd/yyyy):"
        placeholder="e.g., 31/12/2024"
        value={endDate}
        onChange={(e) => setEndDate(e.currentTarget.value)}
        // onBlur={filterByDateRange} // Trigger filtering when focus is lost
        
      />
    </Flex>
      <Text size="sm"  style={{ marginBottom: "0.5rem", fontWeight: 500,  marginTop: "1rem" }}>
        Time of Day:
      </Text>
      <RangeSlider
        style={{ marginTop: "1rem", marginBottom: "3rem", marginRight: "1rem", marginLeft: "1rem" }}
        label={(value) => {
          const hours = Math.floor(value / 60);
          const minutes = value % 60;
          const period = hours < 12 ? "AM" : "PM";
          const formattedHours = hours % 12 || 12; // Convert 0 to 12
          const formattedMinutes = minutes.toString().padStart(2, "0");
          return `${formattedHours}:${formattedMinutes} ${period}`;
        }}
        marks={[
          { value: 240, label: "4:00 AM" }, // Start of range
          { value: 480, label: "8:00 AM" },
          { value: 720, label: "12:00 PM" },
          { value: 960, label: "4:00 PM" },
          { value: 1200, label: "8:00 PM" }, // End of range
        ]}
        min={240} // 4:00 AM
        max={1200} // 8:00 PM
        step={15} // Increment in 15-minute intervals
        defaultValue={[240, 1200]} // Default to the full range
        value={timeRange} // Controlled value
        onChange={(value) => {
          setTimeRange(value); // Update time range state
          console.log("Time range updated:", value);
        }}
      />
      <Divider my="md" />

      <Checkbox
        label="Show Favorites Only?"
        checked={showFavoritesOnly}
        onChange={(event) => setShowFavoritesOnly(event.currentTarget.checked)}
        style={{ marginTop: "1rem" }}
        />

      <Checkbox
        label="Show Flagged Only?"
        checked={showFlaggedOnly}
        onChange={(event) => setShowFlaggedOnly(event.currentTarget.checked)}
        style={{ marginTop: "1rem" }}
      />
      
      <Divider my="md" />
      <Text size="xl" mb="md" style={{ fontWeight: 600 }}>
        Timelapse Generation:
      </Text>
      <Flex
      >
        <Button
          onClick={handleSelectAll}
          size="xs"
          fullWidth
          style={{
            marginBottom: "1rem",
            color: "#fff",
          }}
          leftSection={<IconLayersIntersect />}
        >
          {selectedForTimelapse.length === filteredPhotos.length
            ? "Deselect All"
            : "Select All"}
        </Button>
        <Button
          onClick={handleGenerateTimelapse}
          size="xs"
          fullWidth
          style={{
            marginBottom: "1rem",
            color: "#fff",
            marginLeft: ".5rem",
          }}
          leftSection={<IconClockHour9 />}
        >
          Generate Timelapse
        </Button>
      </Flex>
      <Modal
        opened={isProcessingModalOpen}
        onClose={() => setProcessingModalOpen(false)}
        centered
        withCloseButton={false}
        title="Generating Timelapse..."
      >
        <Paper p="md">
          <Flex direction="column" align="center" gap="md">
            <Loader color="blue" size="lg" />
            {isFetching ? (
              <Text>Fetching Full Resolution Images: {fetchProgress} / {totalImages}</Text>
            ) : (
              <Text>Processing Images: {processedImageCount} / {totalImages}</Text>
            )}
          </Flex>
        </Paper>
      </Modal>
    </Paper>  
  );
}