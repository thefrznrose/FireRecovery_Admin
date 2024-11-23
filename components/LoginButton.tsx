import { signIn } from "next-auth/react";

const LoginButton = () => {
  const handleGoogleSignIn = () => {
    signIn("google", { callbackUrl: "/" }); // POST request with the Google provider
  };

  return (
    <button onClick={handleGoogleSignIn}>
      Sign in with Google
    </button>
  );
};

export default LoginButton;
