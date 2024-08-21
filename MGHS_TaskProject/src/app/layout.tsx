'use client';

import {Toaster} from 'sonner';
import SessionProvider from './SessionProvider';
import GoogleCaptchaWrapper from './GoogleCaptchaWrapper';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full bg-gray-900">
      <body className="h-full">
      <SessionProvider>
        <GoogleCaptchaWrapper>
          {children}
          <Toaster richColors position = "top-center"/>
        </GoogleCaptchaWrapper>
      </SessionProvider>
      </body>
    </html>
  )
}