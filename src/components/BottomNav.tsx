import React from 'react';
import { MapPin, Calendar, Wallet, History, User, Headset } from 'lucide-react';

export type ActiveTab = 'map' | 'reservations' | 'wallet' | 'history' | 'profile';

interface BottomNavProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  unreadNotifsCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onSelectTab,
}) => {
  const tabs = [
    { id: 'map' as ActiveTab, label: 'Inicio / Mapa', icon: MapPin },
    { id: 'reservations' as ActiveTab, label: 'Reservas', icon: Calendar },
    { id: 'wallet' as ActiveTab, label: 'Billetera', icon: Wallet },
    { id: 'history' as ActiveTab, label: 'Historial', icon: History },
    { id: 'profile' as ActiveTab, label: 'Perfil & KYC', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[1200] bg-slate-950/95 backdrop-blur-md border-t border-purple-900/40 text-slate-300 py-2 px-3 shadow-2xl">
      <div className="max-w-md mx-auto grid grid-cols-5 gap-1.5">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelectTab(tab.id)}
              className={`flex flex-col items-center justify-center py-2 px-1 rounded-2xl transition-all duration-200 ${
                isActive
                  ? 'bg-purple-600 text-white font-black shadow-lg shadow-purple-900/60 scale-105 border border-purple-400/30'
                  : 'text-slate-400 hover:text-white hover:bg-purple-950/40'
              }`}
            >
              <Icon className={`w-5 h-5 mb-0.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span className="text-[10px] tracking-tight leading-none text-center font-bold">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
