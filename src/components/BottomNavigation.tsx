
import React from 'react';
import { Home, Car, Fuel, User, Settings } from 'lucide-react';

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'dashboard', label: 'Início', icon: Home },
    { id: 'trips', label: 'Corridas', icon: Car },
    { id: 'refuel', label: 'Combustível', icon: Fuel },
    { id: 'account', label: 'Conta', icon: User },
    { id: 'settings', label: 'Config', icon: Settings },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
      <div className="grid grid-cols-5 h-16">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center gap-1 transition-all duration-200 ${
                isActive
                  ? 'text-yellow-600 bg-yellow-50 border-t-2 border-yellow-600'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              <Icon size={18} className={isActive ? 'scale-110' : ''} />
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNavigation;
