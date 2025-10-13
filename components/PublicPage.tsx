import React, { useState } from 'react';
import Login from './Login';
import ContactForm from './ContactForm';
import Gemini from './Gemini';

const PublicPage: React.FC = () => {
  const [showLogin, setShowLogin] = useState(false);

  if (showLogin) {
    return <Login />;
  }

  return (
    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen flex flex-col items-center justify-center py-12 px-4">
      <div className="w-full max-w-2xl space-y-12">
        <Gemini />
        <ContactForm />
      </div>
      <footer className="mt-12">
          <button
            onClick={() => setShowLogin(true)}
            className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white focus:outline-none focus:underline"
          >
            Admin Login
          </button>
      </footer>
    </div>
  );
};

export default PublicPage;