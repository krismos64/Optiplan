import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';

const DashboardLayout = () => {
  const { user } = useAuth();

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1">
        <div className="bg-white shadow-sm">
          <div className="px-8 py-4">
            <p className="text-gray-600">
              Connecté en tant que <span className="font-semibold">{user?.displayName || 'Utilisateur'}</span>
            </p>
          </div>
        </div>
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;