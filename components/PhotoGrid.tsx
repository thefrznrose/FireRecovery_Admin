
import { useEffect, useState } from "react";
import { Grid, Loader, Text, Button, Paper, Select, Modal, Divider, RangeSlider, TextInput, Checkbox, Flex } from "@mantine/core";
import { useSession } from "next-auth/react";
import { useMediaQuery } from "@mantine/hooks";
import GoogleSignInButton from "./Login/GoogleSignInButton";
import Image from "next/image"; // Import Next.js Image component
import {IconClockHour9, IconEye, IconFlag, IconTrash, IconLayersIntersect, IconTableImport} from "@tabler/icons-react"
import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';

export default function PhotoGrid() {
  const { data: session } = useSession();
  const [photos, setPhotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [gapiLoaded, setGapiLoaded] = useState(false);
  const [isGoogleAuthenticated, setGoogleAuthenticated] = useState(false); // Track Google authenticationc
  const [filter, setFilter] = useState<string | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<any>(null);
  const [isModalOpen, setModalOpen] = useState(false);

  const [value, setValue] = useState<[Date, Date]>([new Date(2021, 11, 1), new Date(2021, 11, 5)]);
  
  const [spreadsheetId, setSpreadsheetId] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState<string | null>("time-desc"); // Default sorting option
  const [selectedForTimelapse, setSelectedForTimelapse] = useState<any[]>([]);

  const isLargeScreen = useMediaQuery('(min-width: 1200px)');
  const isMediumScreen = useMediaQuery('(min-width: 768px)');
  const isSmallScreen = useMediaQuery('(min-width: 480px)');
  const [filteredPhotos, setFilteredPhotos] = useState<any[]>([]);

  const [locationFilter, setLocationFilter] = useState<string | null>(null); // Location filter
  const [startDate, setStartDate] = useState<string>(""); // Start date (dd/mm/yyyy)
  const [endDate, setEndDate] = useState<string>(""); // End date (dd/mm/yyyy)
  const [timeRange, setTimeRange] = useState<[number, number]>([240, 1200]); // Time range in minutes (4:00 AM to 8:00 PM)

  const ffmpeg = createFFmpeg({ log: true });

  const fetchFileContent = async (fileId: string | null): Promise<Blob> => {
    console.log("fetching:", fileId)
    if (!fileId) {
      throw new Error("fileId cannot be null");
    }
  
    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
      {
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      }
    );
    console.log("Response: ", response)
  
    if (!response.ok) {
      throw new Error(`Error fetching file: ${response.statusText}`);
    }
    console.log(response)
    return await response.blob();
  };

  // const handleGenerateTimelapse = async () => {
  //   if (selectedForTimelapse.length === 0) {
  //     alert("No images selected for timelapse.");
  //     return;
  //   }
  
  //   console.log("Starting timelapse generation...");
  //   const ffmpeg = createFFmpeg({
  //     log: true,
  //     corePath: "/ffmpeg-core/ffmpeg-core.js",
  //   });
  
  //   console.log("Loading FFmpeg...");
  //   await ffmpeg.load();
  //   console.log("FFmpeg loaded successfully.");
  
  //   try {
  //     setLoading(true);
  
  //     const imageFiles = [];
  //     for (let index = 0; index < selectedForTimelapse.length; index++) {
  //       const photo = selectedForTimelapse[index];
  //       const fileId = extractFileId(photo.fileLink);
  
  //       console.log(`Fetching image ${index + 1}/${selectedForTimelapse.length}...`);
  //       const blob = await fetchFileContent(fileId);
  //       const arrayBuffer = await blob.arrayBuffer();
  //       const uint8Array = new Uint8Array(arrayBuffer);
  
  //       const filename = `image_${String(index).padStart(3, "0")}.jpg`;
  //       const resizedFilename = `resized_${String(index).padStart(3, "0")}.jpg`;
  
  //       ffmpeg.FS("writeFile", filename, uint8Array);
  
  //       console.log(`Resizing image ${index + 1}/${selectedForTimelapse.length}...`);
  //       // Lower the resolution of the images
  //       await ffmpeg.run(
  //         "-i",
  //         filename,
  //         "-vf",
  //         "scale=1920:1080", // Adjust this resolution as needed
  //         "-pix_fmt",
  //         "yuv420p",
  //         resizedFilename
  //       );
  
  //       ffmpeg.FS("unlink", filename); // Remove original high-resolution image
  //       imageFiles.push(resizedFilename);
  //     }
  
  //     console.log("Creating input list for timelapse...");
  //     // Step 2: Write Input File List
  //     const lastImage = imageFiles[imageFiles.length - 1];
  //     const inputList = imageFiles
  //       .map((filename) => `file '${filename}'\nduration 2\n`) // 2 seconds per image
  //       .join("") + `file '${lastImage}'\nduration 2\n`; // Add the last image twice
  //     ffmpeg.FS("writeFile", "input.txt", new TextEncoder().encode(inputList));
  
  //     console.log("Generating timelapse video...");
  //     // Step 3: Generate Timelapse
  //     await ffmpeg.run(
  //       "-f",
  //       "concat",
  //       "-safe",
  //       "0",
  //       "-i",
  //       "input.txt",
  //       "-vsync",
  //       "vfr",
  //       "-pix_fmt",
  //       "yuv420p",
  //       "-r",
  //       "30",
  //       "timelapse.mp4"
  //     );
  
  //     console.log("Reading and downloading timelapse video...");
  //     // Step 4: Read and Download Timelapse
  //     const data = ffmpeg.FS("readFile", "timelapse.mp4");
  //     const videoBlob = new Blob([data.buffer], { type: "video/mp4" });
  //     const videoUrl = URL.createObjectURL(videoBlob);
  
  //     const downloadLink = document.createElement("a");
  //     downloadLink.href = videoUrl;
  //     downloadLink.download = "timelapse.mp4";
  //     downloadLink.click();
  
  //     console.log("Timelapse generation completed successfully.");
  //   } catch (error) {
  //     console.error("Error generating timelapse:", error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  
  const handleGenerateTimelapse = async (): Promise<void> => {
    if (selectedForTimelapse.length === 0) {
      alert("No images selected for timelapse.");
      return;
    }
  
    setLoading(true);
  
    try {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
  
      if (!ctx) {
        throw new Error("Failed to get 2D context for canvas.");
      }
  
      const stream = canvas.captureStream(1); // 30 FPS
      const recorder = new MediaRecorder(stream, { mimeType: "video/webm; codecs=vp8" });
  
      const chunks: Blob[] = [];
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
  
      const drawImageFrames = (duration: number, fps: number): Promise<void> => {
        return new Promise((resolve) => {
          const totalFrames = Math.ceil((duration / 1000) * fps);
          let frameCount = 0;
  
          const renderFrame = () => {
            if (frameCount >= totalFrames) {
              resolve();
              return;
            }
            frameCount++;
            requestAnimationFrame(renderFrame);
          };
  
          renderFrame();
        });
      };
  
      const preFetchedImages = await Promise.all(
        selectedForTimelapse.map(async (photo) => {
          const fileId = extractFileId(photo.fileLink);
          const blob = await fetchFileContent(fileId);
          return loadImage(blob);
        })
      );
  
      // Add the last image twice
      const lastImage = preFetchedImages[preFetchedImages.length - 1];
      preFetchedImages.push(lastImage);
  
      for (const img of preFetchedImages) {
        canvas.width = img.naturalWidth > 1920 ? 1920 : img.naturalWidth;
        canvas.height = img.naturalHeight > 1080 ? 1080 : img.naturalHeight;
  
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  
        await drawImageFrames(4000, 30); // 2 seconds per image at 30 FPS
      }
  
      recorder.stop();
  
      const videoBlob = await new Promise<Blob>((resolve) => {
        recorder.onstop = () => {
          const blob = new Blob(chunks, { type: "video/webm" });
          resolve(blob);
        };
      });
  
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
    }
  };
  
  
  const drawImageFrames = (duration: number, fps: number): Promise<void> => {
    return new Promise((resolve) => {
      const totalFrames = Math.ceil((duration / 1000) * fps);
      let frameCount = 0;
  
      const renderFrame = () => {
        if (frameCount >= totalFrames) {
          resolve();
          return;
        }
        frameCount++;
        requestAnimationFrame(renderFrame);
      };
  
      renderFrame();
    });
  };

  const loadImage = (blob: Blob): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = URL.createObjectURL(blob);
    });
  };
  
  
  
  
  
  
  const filterPhotos = () => {
    console.log("Start date input:", startDate);
    console.log("End date input:", endDate);
  
    const start = startDate
      ? new Date(startDate.split("/").reverse().join("-"))
      : null;
    const end = endDate
      ? new Date(endDate.split("/").reverse().join("-"))
      : null;
  
    if (start) console.log("Parsed start date:", start);
    if (end) console.log("Parsed end date:", end);
  
    return photos.filter((photo) => {
      const photoDate = new Date(photo.uploadDate.split("/").reverse().join("-"));
  
      if (isNaN(photoDate.getTime())) {
        console.error(`Invalid photo upload date: ${photo.uploadDate}`);
        return false; // Exclude photos with invalid upload dates
      }
  
      console.log("Photo upload date:", photo.uploadDate);
      console.log("Parsed photo date:", photoDate);
  
      // Convert uploadTime to minutes since midnight for time filtering
      const timeParts = photo.uploadTime.match(/(\d+):(\d+):(\d+)\s(AM|PM)/);
      if (!timeParts) {
        console.error(`Invalid photo upload time: ${photo.uploadTime}`);
        return false; // Exclude photos with invalid upload times
      }
      const hours = parseInt(timeParts[1], 10) % 12 + (timeParts[4] === "PM" ? 12 : 0);
      const minutes = parseInt(timeParts[2], 10);
      const photoTimeInMinutes = hours * 60 + minutes;
  
      console.log(
        "Photo time in minutes:",
        photoTimeInMinutes,
        "| Time range:",
        timeRange
      );
  
      // Log specific comparisons for debugging
      console.log(
        `Comparing photo time: ${photoTimeInMinutes} with time range: ${timeRange[0]} - ${timeRange[1]}`
      );
      console.log(
        `Time comparison results: ${
          photoTimeInMinutes >= timeRange[0]
        } (start) and ${photoTimeInMinutes <= timeRange[1]} (end)`
      );
  
      // Location filter
      const matchesLocation =
        !locationFilter || photo.location === locationFilter;
      if (!matchesLocation)
        console.log("Photo excluded by location filter:", photo.location);
  
      // Matches date range
      const matchesDate =
        (!start || photoDate >= start) && (!end || photoDate <= end);
      if (!matchesDate)
        console.log(
          "Photo excluded by date range filter:",
          photoDate,
          "| Start:",
          start,
          "| End:",
          end
        );
  
      // Matches time range
      const matchesTime =
        photoTimeInMinutes >= timeRange[0] &&
        photoTimeInMinutes <= timeRange[1];
        console.log(photoTimeInMinutes, timeRange)
      if (!matchesTime)
        console.log(
          "Photo excluded by time range filter:",
          photoTimeInMinutes,
          "| Time range:",
          timeRange
        );
  
      // Combine all filters
      return matchesLocation && matchesDate && matchesTime;
    });
  };

  const sortedPhotos = [...filteredPhotos].sort((a, b) => {
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
      default:
        return 0;
    }
  });

  useEffect(() => {
    // Re-filter photos whenever any filter changes
    const applyFilters = () => {
      const results = filterPhotos();
      setFilteredPhotos(results);
    };
    applyFilters();
  }, [photos, timeRange, startDate, endDate, locationFilter]);

  useEffect(() => {
    const initializeGapiAndFetchSheet = async () => {
      // Retry until gapi is available
      const retryGapiLoad = () => {
        if (window.gapi) {
          setGapiLoaded(true);
        } else {
          console.log("Retrying gapi load...");
          setTimeout(retryGapiLoad, 1000); // Retry after 1 second
          return;
        }
      };
  
      retryGapiLoad(); // Start retrying gapi load
  
      // Wait for the session to be established
      if (!session || !session.accessToken) {
        console.log("Waiting for authentication...");
        setTimeout(initializeGapiAndFetchSheet, 5000); // Retry after 1 second if session is unavailable
        return;
      }
  
      // Load spreadsheet ID from localStorage
      const storedSheetId = localStorage.getItem("spreadsheetId");
      if (storedSheetId) {
        console.log("Loading spreadsheet:", storedSheetId);
        setSpreadsheetId(storedSheetId);
        try {
          await fetchSheetData(storedSheetId); // Fetch data for the stored sheet
          // setGoogleAuthenticated(true)
        } catch (error) {
          console.error("Error fetching sheet data:", error);
          setGoogleAuthenticated(false)
          setTimeout(initializeGapiAndFetchSheet, 1000); // Retry fetching sheet
        }
      } else {
        console.log("No spreadsheet ID found in localStorage.");
        // setGoogleAuthenticated(true)
      }
    };
  
    initializeGapiAndFetchSheet(); // Start initialization
  }, [session]);
  
  const handleSelectAll = () => {
    if (selectedForTimelapse.length === filteredPhotos.length) {
      // If all photos are selected, deselect all
      setSelectedForTimelapse([]);
    } else {
      // Otherwise, select all photos
      setSelectedForTimelapse([...sortedPhotos]);
    }
  };
  

  const handleCheckboxChange = (photo: any) => {
    setSelectedForTimelapse((prev) => {
      const isSelected = prev.some((item) => item.timestamp === photo.timestamp);
      if (isSelected) {
        return prev.filter((item) => item.timestamp !== photo.timestamp);
      } else {
        const updated = [...prev, photo];
        return updated.sort(
          (a, b) =>
            new Date(a.uploadDate + " " + a.uploadTime).getTime() -
            new Date(b.uploadDate + " " + b.uploadTime).getTime()
        );
      }
    });
  };

  const deletePhoto = async (photo: any, index: number) => {
    if (!spreadsheetId) {
      console.error("Spreadsheet ID is not defined. Please select a sheet first.");
      return;
    }
  
    const fileId = extractFileId(photo.fileLink);
  
    // Show confirmation dialog
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
      // Delete the file from Google Drive
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
  
      // Delete the row from the spreadsheet
      const rowIndex = index + 2; // Spreadsheet rows are 1-indexed and include a header
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
  
      // Update the state to remove the deleted photo
      setPhotos((prevPhotos) => prevPhotos.filter((_, i) => i !== index));
    } catch (error) {
      console.error("Error deleting photo:", error);
    } finally {
      setLoading(false);
    }
  };
  

  const extractFileId = (url: string) => {
    const match = url.match(/id=([a-zA-Z0-9-_]+)/);
    return match ? match[1] : null;
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
        return { ...photo, thumbnailLink: "/fallback-thumbnail.jpg" }; // Default fallback
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
          return { ...photo, thumbnailLink: "/fallback-thumbnail.jpg" }; // Fallback on error
        }

        const data = await res.json();
        return { ...photo, thumbnailLink: data.thumbnailLink || "/fallback-thumbnail.jpg" }; // Fallback if thumbnailLink is null
      } catch (error) {
        console.error(`Error fetching thumbnail for file ID ${fileId}:`, error);
        return { ...photo, thumbnailLink: "/fallback-thumbnail.jpg" }; // Fallback on exception
      }
    })
  );

  return thumbnails;
};

  
  const handleImageClick = (photo: any) => {
    setSelectedPhoto(photo);
    setModalOpen(true);
  };

  return (
    <>
      <Grid>
        {/* Sidebar */}
        
        <Grid.Col span={2.75}>
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
                  <div>
                    <Text size="md" style={{ fontWeight: 500 }}>
                      Logged in as:
                    </Text>
                    <Text size="sm">
                      {session.user?.name || "Unknown User"}
                    </Text>
                    <Text size="sm" color="dimmed">
                      {session.user?.email || "No email provided"}
                    </Text>
                  </div>
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
                {/* <GoogleSignInButton /> */}
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
            {/* <TextInput
              label="Search"
              placeholder="Search for location,"
            /> */}
            <Select
              label="Sort By"
              placeholder="Select sorting"
              data={[
                { value: "time-asc", label: "Taken Time/Date (Oldest First)" },
                { value: "time-desc", label: "Taken Time/Date (Newest First)" },
                { value: "location-asc", label: "Location (A-Z)" },
                { value: "location-desc", label: "Location (Z-A)" },
                { value: "uploader-asc", label: "Uploader Name (A-Z)" },
                { value: "uploader-desc", label: "Uploader Name (Z-A)" },
              ]}
              value={sortOption}
              onChange={setSortOption}
            />
            <Select
            label="Location"
            placeholder="Select location"
            data={[
              ...new Set(photos.map((photo) => photo.location)), // Unique locations
            ].map((location) => ({ value: location, label: location }))}
            value={locationFilter}
            onChange={setLocationFilter}
            style={{ marginBottom: "1rem" }}
          />
          <Flex>
            <TextInput
              label="Start Date (mm/dd/yyyy)"
              placeholder="e.g., 01/01/2024"
              value={startDate}
              onChange={(e) => setStartDate(e.currentTarget.value)}
              // onBlur={filterByDateRange} // Trigger filtering when focus is lost
            />

            <TextInput
              label="End Date (mm/dd/yyyy)"
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
              Timelapse:
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
        </Grid.Col>
        {/* Main Content */}
        <Grid.Col span={9}>
        <Grid gutter="lg" columns={12}>
  {sortedPhotos.map((photo, index) => {
    // Find the index in the timelapse array if selected
    const timelapseIndex = selectedForTimelapse.findIndex(
      (item) => item.timestamp === photo.timestamp
    );

    return (
      <Grid.Col
        key={`${photo.name}-${index}`}
        span={isLargeScreen ? 3 : isMediumScreen ? 4 : isSmallScreen ? 6 : 12}
      >
        <Paper
          withBorder
          shadow="md"
          radius="md"
          style={{
            height: "450px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "1rem",
            position: "relative", // Needed for overlay positioning
          }}
        >
          {timelapseIndex !== -1 && (
              <div
                style={{
                  position: "absolute",
                  bottom: ".5rem",
                  right: ".5rem",
                  width: "30px",
                  height: "30px",
                  backgroundColor: "grey",
                  color: "#fff",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "12px",
                  fontWeight: "bold",
                  zIndex: 2,
                }}
              >
                {timelapseIndex + 1}
              </div>
            )}
          {/* Image Section */}
          <div style={{ position: "relative", width: "100%", height: "14rem" }}>
            <Image
              src={`${photo.thumbnailLink}`}
              alt={photo.name}
              fill
              style={{
                objectFit: "contain", // Ensures the image fits while maintaining aspect ratio
              }}
              onError={(e) => {
                e.currentTarget.src = photo.thumbnailLink; // Fallback handling
              }}
            />
            
          </div>
          {/* Information Section */}
          <div>
            <Text size="sm">
              <strong>Location:</strong> {photo.location || "N/A"}
            </Text>
            <Text size="sm">
              <strong>Uploader:</strong> {photo.uploaderName || "N/A"}
            </Text>
            <Text size="sm">
              <strong>Taken:</strong> {photo.uploadDate || "N/A"} at{" "}
              {photo.uploadTime || "N/A"}
            </Text>
            <Text size="sm">
              <strong>Uploaded:</strong> {photo.timestamp || "N/A"}
            </Text>
            <Button
              onClick={() => window.open(photo.fileLink, "_blank", "noopener,noreferrer")}
              size="xs"
              style={{ marginTop: "1rem" }}
              leftSection={<IconEye />}
              color={"limeGreen"}
            >
              View
            </Button>
            <Button
              color="yellow"
              size="xs"
              onClick={() => deletePhoto(photo, index)}
              leftSection={<IconFlag />}
              style={{
                marginTop: "1rem",
                marginLeft: "0.5rem",
              }}
            >
              Flag
            </Button>
            <Button
              color="red"
              size="xs"
              onClick={() => deletePhoto(photo, index)}
              leftSection={<IconTrash />}
              style={{
                marginTop: "1rem",
                marginLeft: "0.5rem",
              }}
            >
              Delete
            </Button>
            <Checkbox
              label="Include in Timelapse"
              checked={timelapseIndex !== -1}
              onChange={() => handleCheckboxChange(photo)}
              style={{ marginTop: "1rem" }}
            />
          </div>
        </Paper>
      </Grid.Col>
    );
  })}
</Grid>


          {loading && <Loader size="lg" style={{ margin: "2rem auto" }} />}
        </Grid.Col>
      </Grid>

      <Modal
        opened={isModalOpen}
        onClose={() => setModalOpen(false)}
        centered
        title={selectedPhoto?.name || "Photo Details"}
      >
        {selectedPhoto && (
          <img
            src={`${selectedPhoto.thumbnailLink}}`}
            alt={selectedPhoto.name}
            // style={{ maxWidth: "100%" }}
          />
        )}
      </Modal>
    </>
  );
}
