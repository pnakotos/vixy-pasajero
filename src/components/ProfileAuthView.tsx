import React, { useState } from 'react';
import { UserProfile } from '../types';
import { ShieldCheck, UserCheck, Mail, Phone, Camera, Upload, CheckCircle, Lock, LogOut, ChevronRight, AlertCircle, Sparkles } from 'lucide-react';

interface ProfileAuthViewProps {
  user: UserProfile;
  onUpdateUser: (updated: UserProfile) => void;
  onOpenSupport: () => void;
  onLogout?: () => void;
}

export const ProfileAuthView: React.FC<ProfileAuthViewProps> = ({
  user,
  onUpdateUser,
  onOpenSupport,
  onLogout,
}) => {
  const [authMethod, setAuthMethod] = useState<'email' | 'phone' | 'google' | 'facebook'>('email');
  const [showIdentityForm, setShowIdentityForm] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Identity Form State
  const [cedulaVal, setCedulaVal] = useState(user.cedula);
  const [nameVal, setNameVal] = useState(user.name);
  const [lastNameVal, setLastNameVal] = useState(user.lastName);
  const [phoneVal, setPhoneVal] = useState(user.phone);
  const [emergencyName, setEmergencyName] = useState(user.emergencyContact);
  const [emergencyPhone, setEmergencyPhone] = useState(user.emergencyPhone);

  const [idPhotoPreview, setIdPhotoPreview] = useState<string | null>(user.idPhotoUrl || null);
  const [selfiePreview, setSelfiePreview] = useState<string | null>(user.selfieUrl || null);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleSimulatePhotoUpload = (type: 'id' | 'selfie') => {
    const mockId = 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=600&q=80';
    const mockSelfie = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80';
    
    if (type === 'id') setIdPhotoPreview(mockId);
    else setSelfiePreview(mockSelfie);
  };

  const handleSaveIdentity = (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);

    setTimeout(() => {
      const updated: UserProfile = {
        ...user,
        name: nameVal,
        lastName: lastNameVal,
        cedula: cedulaVal,
        phone: phoneVal,
        emergencyContact: emergencyName,
        emergencyPhone: emergencyPhone,
        isVerified: true,
        verificationStatus: 'verified',
        idPhotoUrl: idPhotoPreview || user.idPhotoUrl,
        selfieUrl: selfiePreview || user.selfieUrl,
      };

      onUpdateUser(updated);
      setIsVerifying(false);
      setShowIdentityForm(false);
    }, 1500);
  };

  return (
    <div className="space-y-4 max-w-lg mx-auto pb-20">
      
      {/* USER CARD PROFILE - BENTO BLACK & PURPLE */}
      <div className="bg-slate-950 text-white rounded-3xl p-5 shadow-2xl border border-purple-900/50 space-y-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="relative">
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-purple-500 shadow-xl"
              />
              {user.isVerified && (
                <div className="absolute -bottom-1 -right-1 bg-purple-600 text-white rounded-full p-1 border border-slate-950" title="Cédula e Identidad Verificada">
                  <ShieldCheck className="w-4 h-4" />
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-white">{user.name} {user.lastName}</h2>
                {user.isVerified ? (
                  <span className="bg-purple-500/20 text-purple-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-purple-500/40">
                    Verificado ✅
                  </span>
                ) : (
                  <span className="bg-amber-500/20 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-500/30">
                    Pendiente ⚠️
                  </span>
                )}
              </div>
              <p className="text-xs text-purple-300 font-mono mt-0.5">Cédula: {user.cedula}</p>
              <p className="text-xs text-slate-400 mt-0.5">{user.phone} • {user.email}</p>
            </div>
          </div>

          {/* QUICK HEADER LOGOUT ACTION */}
          {onLogout && (
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="p-2.5 bg-purple-950/50 hover:bg-red-950/70 text-slate-300 hover:text-red-400 rounded-2xl border border-purple-800/40 hover:border-red-800/60 transition active:scale-95 flex items-center justify-center shrink-0"
              title="Cerrar Sesión"
            >
              <LogOut className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* AUTH METHODS SUPPORTED IN APP */}
        <div className="bg-slate-900/90 p-3 rounded-2xl border border-purple-900/40 space-y-2">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">
            Sesión activa en Vixy Taxi:
          </span>
          <div className="grid grid-cols-4 gap-1.5 text-[11px] font-bold text-center">
            <span className="bg-slate-950 text-purple-300 p-1.5 rounded-xl border border-purple-900/50 flex items-center justify-center gap-1">
              <Mail className="w-3 h-3" /> Correo
            </span>
            <span className="bg-slate-950 text-purple-300 p-1.5 rounded-xl border border-purple-900/50 flex items-center justify-center gap-1">
              <Phone className="w-3 h-3" /> Teléfono
            </span>
            <span className="bg-slate-950 text-purple-300 p-1.5 rounded-xl border border-purple-900/50 flex items-center justify-center gap-1">
              🌐 Google
            </span>
            <span className="bg-slate-950 text-purple-300 p-1.5 rounded-xl border border-purple-900/50 flex items-center justify-center gap-1">
              📘 Facebook
            </span>
          </div>
        </div>
      </div>

      {/* KYC IDENTITY VERIFICATION CARD - WHITE BENTO CARD WITH PURPLE BORDERS */}
      <div className="bg-white rounded-3xl p-5 shadow-xl border border-purple-100 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-purple-600" />
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">Validación de Identidad con Cédula</h3>
              <p className="text-[11px] text-slate-500">Requisito obligatorio de seguridad para solicitar viajes en Vixy</p>
            </div>
          </div>

          <button
            onClick={() => setShowIdentityForm(!showIdentityForm)}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-3.5 py-2 rounded-xl text-xs transition active:scale-95 shadow-md shadow-purple-900/20"
          >
            {user.isVerified ? 'Actualizar Datos' : 'Verificar Ahora'}
          </button>
        </div>

        {/* IDENTITY FORM */}
        {showIdentityForm && (
          <form onSubmit={handleSaveIdentity} className="bg-slate-50 p-4 rounded-2xl border border-purple-200 space-y-3 text-xs pt-3 animate-in fade-in">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Nombre Completo:</label>
                <input
                  type="text"
                  required
                  value={nameVal}
                  onChange={(e) => setNameVal(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl p-2 font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Apellido Completo:</label>
                <input
                  type="text"
                  required
                  value={lastNameVal}
                  onChange={(e) => setLastNameVal(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl p-2 font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Cédula de Identidad (V- / E-):</label>
              <input
                type="text"
                required
                value={cedulaVal}
                onChange={(e) => setCedulaVal(e.target.value)}
                placeholder="Ej: V-24.892.110"
                className="w-full bg-white border border-slate-300 rounded-xl p-2 font-mono font-bold focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Contacto Emergencia:</label>
                <input
                  type="text"
                  required
                  value={emergencyName}
                  onChange={(e) => setEmergencyName(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl p-2 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Teléfono Emergencia:</label>
                <input
                  type="text"
                  required
                  value={emergencyPhone}
                  onChange={(e) => setEmergencyPhone(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl p-2 font-mono focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>
            </div>

            {/* PHOTO UPLOADS FOR ID & SELFIE */}
            <div className="space-y-2 pt-2 border-t border-slate-200">
              <label className="font-bold text-slate-800 block">Fotos de Validación:</label>

              <div className="grid grid-cols-2 gap-2">
                <div
                  onClick={() => handleSimulatePhotoUpload('id')}
                  className="bg-white border-2 border-dashed border-purple-200 hover:border-purple-500 p-3 rounded-2xl text-center cursor-pointer transition"
                >
                  <Camera className="w-5 h-5 text-purple-500 mx-auto mb-1" />
                  <span className="text-[10px] font-bold text-slate-700 block">Foto de Cédula (Frente)</span>
                  {idPhotoPreview ? (
                    <span className="text-[9px] text-purple-600 font-bold">✓ Foto adjuntada</span>
                  ) : (
                    <span className="text-[9px] text-slate-400">Tocar para tomar/adjuntar</span>
                  )}
                </div>

                <div
                  onClick={() => handleSimulatePhotoUpload('selfie')}
                  className="bg-white border-2 border-dashed border-purple-200 hover:border-purple-500 p-3 rounded-2xl text-center cursor-pointer transition"
                >
                  <Camera className="w-5 h-5 text-purple-500 mx-auto mb-1" />
                  <span className="text-[10px] font-bold text-slate-700 block">Selfie de Rostro</span>
                  {selfiePreview ? (
                    <span className="text-[9px] text-purple-600 font-bold">✓ Foto adjuntada</span>
                  ) : (
                    <span className="text-[9px] text-slate-400">Tocar para tomar/adjuntar</span>
                  )}
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isVerifying}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-black py-3 rounded-2xl text-xs uppercase shadow-lg shadow-purple-900/30 transition active:scale-95 flex items-center justify-center gap-2"
            >
              {isVerifying ? (
                <span>Validando Cédula y Reconocimiento Facial...</span>
              ) : (
                <span>GUARDAR Y AUTENTICAR IDENTIDAD</span>
              )}
            </button>
          </form>
        )}
      </div>

      {/* SUPPORT SHORTCUT BENTO CARD */}
      <div className="bg-slate-950 text-white rounded-3xl p-4 shadow-xl border border-purple-900/40 flex items-center justify-between">
        <div>
          <h4 className="font-extrabold text-sm text-white">Soporte Técnico Vixy 24/7</h4>
          <p className="text-xs text-slate-400">Atención en vivo para reportes, pagos y objetos perdidos.</p>
        </div>

        <button
          onClick={onOpenSupport}
          className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-4 py-2 rounded-2xl text-xs whitespace-nowrap shadow-md"
        >
          Abrir Chat 24/7
        </button>
      </div>

      {/* MAIN EXPLICIT LOGOUT BUTTON ("BOTON DE CERRAR SESION") */}
      <div className="bg-white rounded-3xl p-5 shadow-xl border border-purple-100 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
              <LogOut className="w-4 h-4 text-purple-600" />
              <span>Cerrar Sesión de la Cuenta</span>
            </h4>
            <p className="text-xs text-slate-500">Sal de tu sesión activa de Vixy Taxi en este dispositivo.</p>
          </div>
        </div>

        {showLogoutConfirm ? (
          <div className="bg-purple-950 text-white p-4 rounded-2xl border border-purple-800 space-y-3 animate-in fade-in">
            <p className="text-xs font-semibold text-center text-purple-200">
              ¿Estás seguro de que deseas cerrar sesión en Vixy Taxi?
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-2.5 rounded-xl text-xs transition"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowLogoutConfirm(false);
                  if (onLogout) onLogout();
                }}
                className="flex-1 bg-purple-600 hover:bg-purple-500 text-white font-extrabold py-2.5 rounded-xl text-xs shadow transition active:scale-95"
              >
                Sí, Cerrar Sesión
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full bg-slate-950 hover:bg-purple-950 text-purple-300 font-bold py-3.5 px-4 rounded-2xl text-xs uppercase tracking-wider border border-purple-900/60 shadow-lg flex items-center justify-center gap-2 transition active:scale-95"
          >
            <LogOut className="w-4 h-4 text-purple-400" />
            <span>CERRAR SESIÓN EN VIXY TAXI</span>
          </button>
        )}
      </div>
    </div>
  );
};
