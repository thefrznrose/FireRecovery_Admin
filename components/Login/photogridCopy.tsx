import { useEffect, useState } from "react";
import { Grid, Image, Loader, Text, Button, Paper, Select, Modal } from "@mantine/core";
import { useSession } from "next-auth/react";
import { useMediaQuery } from "@mantine/hooks";

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

  // Load Google API script
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


  useEffect(() => {
    console.log(photos)
  }, [photos])

  const loadPicker = () => {
    if (!gapiLoaded || !session?.accessToken) {
      console.error("Google Picker API or Access Token not available");
      console.log(gapiLoaded, session?.accessToken)
      return;
    }

    window.gapi.load("picker", { callback: createPicker });
  };

  const createPicker = () => {
    console.log("Access Token:", session?.accessToken);

    const picker = new window.google.picker.PickerBuilder()
      .addView(
        new window.google.picker.DocsView()
          .setIncludeFolders(true) // Allow folder selection
          .setSelectFolderEnabled(true) // Enable folder selection
          .setMimeTypes("image/jpeg,image/png,image/gif") // Limit selection to images
      )
      .enableFeature(window.google.picker.Feature.MULTISELECT_ENABLED) // Allow multiple selection
      .setOAuthToken(session?.accessToken) // Pass the OAuth access token
      .setDeveloperKey(process.env.NEXT_PUBLIC_GOOGLE_API_KEY!) // Google API Key
      .setCallback(handlePickerResponse) // Callback after selection
      .build();
    picker.setVisible(true);
  };

  const handlePickerResponse = async (response: any) => {
    if (response.action === "picked") {
      const selectedItems = response.docs; // Items selected by the user
      console.log("Selected Items:", selectedItems);

      const folderIds: string[] = [];
      const imageIds: string[] = [];

      // Separate folder IDs and image file IDs
      selectedItems.forEach((item: any) => {
        if (item.mimeType === "application/vnd.google-apps.folder") {
          folderIds.push(item.id);
        } else {
          imageIds.push(item.id);
        }
      });

      // Fetch images only from selected folders
      for (const folderId of folderIds) {
        await fetchImagesFromFolder(folderId);
      }

      // Fetch directly selected image files
      if (imageIds.length > 0) {
        await fetchImagesByIds(imageIds);
      }
    }
  };


  const fetchImagesFromFolder = async (folderId: string) => {
    setLoading(true);
    try {
      const res = await fetch(
        `https://www.googleapis.com/drive/v3/files?q='${folderId}'+in+parents+and+mimeType contains 'image/'&fields=files(id,name,thumbnailLink,webViewLink)`,
        {
          headers: {
            Authorization: `Bearer ${session?.accessToken}`,
          },
        }
      );

      const data = await res.json();
      console.log("Fetched Images from Folder:", data.files);
      setPhotos((prevPhotos) => [...prevPhotos, ...(data.files || [])]);

      console.log(data.files)
    } catch (error) {
      console.error("Error fetching images from Google Drive folder:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchImagesByIds = async (imageIds: string[]) => {
    setLoading(true);
    try {
      const res = await fetch(
        `https://www.googleapis.com/drive/v3/files?ids=${imageIds.join(",")}&fields=files(id,name,thumbnailLink,webViewLink)`,
        {
          headers: {
            Authorization: `Bearer ${session?.accessToken}`,
          },
        }
      );

      const data = await res.json();
      console.log("Fetched Directly Selected Images:", data.files);
      setPhotos((prevPhotos) => [...prevPhotos, ...(data.files || [])]);
    } catch (error) {
      console.error("Error fetching directly selected images:", error);
    } finally {
      setLoading(false);
    }
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
            <Button onClick={loadPicker}>Load Images</Button>
          </Paper>
        </Grid.Col>

        {/* Main Content */}
        <Grid.Col span={9}>
          <Grid gutter="lg" columns={12}>
          {photos.map((photo, index) => {
                // Parse the datetime field into a JavaScript Date object
                const parsedDate = new Date(photo.datetime);

                // Format the date as MM/DD/YYYY
                const formattedDate = `Date: ${parsedDate.getMonth() + 1}/${parsedDate.getDate()}/${parsedDate.getFullYear()}`;

                // Format the time as h:mm am/pm
                const hours = parsedDate.getHours();
                const minutes = parsedDate.getMinutes().toString().padStart(2, '0');
                const period = hours < 12 ? 'am' : 'pm';
                const formattedHours = hours % 12 || 12; // Convert 0 to 12 for 12-hour format
                const formattedTime = `Time: ${formattedHours}:${minutes} ${period}`;

                // Check if this is the last photo element
                const isLastElement = index === photos.length - 1;

                return (
                    <>
                    <Grid.Col
                        key={`${photo.id}-${index}`}
                        span={isLargeScreen ? 3 : isMediumScreen ? 4 : isSmallScreen ? 6 : 12}
                        // ref={isLastElement ? lastPhotoElementRef : null}
                    >
                        <Paper
                            withBorder
                            shadow="md"
                            radius="md"
                            style={{
                                height: '450px',
                                width: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '1rem',
                                gap: '0.5rem',
                            }}
                        >
                            {/* Image Section */}
                            <div
                                style={{
                                    width: '100%',
                                    height: '70%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                                onClick={() => handleImageClick(photo.id)} // Pass photo ID to fetch full-resolution image
                            >
                                    <img
                                        src={photo.thumbnailLink}
                                        alt={photo.name}
                                        
                                        // placeholder={<Text>Loading Image...</Text>}
                                        />
                            </div>
                            {/* Information and Delete Section */}
                            <div
                                style={{
                                    width: '100%',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    paddingTop: '0.5rem',
                                }}
                            >
                                {/* Left Side Information */}
                                <div style={{ textAlign: 'left' }}>
                                    <Text>Location: {photo.location}</Text>
                                    <Text size="sm">Upload {formattedDate}</Text>
                                    <Text color="dimmed" size="sm">{formattedTime}</Text>
                                    <Text size="sm">{`Resolution: ${photo.width || 'N/A'} x ${photo.height || 'N/A'}`}</Text>
                                    <Text size="sm">{`Uploader: ${photo.uploaderName || '[Uploader]'}`}</Text>
                                </div>

                                {/* Right Side Delete Button */}
                                <Button
                                    color="red"
                                    // onClick={() => handleDelete(photo.id)}
                                    size="sm"
                                >
                                    Delete
                                </Button>
                            </div>
                        </Paper>
                    </Grid.Col>
                    </>
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
          <Image
            src={`${selectedPhoto.thumbnailLink}&access_token=${session?.accessToken}`}
            alt={selectedPhoto.name}
            style={{ maxWidth: "100%" }}
          />
        )}
      </Modal>
    </>
  );
}
