import React, { useState } from 'react';
import { Currency, TripRating } from '../types';
import { MOCK_TRIP_HISTORY, EXCHANGE_RATE_VES } from '../data/mockData';
import { History, Star, MapPin, Navigation, FileText, CheckCircle2, XCircle, Share2, MessageSquare, ChevronRight, X } from 'lucide-react';

interface TripHistoryViewProps {
  currency: Currency;
  onOpenSupportForTrip: (tripId: string) => void;
}

export const TripHistoryView: React.FC<TripHistoryViewProps> = ({
  currency,
  onOpenSupportForTrip,
}) => {
  const [selectedReceipt, setSelectedReceipt] = useState<any | null>(null);
  const [ratingModalTrip, setRatingModalTrip] = useState<any | null>(null);

  // Rating Modal Form state
  const [stars, setStars] = useState(5);
  const [comment, setComment] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [submittedRatings, setSubmittedRatings] = useState<Record<string, TripRating>>({});

  const availableTags = [
    'Excelente conducción 🚗',
    'Vehículo impecable ✨',
    'Llegó súper rápido ⚡',
    'Muy respetuoso 🤝',
    'Buena música / Clima 🎵'
  ];

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleSaveRating = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ratingModalTrip) return;

    const newRating: TripRating = {
      tripId: ratingModalTrip.id,
      driverId: 'drv_001',
      driverName: ratingModalTrip.driverName,
      stars,
      tags: selectedTags,
      comment,
      date: new Date().toISOString().substring(0, 10),
    };

    setSubmittedRatings(prev => ({ ...prev, [ratingModalTrip.id]: newRating }));
    setRatingModalTrip(null);
  };

  return (
    <div className="space-y-4 max-w-lg mx-auto pb-20">
      
      {/* HEADER */}
      <div className="bg-slate-900 text-white rounded-3xl p-5 shadow-xl border border-slate-800 flex items-center justify-between">
        <div>
          <span className="text-[10px] bg-amber-400 text-slate-950 font-bold px-2 py-0.5 rounded-full uppercase">
            Historial de Servicios
          </span>
          <h2 className="text-lg font-extrabold mt-1">Tus Viajes Pasados 📜</h2>
          <p className="text-xs text-slate-300">Consulta recibos detallados, facturación y calificaciones.</p>
        </div>
        <History className="w-9 h-9 text-amber-400 opacity-80 shrink-0" />
      </div>

      {/* TRIP LIST */}
      <div className="space-y-3">
        {MOCK_TRIP_HISTORY.map((trip) => {
          const ratingData = submittedRatings[trip.id] || {
            stars: trip.rating,
            comment: trip.comment,
          };

          return (
            <div key={trip.id} className="bg-white rounded-3xl p-4 shadow-md border border-slate-200 space-y-3">
              
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-2xl bg-slate-900 text-amber-400 flex items-center justify-center font-bold text-base shadow">
                    {trip.category === 'moto' ? '🏍️' : trip.category === 'delivery' ? '📦' : '🚗'}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-xs text-slate-900 uppercase">
                      {trip.category === 'moto' ? 'Moto Taxi VeloX' : trip.category === 'delivery' ? 'Delivery Encomienda' : 'Auto Taxi Confort'}
                    </h3>
                    <span className="text-[10px] text-slate-400 font-mono">{trip.date}</span>
                  </div>
                </div>

                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Completado
                </span>
              </div>

              {/* ROUTE SUMMARY */}
              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-2 text-slate-700">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="font-medium truncate">{trip.pickupAddress}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <Navigation className="w-3.5 h-3.5 text-red-600 shrink-0" />
                  <span className="font-medium truncate">{trip.dropoffAddress}</span>
                </div>
              </div>

              {/* DRIVER & RATING DISPLAY */}
              <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <img
                    src={trip.driverPhoto}
                    alt={trip.driverName}
                    className="w-8 h-8 rounded-full object-cover border border-slate-300"
                  />
                  <div>
                    <span className="font-bold text-slate-900 block leading-tight">{trip.driverName}</span>
                    <span className="text-[10px] text-slate-400 font-mono">Placa: {trip.driverPlate}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setRatingModalTrip(trip)}
                  className="bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold px-2.5 py-1 rounded-xl text-[11px] flex items-center gap-1"
                >
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  <span>{ratingData.stars} ★ Evaluar</span>
                </button>
              </div>

              {/* COST & ACTIONS */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-medium">Monto del Viaje</span>
                  <span className="font-mono font-black text-amber-600 text-xs">
                    {currency === 'USD' ? `$${trip.priceUsd.toFixed(2)} USD` : `${trip.priceVes.toFixed(2)} Bs.`}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onOpenSupportForTrip(trip.id)}
                    className="text-[11px] font-bold text-slate-600 hover:text-slate-900 px-2 py-1 rounded-lg border border-slate-200"
                  >
                    Objeto Perdido / Soporte
                  </button>

                  <button
                    onClick={() => setSelectedReceipt(trip)}
                    className="bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold px-3 py-1.5 rounded-xl flex items-center gap-1 shadow"
                  >
                    <FileText className="w-3.5 h-3.5 text-amber-400" />
                    <span>Ver Recibo</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* DETAILED RECEIPT DRAWER MODAL */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-[2500] bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 shadow-2xl w-full max-w-md space-y-4 text-slate-900 border border-slate-200 animate-in fade-in">
            
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-500" />
                <h3 className="font-extrabold text-base">Recibo Digital de Servicio</h3>
              </div>
              <button onClick={() => setSelectedReceipt(null)} className="p-1 rounded-full text-slate-400 hover:text-slate-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3 font-mono text-xs">
              <div className="flex justify-between text-slate-500 text-[10px]">
                <span>CÓDIGO: {selectedReceipt.id.toUpperCase()}</span>
                <span>{selectedReceipt.date}</span>
              </div>

              <div className="border-t border-dashed border-slate-300 pt-2 space-y-1">
                <div className="flex justify-between">
                  <span>Tarifa Base ({selectedReceipt.category}):</span>
                  <span>$1.50 USD</span>
                </div>
                <div className="flex justify-between">
                  <span>Distancia recorri. ({selectedReceipt.distanceKm} km):</span>
                  <span>${(selectedReceipt.priceUsd - 1.50).toFixed(2)} USD</span>
                </div>
                <div className="flex justify-between text-slate-500 text-[10px]">
                  <span>Equivalente en Bolívares:</span>
                  <span>{selectedReceipt.priceVes.toFixed(2)} Bs.</span>
                </div>
              </div>

              <div className="border-t-2 border-slate-900 pt-2 flex justify-between font-bold text-sm">
                <span>TOTAL PAGADO:</span>
                <span className="text-amber-600">${selectedReceipt.priceUsd.toFixed(2)} USD</span>
              </div>

              <div className="bg-white p-2 rounded-xl border border-slate-200 text-[11px] font-sans">
                <span className="text-slate-400 block font-semibold text-[10px]">MÉTODO UTILIZADO</span>
                <span className="font-bold uppercase text-slate-800">{selectedReceipt.paymentMethod.replace('_', ' ')}</span>
              </div>
            </div>

            <button
              onClick={() => setSelectedReceipt(null)}
              className="w-full bg-slate-900 text-white font-bold py-2.5 rounded-xl text-xs uppercase"
            >
              CERRAR RECIBO
            </button>
          </div>
        </div>
      )}

      {/* RATING & COMMENTS MODAL */}
      {ratingModalTrip && (
        <div className="fixed inset-0 z-[2500] bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 shadow-2xl w-full max-w-md space-y-4 text-slate-900 border border-slate-200 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h3 className="font-extrabold text-sm">Evaluar Experiencia de Viaje</h3>
              <button onClick={() => setRatingModalTrip(null)} className="p-1 text-slate-400 hover:text-slate-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRating} className="space-y-4">
              <div className="text-center space-y-2">
                <p className="text-xs font-bold text-slate-700">¿Cómo fue tu servicio con {ratingModalTrip.driverName}?</p>
                <div className="flex items-center justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setStars(s)}
                      className="p-1 transition transform active:scale-125"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          s <= stars ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* TAGS */}
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Destacar aspectos positivos:</label>
                <div className="flex flex-wrap gap-1.5">
                  {availableTags.map((t, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => toggleTag(t)}
                      className={`text-[10px] px-2.5 py-1 rounded-full font-bold border transition ${
                        selectedTags.includes(t)
                          ? 'bg-amber-400 border-amber-500 text-slate-950 shadow'
                          : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* COMMENTS */}
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Comentario o sugerencia:</label>
                <textarea
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Escribe tu opinión sobre el vehículo, puntualidad o trato..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-800 focus:ring-2 focus:ring-amber-400 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black py-3 rounded-2xl text-xs uppercase shadow-lg"
              >
                GUARDAR CALIFICACIÓN
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
