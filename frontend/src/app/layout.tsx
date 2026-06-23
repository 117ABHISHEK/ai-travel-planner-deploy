import type { Metadata } from 'next';
import { Merriweather, Plus_Jakarta_Sans } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/context/AuthContext';
import './globals.css';

const merriweather = Merriweather({
  subsets: ['latin'],
  weight: ['300', '400', '700', '900'],
  variable: '--font-serif',
  display: 'swap',
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'AI Travel Planner — Smart Itineraries Powered by AI',
  description:
    'Plan your perfect trip with AI-generated itineraries, hotel recommendations, budget estimates, and a personalized packing list. Powered by Google Gemini.',
  keywords: 'travel planner, AI itinerary, trip planning, travel assistant, gemini AI',
  openGraph: {
    title: 'AI Travel Planner',
    description: 'Generate complete travel itineraries with AI in seconds.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${merriweather.variable} ${plusJakartaSans.variable}`}>
      <body className="bg-surface text-journal-dark antialiased min-h-screen">
        <AuthProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#FFFDF9',
                color: '#2D312E',
                border: '1px solid #DECFC0',
                borderRadius: '12px',
                fontFamily: 'var(--font-sans), sans-serif',
                boxShadow: '0 4px 16px rgba(45,49,46,0.08)',
              },
              success: {
                iconTheme: { primary: '#C85C38', secondary: '#FFFDF9' },
              },
              error: {
                iconTheme: { primary: '#ef4444', secondary: '#FFFDF9' },
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
