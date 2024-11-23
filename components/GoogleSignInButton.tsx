import { useEffect } from "react";

const GoogleSignInButton = () => {
  useEffect(() => {
    const handleCredentialResponse = (response: any) => {
      console.log("Encoded JWT ID token: ", response.credential);

      // Send the token to your backend for verification
      fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: response.credential }),
      })
        .then((res) => res.json())
        .then((data) => console.log("User authenticated:", data))
        .catch((error) => console.error("Authentication error:", error));
    };

    // Expose the callback globally
    (window as any).handleCredentialResponse = handleCredentialResponse;

    // Initialize the Google Sign-In button
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
