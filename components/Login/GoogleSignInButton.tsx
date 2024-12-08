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
    const initializeGoogleSignIn = () => {
      if (window.google?.accounts?.id) {
        window.google.accounts.id.initialize({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
          callback: handleCredentialResponse,
        });
        window.google.accounts.id.renderButton(
          document.getElementById("googleSignInDiv"),
          { theme: "outline", size: "large" }
        );
      } else {
        console.log("Retrying Google Sign-In script initialization...");
        setTimeout(initializeGoogleSignIn, 500); // Retry after 500ms
      }
    };

    initializeGoogleSignIn(); // Start the initialization process
  }, []);

  return <div id="googleSignInDiv"></div>;
};

export default GoogleSignInButton;
