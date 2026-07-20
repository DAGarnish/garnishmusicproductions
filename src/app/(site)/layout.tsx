import type { Metadata } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import '../globals.css';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

const spaceGrotesk = Space_Grotesk({
  variable: '--font-space-grotesk',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Garnish Music Production',
  description: 'Learn professional music production, DJing, and audio engineering.',
  icons: {
    icon: 'https://res.cloudinary.com/s7pus8t5/image/upload/garnish-uploads/sites/8/2022/12/Fav-white-bg.png',
    shortcut: 'https://res.cloudinary.com/s7pus8t5/image/upload/garnish-uploads/sites/8/2022/12/Fav-white-bg.png',
  },
};

export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${spaceGrotesk.variable} h-full antialiased`}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
