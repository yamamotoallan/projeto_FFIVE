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
            },
            keyframes: {
                'bounce-subtle': {
                    '0%, 100%': { transform: 'translateY(-5%)' },
                    '50%': { transform: 'translateY(0)' },
                },
                'fade-in': {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                'slide-in-right': {
                    '0%': { transform: 'translateX(100%)' },
                    '100%': { transform: 'translateX(0)' },
                },
                'slide-in-bottom': {
                    '0%': { transform: 'translateY(10px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                }
            },
            animation: {
                'bounce-subtle': 'bounce-subtle 2s infinite ease-in-out',
                'fade-in': 'fade-in 0.3s ease-out',
                'slide-in-right': 'slide-in-right 0.3s ease-out',
                'slide-in-bottom': 'slide-in-bottom 0.3s ease-out',
            }
        },
    },
    plugins: [],
}
