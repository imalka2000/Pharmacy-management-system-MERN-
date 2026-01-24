/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: '#0f766e', // Teal 700
                secondary: '#f97316', // Orange 500
                dark: '#1e293b',
                light: '#f1f5f9'
            }
        },
    },
    plugins: [],
}
