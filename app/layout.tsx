import type { Metadata } from 'next'
import { Agentation } from 'agentation'
import './globals.css'

export const metadata: Metadata = {
  title: 'ElevenRooms',
  description: 'An ambient soundscape experience powered by ElevenLabs. Choose a room, toggle the layers of sound, and let the atmosphere carry you.',
  icons: { icon: '/favicon.svg' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300..700&display=swap" rel="stylesheet" />
      </head>
      <body>
        {children}
        {process.env.NODE_ENV === 'development' && <Agentation />}
      </body>
    </html>
  )
}
