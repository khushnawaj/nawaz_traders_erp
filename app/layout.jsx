import './globals.css';
import { Toaster } from 'react-hot-toast';
import Navbar from '@/components/layout/Navbar';
import { ThemeProvider } from '@/components/theme/ThemeProvider';

export const metadata = {
  title: 'Nawaz Traders — GRAINS TODAY • A STRONGER TOMORROW',
  description: 'Grain Procurement, Agricultural Trading, Stock, Party Ledgers & Fleet Management ERP',
  icons: {
    icon: '/images/nawaz-traders-icon.png',
    shortcut: '/images/nawaz-traders-icon.png',
    apple: '/images/nawaz-traders-icon.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full scroll-smooth" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/images/nawaz-traders-icon.png" />
        <link rel="apple-touch-icon" href="/images/nawaz-traders-icon.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="h-full antialiased bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-300">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3500,
              style: {
                background: '#022c22',
                color: '#f0fdf4',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                fontSize: '13px',
                fontWeight: '600',
                borderRadius: '16px',
                padding: '12px 18px',
                boxShadow: '0 20px 30px -10px rgba(0, 0, 0, 0.5)',
              },
              success: {
                iconTheme: {
                  primary: '#f59e0b',
                  secondary: '#022c22',
                },
              },
            }}
          />
          <Navbar />
          <div className="flex-1 bg-slate-50 dark:bg-gradient-to-b dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 transition-colors duration-300">
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
