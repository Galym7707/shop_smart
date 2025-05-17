// frontend/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header"; // Убедись, что путь к Header правильный
import Footer from "@/components/Footer"; // Убедись, что путь к Footer правильный
import { AuthProvider } from "@/context/AuthContext"; // Путь к AuthContext
import { ThemeProvider } from "@/context/ThemeContext"; // Путь к ThemeContext

const inter = Inter({ subsets: ["latin"] });

// Этот экспорт metadata должен быть в серверном компоненте.
// RootLayout по умолчанию является серверным, если не указано "use client"
// и если он не импортирует напрямую клиентские хуки.
export const metadata: Metadata = {
  title: "ShopSmart",
  description: "Smart shopping lists with AI suggestions",
  // Убедись, что favicon.ico находится в папке frontend/public/
  icons: { icon: '/favicon.ico' }, 
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // В этом компоненте RootLayout НЕ ДОЛЖНО БЫТЬ useState, useEffect или "use client" наверху файла.
  // Вся логика состояния для темы и аутентификации находится в соответствующих контекст-провайдерах.
  return (
    <html lang="en" suppressHydrationWarning> {/* suppressHydrationWarning может быть полезен при использовании тем */}
      <body 
        className={`${inter.className} flex flex-col min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100 transition-colors duration-300`}
      >
        {/* AuthProvider и ThemeProvider являются клиентскими компонентами (имеют "use client" внутри себя), 
            но их использование здесь не делает RootLayout клиентским. */}
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
