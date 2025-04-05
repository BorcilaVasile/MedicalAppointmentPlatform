import React from 'react';
import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <div
      style={{
        backgroundColor: 'var(--background-50)',
        color: 'var(--text-900)',
      }}
      className="min-h-screen flex flex-col justify-center items-center"
    >
      <h1 className="text-4xl sm:text-5xl font-bold mb-4">404 - Pagina Nu a Fost Găsită</h1>
      <p className="text-lg sm:text-xl mb-8">
        Ne pare rău, pagina pe care o cauți nu există.
      </p>
      <Link
        to="/"
        style={{
          backgroundColor: 'var(--primary-500)',
          color: 'var(--text-50)',
        }}
        className="inline-block py-3 px-6 rounded-md text-lg sm:text-xl transition-colors"
      >
        Înapoi la Acasă
      </Link>
    </div>
  );
}

export default NotFound;