// ImageItem.js
import { Checkbox, Button, Paper, Text, Loader, Grid } from "@mantine/core";
import { IconEye, IconFlag, IconTrash } from "@tabler/icons-react";
import LazyLoad from "react-lazyload";
import Image from "next/image";
import { useDataContext } from "@/public/static/DataContext/DataContext";

interface PhotoItemProps {
  photo: any;
  onCheckboxChange: (photo: any) => void;
  onDelete: (photo: any, index: number) => void;
  isSelected: boolean;
  index: number;
}

const PhotoItem: React.FC<PhotoItemProps> = ({ photo, onCheckboxChange, onDelete, isSelected, index }) => {

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

  const extractFileId = (url: string) => {
    const match = url.match(/id=([a-zA-Z0-9-_]+)/);
    return match ? match[1] : null;
  };

  const {
    isLargeScreen,
    isMediumScreen,
    isSmallScreen,
    setLoading,
    setPhotos, 
    session,
    spreadsheetId,
    // isProcessingModalOpen,
  } = useDataContext(); // Import state and handlers from DataContext

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
        {index !== -1 && (
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
              {index + 1}
            </div>
          )}
        <div style={{ position: "relative", width: "100%", height: "14rem" }}>
        <LazyLoad height={200} offset={100} once>
        <Image
          src={photo.thumbnailLink}
          alt={photo.fileLink}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
          style={{
            objectFit: "contain",
          }}
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = photo.thumbnailLink; // Fallback image
          }}
        />
        </LazyLoad>
        </div>
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
            // onClick={() => deletePhoto(photo, index)}
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
            checked={index !== -1}
            onChange={() => onCheckboxChange(photo)}
            style={{ marginTop: "1rem" }}
          />
        </div>
      </Paper>
    </Grid.Col>
  );
}

export default PhotoItem;