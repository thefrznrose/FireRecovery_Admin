import { useEffect, useState } from "react";
import { Grid, Image, Loader, Text, Button } from "@mantine/core";
import { useSession } from "next-auth/react";

export default function PhotoGrid() {
  const { data: session } = useSession();
  const [photos, setPhotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [gapiLoaded, setGapiLoaded] = useState(false);

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

  const loadPicker = () => {
    if (!gapiLoaded || !session?.accessToken) {
      console.error("Google Picker API or Access Token not available");
      return;
    }

    window.gapi.load("picker", { callback: createPicker });
  };

  const createPicker = () => {
    const picker = new window.google.picker.PickerBuilder()
      .addView(new window.google.picker.DocsView().setIncludeFolders(true)) // Allow folder selection
      .setOAuthToken(session?.accessToken) // Pass the OAuth access token
      .setDeveloperKey(process.env.NEXT_PUBLIC_GOOGLE_API_KEY!) // Google API Key
      .setCallback(handlePickerResponse) // Callback after selecting a folder
      .build();
    picker.setVisible(true);
  };

  const handlePickerResponse = async (response: any) => {
    if (response.action === "picked") {
      const folderId = response.docs[0].id; // Get the folder ID
      console.log("Selected Folder ID:", folderId);
      await fetchImagesFromFolder(folderId); // Fetch images from the folder
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
      console.log("Fetched Images:", data.files);
      setPhotos(data.files || []);
    } catch (error) {
      console.error("Error fetching images from Google Drive:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Button onClick={loadPicker}>Select Google Drive Directory</Button>
      {loading && <Loader size="lg" />}
      <Grid gutter="lg" columns={12}>
        {photos.map((photo) => (
          <Grid.Col span={3} key={photo.id}>
            <Image src={photo.thumbnailLink} alt={photo.name} />
            <Text>{photo.name}</Text>
          </Grid.Col>
        ))}
      </Grid>
    </div>
  );
}
