import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  CAMPUS_OPTIONS,
  INITIAL_TIME_SLOTS,
  TimeSlotWindow,
  PaymentMethodType,
  BuyoutConditionGrade,
  SeniorBuyoutSelection,
  calculateStorageQuote,
  calculateLeaseQuote,
  calculateSeniorBuyoutQuote,
  calculatePaymentPlan,
  estimatePackingVolume,
  generateVaultPassId,
} from '../utils/pricing';
import { playClickTone, playVaultPassChime } from '../utils/audio';
import { VaultPassBookingRecord } from '../lib/googleDocs';
import { User } from 'firebase/auth';
import { GoogleSignInButton } from './GoogleSignInButton';
import { VisualLoadoutStage } from './VisualLoadoutStage';
import {
  QrCode,
  CheckCircle2,
  FileText,
  Printer,
  X,
  ExternalLink,
  AlertCircle,
  Calculator,
  KeyRound,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';

const CUSTODY_STAGES = [
  {
    stage: 1,
    title: '1. Empty Boxes Delivered',
    detail: 'Double-walled boxes & QR seals dropped at your dorm.',
  },
  {
    stage: 2,
    title: '2. Doorstep Pickup',
    detail: 'Courier scanned QR seal & verified ≤25 kg weight.',
  },
  {
    stage: 3,
    title: '3. Van Transit',
    detail: 'Sealed Sprinter van en route from campus to Al Quoz.',
  },
  {
    stage: 4,
    title: '4. 21°C Al Quoz Vault',
    detail: 'Stored on Rack A4 at 21.0°C & 45% humidity.',
  },
  {
    stage: 5,
    title: '5. Sept Redelivery',
    detail: 'Delivered directly to your new semester room.',
  },
];

interface VaultConfiguratorViewProps {
  mode: 'storage' | 'lease' | 'buyout';
  onModeChange: (mode: 'storage' | 'lease' | 'buyout') => void;
  selectedCampusId: string;
  onCampusChange: (campusId: string) => void;
  boxCount: number;
  onBoxCountChange: (count: number) => void;
  bulkyCount: number;
  onBulkyCountChange: (count: number) => void;
  selectedLeaseItems: string[];
  onToggleLeaseItem: (itemId: string) => void;
  onSelectAllLeaseItems: () => void;
  bookings: VaultPassBookingRecord[];
  onAddBooking: (booking: VaultPassBookingRecord) => void;
  onAdvanceBookingStage: (passId: string) => void;
  onOpenTerms: () => void;
  user: User | null;
  hasGoogleToken: boolean;
  isLoggingIn: boolean;
  onGoogleLogin: () => void;
  onGoogleLogout: () => void;
  onExportPassToGoogleDocs: (booking: VaultPassBookingRecord) => Promise<void>;
  isExportingDoc: boolean;
  lastExportedDocUrl: string | null;
  docStatusMessage: string | null;
}

export const VaultConfiguratorView: React.FC<VaultConfiguratorViewProps> = ({
  mode,
  onModeChange,
  selectedCampusId,
  onCampusChange,
  boxCount,
  onBoxCountChange,
  bulkyCount,
  onBulkyCountChange,
  selectedLeaseItems,
  onToggleLeaseItem,
  onSelectAllLeaseItems,
  bookings,
  onAddBooking,
  onAdvanceBookingStage,
  onOpenTerms,
  user,
  hasGoogleToken,
  isLoggingIn,
  onGoogleLogin,
  onGoogleLogout,
  onExportPassToGoogleDocs,
  isExportingDoc,
  lastExportedDocUrl,
  docStatusMessage,
}) => {
  // Sub-view: 'studio' | 'telemetry' | 'ledger'
  const [studioSubView, setStudioSubView] = useState<'studio' | 'telemetry' | 'ledger'>('studio');

  // Step-by-step wizard state (1, 2, or 3) so only ONE form card is visible at a time
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3>(1);

  const [studentName, setStudentName] = useState<string>('Aryan Sharma');
  const [studentEmail, setStudentEmail] = useState<string>('as9812@uowmail.edu.au');
  const [dormAddress, setDormAddress] = useState<string>('Barsha Heights · Tower B, Room 408');
  const [pickupDate, setPickupDate] = useState<string>('2027-05-24');
  const [returnDate, setReturnDate] = useState<string>('2027-09-02');
  const [earlyBirdEligible, setEarlyBirdEligible] = useState<boolean>(false);
  const [overweightBoxes] = useState<number>(0);
  const [agreedToRules, setAgreedToRules] = useState<boolean>(true);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [issuedPass, setIssuedPass] = useState<VaultPassBookingRecord | null>(null);

  const [timeSlots, setTimeSlots] = useState<TimeSlotWindow[]>(INITIAL_TIME_SLOTS);
  const [selectedSlotId, setSelectedSlotId] = useState<string>('slot-11-13');

  const [showPackingHelper, setShowPackingHelper] = useState<boolean>(false);
  const [clothingBundles, setClothingBundles] = useState<number>(2);
  const [textbookStacks, setTextbookStacks] = useState<number>(1);
  const [beddingSets, setBeddingSets] = useState<number>(1);
  const [kitchenwareSets, setKitchenwareSets] = useState<number>(1);
  const [estMonitors, setEstMonitors] = useState<number>(1);
  const [estFridges, setEstFridges] = useState<number>(0);

  const [techSerialInput, setTechSerialInput] = useState<string>(
    'SN-LG27UL850-99412-AE (27" 4K Monitor)'
  );

  const [trackedPassId, setTrackedPassId] = useState<string>(
    bookings[0]?.passId || 'CV-UOWD-2026-9810'
  );
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('tabby');

  const [buyoutSelections, setBuyoutSelections] = useState<SeniorBuyoutSelection[]>([
    { itemId: 'mini-fridge', grade: 'B' },
    { itemId: 'monitor-4k', grade: 'A' },
  ]);

  const packingEstimate = estimatePackingVolume({
    clothingBundles,
    textbookStacks,
    beddingSets,
    kitchenwareSets,
    monitorsOrPcCount: estMonitors,
    miniFridgeOrChairCount: estFridges,
  });

  const storageQuote = calculateStorageQuote({
    campusId: selectedCampusId,
    boxCount,
    bulkyCount,
    overweightBoxCount: overweightBoxes,
    earlyBirdEligible,
  });

  const leaseQuote = calculateLeaseQuote({
    campusId: selectedCampusId,
    selectedItemIds: selectedLeaseItems,
    termMonths: 9,
  });

  const buyoutQuote = calculateSeniorBuyoutQuote(selectedCampusId, buyoutSelections);

  const activeCampus =
    mode === 'storage'
      ? storageQuote.campus
      : mode === 'lease'
      ? leaseQuote.campus
      : buyoutQuote.campus;

  const activeNetTotal =
    mode === 'storage'
      ? storageQuote.netTotalAed
      : mode === 'lease'
      ? leaseQuote.netContractTotalAed
      : buyoutQuote.totalStudentPayoutAed;

  const paymentPlan = calculatePaymentPlan(activeNetTotal, paymentMethod);
  const activeSlot = timeSlots.find((s) => s.id === selectedSlotId) || timeSlots[1];
  const trackedBooking = bookings.find((b) => b.passId === trackedPassId) || bookings[0];

  const handleToggleBuyoutItem = (itemId: string) => {
    playClickTone();
    setBuyoutSelections((prev) => {
      const exists = prev.find((x) => x.itemId === itemId);
      if (exists) return prev.filter((x) => x.itemId !== itemId);
      return [...prev, { itemId, grade: 'B' }];
    });
  };

  const handleChangeBuyoutGrade = (itemId: string, grade: BuyoutConditionGrade) => {
    playClickTone();
    setBuyoutSelections((prev) =>
      prev.map((x) => (x.itemId === itemId ? { ...x, grade } : x))
    );
  };

  const handleIssueVaultPass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim() || !studentEmail.trim() || !dormAddress.trim()) {
      setValidationError('Please enter your name, university email, and dorm room address.');
      setWizardStep(3);
      return;
    }
    if (mode === 'lease' && selectedLeaseItems.length === 0) {
      setValidationError('Please select at least one appliance to rent.');
      return;
    }
    if (mode === 'buyout' && buyoutSelections.length === 0) {
      setValidationError('Please select at least one appliance to sell back.');
      return;
    }
    if (!agreedToRules) {
      setValidationError('Please accept the 24h defrost and 25 kg weight rules.');
      setWizardStep(3);
      return;
    }

    setValidationError(null);
    playVaultPassChime();

    setTimeSlots((prev) =>
      prev.map((slot) =>
        slot.id === activeSlot.id && slot.bookedCount < slot.maxCapacity
          ? { ...slot, bookedCount: slot.bookedCount + 1 }
          : slot
      )
    );

    const digits = String(9812 + bookings.length);
    const passId =
      mode === 'buyout'
        ? `BUY-${activeCampus.shortCode}-2026-${digits}`
        : generateVaultPassId(selectedCampusId, digits);
    const gatePassCode = `GATE-${activeCampus.shortCode}-${digits}`;

    const newRecord: VaultPassBookingRecord =
      mode === 'storage'
        ? {
            passId,
            studentName: studentName.trim(),
            studentEmail: studentEmail.trim(),
            dormAddress: dormAddress.trim(),
            campusName: storageQuote.campus.name,
            corridor: storageQuote.campus.corridor,
            mode: 'storage',
            summaryLine: `${storageQuote.boxCount}× Boxes + ${storageQuote.bulkyCount}× Bulky Items`,
            grossAmountAed: storageQuote.grossSubtotalAed,
            discountAmountAed:
              storageQuote.partnerDiscountAed + storageQuote.earlyBirdDiscountAed,
            netAmountAed: storageQuote.netTotalAed,
            pickupDate,
            returnDate,
            createdAt: new Date().toLocaleString('en-AE', {
              dateStyle: 'medium',
              timeStyle: 'short',
            }),
            timeSlotLabel: `${activeSlot.windowHours} (${activeSlot.label})`,
            paymentMethodLabel: `${paymentPlan.label} (${paymentPlan.badgeText})`,
            techSerialNumbers:
              bulkyCount > 0 ? techSerialInput.trim() : 'Standard Boxes Only',
            securityGateAuthority: activeCampus.securityGateAuthority,
            securityGatePassCode: gatePassCode,
            custodyStage: 2,
          }
        : mode === 'lease'
        ? {
            passId,
            studentName: studentName.trim(),
            studentEmail: studentEmail.trim(),
            dormAddress: dormAddress.trim(),
            campusName: leaseQuote.campus.name,
            corridor: leaseQuote.campus.corridor,
            mode: 'lease',
            summaryLine: leaseQuote.isFullStarterPack
              ? 'Complete 4-Item Dorm Starter Pack (9-Mo)'
              : leaseQuote.selectedItems.map((i) => i.name).join(' + '),
            grossAmountAed: leaseQuote.grossContractTotalAed,
            discountAmountAed: leaseQuote.partnerContractDiscountAed,
            netAmountAed: leaseQuote.netContractTotalAed,
            pickupDate: '2027-09-01',
            returnDate: '2028-05-28',
            createdAt: new Date().toLocaleString('en-AE', {
              dateStyle: 'medium',
              timeStyle: 'short',
            }),
            timeSlotLabel: `${activeSlot.windowHours} (${activeSlot.label})`,
            paymentMethodLabel: `${paymentPlan.label} (${paymentPlan.badgeText})`,
            techSerialNumbers: 'PAT-Certified Fleet Units',
            securityGateAuthority: activeCampus.securityGateAuthority,
            securityGatePassCode: gatePassCode,
            custodyStage: 5,
          }
        : {
            passId,
            studentName: studentName.trim(),
            studentEmail: studentEmail.trim(),
            dormAddress: dormAddress.trim(),
            campusName: buyoutQuote.campus.name,
            corridor: buyoutQuote.campus.corridor,
            mode: 'buyout',
            summaryLine: `Senior Buyout: ${buyoutQuote.items
              .map((x) => `${x.item.name} (Grade ${x.grade}: ${x.payoutAed} AED)`)
              .join(' + ')}`,
            grossAmountAed: buyoutQuote.totalStudentPayoutAed,
            discountAmountAed: 0,
            netAmountAed: buyoutQuote.totalStudentPayoutAed,
            pickupDate,
            returnDate: 'Al Quoz Refurbishment Fleet',
            createdAt: new Date().toLocaleString('en-AE', {
              dateStyle: 'medium',
              timeStyle: 'short',
            }),
            timeSlotLabel: `${activeSlot.windowHours} (${activeSlot.label})`,
            paymentMethodLabel: 'Instant Cash / Bank Transfer at Checkout',
            techSerialNumbers: 'Inspected at Dorm Checkout',
            securityGateAuthority: activeCampus.securityGateAuthority,
            securityGatePassCode: gatePassCode,
            custodyStage: 4,
          };

    onAddBooking(newRecord);
    setTrackedPassId(newRecord.passId);
    setIssuedPass(newRecord);
  };

  return (
    <div className="space-y-10 pb-24">
      {/* Clean Header & Mode Pills */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#e2dfd6] pb-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-[#141413] tracking-tight">
            {mode === 'storage'
              ? 'Book Summer Box Storage'
              : mode === 'lease'
              ? 'Rent Dorm Appliances (9 Months)'
              : 'Sell Your Graduating Appliances'}
          </h1>
          <p className="text-sm text-[#6e6d68] mt-1">
            {mode === 'storage'
              ? 'Free doorstep pickup, 21°C Al Quoz storage, and September return.'
              : mode === 'lease'
              ? 'Choose from 16 PAT-certified appliances & tech items with a 24h swap guarantee.'
              : 'Get 35–450 AED instant cash per unit across 16 dorm appliances & tech items.'}
          </p>
        </div>

        {/* 3 Mode Buttons */}
        <div
          role="group"
          aria-label="Select transaction configurator mode"
          className="inline-flex flex-wrap items-center gap-1 p-1 rounded-full bg-[#e8e6de]"
        >
          <button
            type="button"
            data-testid="mode-storage"
            onClick={() => {
              playClickTone();
              onModeChange('storage');
            }}
            className={`px-4 py-2 text-xs font-bold rounded-full transition-all ${
              mode === 'storage'
                ? 'bg-[#141413] text-white shadow-sm'
                : 'text-[#52514e] hover:text-[#141413]'
            }`}
          >
            Summer Storage
          </button>
          <button
            type="button"
            data-testid="mode-lease"
            onClick={() => {
              playClickTone();
              onModeChange('lease');
            }}
            className={`px-4 py-2 text-xs font-bold rounded-full transition-all ${
              mode === 'lease'
                ? 'bg-[#141413] text-white shadow-sm'
                : 'text-[#52514e] hover:text-[#141413]'
            }`}
          >
            9-Mo Appliance Rental (16)
          </button>
          <button
            type="button"
            data-testid="mode-buyout"
            onClick={() => {
              playClickTone();
              onModeChange('buyout');
            }}
            className={`px-4 py-2 text-xs font-bold rounded-full transition-all ${
              mode === 'buyout'
                ? 'bg-[#0d4a38] text-white shadow-sm'
                : 'text-[#52514e] hover:text-[#141413]'
            }`}
          >
            Sell Gear (Up to 450 AED)
          </button>
        </div>
      </section>

      {/* Secondary View Switcher (Keeps Tracker & Ledger out of the way) */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="inline-flex items-center gap-1.5">
          {[
            { id: 'studio', label: '1. Configure & Book' },
            { id: 'telemetry', label: `2. Track My Boxes (${trackedBooking?.passId})` },
            { id: 'ledger', label: `3. Bookings (${bookings.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStudioSubView(tab.id as typeof studioSubView)}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-colors ${
                studioSubView === tab.id
                  ? 'bg-white text-[#141413] border border-[#d4d2c8] shadow-xs'
                  : 'text-[#6e6d68] hover:text-[#141413]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {studioSubView === 'studio' && mode === 'storage' && (
          <div className="flex flex-wrap items-center gap-2">
            {[
              { label: '2 Boxes (Studio)', boxes: 2, bulky: 0 },
              { label: '3 Boxes + Monitor', boxes: 3, bulky: 1 },
              { label: '5 Boxes + 2 Bulky', boxes: 5, bulky: 2 },
            ].map((preset) => {
              const active = boxCount === preset.boxes && bulkyCount === preset.bulky;
              return (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => {
                    playClickTone();
                    onBoxCountChange(preset.boxes);
                    onBulkyCountChange(preset.bulky);
                  }}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                    active
                      ? 'bg-[#0d4a38] text-white border-[#0d4a38]'
                      : 'bg-white text-[#52514e] border-[#d8d5cb] hover:border-[#141413]'
                  }`}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* MAIN STUDIO VIEW */}
      {studioSubView === 'studio' && (
        <form
          onSubmit={handleIssueVaultPass}
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
        >
          {/* Left 7 Columns: Visual Stage + Clean 3-Step Wizard */}
          <div className="lg:col-span-7 space-y-6">
            {/* Visual Loadout Stage */}
            <VisualLoadoutStage
              mode={mode}
              boxCount={boxCount}
              onBoxCountChange={onBoxCountChange}
              bulkyCount={bulkyCount}
              onBulkyCountChange={onBulkyCountChange}
              selectedLeaseItems={selectedLeaseItems}
              onToggleLeaseItem={onToggleLeaseItem}
              buyoutSelections={buyoutSelections}
              onToggleBuyoutItem={handleToggleBuyoutItem}
              onChangeBuyoutGrade={handleChangeBuyoutGrade}
            />

            {/* Step Indicator Pills (Only ONE step card renders below!) */}
            <div className="rounded-3xl border border-[#e2dfd6] bg-white p-6 sm:p-8 shadow-sm space-y-6">
              <div className="grid grid-cols-3 gap-2 p-1 rounded-2xl bg-[#f6f5f0]">
                {[
                  { step: 1 as const, label: '1. Campus & Load' },
                  { step: 2 as const, label: '2. Pickup Slot' },
                  { step: 3 as const, label: '3. Room & Pay' },
                ].map((s) => (
                  <button
                    key={s.step}
                    type="button"
                    onClick={() => {
                      playClickTone();
                      setWizardStep(s.step);
                    }}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
                      wizardStep === s.step
                        ? 'bg-white text-[#141413] shadow-xs'
                        : 'text-[#6e6d68] hover:text-[#141413]'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              {/* STEP 1 CONTENT: Campus & Volume */}
              {wizardStep === 1 && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label
                      htmlFor="campus-selector"
                      className="block text-sm font-bold text-[#141413]"
                    >
                      Select Your University or Dorm
                    </label>
                    <select
                      id="campus-selector"
                      value={selectedCampusId}
                      onChange={(e) => {
                        playClickTone();
                        onCampusChange(e.target.value);
                      }}
                      className="w-full px-4 py-3.5 rounded-2xl bg-[#f8f7f3] border border-[#d4d2c8] text-sm font-medium text-[#141413] focus:outline-none focus:border-[#0d4a38]"
                    >
                      {CAMPUS_OPTIONS.map((campus) => (
                        <option key={campus.id} value={campus.id}>
                          {campus.name} {campus.isPartner ? '(-15% Partner Discount)' : ''}
                        </option>
                      ))}
                    </select>

                    <div data-testid="partner-grant-banner" className="text-xs text-[#0d4a38] pt-1">
                      {activeCampus.isPartner ? (
                        <span className="inline-flex items-center gap-1.5 font-semibold">
                          <CheckCircle2 className="w-4 h-4" />
                          15% Partner Discount &amp; Dorm Security Gate Slip active (
                          {activeCampus.shortCode})
                        </span>
                      ) : (
                        <span className="text-[#6e6d68]">Standard rate applied.</span>
                      )}
                    </div>
                  </div>

                  {mode === 'storage' && (
                    <div className="space-y-5 pt-4 border-t border-[#efede6]">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-sm font-bold text-[#141413]">
                          Adjust Boxes or Use Room Estimator
                        </span>
                        <button
                          type="button"
                          data-testid="toggle-packing-estimator"
                          onClick={() => setShowPackingHelper((v) => !v)}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0d4a38] hover:underline"
                        >
                          <Calculator className="w-3.5 h-3.5" />
                          <span>
                            {showPackingHelper ? 'Hide Room Estimator' : 'How many boxes do I need?'}
                          </span>
                        </button>
                      </div>

                      {showPackingHelper && (
                        <div
                          data-testid="packing-estimator"
                          className="p-5 rounded-2xl bg-[#f8f7f3] border border-[#d8d5cb] space-y-4"
                        >
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                            {[
                              {
                                label: 'Clothes / Shoes',
                                val: clothingBundles,
                                set: setClothingBundles,
                                max: 6,
                              },
                              {
                                label: 'Books / Folders',
                                val: textbookStacks,
                                set: setTextbookStacks,
                                max: 6,
                              },
                              {
                                label: 'Bedding Set',
                                val: beddingSets,
                                set: setBeddingSets,
                                max: 4,
                              },
                              {
                                label: 'Kitchen Set',
                                val: kitchenwareSets,
                                set: setKitchenwareSets,
                                max: 4,
                              },
                              {
                                label: 'Monitor / PC',
                                val: estMonitors,
                                set: setEstMonitors,
                                max: 3,
                              },
                              {
                                label: 'Mini-Fridge',
                                val: estFridges,
                                set: setEstFridges,
                                max: 2,
                              },
                            ].map((ctrl) => (
                              <div
                                key={ctrl.label}
                                className="p-3 rounded-xl bg-white border border-[#e2dfd6] flex items-center justify-between"
                              >
                                <span className="font-medium text-[#2c2c2a]">{ctrl.label}</span>
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => ctrl.set(Math.max(0, ctrl.val - 1))}
                                    className="w-6 h-6 rounded-full bg-[#f6f5f0] font-mono font-bold"
                                  >
                                    -
                                  </button>
                                  <span className="font-mono font-bold">{ctrl.val}</span>
                                  <button
                                    type="button"
                                    onClick={() => ctrl.set(Math.min(ctrl.max, ctrl.val + 1))}
                                    className="w-6 h-6 rounded-full bg-[#f6f5f0] font-mono font-bold"
                                  >
                                    +
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="flex items-center justify-between pt-2 text-xs">
                            <span className="font-semibold text-[#52514e]">
                              {packingEstimate.packingSummaryText}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                playClickTone();
                                onBoxCountChange(packingEstimate.recommendedBoxes);
                                onBulkyCountChange(packingEstimate.recommendedBulky);
                                setShowPackingHelper(false);
                              }}
                              className="px-4 py-2 rounded-full bg-[#0d4a38] text-white font-bold"
                            >
                              Apply Estimate
                            </button>
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-xs">
                            <label htmlFor="box-slider" className="font-semibold text-[#52514e]">
                              Boxes (120 AED each)
                            </label>
                            <span className="font-mono font-bold text-[#141413]">{boxCount}</span>
                          </div>
                          <input
                            id="box-slider"
                            type="range"
                            min={1}
                            max={8}
                            value={boxCount}
                            onChange={(e) => onBoxCountChange(Number(e.target.value))}
                            className="w-full accent-[#0d4a38] cursor-pointer"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <div className="flex justify-between text-xs">
                            <label htmlFor="bulky-slider" className="font-semibold text-[#52514e]">
                              Bulky Items (120 AED each)
                            </label>
                            <span className="font-mono font-bold text-[#141413]">{bulkyCount}</span>
                          </div>
                          <input
                            id="bulky-slider"
                            type="range"
                            min={0}
                            max={4}
                            value={bulkyCount}
                            onChange={(e) => onBulkyCountChange(Number(e.target.value))}
                            className="w-full accent-[#0d4a38] cursor-pointer"
                          />
                        </div>
                      </div>

                      {bulkyCount > 0 && (
                        <div>
                          <label
                            htmlFor="tech-serial-input"
                            className="block text-xs font-semibold text-[#52514e] mb-1"
                          >
                            Monitor / Appliance Serial Note (for 2,000 AED Insurance)
                          </label>
                          <input
                            id="tech-serial-input"
                            type="text"
                            value={techSerialInput}
                            onChange={(e) => setTechSerialInput(e.target.value)}
                            aria-label="High-value electronics serial number declaration"
                            className="w-full px-4 py-2.5 rounded-xl bg-[#f8f7f3] border border-[#d4d2c8] text-xs font-mono text-[#141413]"
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {mode === 'lease' && (
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={onSelectAllLeaseItems}
                        className="px-4 py-2.5 rounded-full bg-[#e9f5ef] text-[#0d4a38] text-xs font-bold"
                      >
                        Select All 4 Items (84 AED/mo Partner Bundle)
                      </button>
                    </div>
                  )}

                  <div className="flex justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        playClickTone();
                        setWizardStep(2);
                      }}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#141413] text-white text-xs font-bold"
                    >
                      <span>Next: Choose Pickup Time</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2 CONTENT: 2-Hour Pickup Slot Picker */}
              {wizardStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-base font-bold text-[#141413]">
                      Choose a 2-Hour Doorstep Window
                    </h2>
                    <p className="text-xs text-[#6e6d68]">
                      Capped at 40 bookings per window so couriers arrive on time.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {timeSlots.map((slot) => {
                      const isFull = slot.bookedCount >= slot.maxCapacity;
                      const isSelected = selectedSlotId === slot.id;
                      return (
                        <button
                          key={slot.id}
                          type="button"
                          data-testid={`slot-${slot.id}`}
                          disabled={isFull}
                          onClick={() => {
                            playClickTone();
                            setSelectedSlotId(slot.id);
                            if (slot.isOffPeak && mode === 'storage') {
                              setEarlyBirdEligible(true);
                            }
                          }}
                          className={`p-4 rounded-2xl border text-left transition-all ${
                            isFull
                              ? 'bg-[#f6f5f0] border-[#e2dfd6] opacity-45 cursor-not-allowed'
                              : isSelected
                              ? 'bg-[#141413] text-white border-[#141413]'
                              : 'bg-[#f8f7f3] text-[#141413] border-[#d8d5cb] hover:border-[#141413]'
                          }`}
                        >
                          <div className="flex items-center justify-between text-xs font-mono font-bold">
                            <span>{slot.windowHours}</span>
                            <span
                              className={
                                isFull
                                  ? 'text-rose-600'
                                  : isSelected
                                  ? 'text-[#6ee7b7]'
                                  : 'text-[#0d4a38]'
                              }
                            >
                              {isFull ? 'FULL' : `${slot.bookedCount}/40`}
                            </span>
                          </div>
                          <div
                            className={`text-xs mt-1 ${
                              isSelected ? 'text-[#d4d2c8]' : 'text-[#6e6d68]'
                            }`}
                          >
                            {slot.label} {slot.isOffPeak ? '· -50 AED Off-Peak' : ''}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="pickup-date-input"
                        className="block text-xs font-semibold text-[#52514e] mb-1"
                      >
                        Pickup Date
                      </label>
                      <input
                        id="pickup-date-input"
                        type="date"
                        value={pickupDate}
                        onChange={(e) => setPickupDate(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-[#f8f7f3] border border-[#d4d2c8] text-xs font-mono text-[#141413]"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="return-date-input"
                        className="block text-xs font-semibold text-[#52514e] mb-1"
                      >
                        September Return Date
                      </label>
                      <input
                        id="return-date-input"
                        type="date"
                        value={returnDate}
                        onChange={(e) => setReturnDate(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-[#f8f7f3] border border-[#d4d2c8] text-xs font-mono text-[#141413]"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => setWizardStep(1)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#52514e] hover:text-[#141413]"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        playClickTone();
                        setWizardStep(3);
                      }}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#141413] text-white text-xs font-bold"
                    >
                      <span>Next: Room &amp; Payment</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3 CONTENT: Room Address & Payment */}
              {wizardStep === 3 && (
                <div className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="student-name-input"
                        className="block text-xs font-semibold text-[#52514e] mb-1"
                      >
                        Your Full Name
                      </label>
                      <input
                        id="student-name-input"
                        type="text"
                        value={studentName}
                        onChange={(e) => setStudentName(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-[#f8f7f3] border border-[#d4d2c8] text-xs text-[#141413]"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="student-email-input"
                        className="block text-xs font-semibold text-[#52514e] mb-1"
                      >
                        University Email (.ac.ae / .edu)
                      </label>
                      <input
                        id="student-email-input"
                        type="email"
                        value={studentEmail}
                        onChange={(e) => setStudentEmail(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-[#f8f7f3] border border-[#d4d2c8] text-xs text-[#141413]"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label
                        htmlFor="dorm-address-input"
                        className="block text-xs font-semibold text-[#52514e] mb-1"
                      >
                        Dorm or Apartment Building &amp; Room Number
                      </label>
                      <input
                        id="dorm-address-input"
                        type="text"
                        value={dormAddress}
                        onChange={(e) => setDormAddress(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-[#f8f7f3] border border-[#d4d2c8] text-xs text-[#141413]"
                      />
                    </div>
                  </div>

                  {mode !== 'buyout' && (
                    <div className="space-y-2">
                      <div className="text-xs font-semibold text-[#52514e]">Payment Method</div>
                      <div className="grid grid-cols-2 gap-2.5">
                        {(
                          [
                            {
                              id: 'tabby',
                              title: 'Tabby (Split in 4)',
                              sub: `4 × ${(activeNetTotal / 4).toFixed(0)} AED · 0%`,
                            },
                            {
                              id: 'apple_pay',
                              title: 'Apple Pay / Card',
                              sub: 'Instant checkout',
                            },
                            {
                              id: 'parent_link',
                              title: 'Parent WhatsApp Link',
                              sub: 'Send link to parent',
                            },
                            {
                              id: 'bursary',
                              title: 'Dorm Bursary Account',
                              sub: 'Bill to student ID',
                            },
                          ] as const
                        ).map((pm) => (
                          <button
                            key={pm.id}
                            type="button"
                            data-testid={`pay-${pm.id}`}
                            onClick={() => {
                              playClickTone();
                              setPaymentMethod(pm.id);
                            }}
                            className={`p-3 rounded-2xl border text-left text-xs transition-all ${
                              paymentMethod === pm.id
                                ? 'bg-[#141413] text-white border-[#141413]'
                                : 'bg-[#f8f7f3] text-[#141413] border-[#d8d5cb]'
                            }`}
                          >
                            <div className="font-bold">{pm.title}</div>
                            <div
                              className={`text-[11px] font-mono ${
                                paymentMethod === pm.id ? 'text-[#6ee7b7]' : 'text-[#6e6d68]'
                              }`}
                            >
                              {pm.sub}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <label className="flex items-center gap-2.5 text-xs text-[#52514e] cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={agreedToRules}
                      onChange={(e) => setAgreedToRules(e.target.checked)}
                      className="accent-[#0d4a38]"
                    />
                    <span>
                      I agree to the 24h fridge defrost &amp; 25 kg box limit.{' '}
                      <button
                        type="button"
                        onClick={onOpenTerms}
                        className="text-[#0d4a38] font-semibold underline"
                      >
                        Rules
                      </button>
                    </span>
                  </label>

                  {validationError && (
                    <div
                      role="alert"
                      className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2 text-xs text-rose-700"
                    >
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{validationError}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => setWizardStep(2)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#52514e] hover:text-[#141413]"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back to Pickup Slot</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right 5 Columns: Crisp White Sticky Summary Card */}
          <div className="lg:col-span-5 rounded-3xl border border-[#e2dfd6] bg-white p-8 space-y-6 sticky top-24 shadow-[0_20px_50px_rgba(20,20,19,0.06)]">
            <div className="flex items-center justify-between border-b border-[#efede6] pb-5">
              <div>
                <div className="text-xs font-semibold text-[#6e6d68]">Your Summary</div>
                <h2 className="text-xl font-bold text-[#141413]">
                  {mode === 'storage'
                    ? 'Summer Valet Storage'
                    : mode === 'lease'
                    ? '9-Month Hardware Rental'
                    : 'Senior Cash Buyout'}
                </h2>
              </div>
              <QrCode className="w-7 h-7 text-[#0d4a38]" />
            </div>

            {mode === 'storage' && (
              <div className="space-y-3 text-xs">
                <div className="flex justify-between text-[#52514e]">
                  <span>{storageQuote.boxCount}× Double-Walled Boxes</span>
                  <span data-testid="box-subtotal-value" className="font-mono font-bold text-[#141413]">
                    {storageQuote.boxSubtotalAed} AED
                  </span>
                </div>
                {storageQuote.bulkyCount > 0 && (
                  <div className="flex justify-between text-[#52514e]">
                    <span>{storageQuote.bulkyCount}× Bulky Tech / Fridge</span>
                    <span data-testid="bulky-subtotal-value" className="font-mono font-bold text-[#141413]">
                      {storageQuote.bulkySubtotalAed} AED
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-[#52514e]">
                  <span>Pickup Window</span>
                  <span className="font-mono text-[#141413]">{activeSlot.windowHours}</span>
                </div>
                <div className="flex justify-between text-[#52514e] pt-2 border-t border-[#efede6]">
                  <span>Gross Subtotal</span>
                  <span data-testid="gross-total-value" className="font-mono text-[#141413]">
                    {storageQuote.grossSubtotalAed} AED
                  </span>
                </div>
                <div className="flex justify-between text-[#0d4a38] font-semibold">
                  <span>15% Partner Discount ({storageQuote.campus.shortCode})</span>
                  <span data-testid="partner-discount-value" className="font-mono">
                    -{storageQuote.partnerDiscountAed} AED
                  </span>
                </div>
                {storageQuote.earlyBirdDiscountAed > 0 && (
                  <div className="flex justify-between text-[#0d4a38] font-semibold">
                    <span>Off-Peak Window Credit</span>
                    <span className="font-mono">-{storageQuote.earlyBirdDiscountAed} AED</span>
                  </div>
                )}

                <div className="pt-4 border-t border-[#efede6] flex items-baseline justify-between">
                  <div>
                    <div className="text-sm font-bold text-[#141413]">Total for Summer</div>
                    <div className="text-xs font-mono text-[#0d4a38]">{paymentPlan.badgeText}</div>
                  </div>
                  <div
                    data-testid="net-total-value"
                    className="text-4xl font-bold text-[#141413] font-mono tabular-nums"
                  >
                    {storageQuote.netTotalAed} AED
                  </div>
                </div>
              </div>
            )}

            {mode === 'lease' && (
              <div className="space-y-3 text-xs">
                {leaseQuote.selectedItems.map((it) => (
                  <div key={it.id} className="flex justify-between text-[#52514e]">
                    <span>{it.name}</span>
                    <span className="font-mono font-semibold text-[#141413]">
                      {it.monthlyRateAed} AED/mo
                    </span>
                  </div>
                ))}
                <div className="flex justify-between text-[#0d4a38] font-semibold pt-2 border-t border-[#efede6]">
                  <span>15% Partner Discount ({leaseQuote.campus.shortCode})</span>
                  <span data-testid="partner-discount-value" className="font-mono">
                    -{leaseQuote.partnerMonthlyDiscountAed} AED/mo
                  </span>
                </div>

                <div className="pt-4 border-t border-[#efede6] flex items-baseline justify-between">
                  <div>
                    <div className="text-sm font-bold text-[#141413]">Monthly Rental</div>
                    <div className="text-xs text-[#6e6d68]">
                      9-Month Total: {leaseQuote.netContractTotalAed} AED
                    </div>
                  </div>
                  <div
                    data-testid="net-total-value"
                    className="text-4xl font-bold text-[#0d4a38] font-mono tabular-nums"
                  >
                    {leaseQuote.netMonthlyAed} AED
                  </div>
                </div>
              </div>
            )}

            {mode === 'buyout' && (
              <div data-testid="buyout-panel" className="space-y-3 text-xs">
                {buyoutQuote.items.map((entry) => (
                  <div key={entry.item.id} className="flex justify-between text-[#52514e]">
                    <span>
                      {entry.item.name} (Grade {entry.grade})
                    </span>
                    <span className="font-mono font-bold text-[#0d4a38]">
                      +{entry.payoutAed} AED
                    </span>
                  </div>
                ))}

                <div className="pt-4 border-t border-[#efede6] flex items-baseline justify-between">
                  <div>
                    <div className="text-sm font-bold text-[#141413]">Instant Cash to You</div>
                    <div className="text-xs text-[#6e6d68]">Paid at dorm checkout</div>
                  </div>
                  <div
                    data-testid="net-total-value"
                    className="text-4xl font-bold text-[#0d4a38] font-mono tabular-nums"
                  >
                    +{buyoutQuote.totalStudentPayoutAed} AED
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              data-testid="generate-pass-btn"
              className="w-full py-4 px-6 text-sm font-bold text-white bg-[#0d4a38] hover:bg-[#09382a] rounded-full transition-colors shadow-sm"
            >
              {mode === 'buyout'
                ? 'Claim Cash Buyout Voucher'
                : 'Get Digital Vault Pass & Gate Slip'}
            </button>
          </div>
        </form>
      )}

      {/* SUB-VIEW 2: LIVE 5-STAGE CUSTODY TRACKER */}
      {studioSubView === 'telemetry' && trackedBooking && (
        <section
          data-testid="custody-tracker"
          className="rounded-3xl border border-[#e2dfd6] bg-white p-8 space-y-6"
        >
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#efede6] pb-5">
            <div>
              <h2 className="text-2xl font-bold text-[#141413]">
                Live Custody Tracker —{' '}
                <span className="font-mono text-[#0d4a38]">{trackedBooking.passId}</span>
              </h2>
              <p className="text-xs text-[#6e6d68] mt-1">
                {trackedBooking.studentName} · {trackedBooking.dormAddress} · Al Quoz Vault: 21.0°C
              </p>
            </div>

            <button
              type="button"
              data-testid="advance-custody-btn"
              onClick={() => {
                playClickTone();
                onAdvanceBookingStage(trackedBooking.passId);
              }}
              className="px-5 py-2.5 rounded-full bg-[#141413] text-white text-xs font-bold"
            >
              Advance Stage (Demo) →
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {CUSTODY_STAGES.map((st) => {
              const currentStage = trackedBooking.custodyStage || 4;
              const isCompleted = st.stage <= currentStage;
              const isCurrent = st.stage === currentStage;
              return (
                <div
                  key={st.stage}
                  className={`p-5 rounded-2xl border ${
                    isCurrent
                      ? 'bg-[#141413] text-white border-[#141413]'
                      : isCompleted
                      ? 'bg-[#f4faf6] text-[#141413] border-[#0d4a38]/40'
                      : 'bg-[#f8f7f3] text-[#85837d] border-[#e2dfd6]'
                  }`}
                >
                  <div className="text-[11px] font-mono font-bold mb-1">
                    {isCurrent ? 'ACTIVE NOW' : isCompleted ? 'DONE' : 'UPCOMING'}
                  </div>
                  <div className="text-sm font-bold">{st.title}</div>
                  <p
                    className={`text-xs mt-1 ${
                      isCurrent ? 'text-[#d4d2c8]' : 'text-[#6e6d68]'
                    }`}
                  >
                    {st.detail}
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* SUB-VIEW 3: BOOKINGS LEDGER */}
      {studioSubView === 'ledger' && (
        <section className="rounded-3xl border border-[#e2dfd6] bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#e2dfd6] text-[#6e6d68] bg-[#f8f7f3]">
                  <th className="py-4 px-6 font-semibold">Pass ID</th>
                  <th className="py-4 px-6 font-semibold">Student</th>
                  <th className="py-4 px-6 font-semibold">Slot &amp; Gate Pass</th>
                  <th className="py-4 px-6 font-semibold">Items</th>
                  <th className="py-4 px-6 font-semibold text-right">Total</th>
                  <th className="py-4 px-6 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#efede6] text-[#141413]">
                {bookings.map((bk) => (
                  <tr key={bk.passId}>
                    <td className="py-4 px-6 font-mono font-bold text-[#0d4a38]">{bk.passId}</td>
                    <td className="py-4 px-6">
                      <div className="font-bold">{bk.studentName}</div>
                      <div className="text-[#6e6d68]">{bk.dormAddress}</div>
                    </td>
                    <td className="py-4 px-6 font-mono">
                      <div>{bk.timeSlotLabel}</div>
                      <div className="text-[#0d4a38]">{bk.securityGatePassCode}</div>
                    </td>
                    <td className="py-4 px-6">{bk.summaryLine}</td>
                    <td className="py-4 px-6 font-mono font-bold text-right">
                      {bk.netAmountAed} AED
                    </td>
                    <td className="py-4 px-6 text-right space-x-2">
                      <button
                        type="button"
                        onClick={() => setIssuedPass(bk)}
                        className="px-3.5 py-1.5 rounded-full bg-[#141413] text-white font-semibold"
                      >
                        Open Pass
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* CLEAN BOARDING PASS MODAL */}
      {issuedPass && (
        <div
          data-testid="vault-pass-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="vault-pass-modal-title"
        >
          <motion.div
            initial={{ opacity: 1, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.12 }}
            className="w-full max-w-md rounded-3xl bg-white border border-[#d4d2c8] overflow-hidden shadow-2xl my-8 text-[#141413]"
          >
            <div className="px-6 py-5 bg-[#0d4a38] text-white flex items-center justify-between">
              <div>
                <div className="text-[11px] font-mono uppercase tracking-wider text-[#a7f3d0]">
                  CampusVault UAE Boarding Pass
                </div>
                <h3 id="vault-pass-modal-title" className="text-lg font-bold">
                  {issuedPass.passId}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIssuedPass(null)}
                aria-label="Close Digital Vault Pass modal"
                className="p-1.5 rounded-full hover:bg-white/10 text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="space-y-2 font-mono">
                <div className="flex justify-between">
                  <span className="text-[#6e6d68]">Student:</span>
                  <span className="font-bold">{issuedPass.studentName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6e6d68]">Dorm Door:</span>
                  <span className="font-bold">{issuedPass.dormAddress}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6e6d68]">2h Window:</span>
                  <span className="font-bold text-[#0d4a38]">{issuedPass.timeSlotLabel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6e6d68]">Package:</span>
                  <span className="font-bold text-right max-w-[210px]">
                    {issuedPass.summaryLine}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-bold pt-2 border-t border-[#efede6]">
                  <span>Total:</span>
                  <span data-testid="modal-vault-pass-id" className="text-[#0d4a38]">
                    {issuedPass.netAmountAed} AED ({issuedPass.passId})
                  </span>
                </div>
              </div>

              {/* Dorm Security Gate Clearance Slip */}
              <div className="p-4 rounded-2xl bg-[#f4faf6] border border-[#0d4a38]/30 space-y-1 font-mono text-[11px]">
                <div className="flex items-center justify-between font-bold text-[#0d4a38]">
                  <span className="flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>DORM GATE CLEARANCE</span>
                  </span>
                  <span data-testid="gate-pass-code">{issuedPass.securityGatePassCode}</span>
                </div>
                <div className="text-[#52514e]">{issuedPass.securityGateAuthority}</div>
              </div>

              {/* Barcode */}
              <div className="p-3 rounded-2xl bg-[#f8f7f3] border border-[#e2dfd6] flex flex-col items-center space-y-1">
                <div
                  aria-label="Serialized Custody Barcode"
                  className="w-full h-8 flex items-stretch justify-center gap-[2px]"
                >
                  {[3, 1, 4, 2, 1, 3, 1, 2, 4, 1, 2, 3, 1, 2, 1, 4, 2, 1, 3, 2].map((w, idx) => (
                    <div key={idx} className="bg-[#141413]" style={{ width: `${w * 3}px` }} />
                  ))}
                </div>
                <div className="font-mono text-[11px] font-bold tracking-widest">
                  *{issuedPass.passId}*
                </div>
              </div>

              {/* Google Docs Sync */}
              <div className="flex items-center justify-between pt-2">
                <span className="font-semibold text-[#52514e]">Save to Google Docs:</span>
                {hasGoogleToken ? (
                  <button
                    type="button"
                    onClick={() => onExportPassToGoogleDocs(issuedPass)}
                    disabled={isExportingDoc}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#0d4a38] text-white font-bold"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>{isExportingDoc ? 'Saving...' : 'Export to Docs'}</span>
                  </button>
                ) : (
                  <GoogleSignInButton
                    user={user}
                    hasToken={hasGoogleToken}
                    isLoggingIn={isLoggingIn}
                    onLogin={onGoogleLogin}
                    onLogout={onGoogleLogout}
                    label="Sign in to Save"
                  />
                )}
              </div>

              {docStatusMessage && (
                <div className="text-[11px] text-[#0d4a38] font-mono flex items-center justify-between">
                  <span>{docStatusMessage}</span>
                  {lastExportedDocUrl && (
                    <a
                      href={lastExportedDocUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 underline"
                    >
                      <span>Open</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              )}
            </div>

            <div className="px-6 py-4 bg-[#f8f7f3] border-t border-[#e2dfd6] flex items-center justify-between">
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#52514e] hover:text-[#141413]"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print</span>
              </button>
              <button
                type="button"
                onClick={() => setIssuedPass(null)}
                className="px-5 py-2 rounded-full bg-[#141413] text-white text-xs font-bold"
              >
                Modify Configuration
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
