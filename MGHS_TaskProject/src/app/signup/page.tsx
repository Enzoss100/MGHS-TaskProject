'use client';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { auth, db } from '../firebase';
import { collection, addDoc } from "firebase/firestore";
import { toast } from 'sonner';
import Image from 'next/image';
import logo from "./../assets/logo.jpg";
import styles from './signup.module.css';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordAgain, setPasswordAgain] = useState('');
  const [newUser, setUser] = useState({ firstname: '', lastname: '', personalemail: '', schoolemail: '' });

  const router = useRouter();

  // Add and Authenticate User to the Database
  const signup = async () => {

    // Error Handling
    if (password !== passwordAgain) {
      toast.error('Passwords do not match');
      return;
    }
    
    if (password.length < 6) {
      toast.error('Password should be at least 6 characters long');
      return;
    }

    if (!newUser.firstname || !newUser.lastname || !email || !newUser.personalemail || !newUser.schoolemail || !password || !passwordAgain) {
      toast.error('All fields are required');
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Add user details to Firestore
      await addDoc(collection(db, 'users'), {
        firstname: newUser.firstname.trim(),
        lastname: newUser.lastname.trim(),
        mghsemail: email.trim(),
        personalemail: newUser.personalemail.trim(),
        schoolemail: newUser.schoolemail.trim(),
        uid: user.uid, // adding UID for reference
        admin: false,
        onboarded: false,
      });

      toast.success('Account Successfully Created!');
      // Redirect to sign-in page
      router.push('signin');
    } catch (error: any) {
      console.error('Error creating user:', error.message);
      // Handle error
      toast.error('Error creating account:', error.message);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.left}>
        <Image src={logo.src} alt="Company Logo" width={500} height={500} className={styles.logo} />
      </div>
      <div className={styles.right}>
        <h2 className={styles.header}>Register</h2>
        <form onSubmit={(e) => { e.preventDefault(); signup(); }} className={styles.formsignup}>
          <label htmlFor="firstname" className={styles.label}>*First Name:</label>
          <input
            type="text"
            id="firstname"
            className={styles.input}
            value={newUser.firstname}
            onChange={(e) => setUser({ ...newUser, firstname: e.target.value })}
            required
          />

          <label htmlFor="lastname" className={styles.label}>*Last Name:</label>
          <input
            type="text"
            id="lastname"
            className={styles.input}
            value={newUser.lastname}
            onChange={(e) => setUser({ ...newUser, lastname: e.target.value })}
            required
          />

          <label htmlFor="email" className={styles.label}>*MGHS Email for Login:</label>
          <input
            type="email"
            id="email"
            className={styles.input}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label htmlFor="password" className={styles.label}>Password:</label>
          <input
            type="password"
            id="password"
            className={styles.input}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <label htmlFor="passwordAgain" className={styles.label}>Confirm Password:</label>
          <input
            type="password"
            id="passwordAgain"
            className={styles.input}
            value={passwordAgain}
            onChange={(e) => setPasswordAgain(e.target.value)}
            required
          />

          <div className={styles.recoveryEmailSection}>
            <label className={styles.recoveryEmailLabel}>Recovery Email:</label>
            <label htmlFor="personalemail" className={styles.label}>*Personal Email:</label>
            <input
              type="email"
              id="personalemail"
              className={styles.input}
              value={newUser.personalemail}
              onChange={(e) => setUser({ ...newUser, personalemail: e.target.value })}
              required
            />

            <label htmlFor="schoolemail" className={styles.label}>*School Email:</label>
            <input
              type="email"
              id="schoolemail"
              className={styles.input}
              value={newUser.schoolemail}
              onChange={(e) => setUser({ ...newUser, schoolemail: e.target.value })}
              required
            />
          </div>

          <button type="submit" className={styles.button}>Sign Up</button>
          <a href="signin" className={styles.backToLogin}>Back to Login</a>
        </form>
      </div>
    </div>
  );
}