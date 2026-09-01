import React, { useState } from 'react';
import { UserProfile } from '../types';
import { Car, Lock, Mail, Phone, User, ShieldCheck, ArrowRight, Sparkles, CheckCircle, Smartphone } from 'lucide-react';
import { registerClient, loginClient, ClientApiRecord } from '../services/vixyApi';

interface LoginScreenProps {
  onLoginSuccess: (user: UserProfile) => void;
}

function mapClientRecordToProfile(record: ClientApiRecord): UserProfile {
  const [firstName, ...rest] = record.name.split(' ');
  return {
    id: record.id,
    name: firstName || record.name,
    lastName: rest.join(' '),
    cedula: record.cedula || '',
    phone: record.phone,
    email: record.email,
    avatarUrl: record.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    isVerified: !record.is_blocked,
    verificationStatus: record.is_blocked ? 'rejected' : 'verified',
    emergencyContact: record.emergency_contact || '',
    emergencyPhone: record.emergency_phone || '',
  };
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');

  // Form states
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [lastName, setLastName] = useState('');
  const [cedula, setCedula] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);
    try {
      const record = await loginClient(emailOrPhone.trim(), password);
      if (record.auth_token) {
        localStorage.setItem('vixy_passenger_token', record.auth_token);
        localStorage.setItem('vixy_passenger_id', record.id);
      }
      onLoginSuccess(mapClientRecordToProfile(record));
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : 'No se pudo iniciar sesión.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !cedula) {
      setErrorMsg('Por favor completa todos los campos requeridos.');
      return;
    }
    setErrorMsg('');
    setIsLoading(true);
    try {
      const record = await registerClient({
        name: `${name} ${lastName}`.trim(),
        email,
        phone,
        password,
        cedula,
      });
      if (record.auth_token) {
        localStorage.setItem('vixy_passenger_token', record.auth_token);
        localStorage.setItem('vixy_passenger_id', record.id);
      }
      onLoginSuccess(mapClientRecordToProfile(record));
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : 'No se pudo crear la cuenta.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between p-4 sm:p-6 relative overflow-hidden">
      
      {/* BACKGROUND DECORATIVE GLOWS */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-purple-900/30 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-md w-full mx-auto my-auto py-6 space-y-6 relative z-10">
        
        {/* VIXY LOGO & BRANDING HEADER */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-purple-600 text-white shadow-2xl shadow-purple-900/60 border border-purple-400/30 mb-2">
            <Car className="w-9 h-9" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white flex items-center justify-center gap-1.5">
            Vixy <span className="text-purple-400 font-extrabold">Taxi</span>
          </h1>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            La app de transporte rápido, seguro y confiable en Venezuela. Viaja con comodidad.
          </p>
        </div>

        {/* AUTH MODE TOGGLE TABS */}
        <div className="bg-slate-900/90 p-1.5 rounded-2xl border border-purple-900/50 grid grid-cols-2 gap-1 text-xs font-extrabold">
          <button
            type="button"
            onClick={() => { setMode('login'); setErrorMsg(''); }}
            className={`py-3 rounded-xl transition-all ${
              mode === 'login'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/50'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Iniciar Sesión
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setErrorMsg(''); }}
            className={`py-3 rounded-xl transition-all ${
              mode === 'register'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/50'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Crear Cuenta
          </button>
        </div>

        {errorMsg && (
          <div className="bg-red-950/80 border border-red-800/80 text-red-200 text-xs p-3 rounded-2xl text-center">
            {errorMsg}
          </div>
        )}

        {/* LOGIN FORM */}
        {mode === 'login' ? (
          <form onSubmit={handleLoginSubmit} className="bg-slate-900/80 p-5 rounded-3xl border border-purple-900/40 space-y-4 shadow-2xl">
            <div>
              <label className="text-xs font-extrabold text-slate-300 block mb-1.5 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-purple-400" />
                Correo Electrónico o Teléfono:
              </label>
              <input
                type="text"
                required
                value={emailOrPhone}
                onChange={(e) => setEmailOrPhone(e.target.value)}
                placeholder="ejemplo@correo.com o 04125550000"
                className="w-full bg-slate-950 border border-purple-900/60 rounded-2xl px-3.5 py-3 text-xs font-semibold text-white placeholder-slate-500 focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-extrabold text-slate-300 block mb-1.5 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-purple-400" />
                Contraseña:
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-purple-900/60 rounded-2xl px-3.5 py-3 text-xs font-semibold text-white placeholder-slate-500 focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-purple-300 font-semibold pt-1">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded accent-purple-600" />
                Recordar mi cuenta
              </label>
              <button type="button" className="hover:underline">¿Olvidaste tu clave?</button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-purple-600 hover:bg-purple-500 text-white font-extrabold py-3.5 px-4 rounded-2xl text-xs uppercase tracking-wider shadow-lg shadow-purple-900/60 flex items-center justify-center gap-2 transition active:scale-95"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Iniciando sesión en Vixy...</span>
                </>
              ) : (
                <>
                  <span>INICIAR SESIÓN</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        ) : (
          /* REGISTER FORM */
          <form onSubmit={handleRegisterSubmit} className="bg-slate-900/80 p-5 rounded-3xl border border-purple-900/40 space-y-3.5 shadow-2xl">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] font-extrabold text-slate-300 block mb-1">Nombre:</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej: Carlos"
                  className="w-full bg-slate-950 border border-purple-900/60 rounded-xl p-2.5 text-xs text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-extrabold text-slate-300 block mb-1">Apellido:</label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Ej: Mendoza"
                  className="w-full bg-slate-950 border border-purple-900/60 rounded-xl p-2.5 text-xs text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-extrabold text-slate-300 block mb-1">Cédula de Identidad:</label>
              <input
                type="text"
                required
                value={cedula}
                onChange={(e) => setCedula(e.target.value)}
                placeholder="Ej: V-24.892.110"
                className="w-full bg-slate-950 border border-purple-900/60 rounded-xl p-2.5 text-xs font-mono text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] font-extrabold text-slate-300 block mb-1">Teléfono:</label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0412-5550000"
                  className="w-full bg-slate-950 border border-purple-900/60 rounded-xl p-2.5 text-xs text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-extrabold text-slate-300 block mb-1">Correo Electrónico:</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="usuario@vixytaxi.com"
                  className="w-full bg-slate-950 border border-purple-900/60 rounded-xl p-2.5 text-xs text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-extrabold text-slate-300 block mb-1">Crea una Contraseña:</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-purple-900/60 rounded-xl p-2.5 text-xs text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-purple-600 hover:bg-purple-500 text-white font-extrabold py-3.5 px-4 rounded-2xl text-xs uppercase tracking-wider shadow-lg shadow-purple-900/60 flex items-center justify-center gap-2 transition active:scale-95"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Registrando tu cuenta...</span>
                </>
              ) : (
                <>
                  <span>CREAR CUENTA EN VIXY</span>
                  <CheckCircle className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

      </div>

      {/* FOOTER */}
      <div className="text-center text-[10px] text-slate-500 font-medium py-2">
        Vixy Taxi Venezuela • Sistema de transporte seguro y validado
      </div>
    </div>
  );
};
