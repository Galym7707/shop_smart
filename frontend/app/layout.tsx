// frontend/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css"; // Этот путь уже относительный и должен работать

// Используем относительные пути
// Файл layout.tsx находится в frontend/app/
// Папки components и context находятся в frontend/
// Значит, чтобы из frontend/app/ добраться до frontend/components/,
// нужно подняться на один уровень вверх ('../') и затем зайти в 'components'.
import Header from '../components/Header'; 
import Footer from '../components/Footer';
import { AuthProvider } from '../context/AuthContext';
import { ThemeProvider } from '../context/ThemeContext';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ShopSmart",
  description: "Smart shopping lists with AI suggestions",
  icons: { icon: '/favicon.ico' }, 
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body 
        className={`${inter.className} flex flex-col min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100 transition-colors duration-300`}
      >
        <AuthProvider>
          <ThemeProvider>
            <Header />
            <main className="flex-grow container mx-auto p-4">
              {children}
            </main>
            <Footer />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
