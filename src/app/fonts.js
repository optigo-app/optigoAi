import { Poppins } from 'next/font/google';

// Define Poppins font with all available weights and subsets
export const poppins = Poppins({
  weight: [
    '200', // ExtraLight
    '300', // Light
    '400', // Regular
    '500', // Medium
    '600', // SemiBold
    '700', // Bold
    '800', // ExtraBold
    '900', // Black
  ],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-poppins',
  fallback: [
    'system-ui',
    '-apple-system',
    'BlinkMacSystemFont',
    'Segoe UI',
    'Roboto',
    'Helvetica Neue',
    'sans-serif',
  ],
  preload: true,
});

// Export the font variable for easy access
export default poppins;