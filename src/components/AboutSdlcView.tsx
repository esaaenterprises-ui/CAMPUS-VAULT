import React, { useState } from 'react';
import { calculateUnitEconomics } from '../utils/pricing';
import { User } from 'firebase/auth';
import { GoogleSignInButton } from './GoogleSignInButton';
import {
  FileText,
  ExternalLink,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';

interface AboutSdlcViewProps {
  user: User | null;
  hasGoogleToken: boolean;
  isLoggingIn: boolean;
  onGoogleLogin: () => void;
  onGoogleLogout: () => void;
  onExportSdlcReportToDocs: () => Promise<void>;
  isExportingDoc: boolean;
  lastExportedDocUrl: string | null;
  docStatusMessage: string | null;
  onOpenTerms: () => void;
}

export const AboutSdlcView: React.FC<AboutSdlcViewProps> = ({
  user,
  hasGoogleToken,
  isLoggingIn,
  onGoogleLogin,
  onGoogleLogout,
  onExportSdlcReportToDocs,
  isExportingDoc,
  lastExportedDocUrl,
  docStatusMessage,
  onOpenTerms,
}) => {
  const [simulatedStudents, setSimulatedStudents] = useState<number>(200);
  const [simulatedLeasedKits, setSimulatedLeasedKits] = useState<number>(200);

  const econ = calculateUnitEconomics(simulatedStudents, simulatedLeasedKits);

  return (
    <div className="space-y-14 pb-20">
      {/* Header & Google Docs Executive Brief Export */}
      <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-stone-200 pb-8">
        <div className="space-y-2 max-w-2xl">
          <div className="text-xs font-semibold text-[#0d4a38]">
            Circular Operations &amp; Unit Economics
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-950 tracking-tight">
            Contribution Margin &amp; Circular Model
          </h1>
          <p className="text-sm text-stone-600 leading-relaxed">
            How CampusVault UAE saves students from paying 10,500–22,500 AED in empty summer rent while achieving break-even at just 200 students.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0">
          <div className="space-y-0.5">
            <div className="text-xs font-bold text-stone-900">
              Google Docs Executive Brief
            </div>
            <div className="text-[11px] text-stone-500">
              Export unit economics &amp; operational model to Google Docs.
            </div>
          </div>

          {hasGoogleToken ? (
            <button
              type="button"
              onClick={onExportSdlcReportToDocs}
              disabled={isExportingDoc}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-[#0d4a38] hover:bg-[#09382a] disabled:opacity-50 rounded-xl transition-colors whitespace-nowrap shrink-0"
            >
              <FileText className="w-4 h-4" />
              <span>
                {isExportingDoc ? 'Creating Doc...' : 'Export Executive Brief'}
              </span>
            </button>
          ) : (
            <GoogleSignInButton
              user={user}
              hasToken={hasGoogleToken}
              isLoggingIn={isLoggingIn}
              onLogin={onGoogleLogin}
              onLogout={onGoogleLogout}
              label="Sign in for Docs Export"
            />
          )}
        </div>
      </section>

      {docStatusMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-wrap items-center justify-between gap-3 text-xs text-emerald-950">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#0d4a38] shrink-0" />
            <span>{docStatusMessage}</span>
          </div>
          {lastExportedDocUrl && (
            <a
              href={lastExportedDocUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 font-semibold text-[#0d4a38] hover:underline"
            >
              <span>Open Exported Google Doc</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      )}

      {/* Section 1: Interactive Contribution Margin & Break-Even Simulator */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Unit Contribution Margin & Fixed Costs */}
        <div className="lg:col-span-6 rounded-3xl border border-stone-200/90 bg-white p-7 md:p-8 space-y-6 shadow-xs">
          <div>
            <div className="text-xs font-semibold text-[#0d4a38]">
              Per-Student Unit Economics
            </div>
            <h2 className="text-2xl font-bold text-stone-950 mt-1">
              360 AED Contribution Margin (80% CM)
            </h2>
            <p className="text-xs text-stone-500 mt-1">
              Standard Summer Package: 3 Double-Walled Boxes + 1 Bulky Item = 450 AED
            </p>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center p-3.5 rounded-xl bg-[#f6f5f0] border border-stone-200">
              <span className="font-medium text-stone-700">
                Unit Selling Price (3 Boxes + 1 Bulky)
              </span>
              <span className="font-mono font-bold text-stone-950 text-sm tabular-nums">
                {econ.unitSellingPriceAed} AED
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#f6f5f0] border border-stone-200 space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium text-stone-700">
                  Direct Variable Cost per Student
                </span>
                <span className="font-mono font-bold text-rose-700 text-sm tabular-nums">
                  -{econ.unitVariableCostAed} AED
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-stone-200/80 text-[11px] text-stone-500 font-mono">
                <div>Boxes/QR: 25 AED</div>
                <div>Van/Labor: 45 AED</div>
                <div>Insurance: 20 AED</div>
              </div>
            </div>

            <div className="flex justify-between items-center p-4 rounded-xl bg-emerald-50 border border-emerald-200">
              <span className="font-bold text-emerald-950">
                Unit Contribution Margin (P − V)
              </span>
              <span className="font-mono font-extrabold text-[#0d4a38] text-base tabular-nums">
                {econ.unitContributionMarginAed} AED ({econ.contributionMarginRatioPercent}%)
              </span>
            </div>
          </div>

          <div className="space-y-2.5 pt-2">
            <div className="text-xs font-bold text-stone-800">
              90-Day Summer Fixed Costs (72,000 AED Total)
            </div>
            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <div className="p-3 rounded-xl bg-[#f6f5f0] border border-stone-200">
                <div className="text-stone-500">Al Quoz 21°C Vault Lease</div>
                <div className="font-mono font-bold text-stone-950 mt-0.5">45,000 AED</div>
              </div>
              <div className="p-3 rounded-xl bg-[#f6f5f0] border border-stone-200">
                <div className="text-stone-500">Sprinter Van Fleet</div>
                <div className="font-mono font-bold text-stone-950 mt-0.5">14,000 AED</div>
              </div>
              <div className="p-3 rounded-xl bg-[#f6f5f0] border border-stone-200">
                <div className="text-stone-500">Campus Ambassadors</div>
                <div className="font-mono font-bold text-stone-950 mt-0.5">8,000 AED</div>
              </div>
              <div className="p-3 rounded-xl bg-[#f6f5f0] border border-stone-200">
                <div className="text-stone-500">QR Platform &amp; Licensing</div>
                <div className="font-mono font-bold text-stone-950 mt-0.5">5,000 AED</div>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-stone-900 text-white text-xs space-y-1">
            <div className="font-mono font-bold text-emerald-300">
              BREAK-EVEN = 72,000 AED ÷ 360 AED = 200 STUDENTS
            </div>
            <div className="text-stone-300">
              Just {econ.breakEvenMarketSharePercent}% of Dubai&apos;s 30,000+ target corridor students covers all summer operating costs.
            </div>
          </div>
        </div>

        {/* Right: Interactive Volume & Year-Round Lease Simulator */}
        <div className="lg:col-span-6 rounded-3xl border border-stone-200/90 bg-white p-7 md:p-8 space-y-6 shadow-xs">
          <div>
            <div className="text-xs font-semibold text-[#0d4a38]">
              Interactive Cash-Flow Simulator
            </div>
            <h2 className="text-2xl font-bold text-stone-950 mt-1">
              Summer Storage + 9-Month Hardware MRR
            </h2>
          </div>

          <div className="space-y-5">
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <label htmlFor="sim-students-slider" className="text-stone-700 font-semibold">
                  Summer Storage Students (Break-Even = 200)
                </label>
                <span className="font-mono font-bold text-[#0d4a38] tabular-nums">
                  {simulatedStudents} Students
                </span>
              </div>
              <input
                id="sim-students-slider"
                type="range"
                min={100}
                max={600}
                step={25}
                value={simulatedStudents}
                onChange={(e) => setSimulatedStudents(Number(e.target.value))}
                className="w-full accent-[#0d4a38] cursor-pointer"
              />
              <div className="flex justify-between text-[11px] font-mono text-stone-400">
                <span>100</span>
                <span>200 (Break-Even)</span>
                <span>600 Students</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <label htmlFor="sim-kits-slider" className="text-stone-700 font-semibold">
                  9-Month Leased Hardware Kits (99 AED/mo)
                </label>
                <span className="font-mono font-bold text-[#0d4a38] tabular-nums">
                  {simulatedLeasedKits} Active Kits
                </span>
              </div>
              <input
                id="sim-kits-slider"
                type="range"
                min={50}
                max={400}
                step={25}
                value={simulatedLeasedKits}
                onChange={(e) => setSimulatedLeasedKits(Number(e.target.value))}
                className="w-full accent-[#0d4a38] cursor-pointer"
              />
              <div className="flex justify-between text-[11px] font-mono text-stone-400">
                <span>50 Kits</span>
                <span>200 Kits (19,800 AED/mo)</span>
                <span>400 Kits</span>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#f6f5f0] border border-stone-200 space-y-3 text-xs font-mono">
            <div className="flex justify-between text-stone-600">
              <span>Summer Gross Revenue ({simulatedStudents} × 450 AED):</span>
              <span className="text-stone-950 font-bold tabular-nums">
                {econ.summerGrossRevenueAed.toLocaleString()} AED
              </span>
            </div>
            <div className="flex justify-between text-stone-600">
              <span>Summer Net Profit (After 72k Fixed Cost):</span>
              <span
                className={`font-bold tabular-nums ${
                  econ.summerNetProfitAed >= 0 ? 'text-[#0d4a38]' : 'text-rose-700'
                }`}
              >
                {econ.summerNetProfitAed >= 0 ? '+' : ''}
                {econ.summerNetProfitAed.toLocaleString()} AED
              </span>
            </div>
            <div className="flex justify-between text-stone-700 pt-2.5 border-t border-stone-200">
              <span>Monthly Academic Lease MRR ({simulatedLeasedKits} × 99 AED):</span>
              <span className="font-bold text-[#0d4a38] tabular-nums">
                {econ.monthlyTermRecurringRevenueAed.toLocaleString()} AED / mo
              </span>
            </div>
            <div className="flex justify-between text-stone-600">
              <span>8-Month Off-Season Hardware Revenue:</span>
              <span className="text-stone-950 font-bold tabular-nums">
                {econ.eightMonthTermRevenueAed.toLocaleString()} AED
              </span>
            </div>
            <div className="flex justify-between text-sm font-extrabold text-stone-950 pt-3 border-t border-stone-300">
              <span>12-Month Combined Operating Surplus:</span>
              <span className="text-[#0d4a38] tabular-nums">
                {econ.combinedAnnualOperatingSurplusAed.toLocaleString()} AED
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Clean Comparison Table */}
      <section className="rounded-3xl border border-stone-200/90 bg-white overflow-hidden shadow-xs">
        <div className="px-7 py-5 border-b border-stone-200 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-stone-950">
              Why Students Switch to CampusVault UAE
            </h2>
            <p className="text-xs text-stone-500">
              Compared against empty summer rent, commercial self-storage units, and last-minute classifieds
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenTerms}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors"
          >
            <ShieldCheck className="w-4 h-4 text-[#0d4a38]" />
            <span>View Custody &amp; 24h Defrost Rules</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-stone-200 text-stone-500 bg-[#f6f5f0]">
                <th className="py-3.5 px-6 font-semibold">Feature</th>
                <th className="py-3.5 px-6 font-semibold">Empty Summer Rent (3 Mos)</th>
                <th className="py-3.5 px-6 font-semibold">Traditional Self-Storage</th>
                <th className="py-3.5 px-6 font-semibold">Classifieds Panic Sale</th>
                <th className="py-3.5 px-6 font-bold text-[#0d4a38]">CampusVault UAE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200 text-stone-700">
              <tr>
                <td className="py-4 px-6 font-semibold text-stone-950">90-Day Summer Cost</td>
                <td className="py-4 px-6">
                  10,500 AED (Shared Dorm) to 16,500 AED (Studio)
                </td>
                <td className="py-4 px-6">1,800–3,600 AED (Full room min)</td>
                <td className="py-4 px-6">80% markdown loss at exam week</td>
                <td className="py-4 px-6 font-mono font-bold text-[#0d4a38]">
                  306 AED net (3 boxes with 15% Grant)
                </td>
              </tr>
              <tr>
                <td className="py-4 px-6 font-semibold text-stone-950">Doorstep Transport</td>
                <td className="py-4 px-6">Keep paying landlord</td>
                <td className="py-4 px-6">250+ AED private van hire</td>
                <td className="py-4 px-6">Buyer no-shows &amp; haggling</td>
                <td className="py-4 px-6 font-semibold text-stone-950">
                  Free DKP &amp; DIAC Doorstep Pickup
                </td>
              </tr>
              <tr>
                <td className="py-4 px-6 font-semibold text-stone-950">Dorm Appliances</td>
                <td className="py-4 px-6">2,000+ AED new retail cost</td>
                <td className="py-4 px-6">Storage only</td>
                <td className="py-4 px-6">Uncertified used units</td>
                <td className="py-4 px-6 font-semibold text-[#0d4a38]">
                  99 AED/mo PAT-Certified 4-Item Kit
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
