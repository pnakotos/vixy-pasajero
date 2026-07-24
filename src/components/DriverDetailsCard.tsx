import React from 'react';
import { Driver, RideRequest, Currency } from '../types';
import { EXCHANGE_RATE_VES } from '../data/mockData';
import { Phone, MessageSquare, ShieldAlert, Star, Navigation, MapPin, CheckCircle2, Clock, XCircle, Car, Bike, Package } from 'lucide-react';

interface DriverDetailsCardProps {
  ride: RideRequest;
  currency: Currency;
  onOpenDriverChat: () => void;
  onOpenPanicModal: () => void;
  onCancelRide: () => void;
  onFinishTrip?: () => void;
}

export const DriverDetailsCard: React.FC<DriverDetailsCardProps> = ({
  ride,
  currency,
  onOpenDriverChat,
  onOpenPanicModal,
  onCancelRide,
  onFinishTrip,
}) => {
  const driver = ride.driver;
  if (!driver) return null;

  const vehicleEmoji = ride.category === 'moto' ? '🏍️' : ride.category === 'delivery' ? '📦' : '🚗';

  // Status message
  let statusText = "Conductor asignado. Se dirige a tu ubicación.";
  let etaText = `${ride.etaDriverArrivalMins} min`;
  if (ride.status === 'driver_arriving') {
    statusText = "¡Tu conductor ha llegado al punto de encuentro! 📍";
    etaText = "¡En el sitio!";
  } else if (ride.status === 'in_trip') {
    statusText = "En viaje hacia tu destino. Disfruta tu viaje VeloX.";
    etaText = `${ride.etaTripArrivalMins} min de viaje`;
  }

  return (
    <div className="bg-slate-900 text-white rounded-3xl p-4 sm:p-5 shadow-2xl border border-slate-800 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
      
      {/* STATUS HEADER BANNER */}
      <div className="flex items-center justify-between bg-slate-800/80 p-3 rounded-2xl border border-slate-700/80">
        <div className="flex items-center gap-2.5">
          <div className="w-3 h-3 bg-emerald-400 rounded-full animate-ping"></div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Estado del servicio</span>
            <p className="text-xs font-bold text-amber-300 leading-tight">{statusText}</p>
          </div>
        </div>
        <div className="text-right bg-slate-900 px-3 py-1 rounded-xl border border-slate-700">
          <span className="text-[9px] text-slate-400 block uppercase">Tiempo est.</span>
          <span className="text-xs font-mono font-extrabold text-emerald-400">{etaText}</span>
        </div>
      </div>

      {/* DRIVER PERSONAL & VEHICLE DATA */}
      <div className="flex items-center justify-between gap-3">
        {/* Driver Photo & Rating */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={driver.photoUrl}
              alt={driver.name}
              className="w-14 h-14 rounded-full object-cover border-2 border-amber-400 shadow-md"
            />
            <span className="absolute -bottom-1 -right-1 bg-amber-400 text-slate-950 font-bold text-[10px] px-1.5 py-0.2 rounded-full shadow">
              {driver.rating} ★
            </span>
          </div>

          <div>
            <h3 className="font-extrabold text-sm text-white">{driver.name} {driver.lastName}</h3>
            <p className="text-xs text-slate-300 flex items-center gap-1 font-medium">
              <span>{vehicleEmoji} {driver.vehicleModel}</span>
            </p>
            <span className="text-[10px] text-slate-400">Color: {driver.vehicleColor} • {driver.totalTrips} viajes</span>
          </div>
        </div>

        {/* License Plate Badge (Placa de Identificación) */}
        <div className="text-center bg-amber-400 text-slate-950 px-3 py-1.5 rounded-xl font-mono font-black border-2 border-amber-300 shadow-lg">
          <span className="text-[9px] text-slate-800 uppercase block leading-none font-sans font-bold">PLACA</span>
          <span className="text-base tracking-wider">{driver.vehiclePlate}</span>
        </div>
      </div>

      {/* TRIP COST & PAYMENT METHOD RECAP */}
      <div className="flex items-center justify-between text-xs bg-slate-800/50 px-3 py-2 rounded-xl border border-slate-700/50">
        <div>
          <span className="text-slate-400 text-[10px] uppercase block">Costo acordado</span>
          <span className="font-bold text-amber-400 font-mono">
            {currency === 'USD' ? `$${ride.priceUsd.toFixed(2)} USD` : `${ride.priceVes.toFixed(2)} Bs.`}
          </span>
        </div>
        <div className="text-right">
          <span className="text-slate-400 text-[10px] uppercase block">Forma de pago</span>
          <span className="font-semibold text-slate-200 capitalize">{ride.paymentMethod.replace('_', ' ')}</span>
        </div>
      </div>

      {/* QUICK FINISH TRIP BUTTON WHEN IN TRIP */}
      {ride.status === 'in_trip' && onFinishTrip && (
        <button
          type="button"
          onClick={onFinishTrip}
          className="w-full bg-purple-600 hover:bg-purple-500 text-white font-extrabold py-3 rounded-2xl text-xs uppercase tracking-wider shadow-lg shadow-purple-900/50 transition active:scale-95 flex items-center justify-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
          <span>🏁 COMPLETAR Y FINALIZAR VIAJE</span>
        </button>
      )}

      {/* ACTION BUTTONS: Chat, Call, Panic, Cancel */}
      <div className="grid grid-cols-4 gap-2 pt-1">
        
        {/* Chat button */}
        <button
          type="button"
          onClick={onOpenDriverChat}
          className="flex flex-col items-center justify-center p-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl transition active:scale-95 shadow"
        >
          <MessageSquare className="w-5 h-5 mb-1" />
          <span className="text-[10px] font-bold">Chat</span>
        </button>

        {/* Call button */}
        <a
          href={`tel:${driver.phone}`}
          className="flex flex-col items-center justify-center p-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl transition active:scale-95 shadow text-center"
        >
          <Phone className="w-5 h-5 mb-1" />
          <span className="text-[10px] font-bold">Llamar</span>
        </a>

        {/* Panic Button SOS */}
        <button
          type="button"
          onClick={onOpenPanicModal}
          className="flex flex-col items-center justify-center p-2.5 bg-gradient-to-br from-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800 text-white rounded-2xl transition active:scale-95 shadow border border-red-500 animate-pulse"
        >
          <ShieldAlert className="w-5 h-5 mb-1" />
          <span className="text-[10px] font-extrabold uppercase">Pánico</span>
        </button>

        {/* Cancel button */}
        <button
          type="button"
          onClick={onCancelRide}
          className="flex flex-col items-center justify-center p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-2xl transition active:scale-95 border border-slate-700"
        >
          <XCircle className="w-5 h-5 mb-1 text-slate-400" />
          <span className="text-[10px] font-medium">Cancelar</span>
        </button>
      </div>
    </div>
  );
};
