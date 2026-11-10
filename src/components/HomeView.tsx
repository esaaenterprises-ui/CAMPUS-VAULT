import React, { useState } from 'react';
import { motion } from 'motion/react';
import { playClickTone } from '../utils/audio';
import { ArrowRight, Check } from 'lucide-react';

interface HomeViewProps {
  onNavigateToConfigurator: (
    mode: 'storage' | 'lease' | 'buyout',
    presetCampusId?: string
  ) => void;
  onNavigateTab: (tab: 'home' | 'services' | 'about' | 'configurator' | 'dispatch') => void;
  onOpenTerms: () => void;
}

const SEASONS = [
  {
    id: 'may',
    month: 'May',
    title: 'We pick up from your dorm door.',
    desc: 'Pack our free double-walled boxes. Graduating? Sell us your mini-fridge or monitor on the spot for 75–120 AED cash.',
    cta: 'Book May Pickup',
    mode: 'storage' as const,
  },
  {
    id: 'summer',
    month: 'June – Aug',
    title: 'Stored at 21°C in Al Quoz.',
    desc: 'Your boxes stay sealed and insured up to 2,000 AED inside our climate-controlled Dubai vault while you fly home.',
    cta: 'See Box Pricing',
    mode: 'storage' as const,
  },
  {
    id: 'sept',
    month: 'September',
    title: 'Delivered to your new room.',
    desc: 'Boxes return to your new address. Need appliances? Rent our 4-item Dorm Starter Kit for 84 AED/month.',
    cta: 'Rent Dorm Appliances',
    mode: 'lease' as const,
  },
  {
    id: 'year',
    month: 'Oct – May',
    title: '24-hour free replacement.',
    desc: 'If any rented fridge, microwave, or monitor stops working during the semester, we swap it the next morning for free.',
    cta: 'Sell Graduating Gear',
    mode: 'buyout' as const,
  },
];

