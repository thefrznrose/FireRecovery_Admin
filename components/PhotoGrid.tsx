
import { useEffect, useState } from "react";
import { Grid, Image, Loader, Text, Button, Paper, Select, Modal, Divider } from "@mantine/core";
import { useSession } from "next-auth/react";
import { useMediaQuery } from "@mantine/hooks";
import GoogleSignInButton from "./Login/GoogleSignInButton";

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

  const isLargeScreen = useMediaQuery('(min-width: 1200px)');
  const isMediumScreen = useMediaQuery('(min-width: 768px)');
  const isSmallScreen = useMediaQuery('(min-width: 480px)');

  useEffect(() => {
    if (window.gapi) {
      setGapiLoaded(true);
    } else {
      const interval = setInterval(() => {
        if (window.gapi) {
          setGapiLoaded(true);
          clearInterval(interval);
        }
      }, 100);
    }
  }, []);

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
        await fetchSheetData(selectedSheet.id);
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
          return { ...photo, thumbnailLink: null };
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
            return { ...photo, thumbnailLink: null };
          }
  
          const data = await res.json();
          return { ...photo, thumbnailLink: data.thumbnailLink, name: data.name };
        } catch (error) {
          console.error(`Error fetching thumbnail for file ID ${fileId}:`, error);
          return { ...photo, thumbnailLink: null };
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
              {session ? (
              <div>
                <Text size="md" style={{ fontWeight: 500 }}>
                  Logged in as:
                </Text>
                <Text size="sm">{session.user?.name || "Unknown User"}</Text>
                <Text size="sm" color="dimmed">
                  {session.user?.email || "No email provided"}
                </Text>
              </div>
            ) : (
              <GoogleSignInButton />
            )}
            <Divider my="md" />
            <Text size="lg" mb="sm" style={{ fontWeight: 500 }}>
              Filters
            </Text>
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
          {photos.map((photo, index) => (
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
                <div style={{ textAlign: "center", flex: 1 }}>
          <img
            src={`${photo.thumbnailLink}?timestamp=${Date.now()}`}

            alt={photo.name}
            style={{
              width: "100%", // Allow image to fill width
              height: "100%", // Allow image to fill height
              objectFit: "contain", // Maintain aspect ratio while filling space
              // borderRadius: "8px", // Optional: rounded corners for better aesthetics
            }}
            onError={(e) => {
              console.error(`Error loading image: ${photo.thumbnailLink}?timestamp=${Date.now()}`);
              e.currentTarget.src = photo.thumbnailLink; // Replace with a fallback URL
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
                    <strong>Uploaded:</strong> {photo.uploadDate || 'N/A'} at {photo.uploadTime || 'N/A'}
                  </Text>
                  <Text size="sm">
                    <strong>Timestamp:</strong> {photo.timestamp || 'N/A'}
                  </Text>
                  <Button
                    onClick={() => window.open(photo.fileLink, "_blank", "noopener,noreferrer")}
                  >
                    View
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
