import { useSession } from "next-auth/react";
import useGooglePicker from "@/src/hooks/useGooglePicker";



const FolderPicker = ({ onFolderSelected }: { onFolderSelected: (folderId: string) => void }) => {
  const { data: session } = useSession();
  const isPickerLoaded = useGooglePicker();

  const handleOpenPicker = () => {
    if (!isPickerLoaded || !session?.accessToken) {
      console.error("Google Picker or Access Token not loaded");
      return;
    }

    // Load the Picker API
    window.gapi.load("picker", () => {
      const picker = new window.google.picker.PickerBuilder()
        .addView(new window.google.picker.DocsView().setIncludeFolders(true))
        .setOAuthToken(session.accessToken)
        .setDeveloperKey(process.env.NEXT_PUBLIC_GOOGLE_API_KEY!) // Add your API Key
        .setCallback((data: any) => {
          if (data.action === window.google.picker.Action.PICKED) {
            const folderId = data.docs[0].id;
            console.log("Selected Folder ID:", folderId);
            onFolderSelected(folderId);
          }
        })
        .build();
      picker.setVisible(true);
    });
  };

  return (
    <button onClick={handleOpenPicker}>Select Folder</button>
  );
};

export default FolderPicker;
