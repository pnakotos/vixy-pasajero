import React, { useState, useEffect } from 'react';
import { ShieldAlert, AlertOctagon, Ambulance, PhoneCall, CheckCircle, X, MapPin, Send } from 'lucide-react';
import { UserProfile, RideRequest } from '../types';

interface PanicButtonModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  ride: RideRequest | null;
  onSendEmergencyAlert: (type: 'robo' | 'accidente') => void;
}

export const PanicButtonModal: React.FC<PanicButtonModalProps> = ({
  isOpen,
  onClose,
  user,
  ride,
  onSendEmergencyAlert,
}) => {
  const [selectedEmergency, setSelectedEmergency] = useState<'robo' | 'accidente' | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isSent, setIsSent] = useState(false);

  useEffect(() => {
    let timer: any;
    if (countdown !== null && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (countdown === 0) {
      if (selectedEmergency) {
        onSendEmergencyAlert(selectedEmergency);
        setIsSent(true);
      }
    }
    return () => clearTimeout(timer);
  }, [countdown, selectedEmergency]);

  if (!isOpen) return null;

  const handleStartEmergency = (type: 'robo' | 'accidente') => {
    setSelectedEmergency(type);
    setCountdown(5);
  };

  const handleCancel = () => {
    setCountdown(null);
    setSelectedEmergency(null);
    setIsSent(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[3000] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border-2 border-red-600/80 text-white w-full max-w-md rounded-3xl p-5 sm:p-6 shadow-2xl space-y-5 relative">
        
        {/* Close button */}
        <button
          onClick={handleCancel}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-full bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Emergency Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-red-600/20 text-red-500 rounded-full flex items-center justify-center mx-auto border-2 border-red-500 animate-pulse">
            <ShieldAlert className="w-9 h-9" />
          </div>
          <h2 className="text-xl font-black text-white uppercase tracking-tight">
            Botón de Pánico VeloX 🚨
          </h2>
          <p className="text-xs text-slate-300">
            Alerta inmediata al Centro de Monitoreo 24/7, Cuadrante de Paz (911) y a tu contacto de emergencia.
          </p>
        </div>

        {/* IF CONFIRMATION SENT */}
        {isSent ? (
          <div className="bg-red-950/80 border border-red-600/80 rounded-2xl p-4 text-center space-y-3">
            <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto animate-bounce" />
            <h3 className="font-extrabold text-sm text-emerald-300 uppercase">
              ¡ALERTA DE EMERGENCIA ACTIVADA!
            </h3>
            <p className="text-xs text-slate-200 leading-relaxed">
              Hemos transmitido tus coordenadas GPS en vivo al Cuadrante de Seguridad y hemos notificado por SMS a tu contacto de emergencia: <strong>{user.emergencyContact} ({user.emergencyPhone})</strong>.
            </p>
            <p className="text-[11px] text-amber-300 font-mono">
              Coordenadas: {ride?.pickupCoords ? `${ride.pickupCoords[0].toFixed(4)}, ${ride.pickupCoords[1].toFixed(4)}` : '10.4960, -66.8488'}
            </p>
            <button
              onClick={handleCancel}
              className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-2.5 rounded-xl text-xs"
            >
              Cerrar esta ventana
            </button>
          </div>
        ) : countdown !== null ? (
          /* COUNTDOWN TIMER STATE */
          <div className="bg-red-950/80 border border-red-600 rounded-2xl p-5 text-center space-y-4">
            <h3 className="text-sm font-bold text-red-300 uppercase">
              Enviando alerta de {selectedEmergency === 'robo' ? 'ROBO' : 'ACCIDENTE'} en:
            </h3>
            <div className="text-5xl font-mono font-black text-amber-400 animate-ping">
              {countdown}s
            </div>
            <p className="text-xs text-slate-300">
              Si ha sido un error, cancela antes de que venza el tiempo.
            </p>
            <button
              onClick={() => setCountdown(null)}
              className="w-full bg-slate-800 hover:bg-slate-700 text-white font-extrabold py-3 rounded-xl text-xs uppercase tracking-wider"
            >
              CANCELAR ALERTA
            </button>
          </div>
        ) : (
          /* TWO REQUIRED EMERGENCY OPTIONS: ROBO AND ACCIDENTE */
          <div className="space-y-3 pt-1">
            <p className="text-xs font-bold text-slate-400 text-center uppercase tracking-wider">
              Selecciona el tipo de emergencia:
            </p>

            {/* OPTION 1: ROBO */}
            <button
              type="button"
              onClick={() => handleStartEmergency('robo')}
              className="w-full bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800 text-white p-4 rounded-2xl border border-red-500 shadow-xl flex items-center justify-between transition transform active:scale-95"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center font-bold text-xl">
                  🚨
                </div>
                <div className="text-left">
                  <h4 className="font-extrabold text-sm uppercase">1. ROBO / ASALTO</h4>
                  <p className="text-[11px] text-red-100">Alerta de delincuencia, bloqueo de ruta y 911</p>
                </div>
              </div>
              <Send className="w-5 h-5 text-amber-300" />
            </button>

            {/* OPTION 2: ACCIDENTE */}
            <button
              type="button"
              onClick={() => handleStartEmergency('accidente')}
              className="w-full bg-gradient-to-r from-amber-600 to-orange-700 hover:from-amber-700 hover:to-orange-800 text-white p-4 rounded-2xl border border-amber-500 shadow-xl flex items-center justify-between transition transform active:scale-95"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center font-bold text-xl">
                  🚑
                </div>
                <div className="text-left">
                  <h4 className="font-extrabold text-sm uppercase">2. ACCIDENTE / MÉDICO</h4>
                  <p className="text-[11px] text-amber-100">Despacho de ambulancia y paramédicos GPS</p>
                </div>
              </div>
              <Send className="w-5 h-5 text-amber-200" />
            </button>
          </div>
        )}

        {/* Emergency Info Footer */}
        <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3 text-red-400" /> GPS VeloX Monitor
          </span>
          <a href="tel:911" className="text-red-400 font-bold hover:underline">
            Llamar directamente al 911 📞
          </a>
        </div>
      </div>
    </div>
  );
};
