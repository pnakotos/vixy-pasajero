import React, { useState } from 'react';
import { ScheduledReservation, VehicleCategory, PaymentMethod, Currency } from '../types';
import { MOCK_LOCATIONS, EXCHANGE_RATE_VES } from '../data/mockData';
import { Calendar, Clock, MapPin, Navigation, Bike, Car, Package, Plus, Trash2, CheckCircle, AlertCircle } from 'lucide-react';

interface ReservationsViewProps {
  reservations: ScheduledReservation[];
  onAddReservation: (res: ScheduledReservation) => void;
  onCancelReservation: (id: string) => void;
  currency: Currency;
  isUserVerified?: boolean;
  onRequireVerification?: () => void;
}

export const ReservationsView: React.FC<ReservationsViewProps> = ({
  reservations,
  onAddReservation,
  onCancelReservation,
  currency,
  isUserVerified = true,
  onRequireVerification,
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [category, setCategory] = useState<VehicleCategory>('auto');
  const [pickup, setPickup] = useState(MOCK_LOCATIONS[0].name);
  const [dropoff, setDropoff] = useState(MOCK_LOCATIONS[1].name);
  const [date, setDate] = useState('2026-07-25');
  const [time, setTime] = useState('08:00');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('wallet');

  const estimatedPriceUsd = category === 'moto' ? 3.00 : category === 'delivery' ? 4.00 : 8.50;

  const handleOpenCreateModal = () => {
    if (!isUserVerified) {
      if (onRequireVerification) onRequireVerification();
      return;
    }
    setShowCreateModal(true);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isUserVerified) {
      if (onRequireVerification) onRequireVerification();
      return;
    }
    const newRes: ScheduledReservation = {
      id: `res_${Date.now()}`,
      category,
      pickupAddress: pickup,
      dropoffAddress: dropoff,
      date,
      time,
      priceUsd: estimatedPriceUsd,
      priceVes: estimatedPriceUsd * EXCHANGE_RATE_VES,
      paymentMethod,
      status: 'active',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };

    onAddReservation(newRes);
    setShowCreateModal(false);
  };

  return (
    <div className="space-y-4 max-w-lg mx-auto pb-20">
      {/* HEADER BANNER - BENTO BLACK & PURPLE */}
      <div className="bg-slate-950 text-white rounded-3xl p-5 shadow-2xl flex items-center justify-between border border-purple-900/50 relative overflow-hidden">
        <div>
          <span className="text-[10px] bg-purple-600 text-white font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            Reservas Vixy
          </span>
          <h2 className="text-lg font-extrabold mt-1">Programa tu viaje a tiempo ⏰</h2>
          <p className="text-xs text-slate-300">Un conductor estará listo a la hora agendada.</p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="bg-purple-600 hover:bg-purple-500 text-white font-black p-3 rounded-2xl shadow-lg transition active:scale-95 flex items-center gap-1 text-xs whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>NUEVA RESERVA</span>
        </button>
      </div>

      {/* RESERVATIONS LIST */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Mis Viajes Agendados</h3>

        {reservations.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center text-slate-500 border border-slate-200 space-y-2">
            <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="font-extrabold text-sm text-slate-800">No tienes reservas programadas</p>
            <p className="text-xs">Agenda viajes para el aeropuerto, reuniones o compromisos futuros.</p>
          </div>
        ) : (
          reservations.map((res) => (
            <div key={res.id} className="bg-white rounded-3xl p-4 shadow-md border border-slate-200 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center font-bold text-sm">
                    {res.category === 'moto' ? '🏍️' : res.category === 'delivery' ? '📦' : '🚗'}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-xs text-slate-900 uppercase">
                      {res.category === 'moto' ? 'Moto Taxi Agendada' : res.category === 'delivery' ? 'Delivery Encomienda' : 'Auto Taxi Confort'}
                    </h4>
                    <span className="text-[10px] text-slate-400 font-mono">Agendado: {res.createdAt}</span>
                  </div>
                </div>

                <span className="bg-emerald-100 text-emerald-800 font-bold text-[10px] px-2.5 py-1 rounded-full flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Activo
                </span>
              </div>

              {/* DATE & TIME */}
              <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 font-bold text-indigo-900">
                  <Calendar className="w-4 h-4 text-indigo-600" />
                  <span>Fecha: {res.date}</span>
                </div>
                <div className="flex items-center gap-1.5 font-mono font-bold text-amber-700">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span>Hora: {res.time}</span>
                </div>
              </div>

              {/* ROUTE */}
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center gap-2 text-slate-700">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="font-medium truncate">{res.pickupAddress}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <Navigation className="w-3.5 h-3.5 text-red-600 shrink-0" />
                  <span className="font-medium truncate">{res.dropoffAddress}</span>
                </div>
              </div>

              {/* FOOTER & CANCEL */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-medium">Costo estimado</span>
                  <span className="font-mono font-bold text-amber-600 text-xs">
                    {currency === 'USD' ? `$${res.priceUsd.toFixed(2)} USD` : `${res.priceVes.toFixed(2)} Bs.`}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => onCancelReservation(res.id)}
                  className="text-xs text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1 p-2 rounded-xl hover:bg-rose-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Cancelar Reserva</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* CREATE RESERVATION MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[2500] bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 shadow-2xl w-full max-w-md space-y-4 text-slate-900 border border-slate-200 animate-in fade-in">
            <h3 className="font-extrabold text-base border-b border-slate-200 pb-2">Agendar Nuevo Servicio VeloX</h3>

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="font-bold block mb-1">Tipo de Vehículo:</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'moto', name: 'Moto Taxi' },
                    { id: 'auto', name: 'Auto Taxi' },
                    { id: 'delivery', name: 'Delivery' },
                  ].map((cat) => (
                    <button
                      type="button"
                      key={cat.id}
                      onClick={() => setCategory(cat.id as VehicleCategory)}
                      className={`p-2 rounded-xl font-bold border text-center ${
                        category === cat.id ? 'bg-amber-400 border-amber-500 text-slate-950' : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-bold block mb-1">Punto de Recogida:</label>
                <select
                  value={pickup}
                  onChange={(e) => setPickup(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 font-medium"
                >
                  {MOCK_LOCATIONS.map((loc, i) => (
                    <option key={i} value={loc.name}>{loc.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold block mb-1">Destino Final:</label>
                <select
                  value={dropoff}
                  onChange={(e) => setDropoff(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 font-medium"
                >
                  {MOCK_LOCATIONS.map((loc, i) => (
                    <option key={i} value={loc.name}>{loc.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold block mb-1">Fecha:</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold block mb-1">Hora:</label>
                  <input
                    type="time"
                    required
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 font-mono"
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 bg-slate-200 text-slate-800 font-bold py-2.5 rounded-xl"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="flex-[2] bg-amber-400 hover:bg-amber-500 text-slate-950 font-black py-2.5 rounded-xl shadow uppercase"
                >
                  CONFIRMAR RESERVA
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
