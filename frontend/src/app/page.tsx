'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  MapPin, Compass, ShieldCheck, LayoutDashboard,
  ArrowRight, Globe, Backpack, Hotel, DollarSign,
  Palmtree, Map, Navigation, Heart
} from 'lucide-react';

const features = [
  {
    icon: Compass,
    title: 'AI-Powered Itineraries',
    desc: 'Gemini generates day-by-day plans with realistic local costs, historical insights, and activities customized to your travel style.',
    color: 'text-terracotta',
    bg: 'bg-terracotta-light',
    border: 'border-terracotta/20',
    iconClass: 'hover:rotate-45 transition-transform duration-500',
  },
  {
    icon: Hotel,
    title: 'Hand-picked Lodging',
    desc: 'Get curated hotel suggestions across Budget, Mid-range, and Luxury tiers with live-market pricing estimates for your destination.',
    color: 'text-sage',
    bg: 'bg-sage-light',
    border: 'border-sage/20',
    iconClass: 'group-hover:scale-110 transition-transform duration-300',
  },
  {
    icon: DollarSign,
    title: 'Travel Ledger & Budgeting',
    desc: 'Detailed cost estimations across transportation, hotels, dining, and sightseeing before you pack a single bag.',
    color: 'text-ochre',
    bg: 'bg-ochre-light',
    border: 'border-ochre/20',
    iconClass: 'group-hover:translate-y-[-2px] transition-transform',
  },
  {
    icon: Backpack,
    title: 'Smart Packing Companion',
    desc: 'Weather-aware, destination-specific packing recommendations based on seasonal climate (like adapters for Japan or rain shells for Iceland).',
    color: 'text-terracotta',
    bg: 'bg-terracotta-light',
    border: 'border-terracotta/20',
    iconClass: 'animate-sway-backpack origin-top',
  },
  {
    icon: Globe,
    title: 'Flexible Day Regeneration',
    desc: 'Change of heart? Input direct feedback like "more cozy coffee shops" or "nature trails" to replace a single day instantly.',
    color: 'text-sage',
    bg: 'bg-sage-light',
    border: 'border-sage/20',
    iconClass: 'group-hover:rotate-90 transition-transform duration-500',
  },
  {
    icon: ShieldCheck,
    title: 'Private Travel Journals',
    desc: 'Your plans belong to you. Trips are secured and private to your account using industry-standard token encryption.',
    color: 'text-ochre',
    bg: 'bg-ochre-light',
    border: 'border-ochre/20',
    iconClass: 'group-hover:scale-105 transition-transform',
  },
];

const steps = [
  { num: '01', title: 'Plot Your Destination', desc: 'Type in any city, country, or hidden corner of the globe.' },
  { num: '02', title: 'Customize Hobbies & Budget', desc: 'Select duration, target spend, and key interests (food, hiking, photography).' },
  { num: '03', title: 'Review Your Scrapbook', desc: 'Our Gemini-powered planner details hotels, budget limits, checklists, and timelines.' },
  { num: '04', title: 'Adapt & Embark', desc: 'Regenerate specific days, check off packing items, and head off on your adventure.' },
];

