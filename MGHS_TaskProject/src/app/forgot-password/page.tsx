'use client';
import { useState } from 'react';
import { auth } from '../firebase';
import { sendPasswordResetEmail } from "firebase/auth";
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import logo from "./../assets/logo.jpg";

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const router = useRouter();

  const resetEmail = async () => {
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success("Password Reset Sent To Your Email");
    } catch (error) {
      toast.error("Failed to send password reset email");
    }
  };

  return (
    <div className="flex min-h-full flex-1 flex-col justify-center items-center px-6 py-12">
      <div className="bg-white shadow-md rounded-lg px-6 sm:px-20 py-6 max-w-md">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <img
            className="mx-auto h-40 w-50"
            src={logo.src}
            alt="SecuSpire logo"
          />
          <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-black">
            Forgot Password
          </h2>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <div className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium leading-6 text-black">
                Email address
              </label>
              <div className="mt-2">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="block w-full rounded-md border-black bg-gray/5 py-1.5 text-black shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <button
              onClick={() => resetEmail()}
              disabled={!email}
              className="disabled:opacity-40 flex w-full justify-center rounded-md bg-indigo-500 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
              aria-label="Send Reset Email"
            >
              Send Reset Email
            </button>
          </div>
        </div>

        <p className="mt-10 text-center text-sm text-black">
          Remember your password?{' '}
          <button onClick={() => router.push('/signin')} className="font-semibold leading-6 text-indigo-600 hover:text-indigo-800">
            Sign In
          </button>
        </p>
      </div>
    </div>
  );
}
