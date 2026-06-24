'use client';

import { EstimatedBudget } from '@/types';
import { DollarSign, Plane, Hotel, UtensilsCrossed, Ticket } from 'lucide-react';

interface Props {
  budget: EstimatedBudget;
  durationDays: number;
}

const budgetCategories = [
  { key: 'transport' as keyof EstimatedBudget, label: 'Transportation & Flights', icon: Plane, color: 'bg-sage', border: 'border-sage/20', bg: 'bg-sage-light/30', textColor: 'text-sage' },
  { key: 'accommodation' as keyof EstimatedBudget, label: 'Hotel & Lodging', icon: Hotel, color: 'bg-terracotta', border: 'border-terracotta/20', bg: 'bg-terracotta-light/30', textColor: 'text-terracotta' },
  { key: 'food' as keyof EstimatedBudget, label: 'Meals & Dining', icon: UtensilsCrossed, color: 'bg-ochre', border: 'border-ochre/20', bg: 'bg-ochre-light/30', textColor: 'text-ochre' },
  { key: 'activities' as keyof EstimatedBudget, label: 'Sightseeing & Passes', icon: Ticket, color: 'bg-sage', border: 'border-sage/20', bg: 'bg-sage-light/30', textColor: 'text-sage' },
];

export default function BudgetLedger({ budget, durationDays }: Props) {
  const perDay = durationDays > 0 ? Math.round(budget.total / durationDays) : 0;

  return (
    <div className="space-y-4">
      {/* Total Card */}
      <div className="card border-[#DECFC0] p-6 text-center relative bg-sand shadow-journal-sm">
        <div className="washi-tape" style={{ top: '-8px', left: '50%', transform: 'translateX(-50%) rotate(1deg)', width: '80px' }} />
        
        <div className="relative">
          <DollarSign className="w-8 h-8 text-terracotta mx-auto mb-1 animate-wobble-plane" />
          <p className="text-journal-dark/50 text-xs font-bold uppercase tracking-wider mb-1">Estimated Total Spend</p>
          <p className="text-4xl md:text-5xl font-serif font-black text-journal-dark">
            ${budget.total.toLocaleString()}
          </p>
          <p className="text-journal-dark/60 text-sm mt-2.5 font-semibold">
            Average budget ≈ <span className="text-terracotta font-serif font-black text-base">${perDay}/day</span> per person
          </p>
        </div>
      </div>

      {/* Breakdown ledger sheet */}
      <div className="card border-[#DECFC0] p-5 space-y-5 bg-sand shadow-journal-sm relative">
        <div className="washi-tape" style={{ top: '-8px', left: '20px' }} />
        
        <h3 className="text-xs font-bold text-journal-dark/50 uppercase tracking-widest border-b border-[#EAE1D3] pb-3">Travel Budget Ledger</h3>
        
        <div className="space-y-4">
          {budgetCategories.map(({ key, label, icon: Icon, color, border, bg, textColor }) => {
            const value = budget[key] as number;
            const pct = budget.total > 0 ? Math.round((value / budget.total) * 100) : 0;

            return (
              <div key={key} className="group">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-lg ${bg} border ${border} flex items-center justify-center`}>
                      <Icon className={`w-4 h-4 ${textColor}`} />
                    </div>
                    <span className="text-sm font-semibold text-journal-dark/80">{label}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-journal-dark/40">{pct}%</span>
                    <span className="text-sm font-serif font-black text-journal-dark">${value.toLocaleString()}</span>
                  </div>
                </div>
                <div className="h-2 rounded-full bg-[#EAE1D3] overflow-hidden">
                  <div
                    className={`h-full rounded-full ${color} transition-all duration-700`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Per-person per-day note */}
      <p className="text-[10px] font-bold text-journal-dark/40 text-center uppercase tracking-wider pt-2">
        All calculations in USD. Estimates customized using AI market pricing.
      </p>
    </div>
  );
}
