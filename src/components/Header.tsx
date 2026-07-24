import React, { useState } from 'react';
import { UserProfile, Currency, AppNotification } from '../types';
import { EXCHANGE_RATE_VES } from '../data/mockData';
import { Bell, ShieldCheck, RefreshCw, X, LogOut, Sun, Moon } from 'lucide-react';

interface HeaderProps {
  user: UserProfile;
  currency: Currency;
  onToggleCurrency: () => void;
  theme?: 'dark' | 'light';
  onToggleTheme?: () => void;
  notifications: AppNotification[];
  onMarkNotificationRead: (id: string) => void;
  onClearNotifications: () => void;
  onOpenProfile: () => void;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  currency,
  onToggleCurrency,
  theme = 'dark',
  onToggleTheme,
  notifications,
  onMarkNotificationRead,
  onClearNotifications,
  onOpenProfile,
  onLogout,
}) => {
  const [showNotifDrawer, setShowNotifDrawer] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="sticky top-0 z-[1000] bg-slate-950/95 backdrop-blur-md text-white border-b border-purple-900/30 px-4 py-3 shadow-xl">
      <div className="max-w-xl mx-auto flex items-center justify-between">
        
        {/* Brand & User Greeting */}
        <div className="flex items-center gap-3 cursor-pointer group" onClick={onOpenProfile}>
          <div className="relative">
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="w-10 h-10 rounded-2xl object-cover border-2 border-purple-500 shadow-md transition group-hover:scale-105"
            />
            {user.isVerified && (
              <div className="absolute -bottom-1 -right-1 bg-purple-600 text-white rounded-full p-0.5 border border-slate-950" title="Identidad Verificada">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
            )}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-xl text-white tracking-tight flex items-center gap-1">
                <span className="bg-purple-600 text-white px-1.5 py-0.5 rounded-xl text-xs font-black">V</span>
                <span>Vixy</span>
              </span>
              <span className="text-[10px] bg-purple-500/20 text-purple-300 font-bold px-2 py-0.5 rounded-full border border-purple-500/40 uppercase tracking-wider">
                Taxi VE
              </span>
            </div>
            <p className="text-xs text-slate-300 font-medium">Hola, {user.name} 👋</p>
          </div>
        </div>

        {/* Currency Switcher, Theme Switcher, Notifications & Logout Button */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          
          {/* Rate Badge & Currency Switcher Button */}
          <button
            type="button"
            onClick={onToggleCurrency}
            className="flex items-center gap-1 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-purple-900/50 rounded-2xl px-2 py-1.5 text-xs font-semibold shadow transition active:scale-95"
            title="Cambiar divisa de visualización"
          >
            <RefreshCw className="w-3 h-3 text-purple-400" />
            <span className={currency === 'USD' ? 'text-purple-400 font-bold' : 'text-slate-400'}>$</span>
            <span className="text-slate-600">|</span>
            <span className={currency === 'VES' ? 'text-purple-400 font-bold' : 'text-slate-400'}>Bs</span>
          </button>

          {/* Small Theme Toggle Button */}
          {onToggleTheme && (
            <button
              type="button"
              onClick={onToggleTheme}
              className="flex items-center gap-1 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-purple-900/50 rounded-2xl px-2 py-1.5 text-xs font-semibold shadow transition active:scale-95"
              title={theme === 'light' ? "Cambiar a Tema Oscuro Original" : "Cambiar a Tema Claro"}
            >
              {theme === 'light' ? (
                <>
                  <Moon className="w-3.5 h-3.5 text-purple-400" />
                  <span className="hidden xs:inline text-[10px] font-bold text-purple-300">Oscuro</span>
                </>
              ) : (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                  <span className="hidden xs:inline text-[10px] font-bold text-amber-300">Claro</span>
                </>
              )}
            </button>
          )}

          {/* Bell Notifications Button */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowNotifDrawer(!showNotifDrawer)}
              className="relative p-2 bg-slate-900 hover:bg-slate-800 text-slate-200 rounded-2xl border border-purple-900/50 transition active:scale-95"
              title="Notificaciones"
            >
              <Bell className="w-4 h-4 text-purple-300" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-purple-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>

          {/* Quick Logout Button */}
          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              className="p-2 bg-purple-950/40 hover:bg-red-950/60 text-slate-300 hover:text-red-400 rounded-2xl border border-purple-800/40 hover:border-red-800/60 transition active:scale-95"
              title="Cerrar Sesión"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Live Exchange Rate Bar */}
      <div className="max-w-xl mx-auto mt-2 pt-1.5 border-t border-purple-950/60 flex items-center justify-between text-[11px] text-slate-400">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 bg-purple-500 rounded-full animate-ping"></span>
          Tasa Oficial BCV: <strong className="text-purple-300 font-mono">1 USD = {EXCHANGE_RATE_VES.toFixed(2)} Bs.</strong>
        </span>
        <span className="text-purple-400 font-semibold flex items-center gap-1">
          <span>📡</span> GPS Activo
        </span>
      </div>

      {/* Notifications Drawer Dropdown */}
      {showNotifDrawer && (
        <div className="absolute top-16 right-4 left-4 max-w-sm ml-auto z-[2000] bg-slate-900 border border-purple-800/60 rounded-3xl shadow-2xl overflow-hidden p-4 text-slate-100 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-purple-900/40">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-purple-400" />
              <h3 className="font-bold text-sm text-white">Notificaciones Vixy</h3>
              {unreadCount > 0 && (
                <span className="bg-purple-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                  {unreadCount} nuevas
                </span>
              )}
            </div>
            <button
              onClick={() => setShowNotifDrawer(false)}
              className="text-slate-400 hover:text-white p-1 rounded-xl"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="max-h-64 overflow-y-auto my-2 divide-y divide-purple-950/60 space-y-2">
            {notifications.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-6">No tienes notificaciones pendientes.</p>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => onMarkNotificationRead(n.id)}
                  className={`p-3 rounded-2xl cursor-pointer transition ${
                    n.read ? 'bg-slate-950/40 opacity-70' : 'bg-slate-800/80 border-l-4 border-purple-500'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-xs font-bold text-white">{n.title}</h4>
                    <span className="text-[10px] text-purple-300 font-mono whitespace-nowrap">{n.date}</span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">{n.body}</p>
                </div>
              ))
            )}
          </div>

          {notifications.length > 0 && (
            <div className="pt-2 border-t border-purple-900/40 flex justify-between items-center">
              <button
                onClick={onClearNotifications}
                className="text-xs text-purple-400 hover:text-purple-300 font-semibold"
              >
                Limpiar todas
              </button>
              <span className="text-[10px] text-slate-500">Vixy Push Notifs</span>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
