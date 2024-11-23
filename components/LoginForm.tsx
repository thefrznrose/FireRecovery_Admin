import React, { useState } from 'react';
import { GoogleLogin } from 'react-google-login';
import styles from './LoginForm.module.css'; // Ensure to create this CSS module.
import GoogleSignInButton from './GoogleSignInButton';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement your login logic here
    console.log(email, password);
  };

  const handleGoogleSuccess = async (response: any) => {
    const token = response.tokenId;
  
    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
  
      if (!res.ok) throw new Error('Failed to authenticate');
  
      const data = await res.json();
      console.log('User authenticated:', data);
    } catch (error) {
      console.error('Authentication error:', error);
    }
  };
  

  const handleGoogleFailure = (error: any) => {
    // Handle Google login failure
    console.error(error);
  };

  return (
    <form onSubmit={handleLogin} className={styles.form}>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className={styles.input}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className={styles.input}
      />
      <button type="submit" className={styles.button}>Login</button>
      {/* <GoogleLogin
        clientId="709647754036-jtbk6910dvpnesjcsmiu2f7t5ag0k93b.apps.googleusercontent.com" // Replace with your Google client ID
        buttonText="Sign in with Google"
        onSuccess={handleGoogleSuccess}
        onFailure={handleGoogleFailure}
        cookiePolicy={'single_host_origin'}
      /> */}
      <GoogleSignInButton/>
    </form>
  );
};

export default LoginForm;
