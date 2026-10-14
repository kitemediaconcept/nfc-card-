import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'NFC Card | Minimal Contactless Digital Business Card',
  description: 'Share your contact details with a single tap. Minimalist matte black contactless NFC card with instant cloud redirection.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.cdnfonts.com" />
        <link href="https://fonts.cdnfonts.com/css/sf-pro-display" rel="stylesheet" />
      </head>
      <body className="min-h-full flex flex-col font-sans" style={{ fontFamily: "SF Pro Display, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
