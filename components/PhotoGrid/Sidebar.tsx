// Sidebar.tsx
// This component renders the sidebar for the photo grid application
// It includes functionality for:
// - Google authentication
// - Spreadsheet selection
// - Photo filtering and sorting
// - Timelapse generation

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
import { 
  IconClockHour9,  // Icon for timelapse generation
  IconLayersIntersect, // Icon for select all
  IconTableImport // Icon for importing spreadsheet
} from "@tabler/icons-react";
import { useDataContext } from "@/public/static/DataContext/DataContext";

/**
 * Sidebar Component
 * 
 * Provides UI controls for filtering, sorting, and selecting photos for timelapse generation.
 * Integrates with Google Sheets and Drive for data management.
 */
export default function Sidebar() {
  // ===== DATA CONTEXT =====
  // Extract all required state and functions from the Data Context
  const {
    // Session and authentication
    session,
    isGoogleAuthenticated,
    
    // Photo data
    photos,
    setPhotos,
    
    // Filtering and sorting state
    sortOption,
    locationFilter,
    timeRange,
    startDate,
    endDate,
    
    // Timelapse generation
    selectedForTimelapse,
    filteredPhotos,
    sortedPhotos,
    processedImageCount,
    setProcessedImageCount,
    isProcessingModalOpen,
    setProcessingModalOpen,
    
    // Responsiveness helpers
    isLargeScreen,
    isMediumScreen,
    isSmallScreen,
    
    // Google API integration
    gapiLoaded,
    spreadsheetId,
    setSpreadsheetId,
    
    // State setters
    setSelectedForTimelapse,
    setLoading,
    setSortOption,
    setLocationFilter,
    setTimeRange,
    setStartDate,
    setEndDate,
    setGoogleAuthenticated,
    
    // Flagging system
    flaggedPhotos,
    setFlaggedPhotos,
    showFlaggedOnly,
    setShowFlaggedOnly,
    
    // Favorites system (new feature)
    setFavoritePhotos,
    showFavoritesOnly,
    setShowFavoritesOnly,
  } = useDataContext();
  
  // ===== LOCAL STATE =====
  // Track image processing progress for timelapse generation
  const [fetchProgress, setFetchProgress] = useState(0);
  const [totalImages, setTotalImages] = useState(0);
  const [isFetching, setIsFetching] = useState(false);

  // ===== PHOTO SELECTION HANDLERS =====
  /**
   * Toggles selection of all filtered photos for timelapse generation
   */
  const handleSelectAll = () => {
    if (selectedForTimelapse.length === filteredPhotos.length) {
      // If all photos are selected, deselect all
      setSelectedForTimelapse([]);
    } else {
      // Otherwise, select all filtered photos
      console.log("Selecting all photos:", sortedPhotos);
      setSelectedForTimelapse([...sortedPhotos]);
    }
  };
  
  // ===== UTILITY FUNCTIONS =====
  /**
   * Extracts Google Drive file ID from various URL formats
   * Supports both direct /file/d/ID/view format and id=ID query parameter
   * 
   * @param {string} url - The Google Drive file URL
   * @return {string|null} - The extracted file ID or null if not found
   */
  const extractFileId = (url: string) => {
    console.log("🔍 Extracting file ID from URL:", url);
    
    // Handle direct Google Drive file path format (/file/d/FILE_ID/view)
    const filePathMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (filePathMatch) {
      console.log("✅ File ID extracted from path format:", filePathMatch[1]);
      return filePathMatch[1];
    }
    
    // Fallback to id query parameter format
    const paramMatch = url.match(/id=([a-zA-Z0-9-_]+)/);
    if (paramMatch) {
      console.log("✅ File ID extracted from query parameter:", paramMatch[1]);
      return paramMatch[1];
    }
    
    console.error("❌ Could not extract file ID from URL:", url);
    return null;
  };

  /**
   * Fetches full-resolution image content from Google Drive
   * 
   * @param {string|null} fileId - The Google Drive file ID
   * @return {Promise<Blob>} - A Promise resolving to the file content as a Blob
   */
  const fetchFileContent = async (fileId: string | null): Promise<Blob> => {
    if (!fileId) {
      throw new Error("fileId cannot be null");
    }
    
    console.log(`📥 Fetching full-resolution image for File ID: ${fileId}`);
    
    // Make API request to Google Drive for the file content
    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
      {
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      }
    );
    
    // Handle errors
    if (!response.ok) {
      console.error(`❌ Error fetching file ${fileId}: ${response.statusText}`);
      throw new Error(`Error fetching file: ${response.statusText}`);
    }
    
    console.log(`✅ Successfully fetched full-resolution image for File ID: ${fileId}`);
    return await response.blob();
  };

  // ===== GOOGLE PICKER INTEGRATION =====
  /**
   * Initializes and opens the Google Picker for selecting spreadsheets
   */
  const loadPicker = () => {
    // Validate prerequisites
    if (!gapiLoaded || !session?.accessToken) {
      console.log("Google Picker prerequisites not met:");
      console.log("- GAPI loaded:", gapiLoaded);
      console.log("- Access token available:", !!session?.accessToken);
      console.error("Google Picker API or Access Token not available");
      return;
    }
    
    // Load the Google Picker API
    window.gapi.load("picker", { callback: createPicker });
  };

  /**
   * Creates and displays the Google Picker interface
   * Configured to only show Google Sheets files
   */
  const createPicker = () => {
    if (!session?.accessToken) return;
    
    // Create a new picker builder
    const picker = new window.google.picker.PickerBuilder()
      // Add a view that shows only spreadsheets
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
    
    // Display the picker
    picker.setVisible(true);
  };

  /**
   * Handles the response from the Google Picker
   * When a sheet is selected, saves its ID and fetches its data
   * 
   * @param {any} response - The response from the Google Picker
   */
  const handlePickerResponse = async (response: any) => {
    if (response.action === "picked") {
      const selectedItems = response.docs;
      
      // Find the first spreadsheet in the selection
      const selectedSheet = selectedItems.find((item: any) =>
        item.mimeType.includes("application/vnd.google-apps.spreadsheet")
      );
      
      if (selectedSheet) {
        console.log("Selected Google Sheet:", selectedSheet);
        const sheetId = selectedSheet.id;
        
        // Save sheet ID to state and localStorage for persistence
        setSpreadsheetId(sheetId);
        localStorage.setItem("spreadsheetId", sheetId);
        
        // Fetch data from the selected sheet
        await fetchSheetData(sheetId);
      }
    }
  };

  // ===== GOOGLE SHEETS INTEGRATION =====
  /**
   * Fetches metadata for a Google Sheet to get sheet names/info
   * 
   * @param {string} spreadsheetId - The Google Sheet ID
   * @return {Promise<any>} - The sheet metadata
   */
  const fetchSheetMetadata = async (spreadsheetId: string) => {
    try {
      // Request sheet metadata
      const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`,
        {
          headers: { Authorization: `Bearer ${session?.accessToken}` },
        }
      );
      
      // Handle errors
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
  
  /**
   * Fetches data from a Google Sheet
   * Tries multiple approaches to accommodate different sheet structures
   * 
   * @param {string} spreadsheetId - The Google Sheet ID
   */
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
          await processSheetData(data);
          return;
        }
        
        // If that fails, fall back to index 0
        console.log("Fetching by sheet name failed, trying index 0 instead");
      } catch (error) {
        console.log("Error fetching by sheet name:", error);
      }
      
      // Fallback to index 0 approach
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
      await processSheetData(data);
      
    } catch (error) {
      console.error("Error fetching Google Sheet data:", error);
      setGoogleAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Processes raw data from Google Sheets into photo objects
   * Maps spreadsheet rows to photo data structure
   * 
   * @param {any} data - Raw sheet data
   */
  const processSheetData = async (data: any) => {
    if (data.values) {
      // Map spreadsheet rows to photo objects
      // Skip the first row (headers) with slice(1)
      const photoData = data.values.slice(1).map((row: any) => ({
        timestamp: row[0], // Column A: Timestamp
        location: row[1],  // Column B: Location
        uploaderName: row[2], // Column C: Uploader Name
        uploadDate: row[3], // Column D: Upload Date
        uploadTime: row[4], // Column E: Upload Time
        fileLink: row[5],  // Column F: File Link
        flagged: row[6],   // Column G: Flagged status
        favorites: row[7], // Column H: Favorites status
      }));
      
      // Fetch thumbnails for each photo
      const photosWithThumbnails = await fetchThumbnails(photoData);
      setPhotos(photosWithThumbnails);
      console.log("Processed photos with thumbnails:", photosWithThumbnails);
      
      // Update authentication state
      setGoogleAuthenticated(true);
      
      // Extract flagged photos
      const initialFlagged = photosWithThumbnails
        .filter(photo => photo.flagged)
        .map(photo => photo.timestamp);
      setFlaggedPhotos(initialFlagged);
      
      // Extract favorite photos
      const initialFavorites = photosWithThumbnails
        .filter(photo => photo.favorites)
        .map(photo => photo.timestamp);
      setFavoritePhotos(initialFavorites);
    } else {
      console.error("No values found in the sheet data");
      setGoogleAuthenticated(false);
    }
  };

  /**
   * Fetches thumbnail images for each photo from Google Drive
   * 
   * @param {any[]} photoData - Array of photo objects
   * @return {Promise<any[]>} - Photos with added thumbnail links
   */
  const fetchThumbnails = async (photoData: any[]) => {
    // Process each photo in parallel using Promise.all
    const thumbnails = await Promise.all(
      photoData.map(async (photo) => {
        const fileId = extractFileId(photo.fileLink);
        
        // If we can't extract a file ID, use fallback image
        if (!fileId) {
          return { ...photo, thumbnailLink: "/fallback-image.png" };
        }
  
        try {
          // Fetch thumbnail metadata from Google Drive
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
          // Use thumbnailLink if available, otherwise fallback
          return { 
            ...photo, 
            thumbnailLink: data.thumbnailLink || "/fallback-image.png"
          };
        } catch (error) {
          console.error(`Error fetching thumbnail for file ID ${fileId}:`, error);
          return { ...photo, thumbnailLink: "/fallback-image.png" };
        }
      })
    );
  
    return thumbnails;
  };

  // ===== TIMELAPSE GENERATION =====
  /**
   * Generates a timelapse video from selected photos
   * Uses Canvas API and MediaRecorder to create a WebM video
   */
  const handleGenerateTimelapse = async (): Promise<void> => {
    console.log("🚀 Starting timelapse generation process");
    console.log(`💾 Selected images count: ${selectedForTimelapse.length}`);
    
    // Validate selection
    if (selectedForTimelapse.length ===
 0) {
      console.warn("⚠️ No images selected for timelapse");
      alert("No images selected for timelapse.");
      return;
    }
    
    console.log("📷 Selected images:", selectedForTimelapse);
    
    // Initialize state for progress tracking
    setFetchProgress(0);
    setTotalImages(selectedForTimelapse.length);
    setProcessedImageCount(0);
    setProcessingModalOpen(true);
    setLoading(true);
    
    try {
      // ===== STEP 1: SETUP CANVAS =====
      console.log("🎨 Creating canvas element");
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      
      if (!ctx) {
        console.error("❌ Failed to get 2D context for canvas");
        throw new Error("Failed to get 2D context for canvas.");
      }
      console.log("✅ Canvas context obtained");
      
      // ===== STEP 2: SETUP MEDIA RECORDER =====
      console.log("🎬 Setting up MediaRecorder");
      const chunks: Blob[] = [];
      let streamCreated = false;
      
      try {
        // Create a stream from the canvas
        const stream = canvas.captureStream(5); // 5 frames per second
        streamCreated = true;
        console.log("✅ Stream created successfully", stream);
        
        // Initialize MediaRecorder with WebM format
        console.log("📼 Creating MediaRecorder with codec: video/webm; codecs=vp8");
        const recorder = new MediaRecorder(stream, { mimeType: "video/webm; codecs=vp8" });
        console.log("✅ MediaRecorder created:", recorder.state);
        
        // Configure data handling
        recorder.ondataavailable = (e: BlobEvent) => {
          console.log(`📊 Data available event: ${e.data.size} bytes`);
          if (e.data.size > 0) {
            console.log(`➕ Adding ${e.data.size} bytes to chunks array`);
            chunks.push(e.data);
          }
        };
        
        // Start recording
        console.log("▶️ Starting recorder");
        recorder.start();
        console.log("✅ Recorder started:", recorder.state);
        
        // ===== STEP 3: IMAGE LOADING HELPER =====
        /**
         * Helper function to load an image from a blob
         * 
         * @param {Blob} blob - Image data as a blob
         * @return {Promise<HTMLImageElement>} - Loaded image element
         */
        const loadImage = (blob: Blob): Promise<HTMLImageElement> => {
          console.log(`🖼️ Loading image from blob: ${blob.size} bytes, type: ${blob.type}`);
          return new Promise((resolve, reject) => {
            const img = new window.Image();
            
            // Handle successful load
            img.onload = () => {
              console.log(`✅ Image loaded successfully: ${img.width}x${img.height}`);
              resolve(img);
            };
            
            // Handle load errors
            img.onerror = (err) => {
              console.error("❌ Image loading error:", err);
              reject(err);
            };
            
            // Set source to blob URL
            img.src = URL.createObjectURL(blob);
            console.log("🔗 Image URL created:", img.src);
          });
        };
        
        // ===== STEP 4: FETCH ALL IMAGES =====
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
              // Fetch the full-resolution image
              console.log(`📥 Fetching content for file ID: ${fileId}`);
              const blob = await fetchFileContent(fileId);
              console.log(`✅ Content fetched: ${blob.size} bytes, type: ${blob.type}`);
              
              // Update progress
              setFetchProgress((prev) => {
                console.log(`📊 Fetch progress: ${prev + 1}/${selectedForTimelapse.length}`);
                return prev + 1;
              });
              
              // Load the image
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
          // Filter out any null images (failed loads)
          const validImages = images.filter((img) => img);
          console.log(`📊 Images fetched: ${validImages.length}/${selectedForTimelapse.length} successful`);
          return validImages;
        });
        
        console.log("✅ All images fetched and loaded");
        setIsFetching(false);
        
        // ===== STEP 5: CREATE TIMELAPSE =====
        console.log("🎞️ Beginning timelapse creation");
        
        // Configure frame rate and duration
        const displayDuration = 2 * 1000; // 2 seconds per image
        const fps = 30; // Frames per second
        const totalFramesPerImage = Math.ceil((displayDuration / 1000) * fps);
        console.log(`⚙️ Configuration: ${displayDuration}ms per image, ${fps}fps, ${totalFramesPerImage} frames per image`);
        
        // Process each image
        console.log(`🎬 Processing ${preFetchedImages.length} images`);
        for (let i = 0; i < preFetchedImages.length; i++) {
          const img = preFetchedImages[i];
          console.log(`📷 Processing image ${i + 1}/${preFetchedImages.length}`);
          
          if (!img) {
            console.warn(`⚠️ Skipping null image at index ${i}`);
            continue;
          }
          
          // Adjust canvas size to match image dimensions
          console.log(`🖼️ Adjusting canvas size to ${img.naturalWidth}x${img.naturalHeight}`);
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          
          // Draw frames for current image
          console.log(`🎞️ Drawing ${totalFramesPerImage} frames for image ${i + 1}`);
          for (let frame = 0; frame < totalFramesPerImage; frame++) {
            // Only log first and last frame to reduce console spam
            if (frame === 0 || frame === totalFramesPerImage - 1) {
              console.log(`🎬 Drawing frame ${frame + 1}/${totalFramesPerImage} for image ${i + 1}`);
            }
            
            // Clear canvas and draw new image
            ctx.clearRect(0, 0, 10000, 10000);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            
            // Wait for next animation frame to ensure smooth recording
            await new Promise((resolve) => requestAnimationFrame(resolve));
          }
          
          // Update progress
          setProcessedImageCount((prev) => {
            console.log(`📊 Processed image count: ${prev + 1}/${preFetchedImages.length}`);
            return prev + 1;
          });
        }
        
        // ===== STEP 6: FINALIZE VIDEO =====
        console.log("🛑 Stopping recorder");
        recorder.stop();
        console.log("✅ Recorder stopped");
        
        // Wait for recorder to finish and get final video blob
        console.log("⏳ Waiting for final video blob");
        const videoBlob = await new Promise<Blob>((resolve) => {
          recorder.onstop = () => {
            console.log(`📼 Recorder stopped event, ${chunks.length} chunks available`);
            const blob = new Blob(chunks, { type: "video/webm" });
            console.log(`✅ Final video blob created: ${blob.size} bytes`);
            resolve(blob);
          };
        });
        
        // ===== STEP 7: DOWNLOAD VIDEO =====
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
        // Handle errors specific to stream creation and recording
        console.error("❌ Error with stream or recorder:", streamError);
        if (!streamCreated) {
          console.error("💔 Failed to create canvas capture stream. This might be due to browser support issues or security restrictions.");
        }
        throw streamError;
      }
      
    } catch (error) {
      // Handle general timelapse generation errors
      console.error("❌ Error generating timelapse:", error);
      console.error("Error details:", {
        name: error instanceof Error ? error.name : "Unknown",
        message: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : "No stack trace"
      });
    } finally {
      // Clean up resources regardless of success or failure
      console.log("🧹 Cleaning up resources");
      setLoading(false);
      setProcessingModalOpen(false);
      console.log("🏁 Timelapse generation process ended");
    }
  };

  // ===== RENDER COMPONENT =====
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
        backgroundColor: "#f9f9f9", // Light background
      }}
    >
      {/* ===== AUTHENTICATION SECTION ===== */}
      {session && isGoogleAuthenticated ? (
        // Authenticated state
        <div>
          <Flex
            align={isSmallScreen ? "stretch" : "center"}
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
        // Unauthenticated state
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
      
      {/* ===== FILTERS SECTION ===== */}
      <Text size="xl" mb="md" style={{ fontWeight: 600 }}>
        Filters:
      </Text>
      
      {/* Sort options */}
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
      
      {/* Location filter */}
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
      
      {/* Date range filters */}
      <Flex>
        <TextInput
          label="Start Date (mm/dd/yyyy):"
          placeholder="e.g., 01/01/2024"
          value={startDate}
          onChange={(e) => setStartDate(e.currentTarget.value)}
          style={{paddingRight: "1rem"}}
        />

        <TextInput
          label="End Date (mm/dd/yyyy):"
          placeholder="e.g., 12/31/2024"
          value={endDate}
          onChange={(e) => setEndDate(e.currentTarget.value)}
        />
      </Flex>
      
      {/* Time of day range slider */}
      <Text size="sm" style={{ marginBottom: "0.5rem", fontWeight: 500, marginTop: "1rem" }}>
        Time of Day:
      </Text>
      <RangeSlider
        style={{ marginTop: "1rem", marginBottom: "3rem", marginRight: "1rem", marginLeft: "1rem" }}
        label={(value) => {
          // Convert minutes to hours:minutes AM/PM format
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
      
      {/* ===== FLAGGING & FAVORITES FILTERS ===== */}
      {/* Favorites filter checkbox */}
      <Checkbox
        label="Show Favorites Only?"
        checked={showFavoritesOnly}
        onChange={(event) => setShowFavoritesOnly(event.currentTarget.checked)}
        style={{ marginTop: "1rem" }}
      />

      {/* Flagged filter checkbox */}
      <Checkbox
        label="Show Flagged Only?"
        checked={showFlaggedOnly}
        onChange={(event) => setShowFlaggedOnly(event.currentTarget.checked)}
        style={{ marginTop: "1rem" }}
      />
      
      <Divider my="md" />
      
      {/* ===== TIMELAPSE GENERATION SECTION ===== */}
      <Text size="xl" mb="md" style={{ fontWeight: 600 }}>
        Timelapse Generation:
      </Text>
      
      {/* Timelapse controls */}
      <Flex>
        {/* Select/Deselect All Button */}
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
        
        {/* Generate Timelapse Button */}
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
      
      {/* ===== PROCESSING MODAL ===== */}
      {/* Modal appears during timelapse generation to show progress */}
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