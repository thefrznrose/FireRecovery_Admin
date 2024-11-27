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

  return (
    <form onSubmit={handleLogin} className={styles.form}>
      {/* <input
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
      <button type="submit" className={styles.button}>Login</button> */}
      <GoogleSignInButton/>
    </form>
  );
};

export default LoginForm;
