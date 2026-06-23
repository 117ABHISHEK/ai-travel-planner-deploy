'use client';

import { useState, FormEvent } from 'react';
import { Compass, Calendar, DollarSign, Tag, Sparkles, Loader2, X } from 'lucide-react';
import { CreateTripFormData, BudgetTier } from '@/types';

const INTEREST_OPTIONS = [
  'History', 'Art & Culture', 'Food & Cuisine', 'Adventure', 'Nature & Wildlife',
  'Beach & Water', 'Shopping', 'Nightlife', 'Architecture', 'Photography',
  'Hiking', 'Local Experiences', 'Luxury', 'Budget Travel', 'Family-Friendly',
];

const BUDGET_OPTIONS: { value: BudgetTier; label: string; desc: string; color: string }[] = [
  { value: 'Low', label: '🎒 Budget Backpacker', desc: 'Hostels, local street food, free trails', color: 'border-sage bg-sage-light/20 text-sage' },
  { value: 'Medium', label: '✈️ Globetrotter', desc: '3-star guesthouses, casual bistros, paid landmarks', color: 'border-ochre bg-ochre-light/20 text-ochre' },
  { value: 'High', label: '💎 Premium Voyager', desc: '5-star resorts, fine dining, private tours', color: 'border-terracotta bg-terracotta-light/20 text-terracotta' },
];

interface Props {
  onSubmit: (data: CreateTripFormData) => Promise<void>;
  isLoading: boolean;
}

export default function CreateTripForm({ onSubmit, isLoading }: Props) {
  const [destination, setDestination] = useState('');
  const [durationDays, setDurationDays] = useState(5);
  const [budgetTier, setBudgetTier] = useState<BudgetTier>('Medium');
  const [interests, setInterests] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const toggleInterest = (interest: string) => {
    setInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!destination.trim()) newErrors.destination = 'Please enter a destination';
    else if (destination.trim().length < 2) newErrors.destination = 'Destination must be at least 2 characters';
    if (durationDays < 1 || durationDays > 30) newErrors.durationDays = 'Duration must be between 1 and 30 days';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit({ destination: destination.trim(), durationDays, budgetTier, interests });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Destination */}
      <div>
        <label htmlFor="destination" className="label text-journal-dark/80">
          <Compass className="inline w-4 h-4 mr-1.5 text-terracotta animate-spin-compass" />
          Where is your compass pointing?
        </label>
        <input
          id="destination"
          type="text"
          value={destination}
          onChange={(e) => { setDestination(e.target.value); setErrors((p) => ({ ...p, destination: '' })); }}
          className={`input ${errors.destination ? 'border-red-400 focus:ring-red-200' : 'border-[#DECFC0]'}`}
          placeholder="e.g. Kyoto, Japan or Patagonia, Chile"
          disabled={isLoading}
          maxLength={100}
        />
        {errors.destination && <p className="mt-1.5 text-xs text-red-500 font-semibold">{errors.destination}</p>}
      </div>

      {/* Duration */}
      <div>
        <label htmlFor="duration" className="label text-journal-dark/80">
          <Calendar className="inline w-4 h-4 mr-1.5 text-sage" />
          Duration: <span className="text-terracotta font-serif font-black">{durationDays} {durationDays === 1 ? 'day' : 'days'}</span>
        </label>
        <input
          id="duration"
          type="range"
          min={1}
          max={30}
          value={durationDays}
          onChange={(e) => setDurationDays(Number(e.target.value))}
          disabled={isLoading}
          className="w-full h-2 rounded-full appearance-none cursor-pointer bg-[#EAE1D3]"
          style={{
            background: `linear-gradient(to right, #C85C38 0%, #C85C38 ${((durationDays - 1) / 29) * 100}%, #EAE1D3 ${((durationDays - 1) / 29) * 100}%, #EAE1D3 100%)`
          }}
        />
        <div className="flex justify-between text-[10px] font-bold text-journal-dark/40 mt-1 uppercase tracking-wider">
          <span>1 day</span>
          <span>30 days</span>
        </div>
        {errors.durationDays && <p className="mt-1 text-xs text-red-500 font-semibold">{errors.durationDays}</p>}
      </div>

      {/* Budget Tier */}
      <div>
        <label className="label text-journal-dark/80">
          <DollarSign className="inline w-4 h-4 mr-1.5 text-ochre" />
          Spend Tier
        </label>
        <div className="grid grid-cols-1 gap-3">
          {BUDGET_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setBudgetTier(opt.value)}
              disabled={isLoading}
              className={`flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                budgetTier === opt.value
                  ? `${opt.color} border-opacity-100 shadow-journal-sm`
                  : 'border-[#EDE4DE] bg-sand hover:border-[#DECFC0]'
              }`}
            >
              <div className="flex-1">
                <p className="font-bold text-journal-dark text-sm">{opt.label}</p>
                <p className="text-xs text-journal-dark/60 mt-0.5 font-medium">{opt.desc}</p>
              </div>
              <div className={`w-4 h-4 rounded-full border-2 mt-0.5 shrink-0 flex items-center justify-center ${
                budgetTier === opt.value ? 'border-current' : 'border-[#DECFC0]'
              }`}>
                {budgetTier === opt.value && (
                  <div className="w-2 h-2 rounded-full bg-current" />
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Hobbies / Interests */}
      <div>
        <label className="label text-journal-dark/80">
          <Tag className="inline w-4 h-4 mr-1.5 text-sage" />
          Travel Hobbies
          <span className="text-journal-dark/40 font-semibold ml-1 text-xs">(optional)</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {INTEREST_OPTIONS.map((interest) => {
            const selected = interests.includes(interest);
            return (
              <button
                key={interest}
                type="button"
                onClick={() => toggleInterest(interest)}
                disabled={isLoading}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all duration-200 ${
                  selected
                    ? 'bg-terracotta-light border-terracotta text-terracotta'
                    : 'bg-sand border-[#EDE4DE] text-journal-dark/60 hover:border-[#DECFC0] hover:text-journal-dark'
                }`}
              >
                {selected && <X className="inline w-3 h-3 mr-1 -mt-0.5" />}
                {interest}
              </button>
            );
          })}
        </div>
        {interests.length > 0 && (
          <p className="text-[10px] uppercase font-bold text-journal-dark/45 mt-2 tracking-wider">{interests.length} custom filters active</p>
        )}
      </div>

      {/* Submit */}
      <button
        id="create-trip-submit"
        type="submit"
        disabled={isLoading}
        className="btn-adventure w-full py-4 text-base"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="animate-pulse">Gemini is drafting your scrapbook entries…</span>
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5" />
            Draft Travel Journal
          </>
        )}
      </button>

      {isLoading && (
        <p className="text-center text-xs font-semibold text-journal-dark/40">
          This takes about 10–25 seconds. Creating custom itinerary ledger tables…
        </p>
      )}
    </form>
  );
}
