import React from 'react';
import { X, ShieldCheck, Scale, ThermometerSnowflake, Clock, Award } from 'lucide-react';

interface TermsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onAcknowledge?: () => void;
}

export const TermsDrawer: React.FC<TermsDrawerProps> = ({
  isOpen,
  onClose,
  onAcknowledge,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-stone-950/50 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="terms-drawer-title"
    >
      <div className="relative w-full max-w-lg bg-white border-l border-stone-200 h-full flex flex-col justify-between overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between px-6 py-5 border-b border-stone-200">
          <div>
            <h2 id="terms-drawer-title" className="text-lg font-bold text-stone-950">
              Custody &amp; 24h Defrost Rules
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              DET Commercial Storage Compliance · Al Quoz Ind. 3
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close terms and conditions drawer"
            className="p-2 text-stone-500 hover:text-stone-950 rounded-xl hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-4 text-sm text-stone-700">
          <div className="p-4 rounded-2xl bg-[#f6f5f0] border border-stone-200 space-y-1">
            <div className="flex items-center gap-2 text-stone-950 font-bold text-xs">
              <Award className="w-4 h-4 text-[#0d4a38] shrink-0" />
              <span>1. 15% Partner University Grant</span>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              Students at UOWD, Middlesex, Heriot-Watt, BITS Pilani, Amity, and The Myriad / KSK Homes receive an automatic 15% discount with a valid <code className="text-stone-900 font-semibold">.ac.ae</code> ID card.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#f6f5f0] border border-stone-200 space-y-1">
            <div className="flex items-center gap-2 text-stone-950 font-bold text-xs">
              <Scale className="w-4 h-4 text-[#0d4a38] shrink-0" />
              <span>2. 25 kg Maximum Box Weight</span>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              Per UAE MoHRE safety rules, each double-walled box is capped at 25 kg. Boxes over 25 kg are split into a second box (60 AED repackaging fee).
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#f6f5f0] border border-stone-200 space-y-1">
            <div className="flex items-center gap-2 text-stone-950 font-bold text-xs">
              <ThermometerSnowflake className="w-4 h-4 text-[#0d4a38] shrink-0" />
              <span>3. Mandatory 24-Hour Fridge Defrost</span>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              All mini-fridges must be unplugged, defrosted, and wiped dry 24 hours before pickup. Units leaking meltwater incur a 50 AED cleaning surcharge.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#f6f5f0] border border-stone-200 space-y-1">
            <div className="flex items-center gap-2 text-stone-950 font-bold text-xs">
              <Clock className="w-4 h-4 text-amber-700 shrink-0" />
              <span>4. Unclaimed Storage Past October 1</span>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              Uncollected items past October 1 without an extension incur 15 AED/day demurrage and transfer to the circular fleet after 90 days.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#f6f5f0] border border-stone-200 space-y-1">
            <div className="flex items-center gap-2 text-stone-950 font-bold text-xs">
              <ShieldCheck className="w-4 h-4 text-[#0d4a38] shrink-0" />
              <span>5. 2,000 AED Custody Insurance &amp; QR Seals</span>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              Every bundle includes 2,000 AED coverage against fire, water, and transit damage inside our 21°C Al Quoz vault, tracked via tamper-evident QR seals.
            </p>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-stone-200 bg-[#f6f5f0] flex items-center justify-between gap-4">
          <span className="text-xs text-stone-500">
            CampusVault UAE · Al Quoz Ind. 3
          </span>
          <div className="flex items-center gap-2">
            {onAcknowledge && (
              <button
                type="button"
                onClick={() => {
                  onAcknowledge();
                  onClose();
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#0d4a38] hover:bg-[#09382a] rounded-xl transition-colors"
              >
                Accept Rules
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-stone-700 bg-white hover:bg-stone-100 border border-stone-300 rounded-xl transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
