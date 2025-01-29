import { useDataContext } from "@/public/static/DataContext/DataContext";
import { Loader, Modal, Text } from "@mantine/core";

// const {
    // isProcessingModalOpen,
    // setProcessingModalOpen,
    // processedImageCount,
    // selectedForTimelapse,
// } = useDataContext();

export default function TimelapseModal() {
    return(
        <>
        {/* <Modal
        opened={isProcessingModalOpen}
        onClose={() => setProcessingModalOpen(false)}
        centered
        withCloseButton={false} // Prevent closing during processing
        title="Generating Timelapse..."
      >
        <div style={{ textAlign: "center", padding: "1rem" }}>
          <Text size="lg" >
            Processing Images
          </Text>
          <Text size="md" mt="sm">
            {processedImageCount} of {selectedForTimelapse.length} images processed
          </Text>
          <Loader size="lg" mt="md" />
        </div>
      </Modal> */}
        </>
    );
}