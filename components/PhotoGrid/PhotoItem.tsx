// PhotoItem.tsx
// This component renders an individual photo card within the PhotoGrid
// It displays photo metadata, thumbnail, and action buttons for various operations

import { Checkbox, Button, Paper, Text, Grid } from "@mantine/core";
import {
  IconEye,    // View icon
  IconFlag,   // Flag icon
  IconHeart,  // Favorite icon
  IconTrash   // Delete icon
} from "@tabler/icons-react";
import LazyLoad from "react-lazyload";
import Image from "next/image";
import { useDataContext } from "@/public/static/DataContext/DataContext";

/**
 * Props interface for the PhotoItem component
 */
interface PhotoItemProps {
  photo: any;                              // Photo object containing metadata and links
  onCheckboxChange: (photo: any) => void;  // Handler for toggling timelapse selection
  onDelete: (photo: any, index: number) => void;    // Handler for photo deletion
  onFlag: (photo: any, index: number) => void;      // Handler for flagging/unflagging
  onFavorite: (photo: any, index: number) => void;  // Handler for favoriting/unfavoriting
  isSelected: boolean;                     // Whether photo is selected for timelapse
  isFlagged: boolean;                      // Whether photo is flagged
  isFavorite: boolean;                     // Whether photo is favorited
  index: number;                           // Photo index in the list
}

/**
 * PhotoItem Component
 * 
 * Renders a single photo card with metadata and action buttons
 * Provides UI for viewing, flagging, favoriting, deleting photos and selecting for timelapse
 */
