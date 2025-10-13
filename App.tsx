import React from 'react';
import useAuth from './hooks/useAuth';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import Spinner from './components/Spinner';

const App: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <Spinner />
      </div>
    );
  }

  return user ? <Dashboard /> : <Login />;
};

export default App;