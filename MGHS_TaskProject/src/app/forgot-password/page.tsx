'use client';
import { useState } from 'react';
import { auth } from '../firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { FaArrowLeft } from 'react-icons/fa';  // Import the React icon
import styles from './forgotpass.module.css';
import { fetchUserByEmail } from '../services/AllUsersService';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const router = useRouter();

  const resetEmail = async () => {
    try {
      // Check if the email exists in Firebase
      const user = await fetchUserByEmail(email);
      if (!user) {
        toast.error('Email does not exist');
        return;
      }

      // Send password reset email
      await sendPasswordResetEmail(auth, email);
      toast.success('Password Reset Sent To Your Email');
    } catch (error) {
      toast.error('Failed to send password reset email');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <a href="/signin">
          <FaArrowLeft
            className={styles.backArrow}
            size={30}
          />
        </a>
        <h1 className={styles.headerTitle}>RESET PASSWORD ACCOUNT</h1>
      </div>
      <div className={styles.content}>
        <div className={styles.resetBox}>
          <label htmlFor="mghs-email" className={styles.forgotLabel}>MGHS Email:</label>
          <input
            type="email"
            id="mghs-email"
            name="mghs-email"
            required
            placeholder="Place your MGHS Email"
            className={styles.forgotInput}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button
            type="button"
            className={styles.sendEmailBtn}
            onClick={() => resetEmail()}
            disabled={!email}
          >
            Send Email
          </button>
        </div>
      </div>
    </div>
  );
}
