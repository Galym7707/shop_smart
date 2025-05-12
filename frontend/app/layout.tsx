import './globals.css';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

export const metadata = {
  title: 'ShopSmart - Collaborative Shopping Lists',
  description: 'Create and share shopping lists in real-time',
  icons: { icon: '/favicon.ico' },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 antialiased">
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}