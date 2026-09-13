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
            <body className={`${inter.className} min-h-screen bg-surface-50 dark:bg-surface-950 antialiased`}>
                {children}
                <Toaster
                    position="top-right"
                    toastOptions={{
                        duration: 4000,
                        style: {
                            background: '#1e293b',
                            color: '#f1f5f9',
                            border: '1px solid #334155',
                            borderRadius: '0.75rem',
                            fontSize: '0.875rem',
                        },
                    }}
                />
            </body>
        </html>
    );
}
