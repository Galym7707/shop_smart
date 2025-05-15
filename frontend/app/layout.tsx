import './globals.css';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { useState, useEffect } from 'react';

export const metadata = {
  title: 'ShopSmart - Collaborative Shopping Lists',
  description: 'Create and share shopping lists in real-time',
  icons: { icon: '/favicon.ico' },
};

export default function RootLayout({ children }) {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme') || 'light';
    setTheme(storedTheme);
    document.body.className = storedTheme;
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.body.className = newTheme;
  };

  return (
    <html lang="en">
      <body className={theme}>
        <Header toggleTheme={toggleTheme} theme={theme} />
        {children}
        <Footer />
      </body>
    </html>
  );
}