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

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link
                    href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap"
                    rel="stylesheet"
                />
            </head>
            <body className="min-h-screen bg-surface-50 dark:bg-surface-950 antialiased">
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
