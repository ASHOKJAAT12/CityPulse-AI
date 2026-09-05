// CSS module type declarations
declare module '*.css' {
    const content: Record<string, string>;
    export default content;
}

// Leaflet CSS (imported dynamically for SSR safety)
declare module 'leaflet/dist/leaflet.css';
