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
            // ── CityPulse White Neumorphic Color Palette ────────────
            colors: {
                // Neumorphic neutral palette (primary design system)
                neu: {
                    bg:       '#F0F2F5',
                    surface:  '#FFFFFF',
                    surface2: '#F7F8FA',
                    text:     '#1A1D23',
                    muted:    '#7B8494',
                    light:    '#A8B0C0',
                    border:   '#DCE1EB',
                    accent:   '#4F6BED',
                    'accent-light': '#EEF1FD',
                },
                // Primary — government blue (used sparingly for primary actions)
                primary: {
                    50:  '#eff6ff',
                    100: '#dbeafe',
                    200: '#bfdbfe',
                    300: '#93c5fd',
                    400: '#60a5fa',
                    500: '#4F6BED',
                    600: '#4F6BED',
                    700: '#3d57d1',
                    800: '#2c41b5',
                    900: '#1e2e8c',
                    950: '#111d66',
                },
                // Accent — smart city teal/green
                accent: {
                    50:  '#f0fdf4',
                    100: '#dcfce7',
                    200: '#bbf7d0',
                    300: '#86efac',
                    400: '#4ade80',
                    500: '#22c55e',
                    600: '#16a34a',
                    700: '#15803d',
                    800: '#166534',
                    900: '#14532d',
                },
                // Surface (for legacy class compatibility)
                surface: {
                    50:  '#F7F8FA',
                    100: '#F0F2F5',
                    200: '#DCE1EB',
                    300: '#C8D0DF',
                    400: '#A8B0C0',
                    500: '#8A939E',
                    600: '#6B7280',
                    700: '#4B5563',
                    800: '#374151',
                    850: '#2D3748',
                    900: '#1F2937',
                    950: '#111827',
                },
                // Status colors — consistent with neumorphic design
                success: { 400: '#4ade80', 500: '#22c55e', 600: '#16a34a' },
                warning: { 400: '#fbbf24', 500: '#f59e0b', 600: '#d97706' },
                danger:  { 400: '#f87171', 500: '#ef4444', 600: '#dc2626' },
                info:    { 400: '#60a5fa', 500: '#3b82f6', 600: '#2563eb' },
            },
            // ── Typography ────────────────────────────────────────────
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
            },
            fontSize: {
                '2xs': '0.625rem',
            },
            // ── Neumorphic Box Shadows ─────────────────────────────────
            boxShadow: {
                // Core neumorphic
                'neu-raised': '6px 6px 14px rgba(163,177,198,0.55), -6px -6px 14px rgba(255,255,255,0.92)',
                'neu-subtle': '3px 3px 8px rgba(163,177,198,0.55), -3px -3px 8px rgba(255,255,255,0.92)',
                'neu-hover':  '8px 8px 18px rgba(163,177,198,0.55), -8px -8px 18px rgba(255,255,255,0.92)',
                'neu-inset':  'inset 4px 4px 10px rgba(163,177,198,0.5), inset -4px -4px 10px rgba(255,255,255,0.9)',
                'neu-inset-sm': 'inset 2px 2px 6px rgba(163,177,198,0.45), inset -2px -2px 6px rgba(255,255,255,0.9)',
                // Legacy compatibility
                'card':       '3px 3px 8px rgba(163,177,198,0.55), -3px -3px 8px rgba(255,255,255,0.92)',
                'card-hover': '6px 6px 14px rgba(163,177,198,0.55), -6px -6px 14px rgba(255,255,255,0.92)',
                'sidebar':    '2px 0 8px rgba(163,177,198,0.3)',
            },
            // ── Animation ─────────────────────────────────────────────
            keyframes: {
                'fade-in': {
                    '0%':   { opacity: '0', transform: 'translateY(6px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                'slide-in-right': {
                    '0%':   { transform: 'translateX(100%)' },
                    '100%': { transform: 'translateX(0)' },
                },
                'slide-toggle': {
                    '0%':   { transform: 'translateX(0)' },
                    '100%': { transform: 'translateX(100%)' },
                },
                pulse: {
                    '0%, 100%': { opacity: '1' },
                    '50%':      { opacity: '0.5' },
                },
            },
            animation: {
                'fade-in':        'fade-in 0.2s ease-out',
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
                'xl':  '0.75rem',
                '2xl': '1rem',
                '3xl': '1.5rem',
                '4xl': '2rem',
            },
            // ── Breakpoints ───────────────────────────────────────────
            screens: {
                'xs':  '480px',
                'sm':  '640px',
                'md':  '768px',
                'lg':  '1024px',
                'xl':  '1280px',
                '2xl': '1536px',
                '3xl': '1920px',
            },
        },
    },
    plugins: [],
};

export default config;
