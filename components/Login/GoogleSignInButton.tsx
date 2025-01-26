import { signIn, signOut, useSession } from "next-auth/react";
import { useEffect } from "react";
import { Button, Flex, Text } from "@mantine/core";

const GoogleSignInButton = () => {
  const { data: session } = useSession();

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
          client_id: process.env.GOOGLE_CLIENT_ID!,
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

  if (session) {
    // Display logged-in user details
    return (
      <Flex direction="column" align="start">
        <Text size="sm">
          Logged in as:
        </Text>
        <Text size="sm">{session.user?.name || "Unknown User"}</Text>
        <Text size="xs" color="dimmed">
          {session.user?.email || "No email provided"}
        </Text>
        <Button size="xs" mt="sm" color="red" onClick={() => signOut()}>
          Sign Out
        </Button>
      </Flex>
    );
  }

  // Render Google Sign-In button if not logged in
  return <div id="googleSignInDiv"></div>;
};

export default GoogleSignInButton;
