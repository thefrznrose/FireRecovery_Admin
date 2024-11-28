
import { useEffect, useState } from "react";
import { Grid, Loader, Text, Button, Paper, Select, Modal, Divider, RangeSlider } from "@mantine/core";
import { useSession } from "next-auth/react";
import { useMediaQuery } from "@mantine/hooks";
import GoogleSignInButton from "./Login/GoogleSignInButton";
import Image from "next/image"; // Import Next.js Image component
import {IconEye, IconFlag, IconTrash} from "@tabler/icons-react"

export default function PhotoGrid() {
  const { data: session } = useSession();
  const [photos, setPhotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [gapiLoaded, setGapiLoaded] = useState(false);
  const [filter, setFilter] = useState<string | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<any>(null);
  const [isModalOpen, setModalOpen] = useState(false);

  const [startMonth, setStartMonth] = useState<string | null>(null);
  const [startYear, setStartYear] = useState<string | null>(null);
  const [endMonth, setEndMonth] = useState<string | null>(null);
  const [endYear, setEndYear] = useState<string | null>(null);
  const [spreadsheetId, setSpreadsheetId] = useState<string | null>(null);


  const isLargeScreen = useMediaQuery('(min-width: 1200px)');
  const isMediumScreen = useMediaQuery('(min-width: 768px)');
  const isSmallScreen = useMediaQuery('(min-width: 480px)');
  
  const filteredPhotos = filter 
  ? photos.filter((photo) => photo.location === filter) 
  : photos;

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
        setTimeout(initializeGapiAndFetchSheet, 1000); // Retry after 1 second if session is unavailable
        return;
      }
  
      // Load spreadsheet ID from localStorage
      const storedSheetId = localStorage.getItem("spreadsheetId");
      if (storedSheetId) {
        console.log("Loading spreadsheet:", storedSheetId);
        setSpreadsheetId(storedSheetId);
        try {
          await fetchSheetData(storedSheetId); // Fetch data for the stored sheet
        } catch (error) {
          console.error("Error fetching sheet data:", error);
          setTimeout(initializeGapiAndFetchSheet, 1000); // Retry fetching sheet
        }
      } else {
        console.log("No spreadsheet ID found in localStorage.");
      }
    };
  
    initializeGapiAndFetchSheet(); // Start initialization
  }, [session]);
  
  

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
        const error = await res.json();
        console.error("Google Sheets API Error:", error);
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
              height: "100vh",
              position: "sticky",
              top: 0,
            }}
          >
              {/* {session ? (
              <div>
                <Text size="md" style={{ fontWeight: 500 }}>
                  Logged in as:
                </Text>
                <Text size="sm">{session.user?.name || "Unknown User"}</Text>
                <Text size="sm" color="dimmed">
                  {session.user?.email || "No email provided"}
                </Text>
              </div>
            ) : ( */}
              <GoogleSignInButton />
            {/* )} */}
            <Divider my="md" />
            <Text size="lg" mb="md" style={{ fontWeight: 600 }}>
              Filters:
            </Text>
            <Select
              label="Location"
              placeholder="Select location"
              data={photos
                .map((photo) => ({ value: photo.location, label: photo.location }))
                .filter((v, i, a) => a.findIndex((t) => t.value === v.value) === i)} // Remove duplicates
              value={filter}
              onChange={setFilter} // Update filter state
              style={{marginTop: "1rem"}}
            />
            <Select
              label="Start Month"
              placeholder="Select month"
              data={[
                { value: "1", label: "January" },
                { value: "2", label: "February" },
                { value: "3", label: "March" },
                { value: "4", label: "April" },
              ]}
              value={startMonth}
              onChange={setStartMonth}
              style={{marginTop: "1rem"}}
            />
            <Select
              label="Start Year"
              placeholder="Select year"
              data={[
                { value: "2022", label: "2022" },
                { value: "2023", label: "2023" },
              ]}
              value={startYear}
              onChange={setStartYear}
              style={{marginTop: "1rem"}}
            />
            <RangeSlider
              style={{ marginTop: '2rem', marginBottom: '2rem',  marginRight: '1rem',  marginLeft: '1rem' }}
              label={(value) => {
                  const hours = Math.floor(value / 60);
                  const minutes = value % 60;
                  const period = hours < 12 ? 'AM' : 'PM';
                  const formattedHours = hours % 12 || 12; // Convert 0 to 12
                  const formattedMinutes = minutes.toString().padStart(2, '0');
                  return `${formattedHours}:${formattedMinutes} ${period}`;
              }}
              marks={[
                  { value: 0, label: '12:00 AM' },
                  { value: 360, label: '6:00 AM' },
                  { value: 720, label: '12:00 PM' },
                  { value: 1080, label: '6:00 PM' },
                  { value: 1439, label: '11:59 PM' },
              ]}
              min={0}
              max={1439}
              step={15} // Increment in 15-minute intervals
              defaultValue={[360, 1080]} // Default to 6:00 AM - 6:00 PM
              onChange={(value) => {
                  const [start, end] = value;
                  console.log('Start time in minutes:', start, 'End time in minutes:', end);
              }}
            />
            <Button 
              onClick={loadPicker}
              style={{marginTop: "20px"}}
            >
              Load Images
            </Button>
          </Paper>
        </Grid.Col>

        {/* Main Content */}
        <Grid.Col span={9}>
          <Grid gutter="lg" columns={12}>
          {filteredPhotos.map((photo, index) => (
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
                }}
              >
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
                    <strong>Location:</strong> {photo.location || 'N/A'}
                  </Text>
                  <Text size="sm">
                    <strong>Uploader:</strong> {photo.uploaderName || 'N/A'}
                  </Text>
                  <Text size="sm">
                    <strong>Taken:</strong> {photo.uploadDate || 'N/A'} at {photo.uploadTime || 'N/A'}
                  </Text>
                  <Text size="sm">
                    <strong>Uploaded:</strong> {photo.timestamp || 'N/A'}
                  </Text>
                  <Button
                    onClick={() => window.open(photo.fileLink, "_blank", "noopener,noreferrer")}
                    size="xs"
                    style={{marginTop: "1rem"}}
                    leftSection={<IconEye/>}
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
                        marginLeft: "0.5rem"
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
                        marginLeft: "0.5rem"
                      }}
                    >
                      Delete
                    </Button>
                </div>
              </Paper>
            </Grid.Col>
          ))}
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
