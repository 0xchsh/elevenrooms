import type { Metadata } from 'next'
import '@fontsource/jetbrains-mono'
import { Agentation } from 'agentation'
import './globals.css'

export const metadata: Metadata = {
  title: 'Eleven Rooms',
  description: 'Ambient soundscapes',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        {process.env.NODE_ENV === 'development' && <Agentation />}
      </body>
    </html>
  )
}
