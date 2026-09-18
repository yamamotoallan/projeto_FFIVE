/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}",
        "./pages/**/*.{js,ts,jsx,tsx}",
        "./*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            fontFamily: {
                sans: ['Manrope', 'sans-serif'],
            },
            colors: {
                primary: {
                    DEFAULT: '#ec7f13',
                    hover: '#d6710f',
                    light: '#fff2e5',
                },
                gold: {
                    DEFAULT: '#d4af37',
                    light: '#e5c158',
                    dark: '#b8941f',
                },
                background: {
                    light: '#f8f7f6',
                    dark: '#0a0a0a',
                },
                surface: {
                    light: '#ffffff',
                    dark: '#1a1a1a',
                },
                text: {
                    main: '#1b140d',
                    muted: '#9a734c',
                    'dark-main': '#f5f5f5',
                    'dark-muted': '#d4af37',
                },
                border: {
                    light: '#e7dbcf',
                    dark: '#2a2a2a',
                }
            }
        },
    },
    plugins: [],
}
