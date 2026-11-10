import React, { useState } from 'react';
import {
  HARDWARE_CATALOG,
  HardwareCategory,
  DORM_STARTER_PACK_MONTHLY_AED,
  BOX_RATE_SUMMER_AED,
  BULKY_ITEM_RATE_AED,
} from '../utils/pricing';
import { ShieldCheck, Check, ArrowRight } from 'lucide-react';

interface ServicesViewProps {
  onSelectStoragePreset: (boxes: number, bulky: number) => void;
  onSelectLeasePreset: (itemIds: string[]) => void;
  onOpenTerms: () => void;
}

const HARDWARE_CATEGORIES: Array<{ id: HardwareCategory | 'All'; label: string }> = [
  { id: 'All', label: 'All 16 Items' },
  { id: 'Dorm Essentials', label: 'Dorm Essentials (4)' },
  { id: 'Kitchen & Coffee', label: 'Kitchen & Coffee (4)' },
  { id: 'Tech & Gaming', label: 'Tech & Gaming (4)' },
  { id: 'Comfort & Mobility', label: 'Comfort & Mobility (4)' },
];

export const ServicesView: React.FC<ServicesViewProps> = ({
  onSelectStoragePreset,
  onSelectLeasePreset,
  onOpenTerms,
}) => {
  const [filterCategory, setFilterCategory] = useState<'all' | 'storage' | 'hardware'>('all');
  const [hardwareSubCategory, setHardwareSubCategory] = useState<HardwareCategory | 'All'>('All');
  const [fleetImgError, setFleetImgError] = useState(false);

  const filteredHardware =
    hardwareSubCategory === 'All'
      ? HARDWARE_CATALOG
      : HARDWARE_CATALOG.filter((item) => item.category === hardwareSubCategory);

  return (
    <div className="space-y-16 pb-20">
      {/* Clean Header & Category Switcher */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-stone-200 pb-8">
        <div className="space-y-2 max-w-xl">
          <div className="text-xs font-semibold text-[#0d4a38]">
            Simple Pricing · Free DKP &amp; DIAC Pickup
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-950 tracking-tight">
            Summer Storage &amp; 16-Item Hardware Fleet
          </h1>
          <p className="text-sm text-stone-600 leading-relaxed">
            Pay by the box for 90-day summer storage, rent PAT-certified appliances &amp; tech for 9 months, or sell graduating gear for instant cash.
          </p>
        </div>

        <div
          role="group"
          aria-label="Filter catalog view"
          className="inline-flex items-center gap-1 p-1.5 rounded-xl bg-white border border-stone-200 shadow-xs shrink-0"
        >
          <button
            type="button"
            onClick={() => setFilterCategory('all')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              filterCategory === 'all'
                ? 'bg-[#0d4a38] text-white'
                : 'text-stone-600 hover:text-stone-950'
            }`}
          >
            All Plans
          </button>
          <button
            type="button"
            onClick={() => setFilterCategory('storage')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              filterCategory === 'storage'
                ? 'bg-[#0d4a38] text-white'
                : 'text-stone-600 hover:text-stone-950'
            }`}
          >
            Summer Storage (3)
          </button>
          <button
            type="button"
            onClick={() => setFilterCategory('hardware')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              filterCategory === 'hardware'
                ? 'bg-[#0d4a38] text-white'
                : 'text-stone-600 hover:text-stone-950'
            }`}
          >
            Dorm Appliances &amp; Tech (16)
          </button>
        </div>
      </section>

      {/* Summer Storage Tiers */}
      {(filterCategory === 'all' || filterCategory === 'storage') && (
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <div>
              <h2 className="text-2xl font-bold text-stone-950 tracking-tight">
                90-Day Summer Valet Storage
              </h2>
              <p className="text-sm text-stone-600 mt-0.5">
                Stored at 21°C in Al Quoz Industrial 3 · 15% Partner University Grant applies at checkout
              </p>
            </div>
            <span className="text-xs font-mono text-stone-500">
              {BOX_RATE_SUMMER_AED} AED / box · {BULKY_ITEM_RATE_AED} AED / bulky item
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Tier 1: Light Packer */}
            <div className="rounded-3xl border border-stone-200/90 bg-white p-7 flex flex-col justify-between space-y-6 shadow-xs">
              <div className="space-y-4">
                <div className="text-xs font-semibold text-stone-500">
                  Freshmen &amp; Light Dorms · 2 Boxes
                </div>
                <div className="flex items-baseline justify-between">
                  <h3 className="text-xl font-bold text-stone-950">Light Vault</h3>
                  <div className="text-right">
                    <span className="text-2xl font-extrabold text-stone-950 font-mono tabular-nums">
                      240 AED
                    </span>
                    <div className="text-xs font-semibold text-[#0d4a38]">
                      204 AED with Campus Grant
                    </div>
                  </div>
                </div>
                <ul className="space-y-2.5 text-sm text-stone-600 pt-2">
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-[#0d4a38] shrink-0" />
                    <span>2× Double-walled boxes (max 25 kg each)</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-[#0d4a38] shrink-0" />
                    <span>Free packing tape &amp; tamper-evident QR seals</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-[#0d4a38] shrink-0" />
                    <span>Free May pickup &amp; September room delivery</span>
                  </li>
                </ul>
              </div>

              <button
                type="button"
                onClick={() => onSelectStoragePreset(2, 0)}
                className="w-full py-3 px-4 text-xs font-semibold text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors"
              >
                Choose 2-Box Plan
              </button>
            </div>

            {/* Tier 2: Standard Student Vault */}
            <div className="rounded-3xl border-2 border-[#0d4a38] bg-white p-7 flex flex-col justify-between space-y-6 shadow-sm">
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs font-semibold text-[#0d4a38]">
                  <span>Most Popular · 3 Boxes</span>
                  <span className="px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800">
                    Recommended
                  </span>
                </div>
                <div className="flex items-baseline justify-between">
                  <h3 className="text-xl font-bold text-stone-950">Standard Vault</h3>
                  <div className="text-right">
                    <span className="text-2xl font-extrabold text-stone-950 font-mono tabular-nums">
                      360 AED
                    </span>
                    <div className="text-xs font-semibold text-[#0d4a38]">
                      306 AED with Campus Grant
                    </div>
                  </div>
                </div>
                <ul className="space-y-2.5 text-sm text-stone-600 pt-2">
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-[#0d4a38] shrink-0" />
                    <span>3× Double-walled boxes (75 kg total capacity)</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-[#0d4a38] shrink-0" />
                    <span>Free bubble wrap, tape &amp; QR security seals</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-[#0d4a38] shrink-0" />
                    <span>2,000 AED fire &amp; transit insurance included</span>
                  </li>
                </ul>
              </div>

              <button
                type="button"
                onClick={() => onSelectStoragePreset(3, 0)}
                className="w-full py-3 px-4 text-xs font-semibold text-white bg-[#0d4a38] hover:bg-[#09382a] rounded-xl transition-colors"
              >
                Choose 3-Box Plan (360 AED)
              </button>
            </div>

            {/* Tier 3: Standard + Bulky Tech Vault */}
            <div className="rounded-3xl border border-stone-200/90 bg-white p-7 flex flex-col justify-between space-y-6 shadow-xs">
              <div className="space-y-4">
                <div className="text-xs font-semibold text-stone-500">
                  Studio &amp; Tech Movers · 3 Boxes + 1 Bulky
                </div>
                <div className="flex items-baseline justify-between">
                  <h3 className="text-xl font-bold text-stone-950">Tech &amp; Fridge Vault</h3>
                  <div className="text-right">
                    <span className="text-2xl font-extrabold text-stone-950 font-mono tabular-nums">
                      480 AED
                    </span>
                    <div className="text-xs font-semibold text-[#0d4a38]">
                      408 AED with Campus Grant
                    </div>
                  </div>
                </div>
                <ul className="space-y-2.5 text-sm text-stone-600 pt-2">
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-[#0d4a38] shrink-0" />
                    <span>3× Standard boxes + 1× Bulky monitor/fridge slot</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-[#0d4a38] shrink-0" />
                    <span>Anti-static monitor sleeve &amp; upright fridge transport</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-[#0d4a38] shrink-0" />
                    <span>Serial number intake log &amp; 2,000 AED insurance</span>
                  </li>
                </ul>
              </div>

              <button
                type="button"
                onClick={() => onSelectStoragePreset(3, 1)}
                className="w-full py-3 px-4 text-xs font-semibold text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors"
              >
                Choose 3 Boxes + 1 Bulky (480 AED)
              </button>
            </div>
          </div>
        </section>
      )}

      {/* 9-Month Term Hardware Catalog & Starter Bundle */}
      {(filterCategory === 'all' || filterCategory === 'hardware') && (
        <section className="space-y-8">
          <div className="rounded-3xl border border-stone-200/90 bg-white overflow-hidden grid grid-cols-1 lg:grid-cols-12 items-stretch shadow-xs">
            <div className="lg:col-span-5 relative min-h-[240px] bg-stone-100">
              {!fleetImgError ? (
                <img
                  src="/src/assets/images/pat_certified_appliances_1794224069997.jpg"
                  alt="PAT-certified 50L silent mini-fridge, 20L digital microwave, and 27-inch 4K IPS monitor hardware pack"
                  referrerPolicy="no-referrer"
                  onError={() => setFleetImgError(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-stone-100 text-xs text-stone-500 p-6">
                  PAT-Certified Dorm Starter Hardware Fleet
                </div>
              )}
            </div>

            <div className="lg:col-span-7 p-7 md:p-9 flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <div className="text-xs font-semibold text-[#0d4a38]">
                  Complete 4-Item Academic Subscription · Zero Security Deposit
                </div>
                <div className="flex flex-wrap items-baseline justify-between gap-4">
                  <h2 className="text-2xl font-bold text-stone-950">
                    Dorm Starter Pack (Core 4 Units)
                  </h2>
                  <div className="text-right">
                    <span className="text-3xl font-extrabold text-stone-950 font-mono tabular-nums">
                      {DORM_STARTER_PACK_MONTHLY_AED} AED
                    </span>
                    <span className="text-xs text-stone-500"> / month</span>
                    <div className="text-xs font-semibold text-[#0d4a38]">
                      84 AED/mo with 15% Partner Grant
                    </div>
                  </div>
                </div>
                <p className="text-sm text-stone-600 leading-relaxed">
                  Includes a 50L Silent Mini-Fridge, 27&quot; 4K IPS Monitor, 20L Digital Microwave, and Ergonomic Mesh Chair delivered in September and collected in May. Add any of our 12 extra kitchen, gaming, or mobility items below.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-stone-200">
                <button
                  type="button"
                  onClick={onOpenTerms}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-600 hover:text-stone-950"
                >
                  <ShieldCheck className="w-4 h-4 text-[#0d4a38]" />
                  <span>PAT Safety Certified · 24h Free Replacement SLA</span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    onSelectLeasePreset([
                      'mini-fridge',
                      'monitor-4k',
                      'microwave-solo',
                      'task-chair',
                    ])
                  }
                  className="inline-flex items-center gap-2 px-5 py-3 text-xs font-semibold text-white bg-[#0d4a38] hover:bg-[#09382a] rounded-xl transition-colors whitespace-nowrap shrink-0"
                >
                  <span>Subscribe to Core 4-Item Pack (99 AED/mo)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Sub-Category Filter for the 16 Hardware Items */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h3 className="text-lg font-bold text-stone-950">
              Browse All 16 Leasable &amp; Buyout-Eligible Dorm Items
            </h3>
            <div className="flex flex-wrap items-center gap-1.5">
              {HARDWARE_CATEGORIES.map((cat) => {
                const isSelected = hardwareSubCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setHardwareSubCategory(cat.id)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                      isSelected
                        ? 'bg-stone-950 text-white'
                        : 'bg-white text-stone-600 hover:text-stone-950 border border-stone-200'
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Individual Hardware Fleet Grid (16 Items) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {filteredHardware.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-stone-200/90 bg-white p-6 flex flex-col justify-between space-y-5 shadow-xs"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs text-stone-500">
                    <span className="font-medium">{item.category}</span>
                    <span className="font-mono text-[#0d4a38]">{item.patCertId}</span>
                  </div>
                  <h3 className="text-base font-bold text-stone-950 leading-snug">{item.name}</h3>
                  <p className="text-xs text-stone-600 leading-relaxed">{item.specs}</p>
                </div>

                <div className="space-y-3 pt-3 border-t border-stone-100">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-xl font-extrabold text-stone-950 font-mono tabular-nums">
                        {item.monthlyRateAed} AED
                      </span>
                      <span className="text-xs text-stone-500"> / mo</span>
                    </div>
                    <span className="text-xs text-stone-400 line-through font-mono">
                      Retail {item.retailPriceAed} AED
                    </span>
                  </div>
                  <div className="text-[11px] font-mono text-[#0d4a38]">
                    Graduating Cash Buyout: {item.buyoutGradeCAed}–{item.buyoutGradeAAed} AED
                  </div>
                  <button
                    type="button"
                    onClick={() => onSelectLeasePreset([item.id])}
                    className="w-full py-2.5 px-3 text-xs font-semibold text-stone-900 bg-stone-100 hover:bg-[#0d4a38] hover:text-white rounded-xl transition-colors whitespace-nowrap"
                  >
                    Rent or Sell Item
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
