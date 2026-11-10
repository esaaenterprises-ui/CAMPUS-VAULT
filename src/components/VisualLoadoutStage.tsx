import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  HARDWARE_CATALOG,
  HardwareCategory,
  BuyoutConditionGrade,
  SeniorBuyoutSelection,
} from '../utils/pricing';
import { playClickTone } from '../utils/audio';
import { Plus, Minus, Package, Monitor, Check, QrCode } from 'lucide-react';

interface VisualLoadoutStageProps {
  mode: 'storage' | 'lease' | 'buyout';
  boxCount: number;
  onBoxCountChange: (count: number) => void;
  bulkyCount: number;
  onBulkyCountChange: (count: number) => void;
  selectedLeaseItems: string[];
  onToggleLeaseItem: (itemId: string) => void;
  buyoutSelections: SeniorBuyoutSelection[];
  onToggleBuyoutItem: (itemId: string) => void;
  onChangeBuyoutGrade: (itemId: string, grade: BuyoutConditionGrade) => void;
}

const CATEGORY_TABS: Array<{ id: HardwareCategory | 'All'; label: string }> = [
  { id: 'Dorm Essentials', label: 'Essentials (4)' },
  { id: 'Kitchen & Coffee', label: 'Kitchen (4)' },
  { id: 'Tech & Gaming', label: 'Tech & Gaming (4)' },
  { id: 'Comfort & Mobility', label: 'Comfort & Mobility (4)' },
  { id: 'All', label: 'All (16)' },
];

