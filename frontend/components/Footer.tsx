// frontend/components/Footer.tsx
// Этот компонент может быть серверным, если не использует хуки или специфичную для клиента логику.
// Если в будущем понадобится клиентская логика, добавь "use client";
import React from 'react';

export default function Footer() { // Изменено на export default
  const currentYear = new Date().getFullYear();
  return (
    <footer className="bg-gray-800 dark:bg-gray-900 text-white py-8 text-center">
      <div className="container mx-auto px-4">
        <p className="text-sm text-gray-400">
          &copy; {currentYear} ShopSmart. All rights reserved.
        </p>
        <div className="mt-2">
          <a href="mailto:info@shopsmart.com" className="text-gray-400 hover:text-blue-300 px-2 text-xs sm:text-sm transition-colors">
            info@shopsmart.com
          </a>
          {/* Можно добавить другие ссылки, если необходимо */}
        </div>
      </div>
    </footer>
  );
}
