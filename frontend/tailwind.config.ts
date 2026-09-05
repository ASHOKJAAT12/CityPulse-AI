import type { Config } from 'tailwindcss';

const config: Config = {
    darkMode: 'class',
    content: [
        './pages/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        './app/**/*.{js,ts,jsx,tsx,mdx}',
        './features/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            // ── SmartCity 360 Color Palette ──────────────────────────
            colors: {
                // Primary — deep government blue
                primary: {
                    50: '#eff6ff',
                    100: '#dbeafe',
                    200: '#bfdbfe',
                    300: '#93c5fd',
                    400: '#60a5fa',
                    500: '#3b82f6',
                    600: '#1d6bbd',
                    700: '#1e4a8a',
                    800: '#1e3a6a',
                    900: '#1a2f55',
                    950: '#0f1e38',
                },
                // Accent — smart city teal
                accent: {
                    50: '#f0fdfa',
                    100: '#ccfbf1',
                    200: '#99f6e4',
                    300: '#5eead4',
                    400: '#2dd4bf',
                    500: '#14b8a6',
                    600: '#0d9488',
                    700: '#0f766e',
                    800: '#115e59',
                    900: '#134e4a',
                },
                // Surface (dark UI base)
                surface: {
                    50: '#f8fafc',
                    100: '#f1f5f9',
                    200: '#e2e8f0',
                    700: '#334155',
                    800: '#1e293b',
                    850: '#172032',
                    900: '#0f172a',
                    950: '#080f1f',
                },
                // Status colors
                success: { 400: '#4ade80', 500: '#22c55e', 600: '#16a34a' },
                warning: { 400: '#facc15', 500: '#eab308', 600: '#ca8a04' },
                danger: { 400: '#f87171', 500: '#ef4444', 600: '#dc2626' },
                info: { 400: '#38bdf8', 500: '#0ea5e9', 600: '#0284c7' },
            },
            // ── Typography ────────────────────────────────────────────
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
            },
            fontSize: {
                '2xs': '0.625rem',
            },
            // ── Animation ─────────────────────────────────────────────
            keyframes: {
                'fade-in': {
                    '0%': { opacity: '0', transform: 'translateY(4px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                'slide-in-right': {
                    '0%': { transform: 'translateX(100%)' },
                    '100%': { transform: 'translateX(0)' },
                },
                pulse: {
                    '0%, 100%': { opacity: '1' },
                    '50%': { opacity: '0.5' },
                },
            },
            animation: {
                'fade-in': 'fade-in 0.15s ease-out',
                'slide-in-right': 'slide-in-right 0.2s ease-out',
            },
            // ── Spacing & Sizing ──────────────────────────────────────
            spacing: {
                '18': '4.5rem',
                '72': '18rem',
                '84': '21rem',
                '96': '24rem',
            },
            // ── Border radius ─────────────────────────────────────────
            borderRadius: {
                'xl': '0.75rem',
                '2xl': '1rem',
                '3xl': '1.5rem',
            },
            // ── Box shadow ────────────────────────────────────────────
            boxShadow: {
                'card': '0 1px 3px 0 rgb(0 0 0 / 0.3), 0 1px 2px -1px rgb(0 0 0 / 0.3)',
                'card-hover': '0 4px 6px -1px rgb(0 0 0 / 0.4), 0 2px 4px -2px rgb(0 0 0 / 0.4)',
                'sidebar': '2px 0 8px 0 rgb(0 0 0 / 0.3)',
            },
            // ── Breakpoints ───────────────────────────────────────────
            screens: {
                'xs': '480px',   // Extra small (large phones)
                'sm': '640px',   // Default Tailwind
                'md': '768px',   // Default Tailwind
                'lg': '1024px',  // Default Tailwind
                'xl': '1280px',  // Default Tailwind
                '2xl': '1536px', // Default Tailwind
                '3xl': '1920px', // Large displays (command center)
            },
        },
    },
    plugins: [],
};

export default config;
