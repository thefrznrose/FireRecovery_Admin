import { signIn } from "next-auth/react";
import { useEffect } from "react";

const GoogleSignInButton = () => {
  useEffect(() => {
    const handleCredentialResponse = (response: any) => {
      console.log("Encoded JWT ID token: ", response.credential);
      if (!response.credential) {
        console.error("Google Credential missing");
        return;
      }
      signIn("credentials", { credential: response.credential, redirect: false })
        .then((res) => console.log("Sign-in response:", res))
        .catch((err) => console.error("Sign-in error:", err));
    };
    

    // Initialize Google Identity Services
    if (window.google) {
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
