'use client';

import styles from './onboarding.module.css';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { UserDetails } from '@/types/user-details';
import { fetchUserDetails } from '@/app/services/UserService';
import HamburgerMenu from '@/app/components/HamburgerMenu';
import InternProtectedRoute from '@/app/components/InternProtectedRoute';

export default function Onboarding() {
  const session = useSession({
    required: true,
    onUnauthenticated() {
      redirect('/signin');
    },
  });

  const [internName, setInternName] = useState('');

  useEffect(() => {
    const getInternName = async () => {
      const email = session.data?.user?.email;

      if (!email) {
        toast.error('Email is not available');
        return;
      }

      try {
        const userDetails: UserDetails[] = await fetchUserDetails(email);

        if (userDetails.length > 0) {
          const user = userDetails[0] as UserDetails;
          setInternName(user.firstname);
        } else {
          toast.error('User not found');
        }
      } catch (error) {
        toast.error('An error occurred while fetching user details');
        console.error(error);
      }
    };

    getInternName();
  }, [session]);

  return (
    <InternProtectedRoute>
    <div className={styles.container}>
      <HamburgerMenu internName={internName} />
      <main className={styles.content}>
        <div className={styles.intro}>
          <h2>To our Dear Onboarding Student-Interns</h2>
          <p>Greetings from MGHS!</p>
          <p>It is our great pleasure to be able to welcome you to MGHS as one of the new interns. As your excellent skills impressed us, we hope you will be excited to work with us on the most exciting projects.</p>
          <p>We are delighted to send you our <a href="https://drive.google.com/drive/folders/1xXwRjqGGse4ZKUmo60tNuRQVYrjqzr6y?usp=sharing" className={styles.welcomeKit}>MGHS Welcome Kit</a>. Please take the time to understand each message fully.</p>
          <p>Let us know if you have accessed the file. Kindly acknowledge.</p>
        </div>
        
        <div className={styles.reminders}>
          <h3>We have just a few reminders to take note:</h3>
          <ul>
            <li><a href="https://docs.google.com/spreadsheets/d/1USxRu_PoeUX-U_oOMd3MKQLpk3MXP4z_/edit?usp=sharing&ouid=113420244296512121808&rtpof=true&sd=true" className={styles.dtr}>The DTR</a> updated file can be accessed here.</li>
            <li><a href="https://docs.google.com/spreadsheets/d/1USxRu_PoeUX-U_oOMd3MKQLpk3MXP4z_/edit?usp=sharing&ouid=113420244296512121808&rtpof=true&sd=true" className={styles.worksheetDirectory}>Worksheet Directory</a> and study records - this is used to put all output links for easy navigation it serves as a map directory.</li>
            <li>In some aspects, creating new emails for work purposes in MGHS will not work. Kindly change the pass from the date you begin your internship, for example. March192024</li>
            <li>Remember that your supervisor should be informed of the request for signatures, as our signing, sealing, and validation will take time.</li>
            <li>Always remember to send an update every day on the number of hours rendered and hours left, together with your accomplishments within the day, and plan for the next day, this will be done through Telegram. This will be proof as well that you are present.</li>
            <li>Update your supervisor if you have 1 to 2 weeks left from your internship at MGHS so that all turnover files will be smoothly updated.</li>
          </ul>
          <p>Kindly note that all your school&apos;s signed documents must be in your <u>school requirements folder</u>. Once the school has signed all necessary documents, you must send your supervisor the link to the cloud folder.</p>
          <p>After receiving this welcome email, please inform your supervisor of your newly created MGHS working email as instructed.</p>
          <p>If you have questions or concerns, please email us at <span style={{ color: 'blue' }}>mghsconsultancyhr@gmail.com</span>, and we&apos;ll respond as soon as possible. Thank you, and God bless you.</p>
        </div>

        <div className={styles.closing}>
          <p><strong>We welcome you once again to our company virtually, and we hope your talent and skills will significantly contribute to our company&apos;s tremendous success.</strong></p>
          <p>We wish for a better future and a good experience.</p>
          <p>Thank you.</p>
          <p><em>N.B. If you receive this before your interview and other documents are required, please inform your supervisor immediately.</em></p>
          <p>Best regards,</p>
          <p><strong>(SGD) MS. JENNY DIMAANO<br />HR Coordinator for Virtual Internship Program</strong></p>
          <p><strong>DISCLAIMER AND CONFIDENTIALITY NOTICE<br />
            The information contained in this e-mail, including those in its attachments, is confidential and intended only for the person(s) or entity(ies) to which it is addressed. If you are not an intended recipient, you must not read, copy, store, disclose, distribute this message, or act in reliance upon the information contained in it. Any unauthorized dissemination, copying, or use or disclosure of information contained herein is STRICTLY PROHIBITED and ILLEGAL. If you receive this e-mail on error, please contact the sender and delete the material from any computer or system.</strong></p>
        </div>
      </main>
    </div>
    </InternProtectedRoute>
  );
}
