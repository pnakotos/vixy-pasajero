import React, { useState } from 'react';
import { VehicleCategory, PaymentMethod, Currency } from '../types';
import { MOCK_LOCATIONS, EXCHANGE_RATE_VES } from '../data/mockData';
import { Bike, Car, Package, MapPin, Navigation, Clock, ShieldCheck, ShieldAlert, CreditCard, ChevronRight, Calendar, ArrowRightLeft, UserCheck } from 'lucide-react';

interface RideSelectorProps {
  selectedCategory: VehicleCategory;
  onSelectCategory: (cat: VehicleCategory) => void;
  pickupAddress: string;
  dropoffAddress: string;
  onChangePickup: (val: string) => void;
  onChangeDropoff: (val: string) => void;
  onSelectPresetLocation: (type: 'pickup' | 'dropoff', loc: { name: string; coords: [number, number] }) => void;
  distanceKm: number;
  priceUsd: number;
  priceVes: number;
  paymentMethod: PaymentMethod;
  onChangePaymentMethod: (pm: PaymentMethod) => void;
  walletBalanceUsd: number;
  onRequestRide: () => void;
  onOpenScheduleModal: () => void;
  currency: Currency;
  isSearchingDriver: boolean;
  isUserVerified?: boolean;
  onGoToProfile?: () => void;
}

