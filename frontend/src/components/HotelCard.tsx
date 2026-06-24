'use client';

import { Hotel } from '@/types';
import { Star, Building2 } from 'lucide-react';

const tierStyles: Record<Hotel['tier'], { badge: string; bg: string; border: string; accentColor: string }> = {
  Budget: {
    badge: 'bg-sage-light text-sage border-sage/20',
    bg: 'bg-sage-light/20',
    border: 'border-sage/25',
    accentColor: 'text-sage',
  },
  'Mid-range': {
    badge: 'bg-ochre-light text-ochre border-ochre/20',
    bg: 'bg-ochre-light/20',
    border: 'border-ochre/25',
    accentColor: 'text-ochre',
  },
  Luxury: {
    badge: 'bg-terracotta-light text-terracotta border-terracotta/20',
    bg: 'bg-terracotta-light/20',
    border: 'border-terracotta/25',
    accentColor: 'text-terracotta',
  },
};

interface Props {
  hotels: Hotel[];
}

export default function HotelCard({ hotels }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {hotels.map((hotel, idx) => {
        const styles = tierStyles[hotel.tier];
        return (
          <div
            key={idx}
            className={`rounded-2xl border-2 p-5 transition-all duration-300 hover:translate-y-[-2px] bg-sand hover:shadow-journal relative flex flex-col justify-between ${styles.border}`}
          >
            <div className="washi-tape" style={{ top: '-10px', left: '15px', width: '55px', height: '18px' }} />

            <div>
              <div className="flex items-start justify-between mb-5 border-b border-[#EAE1D3] pb-3">
                <div className={`w-10 h-10 rounded-xl ${styles.bg} flex items-center justify-center border border-current ${styles.accentColor}`}>
                  <Building2 className="w-5 h-5" />
                </div>
                <span className={`badge border text-[10px] font-bold ${styles.badge}`}>{hotel.tier}</span>
              </div>

              <h3 className="font-serif font-black text-journal-dark text-base mb-1.5 leading-snug">{hotel.name}</h3>

              {/* Star rating */}
              <div className="flex items-center gap-0.5 mb-5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-3.5 h-3.5 ${
                      star <= Math.round(hotel.rating)
                        ? 'text-ochre fill-ochre'
                        : 'text-slate-200 fill-slate-100'
                    }`}
                  />
                ))}
                <span className="text-xs font-bold text-journal-dark/50 ml-1.5">{hotel.rating.toFixed(1)} rating</span>
              </div>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-1 mt-auto border-t border-[#EAE1D3] pt-3">
              <span className="text-2xl font-serif font-black text-journal-dark">
                ${hotel.estimatedCostNightUSD}
              </span>
              <span className="text-xs font-bold text-journal-dark/50 uppercase tracking-wider">/ night est.</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