export default function HomePage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) return null;

  return (
    <div className="min-h-screen overflow-x-hidden bg-parchment text-journal-dark">
      {/* ─── Nav ─────────────────────────────────────────── */}
      <nav className="glass sticky top-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 group cursor-pointer">
            <div className="w-9 h-9 rounded-xl bg-gradient-brand flex items-center justify-center shadow-journal-sm transition-transform group-hover:scale-105">
              <Compass className="w-5 h-5 text-white group-hover:rotate-180 transition-transform duration-700" />
            </div>
            <span className="text-xl font-serif font-black tracking-tight text-journal-dark">
              wander<span className="text-terracotta">logue</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="btn-ghost text-sm font-semibold hover:text-terracotta">
              Sign In
            </Link>
            <Link href="/register" className="btn-adventure text-sm py-2.5 px-5">
              Create Journal
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── Hero ─────────────────────────────────────────── */}
      <section className="relative px-6 pt-20 pb-28 text-center overflow-hidden">
        {/* Decorative elements to give a human journal/scrapbook feel */}
        <div className="absolute top-10 left-10 opacity-10 hidden lg:block pointer-events-none">
          <Map className="w-40 h-40 text-sage" />
        </div>
        <div className="absolute bottom-10 right-10 opacity-10 hidden lg:block pointer-events-none">
          <Navigation className="w-32 h-32 text-terracotta" />
        </div>
        <div className="orb w-96 h-96 top-0 left-1/4" />
        <div className="orb w-80 h-80 top-20 right-1/4" />

        <div className="relative max-w-4xl mx-auto animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-sage/20 bg-sage-light text-sage text-xs font-semibold mb-8 shadow-journal-sm">
            <Compass className="w-3.5 h-3.5 animate-spin-compass" />
            Your Intelligent Travel Companion
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-black text-journal-dark mb-6 leading-tight tracking-tight">
            Craft your next adventure,<br />
            <span className="gradient-text">one page at a time.</span>
          </h1>

          <p className="text-lg md:text-xl text-journal-dark/70 mb-10 max-w-2xl mx-auto leading-relaxed font-medium">
            Plan custom travel itineraries in seconds. Day-by-day routes, cozy lodgings,
            realistic ledger budgets, and personalized packing lists — formatted as a digital travel log.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register" className="btn-adventure text-base px-8 py-4 w-full sm:w-auto">
              Start Your Plan
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/login" className="btn-journal-secondary text-base px-8 py-4 w-full sm:w-auto">
              <LayoutDashboard className="w-5 h-5 text-sage" />
              Go to Journals
            </Link>
          </div>
        </div>

        {/* Polaroid-style Preview Card */}
        <div className="relative mt-20 max-w-3xl mx-auto animate-slide-up">
          <div className="washi-tape" style={{ left: '40px' }} />
          <div className="washi-tape" style={{ right: '40px', left: 'auto', transform: 'rotate(12deg)' }} />
          <div className="card p-6 md:p-8 text-left border-[#DECFC0] shadow-journal relative">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 border-b border-[#EAE1D3] pb-4">
              <div>
                <span className="text-xs uppercase font-bold tracking-widest text-terracotta">Featured Logbook Entry</span>
                <h3 className="text-2xl font-serif font-black text-journal-dark mt-1 flex items-center gap-2">
                  🗼 Tokyo & Kyoto, Japan
                </h3>
                <p className="text-xs font-semibold text-journal-dark/60 mt-1">7 Days · Culture, Food & Hiking</p>
              </div>
              <span className="badge-medium text-xs font-bold px-3 py-1 self-start sm:self-auto">🎒 Mid-Range</span>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              {[
                { label: 'Transport', val: '$520', color: 'bg-sage-light text-sage border-sage/20' },
                { label: 'Lodging', val: '$980', color: 'bg-terracotta-light text-terracotta border-terracotta/20' },
                { label: 'Dining', val: '$450', color: 'bg-ochre-light text-ochre border-ochre/20' },
                { label: 'Sightseeing', val: '$320', color: 'bg-sage-light text-sage border-sage/20' },
              ].map((item) => (
                <div key={item.label} className={`rounded-xl border p-3 text-center ${item.color}`}>
                  <p className="text-xs font-bold uppercase tracking-wider opacity-80">{item.label}</p>
                  <p className="text-lg font-serif font-black mt-1">{item.val}</p>
                </div>
              ))}
            </div>

            <div className="space-y-3.5 border-t border-[#EAE1D3] pt-4">
              {[
                { time: 'Morning', act: 'Explore the historic Senso-ji Temple in Asakusa & enjoy traditional matcha tea.', cost: '$12' },
                { time: 'Afternoon', act: 'Stroll Shinjuku Gyoen National Garden & visit Harajuku Street vendors.', cost: '$8' },
                { time: 'Evening', act: 'Watch the sunset over Shibuya Crossing & dine at a cozy Izakaya alley.', cost: '$35' },
              ].map((a) => (
                <div key={a.act} className="flex items-start gap-4 text-sm">
                  <span className="w-20 text-terracotta text-xs font-bold tracking-wider uppercase shrink-0 pt-0.5">{a.time}</span>
                  <span className="text-journal-dark/80 flex-1 font-medium leading-relaxed">{a.act}</span>
                  <span className="text-sage text-xs font-bold shrink-0">{a.cost}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Features ─────────────────────────────────────── */}
      <section className="px-6 py-24 max-w-7xl mx-auto border-t border-[#EAE1D3]">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-serif font-black text-journal-dark mb-4">Every detail, naturally arranged</h2>
          <p className="text-journal-dark/60 max-w-xl mx-auto font-medium">
            A comprehensive travel system designed to feel like your own handwritten notes, backed by advanced intelligence.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <div key={f.title} className="card-hover p-6 border-[#EDE4DE] bg-sand flex flex-col justify-between group">
              <div>
                <div className={`w-12 h-12 rounded-xl ${f.bg} flex items-center justify-center mb-6 border ${f.border}`}>
                  <f.icon className={`w-6 h-6 ${f.color} ${f.iconClass}`} />
                </div>
                <h3 className="text-xl font-serif font-black text-journal-dark mb-2.5">{f.title}</h3>
                <p className="text-journal-dark/70 text-sm leading-relaxed font-medium">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── How it works ─────────────────────────────────── */}
      <section className="px-6 py-24 max-w-4xl mx-auto border-t border-[#EAE1D3]">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-serif font-black text-journal-dark mb-4">Start your scrapbook</h2>
          <p className="text-journal-dark/60 font-medium">Four simple steps from home to your next stamp.</p>
        </div>
        <div className="space-y-12 relative">
          <div className="absolute left-6 top-6 bottom-6 w-0.5 border-l border-dashed border-[#DECFC0] hidden sm:block" />
          {steps.map((s, i) => (
            <div key={s.num} className="flex flex-col sm:flex-row gap-6 items-start relative z-10">
              <div className="shrink-0 w-12 h-12 rounded-full bg-gradient-brand flex items-center justify-center text-white font-serif font-bold text-lg shadow-journal-sm">
                {s.num}
              </div>
              <div className="pt-2">
                <h3 className="text-xl font-serif font-black text-journal-dark mb-1.5">{s.title}</h3>
                <p className="text-journal-dark/70 text-base font-medium leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── CTA ──────────────────────────────────────────── */}
      <section className="px-6 py-24 text-center border-t border-[#EAE1D3]">
        <div className="max-w-2xl mx-auto card p-10 md:p-14 border-[#DECFC0] shadow-journal bg-sand relative">
          <div className="washi-tape" style={{ top: '-10px', left: '50%', transform: 'translateX(-50%) rotate(2deg)' }} />
          <div className="relative">
            <h2 className="text-3xl md:text-5xl font-serif font-black text-journal-dark mb-4">
              Where to next?
            </h2>
            <p className="text-journal-dark/60 mb-10 font-medium max-w-md mx-auto">
              Join thousands of travelers who plan custom, budget-smart journeys with wanderlogue.
            </p>
            <Link href="/register" className="btn-adventure text-lg px-10 py-4.5 w-full sm:w-auto">
              Create Your Journal
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Footer ───────────────────────────────────────── */}
      <footer className="px-6 py-12 border-t border-[#EAE1D3] text-center text-journal-dark/60 text-sm bg-sand">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Compass className="w-5 h-5 text-terracotta animate-spin-compass" />
          <span className="font-serif font-black text-base text-journal-dark tracking-tight">
            wander<span className="text-terracotta">logue</span>
          </span>
        </div>
        <p className="font-semibold text-xs text-journal-dark/50">
          Built with Next.js, Express, MongoDB & Google Gemini AI.
        </p>
        <p className="mt-1 flex items-center justify-center gap-1 text-xs text-journal-dark/40">
          Made with <Heart className="w-3 h-3 text-red-500 fill-red-500" /> for travelers worldwide.
        </p>
      </footer>
    </div>
  );
}
