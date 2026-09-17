import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
    title: {
        default: 'CityPulse AI',
        template: '%s | CityPulse AI',
    },
    description: 'AI-powered Smart City Management Platform — Water, Electricity, Traffic, Garbage, and more.',
    keywords: ['smart city', 'city management', 'urban infrastructure', 'AI', 'IoT'],
    authors: [{ name: 'SmartCity 360 Team' }],
    robots: 'noindex, nofollow', // Private platform — no search indexing
};

import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
            </head>
            <body className={`${inter.className} min-h-screen antialiased`} style={{ backgroundColor: '#F0F2F5', color: '#1A1D23' }}>
                {children}
                <Toaster
                    position="top-right"
                    toastOptions={{
                        duration: 4000,
                        style: {
                            background: '#FFFFFF',
                            color: '#1A1D23',
                            border: '1px solid rgba(255,255,255,0.8)',
                            borderRadius: '1rem',
                            fontSize: '0.875rem',
                            boxShadow: '6px 6px 14px rgba(163,177,198,0.5), -6px -6px 14px rgba(255,255,255,0.9)',
                            fontFamily: 'Inter, system-ui, sans-serif',
                        },
                        success: {
                            iconTheme: { primary: '#22c55e', secondary: '#FFFFFF' },
                        },
                        error: {
                            iconTheme: { primary: '#ef4444', secondary: '#FFFFFF' },
                        },
                    }}
                />
            </body>
        </html>
    );
}
