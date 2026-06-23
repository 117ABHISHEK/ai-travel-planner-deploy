'use client';

import { useState } from 'react';
import { PackingItem, PackingCategory } from '@/types';
import { Package, FileText, Shirt, Wrench, MoreHorizontal, CheckCircle2, Circle } from 'lucide-react';

const categoryIcons: Record<PackingCategory, React.ReactNode> = {
  Documents: <FileText className="w-4 h-4 text-terracotta" />,
  Clothing: <Shirt className="w-4 h-4 text-sage" />,
  Gear: <Wrench className="w-4 h-4 text-ochre" />,
  Other: <MoreHorizontal className="w-4 h-4 text-journal-dark/50" />,
};

const categoryColors: Record<PackingCategory, string> = {
  Documents: 'text-terracotta border-terracotta/20 bg-terracotta-light',
  Clothing: 'text-sage border-sage/20 bg-sage-light',
  Gear: 'text-ochre border-ochre/20 bg-ochre-light',
  Other: 'text-journal-dark/60 border-[#DECFC0]/40 bg-[#FAF6EE]',
};

interface Props {
  packingList: PackingItem[];
  onToggleItem: (index: number) => Promise<void>;
  isUpdating: boolean;
}

export default function PackingList({ packingList, onToggleItem, isUpdating }: Props) {
  const [activeCategory, setActiveCategory] = useState<PackingCategory | 'All'>('All');

  const categories: PackingCategory[] = ['Documents', 'Clothing', 'Gear', 'Other'];

  const grouped = categories.reduce<Record<PackingCategory, PackingItem[]>>(
    (acc, cat) => {
      acc[cat] = packingList.filter((item) => item.category === cat);
      return acc;
    },
    { Documents: [], Clothing: [], Gear: [], Other: [] }
  );

  const packedCount = packingList.filter((i) => i.isPacked).length;
  const total = packingList.length;
  const progress = total > 0 ? Math.round((packedCount / total) * 100) : 0;

  const filteredItems =
    activeCategory === 'All' ? packingList : grouped[activeCategory];

  return (
    <div className="space-y-4">
      {/* Progress Card */}
      <div className="card border-[#DECFC0] p-5 shadow-journal-sm relative bg-sand">
        <div className="washi-tape" style={{ top: '-8px', left: '15px' }} />
        
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-terracotta animate-sway-backpack origin-top" />
            <span className="font-serif font-black text-journal-dark">Checklist Progress</span>
          </div>
          <span className="text-xs font-black uppercase text-terracotta bg-terracotta-light border border-terracotta/20 px-2 py-0.5 rounded">
            {packedCount}/{total} packed
          </span>
        </div>
        <div className="h-2.5 rounded-full bg-[#EAE1D3] overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-brand transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-[10px] font-bold text-journal-dark/45 mt-2 uppercase tracking-wider">{progress}% packed and ready</p>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setActiveCategory('All')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
            activeCategory === 'All'
              ? 'bg-terracotta-light border-terracotta text-terracotta'
              : 'bg-sand border-[#EDE4DE] text-journal-dark/60 hover:border-[#DECFC0]'
          }`}
        >
          All ({total})
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
              activeCategory === cat
                ? `${categoryColors[cat]} border-opacity-100`
                : 'bg-sand border-[#EDE4DE] text-journal-dark/60 hover:border-[#DECFC0]'
            }`}
          >
            {categoryIcons[cat]}
            {cat} ({grouped[cat].length})
          </button>
        ))}
      </div>

      {/* Packing items ledger */}
      <div className="card border-[#DECFC0] overflow-hidden bg-sand shadow-journal-sm">
        {filteredItems.length === 0 ? (
          <p className="text-center text-journal-dark/40 font-semibold text-sm py-8">No checklist items in this category.</p>
        ) : (
          <div className="divide-y divide-[#EDE4DE]">
            {filteredItems.map((item, displayIdx) => {
              const realIndex = packingList.findIndex(
                (p) => p.item === item.item && p.category === item.category
              );
              return (
                <button
                  key={`${item.category}-${item.item}-${displayIdx}`}
                  onClick={() => !isUpdating && onToggleItem(realIndex)}
                  disabled={isUpdating}
                  className={`w-full flex items-center gap-4 px-5 py-4 text-left transition-all duration-200 hover:bg-[#FAF6EE]/50 ${
                    item.isPacked ? 'opacity-60 bg-[#FAF6EE]/30' : ''
                  }`}
                >
                  <div className="shrink-0">
                    {item.isPacked ? (
                      <CheckCircle2 className="w-5.5 h-5.5 text-sage fill-sage-light" />
                    ) : (
                      <Circle className="w-5.5 h-5.5 text-[#DECFC0] hover:text-terracotta transition-colors" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span
                      className={`text-sm font-semibold transition-all ${
                        item.isPacked ? 'line-through text-journal-dark/40' : 'text-journal-dark'
                      }`}
                    >
                      {item.item}
                    </span>
                  </div>
                  <div className={`badge border text-[10px] font-bold ${categoryColors[item.category]}`}>
                    <span className="shrink-0">{categoryIcons[item.category]}</span>
                    <span className="ml-1 hidden sm:inline">{item.category}</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {progress === 100 && total > 0 && (
        <div className="card p-5 border-sage/20 bg-sage-light/35 text-center shadow-journal-sm relative">
          <div className="washi-tape" style={{ top: '-10px', left: '50%', transform: 'translateX(-50%) rotate(-1deg)', width: '80px' }} />
          <CheckCircle2 className="w-8 h-8 text-sage mx-auto mb-2" />
          <p className="text-sage font-serif font-black">All bags packed! Safe journey! ✈️</p>
        </div>
      )}
    </div>
  );
}
