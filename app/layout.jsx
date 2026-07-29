import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { CartProvider } from '@/lib/cart-context';

export const metadata = {
  title: 'Next.js Assignment Web App - Node.js, MongoDB, Stripe, Tailwind',
  description: 'Full-stack web application built using Next.js App Router, Tailwind CSS, Node.js API Routes, MongoDB Mongoose Models, and Stripe Payment Integration in pure JS and JSX.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-100 min-h-screen flex flex-col antialiased selection:bg-indigo-500 selection:text-white">
        <CartProvider>
          <Navbar />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