const PhotoItem: React.FC<PhotoItemProps> = ({
  photo,
  onCheckboxChange,
  onDelete,
  onFlag,
  onFavorite,
  isSelected,
  isFlagged,
  isFavorite,
  index,
}) => {

  // ===== CONTEXT STATE =====
  // Extract required context values for this component
  const {
    isLargeScreen,    // Responsive layout breakpoints
    isMediumScreen, 
    isSmallScreen,
    setLoading,       // Loading state management
    setPhotos,        // Photos state management
    session,          // Auth session with access token
    spreadsheetId,    // Selected Google Sheet ID
  } = useDataContext();

  // ===== UTILITY FUNCTIONS =====
  /**
   * Extracts Google Drive file ID from file link URL
   * 
   * @param {string} url - The Google Drive file URL
   * @return {string|null} - The extracted file ID or null if not found
   */
  const extractFileId = (url: string) => {
    // Extract file ID from URL using regex
    const match = url.match(/id=([a-zA-Z0-9-_]+)/);
    return match ? match[1] : null;
  };

  /**
   * Handles photo deletion process
   * Removes photo from both Google Drive and Google Sheets
   * 
   * @param {any} photo - The photo object to delete
   * @param {number} index - The index of the photo in the array
   */
  const deletePhoto = async (photo: any, index: number) => {
    // Validate prerequisites
    if (!spreadsheetId) {
      console.error("Spreadsheet ID is not defined. Please select a sheet first.");
      return;
    }
    
    // Extract file ID from photo link
    const fileId = extractFileId(photo.fileLink);
    
    // Confirm deletion with user
    const isConfirmed = window.confirm(
      "Are you sure you want to delete this photo? This action cannot be undone."
    );
    if (!isConfirmed) {
      return;
    }
    
    // Validate file ID
    if (!fileId) {
      console.error("File ID not found.");
      return;
    }
    
    // Start loading state
    setLoading(true);
    
    try {
      // Step 1: Delete file from Google Drive
      const driveResponse = await fetch(
        `https://www.googleapis.com/drive/v3/files/${fileId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${session?.accessToken}`,
          },
        }
      );
      
      // Handle Google Drive API errors
      if (!driveResponse.ok) {
        const error = await driveResponse.json();
        console.error("Google Drive API Error:", error);
        setLoading(false);
        return;
      }
      
      // Step 2: Clear row from Google Sheets
      // Spreadsheet rows are 1-indexed and include a header row, so add 2 to our index
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
      
      // Handle Google Sheets API errors
      if (!sheetResponse.ok) {
        const error = await sheetResponse.json();
        console.error("Google Sheets API Error:", error);
        setLoading(false);
        return;
      }
      
      // Step 3: Update UI by removing the photo from state
      setPhotos((prevPhotos) => prevPhotos.filter((_, i) => i !== index));
    } catch (error) {
      console.error("Error deleting photo:", error);
    } finally {
      // End loading state
      setLoading(false);
    }
  };

  // ===== RENDER COMPONENT =====
  return (
    <Grid.Col
      key={`${photo.name}-${index}`}
      // Responsive column width based on screen size
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
          position: "relative", // For absolute positioned elements
        }}
      >
        {/* Photo Sequence Number (Index + 1) */}
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
        
        {/* Photo Thumbnail Container */}
        <div
          style={{
            position: "relative",
            width: "100%",
            maxWidth: "85%",
            margin: "0 auto",
            aspectRatio: "4 / 3",
            height: "15rem",
            overflow: "hidden",
            borderRadius: "8px",
            boxShadow: "2px 4px 10px rgba(0, 0, 0, 0.15)",
            backgroundColor: "#f8f8f8", // Fallback background
          }}
        >
          {/* Lazy Loaded Image */}
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
                // Fallback if image fails to load
                (e.currentTarget as HTMLImageElement).src = photo.thumbnailLink;
              }}
            />
          </LazyLoad>
        </div>
        
        {/* Photo Metadata and Action Buttons */}
        <div>
          {/* Metadata Display */}
          <div style={{ marginTop: "1rem", marginLeft: "1rem" }}>
            {/* Map through metadata fields for consistent rendering */}
            {[
              { label: "Location", value: photo.location || "N/A" },
              { label: "Uploader", value: photo.uploaderName || "N/A" },
              { label: "Taken", value: `${photo.uploadDate || "N/A"} at ${photo.uploadTime || "N/A"}` },
              { label: "Uploaded", value: photo.timestamp || "N/A" },
            ].map((item, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "0.5rem",
                }}
              >
                {/* Field Label */}
                <Text
                  size="sm"
                  color="dimmed"
                  style={{
                    width: "80px",
                    flexShrink: 0,
                  }}
                >
                  {item.label}:
                </Text>
                
                {/* Field Value */}
                <Text
                  size="sm"
                  style={{
                    fontWeight: 500,
                    flex: 1,
                  }}
                >
                  {item.value}
                </Text>
              </div>
            ))}
          </div>
          
          {/* Action Buttons Grid */}
          <div style={{ marginTop: "1rem" }}>
            <Grid gutter="xs" justify="center">
              {/* View Button */}
              <Grid.Col span={6}>
                <Button
                  fullWidth
                  size="xs"
                  style={{ minWidth: "110px" }}
                  color="blue"
                  leftSection={<IconEye />}
                  onClick={() => window.open(photo.fileLink, "_blank", "noopener,noreferrer")}
                >
                  View
                </Button>
              </Grid.Col>

              {/* Favorite/Unfavorite Button */}
              <Grid.Col span={6}>
                <Button
                  fullWidth
                  size="xs"
                  style={{ minWidth: "110px" }}
                  color={isFavorite ? "pink" : "green"}
                  onClick={() => onFavorite(photo, index)}
                  leftSection={<IconHeart />}
                >
                  {isFavorite ? "Unfavorite" : "Favorite"}
                </Button>
              </Grid.Col>

              {/* Flag/Unflag Button */}
              <Grid.Col span={6}>
                <Button
                  fullWidth
                  size="xs"
                  style={{ minWidth: "110px" }}
                  color={isFlagged ? "orange" : "yellow"}
                  onClick={() => onFlag(photo, index)}
                  leftSection={<IconFlag />}
                >
                  {isFlagged ? "Unflag" : "Flag"}
                </Button>
              </Grid.Col>

              {/* Delete Button */}
              <Grid.Col span={6}>
                <Button
                  fullWidth
                  size="xs"
                  style={{ minWidth: "110px" }}
                  color="red"
                  onClick={() => onDelete(photo, index)}
                  leftSection={<IconTrash />}
                >
                  Delete
                </Button>
              </Grid.Col>
            </Grid>
            
            {/* Timelapse Selection Checkbox */}
            <Checkbox
              label="Include in Timelapse"
              checked={isSelected}
              onChange={() => onCheckboxChange(photo)}
              style={{ marginTop: "1rem", textAlign: "center" }}
            />
          </div>
        </div>
      </Paper>
    </Grid.Col>
  );
};

export default PhotoItem;