import React, { useState } from 'react';
import { RideRequest, Currency } from '../types';
import { EXCHANGE_RATE_VES } from '../data/mockData';
import { CheckCircle, Star, MapPin, Navigation, Car, Bike, Package, ShieldCheck, Heart, Sparkles, Send, Receipt } from 'lucide-react';

interface TripCompletedModalProps {
  ride: RideRequest;
  currency: Currency;
  onFinishAndRate: (stars: number, comment: string, tags: string[]) => void;
}

export const TripCompletedModal: React.FC<TripCompletedModalProps> = ({
  ride,
  currency,
  onFinishAndRate,
}) => {
  const [stars, setStars] = useState(5);
  const [comment, setComment] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const driver = ride.driver;
  const vehicleEmoji = ride.category === 'moto' ? '🏍️' : ride.category === 'delivery' ? '📦' : '🚗';

  const tagsList = [
    'Excelente conducción 🚗',
    'Vehículo impecable ✨',
    'Muy puntual ⚡',
    'Trato amable 🤝',
    'Buena música / Clima 🎵'
  ];

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    setTimeout(() => {
      onFinishAndRate(stars, comment, selectedTags);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-[3000] bg-slate-950/85 backdrop-blur-md p-4 flex items-center justify-center animate-in fade-in">
      <div className="bg-slate-900 border-2 border-purple-500/80 rounded-3xl p-5 sm:p-6 max-w-sm w-full text-white shadow-2xl space-y-4 relative overflow-hidden">
        
        {/* CELEBRATION HEADER */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-purple-600/30 text-purple-400 rounded-3xl flex items-center justify-center mx-auto border border-purple-500/50 shadow-lg shadow-purple-900/50">
            <CheckCircle className="w-10 h-10 text-purple-400" />
          </div>
          <div>
            <span className="text-[10px] bg-purple-600 text-white font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              ¡Viaje Finalizado! 🏁
            </span>
            <h2 className="text-xl font-black text-white mt-1">Llegaste a tu destino</h2>
            <p className="text-xs text-slate-400">Gracias por viajar con Vixy Taxi Venezuela</p>
          </div>
        </div>

        {/* TRIP SUMMARY CARD / RECEIPT */}
        <div className="bg-slate-950/80 rounded-2xl p-3.5 border border-purple-900/40 space-y-2 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-purple-900/30">
            <span className="text-slate-400 font-semibold flex items-center gap-1">
              <Receipt className="w-3.5 h-3.5 text-purple-400" /> Recibo de Viaje:
            </span>
            <span className="font-mono font-extrabold text-purple-300">
              {currency === 'USD' ? `$${ride.priceUsd.toFixed(2)} USD` : `${ride.priceVes.toFixed(2)} Bs.`}
            </span>
          </div>

          <div className="space-y-1.5 pt-1 text-[11px]">
            <div className="flex items-start gap-2">
              <MapPin className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
              <span className="text-slate-300 truncate">{ride.pickupAddress}</span>
            </div>
            <div className="flex items-start gap-2">
              <Navigation className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <span className="text-slate-300 truncate">{ride.dropoffAddress}</span>
            </div>
          </div>

          {driver && (
            <div className="flex items-center gap-2.5 pt-2 border-t border-purple-900/30">
              <img src={driver.photoUrl} alt={driver.name} className="w-9 h-9 rounded-full object-cover border border-purple-400" />
              <div className="flex-1 min-w-0">
                <p className="font-extrabold text-white text-xs truncate">{driver.name} {driver.lastName}</p>
                <p className="text-[10px] text-slate-400">{vehicleEmoji} {driver.vehicleModel} • <span className="font-mono text-purple-300">{driver.vehiclePlate}</span></p>
              </div>
            </div>
          )}
        </div>

        {/* RATING FORM */}
        {!isSubmitted ? (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="text-center">
              <label className="text-xs font-extrabold text-slate-300 block mb-1">
                ¿Qué tal estuvo tu conductor?
              </label>
              
              {/* STAR SELECTOR */}
              <div className="flex justify-center gap-2 py-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStars(s)}
                    className="p-1 transition active:scale-125 focus:outline-none"
                  >
                    <Star
                      className={`w-7 h-7 ${
                        s <= stars ? 'text-amber-400 fill-amber-400' : 'text-slate-700'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* TAGS SELECTOR */}
            <div className="flex flex-wrap gap-1.5 justify-center">
              {tagsList.map((tag) => {
                const active = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-xl transition border ${
                      active
                        ? 'bg-purple-600 text-white border-purple-400'
                        : 'bg-slate-950 text-slate-400 border-purple-900/40 hover:text-white'
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>

            {/* COMMENT INPUT */}
            <input
              type="text"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Escribe un comentario opcional..."
              className="w-full bg-slate-950 border border-purple-900/50 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-purple-500 focus:outline-none"
            />

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-500 text-white font-extrabold py-3.5 px-4 rounded-2xl text-xs uppercase tracking-wider shadow-lg shadow-purple-900/60 transition active:scale-95 flex items-center justify-center gap-2"
            >
              <span>ENVIAR CALIFICACIÓN Y FINALIZAR</span>
              <Send className="w-4 h-4" />
            </button>
          </form>
        ) : (
          <div className="text-center py-4 space-y-2 animate-in fade-in">
            <Sparkles className="w-8 h-8 text-purple-400 mx-auto animate-bounce" />
            <h4 className="font-extrabold text-sm text-white">¡Gracias por tu valoración!</h4>
            <p className="text-xs text-slate-400">Tu opinión nos ayuda a mantener el estándar de calidad en Vixy.</p>
          </div>
        )}

      </div>
    </div>
  );
};
