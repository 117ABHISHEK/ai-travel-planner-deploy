'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import {
  MapPin, Plus, Trash2, LogOut, LayoutDashboard,
  Compass, Map, Hotel, Backpack, DollarSign, Loader2, ChevronRight, X, Calendar, Tag, BookOpen, Compass as CompassIcon
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { tripsApi } from '@/utils/api';
import { Trip, TripSummary, DayItinerary, PackingItem, CreateTripFormData } from '@/types';
import CreateTripForm from '@/components/CreateTripForm';
import ItineraryCard from '@/components/ItineraryCard';
import PackingList from '@/components/PackingList';
import HotelCard from '@/components/HotelCard';
import BudgetLedger from '@/components/BudgetLedger';

type DashboardTab = 'itinerary' | 'hotels' | 'packing' | 'budget';

const budgetBadge: Record<string, string> = {
  Low: 'badge-low',
  Medium: 'badge-medium',
  High: 'badge-high',
};

export default function DashboardPage() {
  const { token, user, logout, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [trips, setTrips] = useState<TripSummary[]>([]);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [activeTab, setActiveTab] = useState<DashboardTab>('itinerary');
  const [listLoading, setListLoading] = useState(true);
  const [tripLoading, setTripLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showSidebar, setShowSidebar] = useState(false);

  // Guard: redirect unauthenticated users
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  const fetchTrips = useCallback(async () => {
    if (!token) return;
    setListLoading(true);
    try {
      const res = await tripsApi.list(token);
      setTrips(res.data);
    } catch {
      toast.error('Failed to load travel logs.');
    } finally {
      setListLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (isAuthenticated) fetchTrips();
  }, [isAuthenticated, fetchTrips]);

  const handleSelectTrip = async (id: string) => {
    if (!token) return;
    setTripLoading(true);
    setShowSidebar(false);
    setActiveTab('itinerary');
    try {
      const res = await tripsApi.get(id, token);
      setSelectedTrip(res.data);
    } catch {
      toast.error('Failed to load journal entry.');
    } finally {
      setTripLoading(false);
    }
  };

  const handleCreateTrip = async (data: CreateTripFormData) => {
    if (!token) return;
    setIsCreating(true);
    try {
      const res = await tripsApi.create(data, token);
      toast.success(`"${res.data.destination}" logbook created!`);
      setShowCreateModal(false);
      await fetchTrips();
      setSelectedTrip(res.data);
      setActiveTab('itinerary');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create trip log.';
      toast.error(msg);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteTrip = async (id: string) => {
    if (!token) return;
    setDeletingId(id);
    try {
      await tripsApi.delete(id, token);
      toast.success('Journal entry deleted.');
      if (selectedTrip?._id === id) setSelectedTrip(null);
      setTrips((prev) => prev.filter((t) => t._id !== id));
    } catch {
      toast.error('Failed to delete journal entry.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleUpdateItinerary = async (updated: DayItinerary[]) => {
    if (!selectedTrip || !token) return;
    setIsUpdating(true);
    try {
      const res = await tripsApi.update(selectedTrip._id, { itinerary: updated }, token);
      setSelectedTrip(res.data);
    } catch {
      toast.error('Failed to save journal modifications.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleTogglePacking = async (index: number) => {
    if (!selectedTrip || !token) return;
    const updatedList: PackingItem[] = selectedTrip.packingList.map((item, i) =>
      i === index ? { ...item, isPacked: !item.isPacked } : item
    );
    setIsUpdating(true);
    try {
      const res = await tripsApi.update(selectedTrip._id, { packingList: updatedList }, token);
      setSelectedTrip(res.data);
    } catch {
      toast.error('Failed to update checkoff list.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRegenerateDay = async (dayNumber: number, feedback: string) => {
    if (!selectedTrip || !token) return;
    const res = await tripsApi.regenerateDay(selectedTrip._id, dayNumber, feedback, token);
    setSelectedTrip(res.data);
    await fetchTrips();
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-parchment">
        <Compass className="w-10 h-10 text-terracotta animate-spin-compass" />
      </div>
    );
  }

  const tabs: { id: DashboardTab; label: string; icon: React.ReactNode }[] = [
    { id: 'itinerary', label: 'Itinerary', icon: <Map className="w-4 h-4" /> },
    { id: 'hotels', label: 'Lodging', icon: <Hotel className="w-4 h-4" /> },
    { id: 'packing', label: 'Packing Checklist', icon: <Backpack className="w-4 h-4 animate-sway-backpack origin-top" /> },
    { id: 'budget', label: 'Budget Ledger', icon: <DollarSign className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-parchment text-journal-dark">
      {/* ─── Topbar ─────────────────────────────────────────── */}
      <header className="glass sticky top-0 z-40 px-4 md:px-6 py-4">
        <div className="max-w-screen-xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Mobile sidebar toggle */}
            <button
              className="md:hidden btn-journal-ghost p-2"
              onClick={() => setShowSidebar((v) => !v)}
              aria-label="Toggle sidebar"
            >
              <LayoutDashboard className="w-5 h-5 text-terracotta" />
            </button>
            <div className="flex items-center gap-2 group cursor-pointer">
              <div className="w-8 h-8 rounded-lg bg-gradient-brand flex items-center justify-center shadow-journal-sm">
                <Compass className="w-4.5 h-4.5 text-white animate-spin-compass" />
              </div>
              <span className="font-serif font-black tracking-tight text-journal-dark hidden sm:block">
                wander<span className="text-terracotta">logue</span>
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-journal-dark/65 bg-sand px-3 py-1.5 rounded-lg border border-[#DECFC0] hidden sm:block">
              ✍️ {user?.email}
            </span>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-adventure text-sm py-2 px-4"
            >
              <Plus className="w-4 h-4" />
              <span>New Journal</span>
            </button>
            <button onClick={logout} className="btn-journal-ghost p-2 hover:text-terracotta" aria-label="Log out">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 max-w-screen-xl mx-auto w-full px-4 md:px-6 gap-6 py-6 relative">
        <div className="orb w-80 h-80 top-0 left-0" />
        <div className="orb w-80 h-80 bottom-0 right-0" />

        {/* ─── Sidebar ──────────────────────────────────────── */}
        <aside
          className={`
            fixed md:relative inset-0 z-30 md:z-auto
            w-72 md:w-72 shrink-0
            bg-parchment md:bg-transparent
            transition-transform duration-300
            ${showSidebar ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            flex flex-col gap-4 pt-20 md:pt-0 px-4 md:px-0 border-r md:border-r-0 border-[#DECFC0] md:border-transparent
          `}
        >
          {/* Mobile close */}
          <button
            className="md:hidden absolute top-4 right-4 btn-journal-ghost p-2"
            onClick={() => setShowSidebar(false)}
          >
            <X className="w-5 h-5 text-terracotta" />
          </button>

          <div className="flex items-center justify-between pb-2 border-b border-[#DECFC0]">
            <h2 className="text-xs font-bold text-journal-dark/50 uppercase tracking-widest flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-sage" />
              Journal Directory
            </h2>
            <span className="badge bg-sage-light text-sage border-sage/20 text-[10px] px-2 py-0.5 font-bold">
              {trips.length} entries
            </span>
          </div>

          {listLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-5 h-5 text-terracotta animate-spin" />
            </div>
          ) : trips.length === 0 ? (
            <div className="card p-6 text-center border-[#DECFC0] bg-sand">
              <MapPin className="w-8 h-8 text-sage/40 mx-auto mb-3" />
              <p className="text-sm font-semibold text-journal-dark/60 mb-4">Your journal is empty.</p>
              <button onClick={() => setShowCreateModal(true)} className="btn-adventure text-xs py-2 px-3">
                <Plus className="w-3.5 h-3.5" /> Plan Travel Log
              </button>
            </div>
          ) : (
            <div className="space-y-2.5 overflow-y-auto max-h-[calc(100vh-200px)] pr-1">
              {trips.map((trip) => (
                <div
                  key={trip._id}
                  className={`group rounded-xl border transition-all duration-200 cursor-pointer overflow-hidden relative ${
                    selectedTrip?._id === trip._id
                      ? 'border-terracotta bg-[#FFFDF9] shadow-journal-sm'
                      : 'border-[#EDE4DE] bg-sand hover:border-[#DECFC0]'
                  }`}
                  onClick={() => handleSelectTrip(trip._id)}
                >
                  {selectedTrip?._id === trip._id && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-terracotta" />
                  )}
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-serif font-black text-journal-dark text-sm truncate">{trip.destination}</p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <div className="flex items-center gap-1 text-xs font-semibold text-journal-dark/50">
                            <Calendar className="w-3 h-3 text-sage" />
                            {trip.durationDays}d
                          </div>
                          <span className={budgetBadge[trip.budgetTier]}>{trip.budgetTier}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDeleteTrip(trip._id); }}
                          disabled={deletingId === trip._id}
                          className="opacity-0 group-hover:opacity-100 btn-journal-danger p-1.5 transition-opacity"
                          aria-label="Delete trip log"
                        >
                          {deletingId === trip._id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <ChevronRight className={`w-4 h-4 transition-colors ${
                          selectedTrip?._id === trip._id ? 'text-terracotta' : 'text-slate-400'
                        }`} />
                      </div>
                    </div>
                    <p className="text-xs font-bold text-sage mt-2">
                      ${trip.estimatedBudget.total.toLocaleString()} budget
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </aside>

        {/* Mobile sidebar backdrop */}
        {showSidebar && (
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-20 md:hidden"
            onClick={() => setShowSidebar(false)}
          />
        )}

        {/* ─── Main content ──────────────────────────────────── */}
        <main className="flex-1 min-w-0 z-10 relative">
          {tripLoading ? (
            <div className="flex flex-col items-center justify-center h-64 gap-3 bg-sand rounded-2xl border border-[#DECFC0] p-8 shadow-journal-sm">
              <Loader2 className="w-8 h-8 text-terracotta animate-spin" />
              <p className="text-journal-dark/60 font-semibold text-sm">Translating journal entry…</p>
            </div>
          ) : !selectedTrip ? (
            /* Empty state */
            <div className="flex flex-col items-center justify-center h-full min-h-[450px] text-center gap-6 bg-sand rounded-2xl border border-[#DECFC0] p-8 shadow-journal relative">
              <div className="washi-tape" style={{ top: '-10px', left: '50%', transform: 'translateX(-50%) rotate(-1deg)', width: '90px' }} />
              
              <div className="w-20 h-20 rounded-full bg-gradient-brand flex items-center justify-center opacity-90 shadow-journal">
                <CompassIcon className="w-10 h-10 text-white animate-spin-compass" />
              </div>
              <div>
                <h2 className="text-3xl font-serif font-black text-journal-dark mb-2">Begin Your Journey Log</h2>
                <p className="text-journal-dark/60 font-medium max-w-sm mx-auto leading-relaxed">
                  Design a custom, AI-organized travel scrapbook. Tell us where your compass points next.
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn-adventure text-base px-8 py-4 shadow-journal"
              >
                <Plus className="w-5 h-5" />
                Start My First Log
              </button>
            </div>
          ) : (
            /* Trip detail */
            <div className="animate-fade-in space-y-6">
              {/* Trip header */}
              <div className="bg-sand rounded-2xl border border-[#DECFC0] p-6 shadow-journal-sm relative">
                <div className="washi-tape" style={{ top: '-8px', left: '20px' }} />
                
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <MapPin className="w-5 h-5 text-terracotta" />
                      <h1 className="text-2xl md:text-3xl font-serif font-black text-journal-dark leading-tight">
                        {selectedTrip.destination}
                      </h1>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <span className={budgetBadge[selectedTrip.budgetTier]}>
                        {selectedTrip.budgetTier}
                      </span>
                      <span className="flex items-center gap-1.5 text-xs font-bold text-journal-dark/50 bg-[#FAF6EE] border border-[#EDE4DE] px-2.5 py-1 rounded-full">
                        <Calendar className="w-3.5 h-3.5 text-sage" />
                        {selectedTrip.durationDays} days
                      </span>
                      {selectedTrip.interests.slice(0, 3).map((i) => (
                        <span key={i} className="flex items-center gap-1.5 text-xs font-bold text-journal-dark/50 bg-sage-light/30 px-2.5 py-1 rounded-full border border-sage/10">
                          <Tag className="w-3 h-3 text-sage" />
                          {i}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Journal Tabs */}
              <div className="flex gap-1.5 bg-[#EAE1D3] rounded-xl p-1 overflow-x-auto shadow-inner border border-[#DECFC0]">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-bold transition-all whitespace-nowrap flex-1 justify-center ${
                      activeTab === tab.id
                        ? 'bg-terracotta text-white shadow-journal-sm'
                        : 'text-journal-dark/60 hover:text-journal-dark hover:bg-sand/40'
                    }`}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab content */}
              <div className="animate-fade-in min-h-[300px]">
                {activeTab === 'itinerary' && (
                  <ItineraryCard
                    itinerary={selectedTrip.itinerary}
                    onRegenerateDay={handleRegenerateDay}
                    onUpdateItinerary={handleUpdateItinerary}
                    isUpdating={isUpdating}
                  />
                )}
                {activeTab === 'hotels' && (
                  <HotelCard hotels={selectedTrip.hotels} />
                )}
                {activeTab === 'packing' && (
                  <PackingList
                    packingList={selectedTrip.packingList}
                    onToggleItem={handleTogglePacking}
                    isUpdating={isUpdating}
                  />
                )}
                {activeTab === 'budget' && (
                  <BudgetLedger
                    budget={selectedTrip.estimatedBudget}
                    durationDays={selectedTrip.durationDays}
                  />
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ─── Create Trip Modal ──────────────────────────────── */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-journal-dark/40 backdrop-blur-sm"
            onClick={() => !isCreating && setShowCreateModal(false)}
          />
          <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto card border-[#DECFC0] p-6 md:p-8 animate-slide-up shadow-journal relative bg-sand">
            <div className="washi-tape" style={{ top: '-10px', left: '50%', transform: 'translateX(-50%) rotate(1.5deg)', width: '100px' }} />
            
            <div className="flex items-center justify-between mb-6 border-b border-[#EAE1D3] pb-4">
              <div>
                <h2 className="text-2xl font-serif font-black text-journal-dark">Start New Travel Log</h2>
                <p className="text-xs font-semibold text-journal-dark/50 mt-1">Our compass AI will draft your diary</p>
              </div>
              {!isCreating && (
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="btn-journal-ghost p-1.5 text-slate-400 hover:text-journal-dark"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
            <CreateTripForm onSubmit={handleCreateTrip} isLoading={isCreating} />
          </div>
        </div>
      )}
    </div>
  );
}
