'use client';

import { useState } from 'react';
import { DayItinerary, Activity, TimeOfDay } from '@/types';
import {
  Sun, Cloud, Moon, Sunset, RefreshCw, Plus, Trash2,
  DollarSign, Loader2, ChevronDown, ChevronUp, MessageSquare, Edit3
} from 'lucide-react';
import toast from 'react-hot-toast';

const timeIcons: Record<TimeOfDay, React.ReactNode> = {
  Morning: <Sun className="w-3.5 h-3.5 text-ochre" />,
  Afternoon: <Sunset className="w-3.5 h-3.5 text-terracotta" />,
  Evening: <Cloud className="w-3.5 h-3.5 text-sage" />,
  Night: <Moon className="w-3.5 h-3.5 text-[#466289]" />,
};

const timeBadgeColors: Record<TimeOfDay, string> = {
  Morning: 'bg-ochre-light text-ochre border-ochre/20',
  Afternoon: 'bg-terracotta-light text-terracotta border-terracotta/20',
  Evening: 'bg-sage-light text-sage border-sage/20',
  Night: 'bg-blue-50 text-[#466289] border-blue-100',
};

interface Props {
  itinerary: DayItinerary[];
  onRegenerateDay: (dayNumber: number, feedback: string) => Promise<void>;
  onUpdateItinerary: (updated: DayItinerary[]) => Promise<void>;
  isUpdating: boolean;
}

interface NewActivityForm {
  title: string;
  description: string;
  estimatedCostUSD: string;
  timeOfDay: TimeOfDay;
}

const emptyForm = (): NewActivityForm => ({
  title: '',
  description: '',
  estimatedCostUSD: '0',
  timeOfDay: 'Morning',
});

