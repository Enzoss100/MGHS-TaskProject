'use client';

import './globals.css'
import {Toaster} from 'sonner';
import SessionProvider from './SessionProvider';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full bg-gray-900">
      <body className="h-full">
      <SessionProvider>
        {children}
        <Toaster richColors position = "top-center"/>
      </SessionProvider>
      </body>
    </html>
  )
}