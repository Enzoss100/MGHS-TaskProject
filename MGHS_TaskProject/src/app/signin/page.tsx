'use client';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import Image from 'next/image';
import logo from "./../assets/logo.jpg";
import styles from './signin.module.css';
import { fetchUserDetails } from '../services/UserService';
import { UserDetails } from '@/types/user-details';

export default function Signin() {
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleSignIn = async () => {
    try {
      const login = await signIn('credentials', { email, password, redirect: false, method: 'POST'});

      if (login?.ok) {
        // Fetch user details after successful sign-in
        const userDetails: UserDetails[] = await fetchUserDetails(email);
        
        if (userDetails.length > 0) {
          const user = userDetails[0] as UserDetails;

          // Redirect based on admin status
          if (user.admin) {
            router.push('/admin/home'); 
          } else {
            if(!user.onboarded){
              router.push('/intern/processing');
            }
            else{
            router.push('/intern/onboarding');
            }
          }
        } else {
          toast.error('User not found');
        }
      } else {
        toast.error('Invalid email or password');
      }

    } catch (error:any) {
      console.error('Sign in error:', error.message);
    }
  };

  //SignIn uses next-auth from react, but authentication is firebase
   return (
    <div className={styles.container}>
      <div className={styles.left}>
      <div className={styles.logoContainer}>
      <Image src={logo.src} alt="Company Logo" width={250} height={250} className={styles.logo} /><br/>
      <div className={styles.logoLabelContainer}>
        <p className={styles.logoLabel}>MGHS Solution Advertising Services</p>
      </div>
      </div>
      </div>
      <div className={styles.right}>
        <h2 className={styles.loginh2}>Login</h2>
        <form onSubmit={(e) => { e.preventDefault(); handleSignIn(); }} method="POST">
          <label htmlFor="username" className={styles.label}>Username</label>
          <input
            type="text"
            id="username"
            name="username"
            className={styles.input}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          
          <label htmlFor="password" className={styles.label}>Password</label>
          <input
            type="password"
            id="password"
            name="password"
            className={styles.input}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <a href="/forgot-password" className={styles.forgotPassword}>Forgot Password?</a>

          <div className={styles.buttons}>
            <button type="submit" className={`${styles.button} ${styles.buttonSubmit}`}>Login</button>
            <button type="button" onClick={() => router.push('signup')} className={`${styles.button} ${styles.buttonRegister}`}>Register</button>
          </div>
        </form>
      </div>
    </div>
  );
}