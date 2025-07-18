
import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center text-center px-4">
      <h1 className="text-9xl font-black text-sky-300">404</h1>
      <h2 className="mt-4 text-3xl font-bold text-slate-800 tracking-tight sm:text-4xl">Page Not Found</h2>
      <p className="mt-4 text-base text-slate-500">Sorry, we couldn’t find the page you’re looking for.</p>
      <div className="mt-10">
        <Link to="/" className="text-sm font-semibold text-sky-600 hover:text-sky-500">
          <span aria-hidden="true">&larr;</span> Back to home
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
