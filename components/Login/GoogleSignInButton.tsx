import { useEffect } from "react";

const GoogleSignInButton = () => {
  const handleCredentialResponse = (response: any) => {
    if (response.credential) {
      console.log("Encoded JWT ID token:", response.credential);
      // Optionally decode the token if needed
    } else {
      console.error("No credential received from Google");
    }
  };

  useEffect(() => {
    if (typeof window.google !== "undefined") {
      window.google.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
        callback: handleCredentialResponse,
      });

      window.google.accounts.id.renderButton(
        document.getElementById("googleSignInDiv"),
        { theme: "outline", size: "large" }
      );
    }
  }, []);

  return <div id="googleSignInDiv"></div>;
};

export default GoogleSignInButton;
