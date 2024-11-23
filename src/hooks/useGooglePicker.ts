import { useEffect, useState } from "react";

const useGooglePicker = () => {
  const [isPickerLoaded, setPickerLoaded] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && !window.google) {
      const script = document.createElement("script");
      script.src = "https://apis.google.com/js/api.js";
      script.async = true;
      script.defer = true;
      script.onload = () => {
        console.log("Google Picker API loaded");
        setPickerLoaded(true);
      };
      script.onerror = () => {
        console.error("Failed to load Google Picker API");
      };
      document.body.appendChild(script);
    } else if (window.google) {
      setPickerLoaded(true);
    }
  }, []);

  return isPickerLoaded;
};

export default useGooglePicker;