export const RideSelector: React.FC<RideSelectorProps> = ({
  selectedCategory,
  onSelectCategory,
  pickupAddress,
  dropoffAddress,
  onChangePickup,
  onChangeDropoff,
  onSelectPresetLocation,
  distanceKm,
  priceUsd,
  priceVes,
  paymentMethod,
  onChangePaymentMethod,
  walletBalanceUsd,
  onRequestRide,
  onOpenScheduleModal,
  currency,
  isSearchingDriver,
  isUserVerified = true,
  onGoToProfile,
}) => {
  const [showPickupPresets, setShowPickupPresets] = useState(false);
  const [showDropoffPresets, setShowDropoffPresets] = useState(false);

  // Category multiplier calculations
  const etaDriverWait = selectedCategory === 'moto' ? '2 - 4 min' : selectedCategory === 'delivery' ? '3 - 5 min' : '4 - 7 min';
  const etaTripTime = Math.max(5, Math.round(distanceKm * (selectedCategory === 'moto' ? 2.2 : 3.0))) + ' min';

  const categoryOptions = [
    {
      id: 'moto' as VehicleCategory,
      title: 'V-Moto Taxi',
      subtitle: 'Rápido y económico',
      icon: Bike,
      badge: 'Más rápido',
      color: 'from-purple-600 to-purple-800',
      multiplier: 1.0,
    },
    {
      id: 'auto' as VehicleCategory,
      title: 'V-Auto Taxi',
      subtitle: 'Cómodo y aire ac.',
      icon: Car,
      badge: 'Hasta 4 pers.',
      color: 'from-purple-800 to-slate-950',
      multiplier: 1.8,
    },
    {
      id: 'delivery' as VehicleCategory,
      title: 'V-Delivery 📦',
      subtitle: 'Paquetes y envíos',
      icon: Package,
      badge: 'Seguro Vixy',
      color: 'from-violet-600 to-indigo-900',
      multiplier: 1.3,
    }
  ];

  const paymentMethodsList: { id: PaymentMethod; label: string; icon: string; extra?: string }[] = [
    { id: 'direct_driver', label: 'Efectivo / Pago directo al conductor', icon: '💵' },
    { id: 'wallet', label: `Billetera Vixy ($${walletBalanceUsd.toFixed(2)} USD / ${(walletBalanceUsd * EXCHANGE_RATE_VES).toFixed(2)} Bs.)`, icon: '💳' },
    { id: 'pago_movil', label: 'Pago Móvil (Bolívares)', icon: '⚡' },
    { id: 'zinli', label: 'Zinli Wallet (USD)', icon: '📱' },
    { id: 'binance', label: 'Binance Pay (USDT)', icon: '🟡' },
    { id: 'paypal', label: 'PayPal (USD)', icon: '🟦' },
  ];

  return (
    <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-2xl border border-purple-100 space-y-4">
      
      {/* MANDATORY KYC VERIFICATION WARNING BANNER */}
      {!isUserVerified && (
        <div className="bg-amber-500/10 border-2 border-amber-500/60 p-3.5 rounded-2xl flex items-center justify-between gap-3 text-xs shadow-md">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 font-black flex items-center justify-center shrink-0 shadow">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-extrabold text-amber-950">Validación de Cédula Obligatoria</h4>
              <p className="text-[11px] text-amber-900 font-medium">Por seguridad, debes validar tu identidad antes de poder pedir servicios en Vixy.</p>
            </div>
          </div>
          {onGoToProfile && (
            <button
              type="button"
              onClick={onGoToProfile}
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black px-3 py-2 rounded-xl text-xs whitespace-nowrap shrink-0 shadow-md transition active:scale-95 flex items-center gap-1"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Validar 🆔</span>
            </button>
          )}
        </div>
      )}

      {/* VEHICLE CATEGORIES TABS */}
      <div>
        <label className="text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-2 block">
          Selecciona tu servicio Vixy
        </label>
        <div className="grid grid-cols-3 gap-2">
          {categoryOptions.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            const catPriceUsd = (priceUsd * (cat.id === 'auto' ? 1.8 : cat.id === 'delivery' ? 1.3 : 1.0)).toFixed(2);
            const catPriceVes = (parseFloat(catPriceUsd) * EXCHANGE_RATE_VES).toFixed(2);

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onSelectCategory(cat.id)}
                className={`relative flex flex-col items-center p-3 rounded-2xl border transition-all text-left ${
                  isSelected
                    ? 'border-purple-600 bg-purple-50/80 shadow-md ring-2 ring-purple-500'
                    : 'border-slate-200 bg-slate-50/60 hover:bg-purple-50/40 text-slate-700'
                }`}
              >
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white mb-2 bg-gradient-to-tr ${cat.color} shadow-md`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="font-extrabold text-xs text-slate-900 text-center leading-tight">{cat.title}</span>
                <span className="text-[10px] text-slate-500 text-center">{cat.subtitle}</span>
                
                <div className="mt-2 text-center pt-1 border-t border-purple-200/60 w-full">
                  <span className="font-mono font-bold text-xs text-purple-700">
                    {currency === 'USD' ? `$${catPriceUsd}` : `${catPriceVes} Bs.`}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ADDRESS INPUT FIELDS */}
      <div className="bg-slate-50 p-3.5 rounded-2xl border border-purple-200/80 space-y-3 relative">
        
        {/* Pickup Address */}
        <div className="relative">
          <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-600 animate-pulse"></span>
            Origen / Punto de Recogida:
          </label>
          <div className="flex items-center gap-2 bg-white border border-slate-300 rounded-2xl px-3 py-2 shadow-sm focus-within:ring-2 focus-within:ring-purple-500">
            <MapPin className="w-4 h-4 text-purple-600 shrink-0" />
            <input
              type="text"
              value={pickupAddress}
              onChange={(e) => onChangePickup(e.target.value)}
              onFocus={() => setShowPickupPresets(true)}
              placeholder="Ej: Plaza Altamira, Chacao, Caracas"
              className="w-full text-xs font-semibold text-slate-900 focus:outline-none"
            />
          </div>

          {/* Pickup Presets Dropdown */}
          {showPickupPresets && (
            <div className="absolute top-full left-0 right-0 mt-1 z-[1100] bg-white border border-purple-200 rounded-2xl shadow-2xl p-2 max-h-48 overflow-y-auto divide-y divide-purple-50">
              <div className="px-2 py-1 text-[10px] font-extrabold text-purple-600 uppercase tracking-wider">Lugares populares en Caracas</div>
              {MOCK_LOCATIONS.map((loc, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    onSelectPresetLocation('pickup', loc);
                    setShowPickupPresets(false);
                  }}
                  className="px-3 py-2 text-xs text-slate-800 hover:bg-purple-100/70 cursor-pointer rounded-xl flex items-center gap-2"
                >
                  <MapPin className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                  <span className="truncate">{loc.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Swap / Route Divider Line */}
        <div className="flex items-center justify-between text-slate-400 px-2 text-[10px]">
          <span className="border-b border-dashed border-purple-200 flex-1"></span>
          <span className="bg-purple-100 text-purple-900 px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold">
            Distancia {distanceKm.toFixed(1)} km
          </span>
          <span className="border-b border-dashed border-purple-200 flex-1"></span>
        </div>

        {/* Dropoff Address */}
        <div className="relative">
          <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-900"></span>
            Destino final:
          </label>
          <div className="flex items-center gap-2 bg-white border border-slate-300 rounded-2xl px-3 py-2 shadow-sm focus-within:ring-2 focus-within:ring-purple-500">
            <Navigation className="w-4 h-4 text-purple-700 shrink-0" />
            <input
              type="text"
              value={dropoffAddress}
              onChange={(e) => onChangeDropoff(e.target.value)}
              onFocus={() => setShowDropoffPresets(true)}
              placeholder="Toca el mapa o escribe dirección de destino..."
              className="w-full text-xs font-semibold text-slate-900 focus:outline-none"
            />
          </div>

          {/* Dropoff Presets Dropdown */}
          {showDropoffPresets && (
            <div className="absolute top-full left-0 right-0 mt-1 z-[1100] bg-white border border-purple-200 rounded-2xl shadow-2xl p-2 max-h-48 overflow-y-auto divide-y divide-purple-50">
              <div className="px-2 py-1 text-[10px] font-extrabold text-purple-600 uppercase tracking-wider">Destinos recomendados</div>
              {MOCK_LOCATIONS.map((loc, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    onSelectPresetLocation('dropoff', loc);
                    setShowDropoffPresets(false);
                  }}
                  className="px-3 py-2 text-xs text-slate-800 hover:bg-purple-100/70 cursor-pointer rounded-xl flex items-center gap-2"
                >
                  <Navigation className="w-3.5 h-3.5 text-purple-700 shrink-0" />
                  <span className="truncate">{loc.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* TRIP METRICS BENTO CARD */}
      <div className="grid grid-cols-3 gap-2 bg-slate-950 text-white p-3.5 rounded-2xl border border-purple-900/50">
        <div className="text-center border-r border-purple-900/40">
          <span className="text-[10px] text-slate-400 block uppercase font-medium">Tarifa Est.</span>
          <span className="font-extrabold text-sm text-purple-300 font-mono">
            ${priceUsd.toFixed(2)} USD
          </span>
          <span className="text-[10px] text-slate-300 block font-mono">
            {(priceUsd * EXCHANGE_RATE_VES).toFixed(2)} Bs.
          </span>
        </div>

        <div className="text-center border-r border-purple-900/40">
          <span className="text-[10px] text-slate-400 block uppercase font-medium">Llegada Conductor</span>
          <span className="font-bold text-xs text-purple-400 flex items-center justify-center gap-1 mt-0.5">
            <Clock className="w-3 h-3" /> {etaDriverWait}
          </span>
          <span className="text-[9px] text-slate-400">En camino</span>
        </div>

        <div className="text-center">
          <span className="text-[10px] text-slate-400 block uppercase font-medium">Duración Viaje</span>
          <span className="font-bold text-xs text-purple-300 flex items-center justify-center gap-1 mt-0.5">
            <Navigation className="w-3 h-3" /> {etaTripTime}
          </span>
          <span className="text-[9px] text-slate-400">Aproximado</span>
        </div>
      </div>

      {/* PAYMENT METHOD SELECTION */}
      <div>
        <label className="text-xs font-bold text-slate-800 block mb-1.5">
          Método de pago seleccionado:
        </label>
        <select
          value={paymentMethod}
          onChange={(e) => onChangePaymentMethod(e.target.value as PaymentMethod)}
          className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-purple-500 focus:outline-none"
        >
          {paymentMethodsList.map((pm) => (
            <option key={pm.id} value={pm.id}>
              {pm.icon} {pm.label}
            </option>
          ))}
        </select>
      </div>

      {/* ACTION BUTTONS (Request Now or Schedule Reservation) */}
      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={onOpenScheduleModal}
          className="flex-1 bg-slate-100 hover:bg-purple-100 text-slate-800 font-bold py-3.5 px-3 rounded-2xl text-xs flex items-center justify-center gap-1.5 border border-purple-200 transition active:scale-95"
        >
          <Calendar className="w-4 h-4 text-purple-600" />
          <span>Agendar</span>
        </button>

        <button
          type="button"
          disabled={isSearchingDriver || !dropoffAddress}
          onClick={onRequestRide}
          className={`flex-[2] font-black py-3.5 px-4 rounded-2xl text-xs sm:text-sm shadow-xl shadow-purple-900/30 flex items-center justify-center gap-2 transition transform active:scale-95 ${
            isSearchingDriver
              ? 'bg-purple-600 text-white cursor-wait animate-pulse'
              : !dropoffAddress
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
              : 'bg-purple-600 hover:bg-purple-700 text-white border border-purple-400'
          }`}
        >
          {isSearchingDriver ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Asignando Conductor Vixy...</span>
            </>
          ) : (
            <>
              <span>SOLICITAR {selectedCategory.toUpperCase()} VIXY</span>
              <ChevronRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