export default function ItineraryCard({
  itinerary,
  onRegenerateDay,
  onUpdateItinerary,
  isUpdating,
}: Props) {
  const [expandedDay, setExpandedDay] = useState<number | null>(1);
  const [regeneratingDay, setRegeneratingDay] = useState<number | null>(null);
  const [feedbacks, setFeedbacks] = useState<Record<number, string>>({});
  const [showAddForm, setShowAddForm] = useState<number | null>(null);
  const [newActivity, setNewActivity] = useState<NewActivityForm>(emptyForm());

  const handleRegenerate = async (dayNumber: number) => {
    const feedback = feedbacks[dayNumber]?.trim();
    if (!feedback) {
      toast.error('Please detail what activities to replace.');
      return;
    }
    setRegeneratingDay(dayNumber);
    try {
      await onRegenerateDay(dayNumber, feedback);
      setFeedbacks((p) => ({ ...p, [dayNumber]: '' }));
      toast.success(`Day ${dayNumber} regenerated via AI!`);
    } finally {
      setRegeneratingDay(null);
    }
  };

  const handleRemoveActivity = async (dayNumber: number, actIndex: number) => {
    const updated = itinerary.map((day) => {
      if (day.dayNumber !== dayNumber) return day;
      return { ...day, activities: day.activities.filter((_, i) => i !== actIndex) };
    });
    await onUpdateItinerary(updated);
    toast.success('Activity removed from timeline.');
  };

  const handleAddActivity = async (dayNumber: number) => {
    if (!newActivity.title.trim()) {
      toast.error('Activity title is required.');
      return;
    }
    const activity: Activity = {
      title: newActivity.title.trim(),
      description: newActivity.description.trim() || 'No description provided.',
      estimatedCostUSD: parseFloat(newActivity.estimatedCostUSD) || 0,
      timeOfDay: newActivity.timeOfDay,
    };
    const updated = itinerary.map((day) => {
      if (day.dayNumber !== dayNumber) return day;
      return { ...day, activities: [...day.activities, activity] };
    });
    await onUpdateItinerary(updated);
    setShowAddForm(null);
    setNewActivity(emptyForm());
    toast.success('New activity stitched to timeline!');
  };

  return (
    <div className="space-y-4">
      {itinerary.map((day) => {
        const isExpanded = expandedDay === day.dayNumber;
        const isRegenerating = regeneratingDay === day.dayNumber;
        const showAdd = showAddForm === day.dayNumber;

        return (
          <div key={day.dayNumber} className="card border-[#DECFC0] overflow-hidden shadow-journal-sm relative">
            {/* Day header */}
            <button
              className="w-full flex items-center justify-between p-5 hover:bg-[#FAF6EE]/50 transition-colors"
              onClick={() => setExpandedDay(isExpanded ? null : day.dayNumber)}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-brand flex items-center justify-center text-white font-serif font-black text-sm shrink-0 shadow-journal-sm">
                  {day.dayNumber}
                </div>
                <div className="text-left">
                  <p className="text-base font-serif font-black text-journal-dark">Day {day.dayNumber}</p>
                  <p className="text-xs font-semibold text-journal-dark/50">
                    {day.activities.length} {day.activities.length === 1 ? 'activity' : 'activities'} ·{' '}
                    ${day.activities.reduce((s, a) => s + a.estimatedCostUSD, 0).toFixed(0)} est. spend
                  </p>
                </div>
              </div>
              {isExpanded ? <ChevronUp className="w-4 h-4 text-journal-dark/40" /> : <ChevronDown className="w-4 h-4 text-journal-dark/40" />}
            </button>

            {/* Day content */}
            {isExpanded && (
              <div className="px-5 pb-5 border-t border-[#EAE1D3] bg-sand">
                {/* Activities timeline */}
                <div className="mt-5 space-y-4 relative pl-1">
                  {day.activities.length === 0 ? (
                    <p className="text-center text-sm font-semibold text-journal-dark/40 py-6">No entries for this day. Stitch one below!</p>
                  ) : (
                    day.activities.map((activity, idx) => (
                      <div key={idx} className="relative pl-8 group">
                        {/* Timeline dot stamp */}
                        <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-[#FAF6EE] border border-[#DECFC0] flex items-center justify-center shadow-journal-sm">
                          {timeIcons[activity.timeOfDay]}
                        </div>
                        {/* Timeline dotted stitch */}
                        {idx < day.activities.length - 1 && (
                          <div className="absolute left-[11px] top-7 bottom-0 w-px border-l border-dashed border-[#DECFC0]" />
                        )}

                        <div className="rounded-xl bg-[#FFFDF9] border border-[#EDE4DE] p-4 shadow-journal-sm transition-all hover:border-[#DECFC0] hover:shadow-journal relative">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className={`badge border text-[10px] font-bold ${timeBadgeColors[activity.timeOfDay]}`}>
                                  {activity.timeOfDay}
                                </span>
                                <div className="flex items-center gap-0.5 text-xs font-bold text-sage">
                                  <DollarSign className="w-3.5 h-3.5" />
                                  {activity.estimatedCostUSD === 0 ? 'Free Entry' : `$${activity.estimatedCostUSD}`}
                                </div>
                              </div>
                              <h4 className="font-serif font-bold text-journal-dark text-sm leading-snug">{activity.title}</h4>
                              <p className="text-xs text-journal-dark/65 mt-1.5 leading-relaxed font-medium">{activity.description}</p>
                            </div>
                            <button
                              onClick={() => handleRemoveActivity(day.dayNumber, idx)}
                              disabled={isUpdating}
                              className="opacity-0 group-hover:opacity-100 btn-journal-danger p-2 text-xs shrink-0 transition-opacity"
                              aria-label="Remove activity"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Add activity form styled as note sheet */}
                {showAdd ? (
                  <div className="mt-5 rounded-xl border border-sage/20 bg-sage-light/20 p-5 space-y-3 shadow-journal-sm">
                    <p className="text-sm font-bold text-sage flex items-center gap-1">
                      <Edit3 className="w-4 h-4" />
                      Stitch New Activity
                    </p>
                    <input
                      type="text"
                      className="input text-sm py-2 border-[#DECFC0]"
                      placeholder="What is the plan? *"
                      value={newActivity.title}
                      onChange={(e) => setNewActivity((p) => ({ ...p, title: e.target.value }))}
                    />
                    <textarea
                      className="input text-sm py-2 border-[#DECFC0] resize-none"
                      rows={2}
                      placeholder="Short description, transport links, sights"
                      value={newActivity.description}
                      onChange={(e) => setNewActivity((p) => ({ ...p, description: e.target.value }))}
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] uppercase font-bold text-journal-dark/50 mb-1 block">Time Slot</label>
                        <select
                          className="input text-sm py-2 border-[#DECFC0] font-semibold"
                          value={newActivity.timeOfDay}
                          onChange={(e) => setNewActivity((p) => ({ ...p, timeOfDay: e.target.value as TimeOfDay }))}
                        >
                          {(['Morning', 'Afternoon', 'Evening', 'Night'] as TimeOfDay[]).map((t) => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-bold text-journal-dark/50 mb-1 block">Est. Cost (USD)</label>
                        <input
                          type="number"
                          min={0}
                          className="input text-sm py-2 border-[#DECFC0]"
                          value={newActivity.estimatedCostUSD}
                          onChange={(e) => setNewActivity((p) => ({ ...p, estimatedCostUSD: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => handleAddActivity(day.dayNumber)}
                        disabled={isUpdating}
                        className="btn-adventure py-2 px-4 text-sm flex-1"
                      >
                        {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Stitch To Log'}
                      </button>
                      <button
                        onClick={() => { setShowAddForm(null); setNewActivity(emptyForm()); }}
                        className="btn-journal-ghost py-2 px-4 text-sm font-semibold"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowAddForm(day.dayNumber)}
                    className="mt-5 w-full btn-journal-ghost text-sm border-2 border-dashed border-[#DECFC0] rounded-xl py-3 hover:border-terracotta hover:bg-[#FFFDF9]/60 font-bold"
                  >
                    <Plus className="w-4 h-4 text-terracotta" />
                    Stitch Custom Activity
                  </button>
                )}

                {/* AI Regenerate memo box */}
                <div className="mt-5 rounded-xl border border-[#EDE4DE] bg-[#FAF6EE]/70 p-4">
                  <p className="text-xs font-bold text-journal-dark/55 mb-2 flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-terracotta" />
                    AI Regenerate Day {day.dayNumber}
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      className="input text-sm py-2 border-[#DECFC0] flex-1"
                      placeholder={`e.g. "more history museums" or "nature hikes and viewpoint parks"`}
                      value={feedbacks[day.dayNumber] || ''}
                      onChange={(e) =>
                        setFeedbacks((p) => ({ ...p, [day.dayNumber]: e.target.value }))
                      }
                      onKeyDown={(e) => e.key === 'Enter' && handleRegenerate(day.dayNumber)}
                      disabled={isRegenerating || isUpdating}
                    />
                    <button
                      onClick={() => handleRegenerate(day.dayNumber)}
                      disabled={isRegenerating || isUpdating || !feedbacks[day.dayNumber]?.trim()}
                      className="btn-journal-secondary py-2 px-3 text-sm shrink-0 bg-[#FFFDF9] hover:bg-[#FAF6EE]"
                      aria-label={`Regenerate day ${day.dayNumber}`}
                    >
                      {isRegenerating ? (
                        <Loader2 className="w-4 h-4 animate-spin text-terracotta" />
                      ) : (
                        <RefreshCw className="w-4 h-4 text-sage" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
