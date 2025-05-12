export function Footer() {
    return (
      <footer className="bg-gray-800 text-white py-12">
        <div className="container text-center">
          <p className="text-lg mb-4">© 2025 ShopSmart. All rights reserved.</p>
          <p className="text-sm">
            Contact:{' '}
            <a href="mailto:info@shopsmart.com" className="underline hover:text-secondary">
              info@shopsmart.com
            </a>
          </p>
        </div>
      </footer>
    );
  }