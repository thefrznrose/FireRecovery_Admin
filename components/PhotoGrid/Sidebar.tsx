import React from "react";
import {
  Button,
  Divider,
  Flex,
  Grid,
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
  } = useDataContext(); // Import state and handlers from DataContext
  
  const handleSelectAll = () => {
    if (selectedForTimelapse.length === filteredPhotos.length) {
      // If all photos are selected, deselect all
      setSelectedForTimelapse([]);
    } else {
      // Otherwise, select all photos
      setSelectedForTimelapse([...sortedPhotos]);
    }
  };
  
  const extractFileId = (url: string) => {
    const match = url.match(/id=([a-zA-Z0-9-_]+)/);
    return match ? match[1] : null;
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
          timestamp: row[0], // Assuming timestamp is in column A
          location: row[1], // Assuming location is in column B
          uploaderName: row[2], // Assuming uploader name is in column C
          uploadDate: row[3], // Assuming upload date is in column D
          uploadTime: row[4], // Assuming upload time is in column E
          fileLink: row[5], // Assuming file link is in column F
        }));
  
        const photosWithThumbnails = await fetchThumbnails(photoData);
        setPhotos(photosWithThumbnails);
        console.log(photosWithThumbnails)
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
  if (selectedForTimelapse.length === 0) {
    alert("No images selected for timelapse.");
    return;
  }
  setProcessedImageCount(0);
  setProcessingModalOpen(true); 
  setLoading(true);
  try {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Failed to get 2D context for canvas.");
    }
    const chunks: Blob[] = [];
    const stream = canvas.captureStream(5); // 30 FPS
    const recorder = new MediaRecorder(stream, { mimeType: "video/webm; codecs=vp8" });
    recorder.ondataavailable = (e: BlobEvent) => {
      if (e.data.size > 0) chunks.push(e.data);
    };
    recorder.start();
    const loadImage = (blob: Blob): Promise<HTMLImageElement> => {
      return new Promise((resolve, reject) => {
        const img = new window.Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = URL.createObjectURL(blob);
      });
    };
    const preFetchedImages = await Promise.all(
      selectedForTimelapse.map(async (photo) => {
        const fileId = extractFileId(photo.fileLink);
        try {
          const blob = await fetchFileContent(fileId); // Fetch high-res content
          return await loadImage(blob);
        } catch (error) {
          console.error(`Error fetching or loading image for file ID ${fileId}:`, error);
          return null; // Skip failed images
        }
      })
    ).then((images) => images.filter((img) => img)); // Filter out null results
    const displayDuration = 2 * 1000; // Duration for each image in ms (2 seconds)
    const fps = 30; // Frames per second
    const totalFramesPerImage = Math.ceil((displayDuration / 1000) * fps);
    for (const img of preFetchedImages) {
      if (!img) continue;
      // Adjust canvas size to match the image
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      // Draw each frame
      for (let frame = 0; frame < totalFramesPerImage; frame++) {
        ctx.clearRect(0, 0, 10000,10000);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        // Wait for the next frame
        await new Promise((resolve) => requestAnimationFrame(resolve));
      }
      setProcessedImageCount((prev) => prev + 1);
    }
    recorder.stop();
    const videoBlob = await new Promise<Blob>((resolve) => {
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: "video/webm" });
        resolve(blob);
      };
    });
    // Download the generated video
    const videoUrl = URL.createObjectURL(videoBlob);
    const downloadLink = document.createElement("a");
    downloadLink.href = videoUrl;
    downloadLink.download = "timelapse.webm";
    downloadLink.click();
    console.log("Timelapse generation completed.");
  } catch (error) {
    console.error("Error generating timelapse:", error);
  } finally {
    setLoading(false);
    setProcessingModalOpen(false); // Close modal
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
                Generate MP4
              </Button>
            </Flex>
            {/* <Grid
  style={{
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(100px, 350px))", // Min 100px, Max 350px for responsive scaling
    gap: "10px",
    justifyContent: "center", // Center content within the grid
    alignItems: "center", // Vertically align items
  }}
> */}
{/* </Grid> */}

          </Paper>
  );
}