import { signIn } from "next-auth/react";
import { useEffect } from "react";

const GoogleSignInButton = () => {
  const handleCredentialResponse = (response: any) => {
    if (response.credential) {
      console.log("Encoded JWT ID token:", response.credential);
      signIn("google", { redirect: true });
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

      const buttonDiv = document.getElementById("googleSignInDiv");
      if (buttonDiv) {
        window.google.accounts.id.renderButton(buttonDiv, {
          theme: "outline",
          size: "large",
        });
      } else {
        console.error("Google Sign-In button container not found.");
      }
    }
  }, []);

  return <div id="googleSignInDiv"></div>;
};

export default GoogleSignInButton;
