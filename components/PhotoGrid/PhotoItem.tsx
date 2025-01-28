import React from "react";
import { Paper, Text, Button, Checkbox, Grid } from "@mantine/core";
import Image from "next/image";
import LazyLoad from "react-lazyload";
import { IconEye, IconFlag, IconTrash } from "@tabler/icons-react";

interface PhotoItemProps {
  photo: any;
  index: number;
  selectedForTimelapse: any[];
  handleCheckboxChange: (photo: any) => void;
  deletePhoto: (photo: any, index: number) => void;
  isLargeScreen: boolean;
  isMediumScreen: boolean;
  isSmallScreen: boolean;
}

const PhotoItem: React.FC<PhotoItemProps> = ({
  photo,
  index,
  selectedForTimelapse,
  handleCheckboxChange,
  deletePhoto,
  isLargeScreen,
  isMediumScreen,
  isSmallScreen,
}) => {
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
          <LazyLoad height={200} offset={100} once>
            <Image
              src={photo.thumbnailLink}
              alt={photo.fileLink}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              priority // Added the priority prop
              style={{
                objectFit: "contain", // Maintains aspect ratio
              }}
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = photo.thumbnailLink; // Fallback image
              }}
            />
          </LazyLoad>
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
            checked={timelapseIndex !== -1}
            onChange={() => handleCheckboxChange(photo)}
            style={{ marginTop: "1rem" }}
          />
        </div>
      </Paper>
    </Grid.Col>
  );
};

export default PhotoItem;