export const HomeView: React.FC<HomeViewProps> = ({
  onNavigateToConfigurator,
  onOpenTerms,
}) => {
  const [monthlyRentAed, setMonthlyRentAed] = useState<number>(5500); // Avg Studio 5-6k/mo
  const [activeSeason, setActiveSeason] = useState<number>(0);
  const [warehouseImgError, setWarehouseImgError] = useState(false);
  const [dormImgError, setDormImgError] = useState(false);

  const threeMonthDeadRentAed = monthlyRentAed * 3;
  const threeBoxStorageAed = 306; // 3 boxes with 15% student discount
  const summerSavingsAed = threeMonthDeadRentAed - threeBoxStorageAed;

  const housingTypeLabel =
    monthlyRentAed <= 4200
      ? 'Shared Dorm · 3k–4k/mo'
      : monthlyRentAed <= 6400
      ? 'Avg Studio · 5k–6k/mo'
      : '1-Bedroom · 7k–8k/mo';

  return (
    <div className="space-y-24 pb-24">
      {/* 1. CLEAN EDITORIAL HERO + INTERACTIVE SUMMER RENT CALCULATOR */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center pt-4">
        {/* Left: Crisp Human Copy */}
        <div className="lg:col-span-6 space-y-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#e8e6de] text-[#141413] text-xs font-semibold">
            <span>Dubai Knowledge Park · Academic City · Al Quoz</span>
          </div>

          <h1
            className="text-5xl sm:text-6xl font-bold tracking-tight text-[#141413] leading-[1.04]"
            style={{ textWrap: 'balance' }}
          >
            Flying home for summer? Don&apos;t pay empty rent.
          </h1>

          <p className="text-lg text-[#52514e] leading-relaxed max-w-xl">
            We drop off boxes, pick them up from your dorm room, store them at 21°C in Al Quoz, and
            deliver them back in September. Starting at <strong>102 AED/box</strong> with your
            university email.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => onNavigateToConfigurator('storage', 'uowd')}
              className="inline-flex items-center gap-2.5 px-7 py-4 text-sm font-bold text-white bg-[#0d4a38] hover:bg-[#09382a] rounded-full transition-all shadow-sm"
            >
              <span>Book Summer Storage</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => onNavigateToConfigurator('lease', 'uowd')}
              className="px-6 py-4 text-sm font-semibold text-[#141413] bg-white hover:bg-[#eceae2] border border-[#d8d5cb] rounded-full transition-colors"
            >
              Rent Dorm Fridge &amp; Monitor
            </button>
          </div>

          {/* Minimal Campus Pills */}
          <div className="pt-2 space-y-2">
            <div className="text-xs font-medium text-[#6e6d68]">
              15% partner discount unlocked for:
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'uowd', label: 'UOWD' },
                { id: 'mdx', label: 'Middlesex' },
                { id: 'hwu', label: 'Heriot-Watt' },
                { id: 'bits', label: 'BITS Pilani' },
                { id: 'amity', label: 'Amity' },
                { id: 'myriad', label: 'The Myriad & KSK' },
              ].map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => onNavigateToConfigurator('storage', c.id)}
                  className="px-3.5 py-1.5 rounded-full bg-white hover:bg-[#0d4a38] hover:text-white border border-[#dedbd2] text-xs font-semibold text-[#2c2c2a] transition-colors"
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Tactile Dubai Rent vs. Storage Calculator Card */}
        <div className="lg:col-span-6 bg-white rounded-3xl border border-[#e2dfd6] p-8 sm:p-10 shadow-[0_20px_50px_rgba(20,20,19,0.06)] space-y-8">
          <div className="flex items-center justify-between border-b border-[#efede6] pb-5">
            <div>
              <h2 className="text-xl font-bold text-[#141413]">Summer Dead-Rent Calculator</h2>
              <p className="text-xs text-[#6e6d68] mt-0.5">
                Compare 3 months of empty summer rent vs. storing 3 boxes.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-[#e9f5ef] text-[#0d4a38] text-xs font-bold whitespace-nowrap shrink-0">
              {housingTypeLabel}
            </span>
          </div>

          {/* Quick Housing Type Buttons */}
          <div className="grid grid-cols-3 gap-2.5">
            {[
              { label: 'Shared Dorm', sub: '3.5k / mo', rent: 3500 },
              { label: 'Avg Studio', sub: '5.5k / mo', rent: 5500 },
              { label: '1-Bedroom', sub: '7.5k / mo', rent: 7500 },
            ].map((preset) => {
              const isSelected = Math.abs(monthlyRentAed - preset.rent) <= 400;
              return (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => {
                    playClickTone();
                    setMonthlyRentAed(preset.rent);
                  }}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    isSelected
                      ? 'bg-[#141413] text-white border-[#141413]'
                      : 'bg-[#f8f7f3] text-[#141413] border-[#e2dfd6] hover:border-[#b8b4a8]'
                  }`}
                >
                  <div className="text-xs font-bold">{preset.label}</div>
                  <div
                    className={`text-[11px] font-mono mt-0.5 ${
                      isSelected ? 'text-[#d4d2c8]' : 'text-[#6e6d68]'
                    }`}
                  >
                    {preset.sub}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Monthly Rent Slider */}
          <div className="space-y-3">
            <div className="flex items-baseline justify-between">
              <label htmlFor="dead-rent-slider" className="text-xs font-semibold text-[#52514e]">
                Your Monthly Rent
              </label>
              <div className="text-right">
                <span className="text-xl font-bold text-[#141413] font-mono tabular-nums">
                  {monthlyRentAed.toLocaleString()} AED/mo
                </span>
                <span className="text-xs text-[#6e6d68] block">
                  = {threeMonthDeadRentAed.toLocaleString()} AED wasted over 3 summer months
                </span>
              </div>
            </div>

            <input
              id="dead-rent-slider"
              type="range"
              min={3000}
              max={8500}
              step={250}
              value={monthlyRentAed}
              onChange={(e) => setMonthlyRentAed(Number(e.target.value))}
              className="w-full accent-[#0d4a38] cursor-pointer h-2 rounded-lg"
            />
            <div className="flex justify-between text-[11px] font-mono text-[#85837d]">
              <span>3,000 AED/mo (Dorm)</span>
              <span>5,500 AED/mo (Studio)</span>
              <span>8,500 AED/mo (1BR)</span>
            </div>
          </div>

          {/* Savings Outcome Box */}
          <div className="p-6 rounded-2xl bg-[#f6f5f0] border border-[#e5e2d9] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-xs font-semibold text-[#52514e]">
                You keep in your pocket this summer
              </div>
              <motion.div
                key={summerSavingsAed}
                initial={{ scale: 0.96, opacity: 0.7 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-4xl font-bold text-[#0d4a38] font-mono tabular-nums mt-1"
              >
                {summerSavingsAed.toLocaleString()} AED
              </motion.div>
              <div className="text-xs text-[#6e6d68] mt-1">
                3-box summer storage is just <strong>306 AED total</strong> (102 AED × 3).
              </div>
            </div>

            <button
              type="button"
              onClick={() => onNavigateToConfigurator('storage', 'uowd')}
              className="px-5 py-3.5 rounded-full bg-[#141413] hover:bg-[#2c2c2a] text-xs font-bold text-white transition-colors shrink-0"
            >
              Reserve for 306 AED
            </button>
          </div>
        </div>
      </section>

      {/* 2. TWO SIMPLE SERVICE CARDS (Clean Photography, Minimal Copy) */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Card 1: Summer Box Storage */}
        <article className="bg-white rounded-3xl border border-[#e2dfd6] overflow-hidden flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
          <div>
            <div className="h-64 w-full bg-[#eae8e1] overflow-hidden">
              {!warehouseImgError ? (
                <img
                  src="/src/assets/images/al_quoz_vault_facility_1794224067667.jpg"
                  alt="CampusVault Al Quoz 21°C climate-controlled student storage"
                  referrerPolicy="no-referrer"
                  onError={() => setWarehouseImgError(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-sm text-[#6e6d68]">
                  Al Quoz 21°C Climate Vault
                </div>
              )}
            </div>

            <div className="p-8 space-y-4">
              <div className="flex items-baseline justify-between gap-2">
                <h3 className="text-2xl font-bold text-[#141413]">Summer Box Storage</h3>
                <span className="text-lg font-bold text-[#0d4a38] font-mono">102 AED / box</span>
              </div>
              <p className="text-sm text-[#52514e] leading-relaxed">
                For May to September. Includes free double-walled boxes, QR security seals, doorstep
                pickup, 21°C storage, and 2,000 AED insurance.
              </p>
              <div className="flex flex-wrap gap-4 pt-2 text-xs font-medium text-[#2c2c2a]">
                <span className="inline-flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-[#0d4a38]" /> Free DKP &amp; DIAC pickup
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-[#0d4a38]" /> Up to 25 kg per box
                </span>
              </div>
            </div>
          </div>

          <div className="px-8 pb-8">
            <button
              type="button"
              onClick={() => onNavigateToConfigurator('storage', 'uowd')}
              className="w-full py-3.5 rounded-full bg-[#f6f5f0] hover:bg-[#141413] text-[#141413] hover:text-white text-xs font-bold border border-[#d8d5cb] transition-colors"
            >
              Choose Your Box Count
            </button>
          </div>
        </article>

        {/* Card 2: 9-Month Appliance Rental */}
        <article className="bg-white rounded-3xl border border-[#e2dfd6] overflow-hidden flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
          <div>
            <div className="h-64 w-full bg-[#eae8e1] overflow-hidden">
              {!dormImgError ? (
                <img
                  src="/src/assets/images/dubai_dorm_starter_kit_1794224067756.jpg"
                  alt="Dorm room with mini-fridge, 4K monitor, microwave, and ergonomic chair"
                  referrerPolicy="no-referrer"
                  onError={() => setDormImgError(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-sm text-[#6e6d68]">
                  9-Month Dorm Starter Pack
                </div>
              )}
            </div>

            <div className="p-8 space-y-4">
              <div className="flex items-baseline justify-between gap-2">
                <h3 className="text-2xl font-bold text-[#141413]">9-Month Appliance Rental</h3>
                <span className="text-lg font-bold text-[#0d4a38] font-mono">84 AED / mo</span>
              </div>
              <p className="text-sm text-[#52514e] leading-relaxed">
                Get a sanitized 50L Mini-Fridge, 27&quot; 4K Monitor, Microwave, and Desk Chair
                delivered in September. No deposit, with 24-hour free replacement.
              </p>
              <div className="flex flex-wrap gap-4 pt-2 text-xs font-medium text-[#2c2c2a]">
                <span className="inline-flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-[#0d4a38]" /> Safety tested &amp; sanitized
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-[#0d4a38]" /> Zero security deposit
                </span>
              </div>
            </div>
          </div>

          <div className="px-8 pb-8">
            <button
              type="button"
              onClick={() => onNavigateToConfigurator('lease', 'uowd')}
              className="w-full py-3.5 rounded-full bg-[#f6f5f0] hover:bg-[#141413] text-[#141413] hover:text-white text-xs font-bold border border-[#d8d5cb] transition-colors"
            >
              Build Your Dorm Kit
            </button>
          </div>
        </article>
      </section>

      {/* 3. MINIMAL 4-STEP HOW IT WORKS TIMELINE */}
      <section className="bg-white rounded-3xl border border-[#e2dfd6] p-8 sm:p-12 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-[#141413]">How the circular loop works</h2>
            <p className="text-sm text-[#6e6d68] mt-1">
              Click any season to see how we move, store, and recycle across Dubai campuses.
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenTerms}
            className="text-xs font-semibold text-[#0d4a38] hover:underline"
          >
            View 24h defrost &amp; custody rules →
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {SEASONS.map((s, idx) => {
            const active = activeSeason === idx;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  playClickTone();
                  setActiveSeason(idx);
                }}
                className={`p-5 rounded-2xl border text-left transition-all ${
                  active
                    ? 'bg-[#141413] text-white border-[#141413]'
                    : 'bg-[#f8f7f3] text-[#141413] border-[#e2dfd6] hover:border-[#b8b4a8]'
                }`}
              >
                <div
                  className={`text-xs font-mono font-bold ${
                    active ? 'text-[#6ee7b7]' : 'text-[#0d4a38]'
                  }`}
                >
                  {s.month}
                </div>
                <div className="text-sm font-bold mt-1">{s.title}</div>
              </button>
            );
          })}
        </div>

        <div className="p-6 rounded-2xl bg-[#f6f5f0] border border-[#e5e2d9] flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-1 max-w-2xl">
            <div className="text-base font-bold text-[#141413]">
              {SEASONS[activeSeason].month}: {SEASONS[activeSeason].title}
            </div>
            <p className="text-sm text-[#52514e]">{SEASONS[activeSeason].desc}</p>
          </div>

          <button
            type="button"
            onClick={() => onNavigateToConfigurator(SEASONS[activeSeason].mode, 'uowd')}
            className="px-6 py-3 rounded-full bg-[#0d4a38] hover:bg-[#09382a] text-xs font-bold text-white transition-colors shrink-0"
          >
            {SEASONS[activeSeason].cta}
          </button>
        </div>
      </section>
    </div>
  );
};