export const VisualLoadoutStage: React.FC<VisualLoadoutStageProps> = ({
  mode,
  boxCount,
  onBoxCountChange,
  bulkyCount,
  onBulkyCountChange,
  selectedLeaseItems,
  onToggleLeaseItem,
  buyoutSelections,
  onToggleBuyoutItem,
  onChangeBuyoutGrade,
}) => {
  const [activeCategory, setActiveCategory] = useState<HardwareCategory | 'All'>('Dorm Essentials');
  const totalWeightCapKg = boxCount * 25 + bulkyCount * 18;

  if (mode === 'storage') {
    const boxesArray = Array.from({ length: boxCount }, (_, i) => i + 1);
    const bulkyArray = Array.from({ length: bulkyCount }, (_, i) => i + 1);

    return (
      <div className="rounded-3xl border border-[#e2dfd6] bg-white p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-[#141413]">Your Summer Loadout</h3>
            <p className="text-xs text-[#6e6d68]">
              Tap + or − to stack double-walled boxes (60×40×40 cm, 25 kg max).
            </p>
          </div>
          <span className="px-3 py-1 rounded-full bg-[#e9f5ef] text-[#0d4a38] text-xs font-mono font-bold">
            21°C Vault · {totalWeightCapKg} kg cap
          </span>
        </div>

        {/* Tactile Warm Stone Pallet Stage */}
        <div className="rounded-2xl bg-[#f6f5f0] border border-[#e5e2d9] p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[11px] font-mono text-[#6e6d68]">
            <span>{boxCount} BOXES · {bulkyCount} BULKY ITEMS</span>
            <span className="text-[#0d4a38] font-semibold">2,000 AED INSURED</span>
          </div>

          <div className="py-3 flex flex-wrap items-end justify-center gap-3.5 min-h-[104px]">
            <AnimatePresence mode="popLayout">
              {boxesArray.map((boxNum) => (
                <motion.div
                  key={`box-${boxNum}`}
                  layout
                  initial={{ opacity: 0, y: -24, scale: 0.85 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.7 }}
                  transition={{ type: 'spring', stiffness: 360, damping: 24 }}
                  onClick={() => {
                    if (boxCount > 1) {
                      playClickTone();
                      onBoxCountChange(boxCount - 1);
                    }
                  }}
                  title="Tap to remove box"
                  className="cursor-pointer w-20 h-20 rounded-2xl bg-[#e3cbb0] border-2 border-[#c8ab89] shadow-sm flex flex-col items-center justify-between p-2 hover:-translate-y-1 transition-transform"
                >
                  <div className="w-full flex items-center justify-between text-[9px] font-mono font-bold text-[#4a3925] border-b border-[#c8ab89] pb-0.5">
                    <span>BOX {boxNum}</span>
                    <QrCode className="w-3 h-3 text-[#0d4a38]" />
                  </div>
                  <Package className="w-6 h-6 text-[#5c462c]" />
                  <div className="text-[9px] font-mono font-semibold text-[#0d4a38]">25 KG</div>
                </motion.div>
              ))}
            </AnimatePresence>

            <AnimatePresence mode="popLayout">
              {bulkyArray.map((bulkyNum) => (
                <motion.div
                  key={`bulky-${bulkyNum}`}
                  layout
                  initial={{ opacity: 0, x: 20, scale: 0.85 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.7 }}
                  transition={{ type: 'spring', stiffness: 340, damping: 24 }}
                  onClick={() => {
                    playClickTone();
                    onBulkyCountChange(Math.max(0, bulkyCount - 1));
                  }}
                  title="Tap to remove bulky item"
                  className="cursor-pointer w-24 h-24 rounded-2xl bg-white border-2 border-[#0d4a38] shadow-sm flex flex-col items-center justify-between p-2.5 hover:-translate-y-1 transition-transform"
                >
                  <div className="w-full flex items-center justify-between text-[9px] font-mono font-bold text-[#0d4a38] border-b border-[#e5e2d9] pb-0.5">
                    <span>TECH {bulkyNum}</span>
                  </div>
                  <Monitor className="w-6 h-6 text-[#0d4a38]" />
                  <div className="text-[9px] font-mono font-semibold text-[#52514e]">
                    BULKY ITEM
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Wooden / Stone Pallet Base */}
          <div className="w-full h-2.5 rounded-full bg-[#d4cfc3]" />
        </div>

        {/* Clean + / - Stepper Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-4 rounded-2xl bg-[#f8f7f3] border border-[#e2dfd6] flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-[#141413]">Storage Boxes</div>
              <div className="text-[11px] text-[#6e6d68] font-mono">120 AED / box</div>
            </div>
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                aria-label="Remove one storage box"
                onClick={() => {
                  playClickTone();
                  onBoxCountChange(Math.max(1, boxCount - 1));
                }}
                className="w-8 h-8 rounded-full bg-white border border-[#d4d2c8] hover:bg-[#eae8e1] text-[#141413] flex items-center justify-center"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-5 text-center font-mono font-bold text-[#141413]">
                {boxCount}
              </span>
              <button
                type="button"
                aria-label="Add one storage box"
                onClick={() => {
                  playClickTone();
                  onBoxCountChange(Math.min(8, boxCount + 1));
                }}
                className="w-8 h-8 rounded-full bg-[#141413] hover:bg-[#2c2c2a] text-white flex items-center justify-center"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#f8f7f3] border border-[#e2dfd6] flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-[#141413]">Monitor / Mini-Fridge</div>
              <div className="text-[11px] text-[#6e6d68] font-mono">120 AED / bulky item</div>
            </div>
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                aria-label="Remove one bulky item"
                onClick={() => {
                  playClickTone();
                  onBulkyCountChange(Math.max(0, bulkyCount - 1));
                }}
                className="w-8 h-8 rounded-full bg-white border border-[#d4d2c8] hover:bg-[#eae8e1] text-[#141413] flex items-center justify-center"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-5 text-center font-mono font-bold text-[#141413]">
                {bulkyCount}
              </span>
              <button
                type="button"
                aria-label="Add one bulky item"
                onClick={() => {
                  playClickTone();
                  onBulkyCountChange(Math.min(4, bulkyCount + 1));
                }}
                className="w-8 h-8 rounded-full bg-[#0d4a38] hover:bg-[#09382a] text-white flex items-center justify-center"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Clean Categorized 16-Item Appliance Selector for Lease & Senior Buyout
  const isLease = mode === 'lease';
  const selectedCount = isLease ? selectedLeaseItems.length : buyoutSelections.length;

  const visibleItems =
    activeCategory === 'All'
      ? HARDWARE_CATALOG
      : HARDWARE_CATALOG.filter((item) => item.category === activeCategory);

  return (
    <div className="rounded-3xl border border-[#e2dfd6] bg-white p-6 sm:p-8 shadow-sm space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-lg font-bold text-[#141413]">
            {isLease
              ? 'Select Dorm Appliances & Gear to Rent (16 Items)'
              : 'Select Appliances & Gear to Sell Back (16 Items)'}
          </h3>
          <p className="text-xs text-[#6e6d68]">
            {isLease
              ? 'Browse 4 categories below. All 4 Dorm Essentials bundle to 99 AED/mo (84 AED/mo with campus discount).'
              : 'Browse 4 categories below. Get instant cash at dorm checkout based on condition (Grade A / B / C).'}
          </p>
        </div>
        <span className="px-3 py-1 rounded-full bg-[#e9f5ef] text-[#0d4a38] text-xs font-mono font-bold whitespace-nowrap shrink-0">
          {selectedCount} Selected
        </span>
      </div>

      {/* Category Filter Pill Bar (Shows 4 items at a time by default to prevent clutter) */}
      <div
        role="tablist"
        aria-label="Filter hardware categories"
        className="flex flex-wrap items-center gap-1.5 pt-1"
      >
        {CATEGORY_TABS.map((cat) => {
          const isCurrent = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              role="tab"
              aria-selected={isCurrent}
              onClick={() => {
                playClickTone();
                setActiveCategory(cat.id);
              }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                isCurrent
                  ? 'bg-[#141413] text-white'
                  : 'bg-[#f6f5f0] text-[#52514e] hover:text-[#141413] border border-[#e2dfd6]'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-h-[380px] overflow-y-auto pr-1">
        {visibleItems.map((item) => {
          const buyoutEntry = buyoutSelections.find((x) => x.itemId === item.id);
          const isSelected = isLease
            ? selectedLeaseItems.includes(item.id)
            : Boolean(buyoutEntry);
          const currentGrade = buyoutEntry?.grade || 'B';
          const currentPayout =
            currentGrade === 'A'
              ? item.buyoutGradeAAed
              : currentGrade === 'B'
              ? item.buyoutGradeBAed
              : item.buyoutGradeCAed;

          return (
            <div
              key={item.id}
              className={`rounded-2xl border p-4 transition-all flex flex-col justify-between gap-2.5 ${
                isSelected
                  ? 'bg-[#f4faf6] border-[#0d4a38]'
                  : 'bg-[#f8f7f3] border-[#e2dfd6] hover:border-[#b8b4a8]'
              }`}
            >
              <div
                onClick={() => {
                  playClickTone();
                  if (isLease) {
                    onToggleLeaseItem(item.id);
                  } else {
                    onToggleBuyoutItem(item.id);
                  }
                }}
                className="cursor-pointer space-y-1.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-semibold text-[#6e6d68] block">
                      {item.category}
                    </span>
                    <span className="text-sm font-bold text-[#141413] leading-snug block">
                      {item.name}
                    </span>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center border shrink-0 mt-0.5 ${
                      isSelected
                        ? 'bg-[#0d4a38] border-[#0d4a38] text-white'
                        : 'border-[#b8b4a8] text-transparent bg-white'
                    }`}
                  >
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                </div>

                <div className="flex items-baseline justify-between pt-1">
                  <span className="text-xs font-mono font-bold text-[#0d4a38]">
                    {isLease ? `${item.monthlyRateAed} AED / mo` : `+${currentPayout} AED Cash`}
                  </span>
                  <span className="text-[11px] font-mono text-[#6e6d68]">
                    Retail {item.retailPriceAed} AED
                  </span>
                </div>
              </div>

              {!isLease && isSelected && (
                <div className="pt-2 border-t border-[#dce8e1] flex items-center justify-between text-xs">
                  <span className="text-[#52514e]">Condition:</span>
                  <div className="inline-flex gap-1">
                    {(['A', 'B', 'C'] as BuyoutConditionGrade[]).map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => onChangeBuyoutGrade(item.id, g)}
                        className={`px-2 py-0.5 rounded-md font-mono text-[11px] font-semibold ${
                          currentGrade === g
                            ? 'bg-[#0d4a38] text-white'
                            : 'bg-white text-[#52514e] border border-[#d4d2c8]'
                        }`}
                      >
                        Grade {g}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
