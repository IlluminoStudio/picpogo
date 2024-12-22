import { Providers } from './providers'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'PicPogo!',
  description: 'Interactive staff photo board app',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}