import React, { useState } from 'react';
import { Settings as SettingsIcon, Building, Clock, Users, Bell, Shield } from 'lucide-react';
import GeneralSettings from './sections/GeneralSettings';
import HoraireSettings from './sections/HoraireSettings';
import TeamSettings from './sections/TeamSettings';
import NotificationSettings from './sections/NotificationSettings';
import SecuritySettings from './sections/SecuritySettings';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('general');

  const tabs = [
    { id: 'general', label: 'Général', icon: Building },
    { id: 'horaires', label: 'Horaires', icon: Clock },
    { id: 'equipe', label: 'Équipe', icon: Users },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'securite', label: 'Sécurité', icon: Shield }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'general':
        return <GeneralSettings />;
      case 'horaires':
        return <HoraireSettings />;
      case 'equipe':
        return <TeamSettings />;
      case 'notifications':
        return <NotificationSettings />;
      case 'securite':
        return <SecuritySettings />;
      default:
        return null;
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-indigo-900 flex items-center">
          <SettingsIcon className="w-8 h-8 mr-3" />
          Paramètres
        </h1>
        <p className="text-gray-600">Configurez votre espace OptiPlan</p>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 pr-8">
          <nav className="space-y-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <tab.icon className={`w-5 h-5 mr-3 ${
                  activeTab === tab.id ? 'text-indigo-500' : 'text-gray-400'
                }`} />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 bg-white rounded-lg shadow-md">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Settings;