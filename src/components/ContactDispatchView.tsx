import React, { useState } from 'react';
import { User } from 'firebase/auth';
import { GoogleSignInButton } from './GoogleSignInButton';
import {
  GoogleDocSummary,
  VaultPassBookingRecord,
  fetchGoogleDocById,
  appendTextToGoogleDoc,
  formatVaultPassForGoogleDoc,
} from '../lib/googleDocs';
import { HARDWARE_CATALOG } from '../utils/pricing';
import {
  Wrench,
  MapPin,
  ChevronDown,
  FileText,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Search,
  PlusCircle,
} from 'lucide-react';

export interface MaintenanceSwapTicket {
  ticketId: string;
  studentName: string;
  campusHub: string;
  roomAddress: string;
  assetTagId: string;
  applianceType: string;
  issueDescription: string;
  status: 'Dispatched · Next-Morning SLA' | 'Technician En Route';
  createdAt: string;
}

interface ContactDispatchViewProps {
  tickets: MaintenanceSwapTicket[];
  onAddTicket: (ticket: MaintenanceSwapTicket) => void;
  bookings: VaultPassBookingRecord[];
  onOpenTerms: () => void;
  user: User | null;
  hasGoogleToken: boolean;
  isLoggingIn: boolean;
  onGoogleLogin: () => void;
  onGoogleLogout: () => void;
  createdDocs: GoogleDocSummary[];
  onExportSdlcReport: () => Promise<void>;
  onExportVaultPass: (booking: VaultPassBookingRecord) => Promise<void>;
  isExportingDoc: boolean;
}

const OPERATIONAL_FAQS = [
  {
    q: 'Why must mini-fridges be defrosted 24 hours before pickup?',
    a: 'All personal or leased mini-fridges must be unplugged and wiped dry 24 hours before courier collection so residual compressor water does not leak onto cardboard boxes in transit (50 AED fee if wet).',
  },
  {
    q: 'How does the 24-Hour Appliance Swap work?',
    a: 'If a leased mini-fridge, 4K monitor, or microwave faults during the academic year, enter your PAT Asset Tag on this page. Our DKP or DIAC van delivers a replacement unit the next morning at zero cost.',
  },
  {
    q: 'Can I change my September delivery address?',
    a: 'Yes. Your Vault Pass is tied to your QR code, not your May room. Update your September building or room up to 48 hours before delivery for free.',
  },
];

export const ContactDispatchView: React.FC<ContactDispatchViewProps> = ({
  tickets,
  onAddTicket,
  bookings,
  onOpenTerms,
  user,
  hasGoogleToken,
  isLoggingIn,
  onGoogleLogin,
  onGoogleLogout,
  createdDocs,
  onExportSdlcReport,
  onExportVaultPass,
  isExportingDoc,
}) => {
  const [studentName, setStudentName] = useState('');
  const [campusHub, setCampusHub] = useState('UOWD · Dubai Knowledge Park');
  const [roomAddress, setRoomAddress] = useState('');
  const [assetTagId, setAssetTagId] = useState('PAT-DXB-2026-F01');
  const [applianceType, setApplianceType] = useState('50L Silent Dorm Mini-Fridge');
  const [issueDescription, setIssueDescription] = useState('');
  const [ticketError, setTicketError] = useState<string | null>(null);
  const [ticketSuccess, setTicketSuccess] = useState<string | null>(null);

  const [openFaqIdx, setOpenFaqIdx] = useState<number>(0);

  const [inspectDocIdInput, setInspectDocIdInput] = useState('');
  const [inspectedDoc, setInspectedDoc] = useState<GoogleDocSummary | null>(null);
  const [docOpError, setDocOpError] = useState<string | null>(null);
  const [isLoadingDoc, setIsLoadingDoc] = useState(false);
  const [confirmAppendModalOpen, setConfirmAppendModalOpen] = useState(false);

  const handleDispatchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim() || !roomAddress.trim() || !assetTagId.trim()) {
      setTicketError('Please enter your name, dorm room, and PAT Asset Tag ID.');
      setTicketSuccess(null);
      return;
    }

    const newTicket: MaintenanceSwapTicket = {
      ticketId: `SWP-DXB-${104 + tickets.length}`,
      studentName: studentName.trim(),
      campusHub,
      roomAddress: roomAddress.trim(),
      assetTagId: assetTagId.trim().toUpperCase(),
      applianceType,
      issueDescription:
        issueDescription.trim() || 'Requested 24-hour unit swap under academic warranty.',
      status: 'Dispatched · Next-Morning SLA',
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    onAddTicket(newTicket);
    setTicketError(null);
    setTicketSuccess(
      `Swap Ticket ${newTicket.ticketId} logged. Replacement ${applianceType} scheduled for next-morning delivery to ${newTicket.roomAddress}.`
    );
    setStudentName('');
    setRoomAddress('');
    setIssueDescription('');
  };

  const handleInspectGoogleDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inspectDocIdInput.trim()) {
      setDocOpError('Please enter a Google Document ID to load.');
      return;
    }
    setIsLoadingDoc(true);
    setDocOpError(null);
    try {
      const summary = await fetchGoogleDocById(inspectDocIdInput);
      setInspectedDoc(summary);
    } catch (err: unknown) {
      setDocOpError(err instanceof Error ? err.message : 'Failed to fetch Google Doc.');
    } finally {
      setIsLoadingDoc(false);
    }
  };

  const handleConfirmedAppendToDoc = async () => {
    if (!inspectedDoc || bookings.length === 0) return;
    setConfirmAppendModalOpen(false);
    setIsLoadingDoc(true);
    setDocOpError(null);
    try {
      const latestBooking = bookings[0];
      const textBlock = formatVaultPassForGoogleDoc(latestBooking);
      const updated = await appendTextToGoogleDoc(inspectedDoc.documentId, textBlock);
      setInspectedDoc(updated);
    } catch (err: unknown) {
      setDocOpError(err instanceof Error ? err.message : 'Failed to update Google Doc.');
    } finally {
      setIsLoadingDoc(false);
    }
  };

  return (
    <div className="space-y-14 pb-20">
      {/* Header */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-stone-200 pb-8">
        <div className="space-y-2 max-w-xl">
          <div className="text-xs font-semibold text-[#0d4a38]">
            Support &amp; Cloud Sync
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-950 tracking-tight">
            24-Hour Appliance Swap &amp; Docs Hub
          </h1>
          <p className="text-sm text-stone-600 leading-relaxed">
            Request a free next-morning replacement for any leased dorm unit, or sync your Digital Vault Passes directly with Google Docs.
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenTerms}
          className="px-4 py-2.5 text-xs font-semibold text-stone-700 bg-white hover:bg-stone-100 border border-stone-200 rounded-xl transition-colors whitespace-nowrap shrink-0 shadow-xs"
        >
          Custody &amp; 24h Defrost Rules
        </button>
      </section>

      {/* 24-Hour Appliance Maintenance Swap + UAE Hubs */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-7 rounded-3xl border border-stone-200/90 bg-white p-7 md:p-8 space-y-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-stone-200 pb-4">
            <div>
              <div className="text-xs font-semibold text-[#0d4a38]">
                Free Next-Morning Replacement
              </div>
              <h2 className="text-xl font-bold text-stone-950 mt-0.5">
                Request a 24-Hour Hardware Swap
              </h2>
            </div>
            <Wrench className="w-5 h-5 text-[#0d4a38] shrink-0" />
          </div>

          <form onSubmit={handleDispatchSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="swap-student-name" className="block text-xs font-semibold text-stone-700 mb-1">
                  Student Name
                </label>
                <input
                  id="swap-student-name"
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="e.g., Zara Al-Mansoori"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#f6f5f0] border border-stone-300 text-xs text-stone-950 focus:outline-none focus:border-[#0d4a38]"
                />
              </div>

              <div>
                <label htmlFor="swap-campus-hub" className="block text-xs font-semibold text-stone-700 mb-1">
                  Campus Hub
                </label>
                <select
                  id="swap-campus-hub"
                  value={campusHub}
                  onChange={(e) => setCampusHub(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#f6f5f0] border border-stone-300 text-xs text-stone-950 focus:outline-none focus:border-[#0d4a38]"
                >
                  <option>UOWD · Dubai Knowledge Park</option>
                  <option>Middlesex · DKP Block 16</option>
                  <option>Heriot-Watt · DKP Campus</option>
                  <option>The Myriad Dubai · DIAC</option>
                  <option>KSK Homes · DIAC</option>
                  <option>Barsha Heights / DSO Residence</option>
                </select>
              </div>

              <div>
                <label htmlFor="swap-room-address" className="block text-xs font-semibold text-stone-700 mb-1">
                  Building &amp; Room Number
                </label>
                <input
                  id="swap-room-address"
                  type="text"
                  value={roomAddress}
                  onChange={(e) => setRoomAddress(e.target.value)}
                  placeholder="e.g., The Myriad Block B, Room 219"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#f6f5f0] border border-stone-300 text-xs text-stone-950 focus:outline-none focus:border-[#0d4a38]"
                />
              </div>

              <div>
                <label htmlFor="swap-asset-tag" className="block text-xs font-semibold text-stone-700 mb-1">
                  PAT Asset Tag ID
                </label>
                <input
                  id="swap-asset-tag"
                  type="text"
                  value={assetTagId}
                  onChange={(e) => setAssetTagId(e.target.value)}
                  placeholder="e.g., PAT-DXB-2026-F01"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#f6f5f0] border border-stone-300 text-xs text-stone-950 font-mono focus:outline-none focus:border-[#0d4a38]"
                />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="swap-appliance-type" className="block text-xs font-semibold text-stone-700 mb-1">
                  Appliance Requiring Swap
                </label>
                <select
                  id="swap-appliance-type"
                  value={applianceType}
                  onChange={(e) => setApplianceType(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#f6f5f0] border border-stone-300 text-xs text-stone-950 focus:outline-none focus:border-[#0d4a38]"
                >
                  {HARDWARE_CATALOG.map((item) => (
                    <option key={item.id} value={item.name}>
                      {item.name} ({item.category})
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="swap-issue-desc" className="block text-xs font-semibold text-stone-700 mb-1">
                  Fault Note (Optional)
                </label>
                <input
                  id="swap-issue-desc"
                  type="text"
                  value={issueDescription}
                  onChange={(e) => setIssueDescription(e.target.value)}
                  placeholder="Brief note on symptom..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#f6f5f0] border border-stone-300 text-xs text-stone-950 focus:outline-none focus:border-[#0d4a38]"
                />
              </div>
            </div>

            {ticketError && (
              <div
                role="alert"
                className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800"
              >
                {ticketError}
              </div>
            )}

            {ticketSuccess && (
              <div
                role="status"
                className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4 text-[#0d4a38] shrink-0" />
                <span>{ticketSuccess}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 px-5 text-xs font-semibold text-white bg-[#0d4a38] hover:bg-[#09382a] rounded-xl transition-colors"
            >
              Dispatch Next-Morning Replacement
            </button>
          </form>

          {/* Active Dispatch Queue */}
          <div className="pt-4 border-t border-stone-200 space-y-2.5">
            <div className="text-xs font-bold text-stone-700">
              Recent Campus Swaps ({tickets.length})
            </div>
            <div className="space-y-2">
              {tickets.map((t) => (
                <div
                  key={t.ticketId}
                  className="p-3.5 rounded-xl bg-[#f6f5f0] border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                >
                  <div>
                    <div className="font-mono font-bold text-stone-900">
                      {t.ticketId} · {t.assetTagId} · {t.applianceType}
                    </div>
                    <div className="text-stone-600 mt-0.5">
                      {t.studentName} — {t.roomAddress}
                    </div>
                  </div>
                  <div className="text-right font-mono shrink-0">
                    <div className="text-[#0d4a38] font-semibold">{t.status}</div>
                    <div className="text-[11px] text-stone-400">{t.createdAt}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Hubs & FAQ */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-3xl border border-stone-200/90 bg-white p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <h2 className="text-base font-bold text-stone-950">
                Dubai Staging Hubs
              </h2>
              <MapPin className="w-4 h-4 text-[#0d4a38] shrink-0" />
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-[#f6f5f0] border border-stone-200">
                <div className="font-bold text-stone-950">Al Quoz Ind. 3 · Warehouse Bay 14B</div>
                <div className="text-stone-600 mt-0.5">21°C Climate Vault &amp; PAT Steam Lab</div>
              </div>
              <div className="p-3.5 rounded-xl bg-[#f6f5f0] border border-stone-200">
                <div className="font-bold text-stone-950">Route A · Knowledge Park Block 14</div>
                <div className="text-stone-600 mt-0.5">UOWD, Middlesex, Heriot-Watt &amp; Barsha Heights</div>
              </div>
              <div className="p-3.5 rounded-xl bg-[#f6f5f0] border border-stone-200">
                <div className="font-bold text-stone-950">Route B · DIAC (The Myriad &amp; KSK)</div>
                <div className="text-stone-600 mt-0.5">BITS Pilani, Amity &amp; Silicon Oasis · +971 50 829 4410</div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-stone-200/90 bg-white p-6 space-y-3 shadow-xs">
            <h2 className="text-base font-bold text-stone-950">Common Questions</h2>
            <div className="space-y-2">
              {OPERATIONAL_FAQS.map((item, idx) => {
                const isOpen = openFaqIdx === idx;
                return (
                  <div
                    key={item.q}
                    className="rounded-xl bg-[#f6f5f0] border border-stone-200 overflow-hidden"
                  >
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      onClick={() => setOpenFaqIdx(isOpen ? -1 : idx)}
                      className="w-full px-4 py-3 text-left text-xs font-semibold text-stone-950 flex items-center justify-between gap-3"
                    >
                      <span>{item.q}</span>
                      <ChevronDown
                        className={`w-4 h-4 text-stone-500 shrink-0 transition-transform ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-4 pb-3.5 text-xs text-stone-600 leading-relaxed border-t border-stone-200/70 pt-2.5">
                        {item.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Google Docs Integration */}
      <section className="rounded-3xl border border-stone-200/90 bg-white p-7 md:p-8 space-y-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-200 pb-5">
          <div className="space-y-1">
            <div className="text-xs font-semibold text-[#0d4a38]">
              Google Workspace Sync
            </div>
            <h2 className="text-xl font-bold text-stone-950">
              Export Vault Passes &amp; Executive Brief to Google Docs
            </h2>
          </div>

          <GoogleSignInButton
            user={user}
            hasToken={hasGoogleToken}
            isLoggingIn={isLoggingIn}
            onLogin={onGoogleLogin}
            onLogout={onGoogleLogout}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-6 p-5 rounded-2xl bg-[#f6f5f0] border border-stone-200 space-y-4">
            <h3 className="text-sm font-bold text-stone-950">
              1. Create New Google Doc
            </h3>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                disabled={!hasGoogleToken || isExportingDoc}
                onClick={onExportSdlcReport}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-[#0d4a38] hover:bg-[#09382a] disabled:opacity-40 rounded-xl transition-colors"
              >
                <FileText className="w-4 h-4" />
                <span>Export Executive Brief</span>
              </button>

              {bookings.length > 0 && (
                <button
                  type="button"
                  disabled={!hasGoogleToken || isExportingDoc}
                  onClick={() => onExportVaultPass(bookings[0])}
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-stone-900 bg-white hover:bg-stone-100 border border-stone-300 disabled:opacity-40 rounded-xl transition-colors"
                >
                  <PlusCircle className="w-4 h-4 text-[#0d4a38]" />
                  <span>Export Pass ({bookings[0].passId})</span>
                </button>
              )}
            </div>

            {createdDocs.length > 0 && (
              <div className="space-y-2 pt-3 border-t border-stone-200">
                {createdDocs.map((doc) => (
                  <div
                    key={doc.documentId}
                    className="p-3 rounded-xl bg-white border border-stone-200 flex items-center justify-between gap-2 text-xs"
                  >
                    <div className="truncate">
                      <div className="font-semibold text-stone-950 truncate">{doc.title}</div>
                      <div className="font-mono text-[11px] text-stone-500">
                        ID: {doc.documentId}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setInspectDocIdInput(doc.documentId);
                          setInspectedDoc(doc);
                        }}
                        className="px-2.5 py-1 text-[11px] font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg"
                      >
                        Inspect
                      </button>
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-[#0d4a38] bg-emerald-50 rounded-lg hover:underline"
                      >
                        <span>Open</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="lg:col-span-6 p-5 rounded-2xl bg-[#f6f5f0] border border-stone-200 space-y-4">
            <h3 className="text-sm font-bold text-stone-950">
              2. Inspect or Append by Document ID
            </h3>

            <form onSubmit={handleInspectGoogleDoc} className="flex items-center gap-2">
              <input
                type="text"
                value={inspectDocIdInput}
                onChange={(e) => setInspectDocIdInput(e.target.value)}
                placeholder="Paste Google Document ID..."
                aria-label="Google Document ID to inspect"
                className="flex-1 px-3.5 py-2 rounded-xl bg-white border border-stone-300 text-xs text-stone-950 font-mono focus:outline-none focus:border-[#0d4a38]"
              />
              <button
                type="submit"
                disabled={!hasGoogleToken || isLoadingDoc}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-stone-900 bg-white hover:bg-stone-100 border border-stone-300 disabled:opacity-40 rounded-xl transition-colors shrink-0"
              >
                <Search className="w-3.5 h-3.5" />
                <span>{isLoadingDoc ? 'Loading...' : 'Read Doc'}</span>
              </button>
            </form>

            {docOpError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
                {docOpError}
              </div>
            )}

            {inspectedDoc && (
              <div className="p-4 rounded-xl bg-white border border-stone-200 space-y-3 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <div className="font-bold text-stone-950">{inspectedDoc.title}</div>
                  <a
                    href={inspectedDoc.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[#0d4a38] font-semibold hover:underline shrink-0"
                  >
                    <span>Open in Docs</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                <pre className="p-3 rounded-lg bg-[#f6f5f0] border border-stone-200 text-[11px] text-stone-700 font-mono whitespace-pre-wrap max-h-36 overflow-y-auto">
                  {inspectedDoc.bodyPreview}
                </pre>

                {bookings.length > 0 && (
                  <div className="pt-1 flex items-center justify-between gap-2">
                    <span className="text-[11px] text-stone-500">
                      Append latest pass ({bookings[0].passId}):
                    </span>
                    <button
                      type="button"
                      onClick={() => setConfirmAppendModalOpen(true)}
                      className="px-3 py-1.5 text-xs font-semibold text-amber-900 bg-amber-100 hover:bg-amber-200 rounded-lg transition-colors shrink-0"
                    >
                      Append Custody Record...
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {confirmAppendModalOpen && inspectedDoc && bookings.length > 0 && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-doc-mutation-title"
        >
          <div className="w-full max-w-md rounded-2xl border border-stone-200 bg-white p-6 space-y-4 shadow-xl">
            <div className="flex items-center gap-2.5 text-amber-700">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <h3 id="confirm-doc-mutation-title" className="text-base font-bold text-stone-950">
                Confirm Update to Google Doc?
              </h3>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              Append the custody certificate for Vault Pass{' '}
              <strong className="text-stone-950 font-mono">{bookings[0].passId}</strong> to{' '}
              <strong className="text-stone-950">&quot;{inspectedDoc.title}&quot;</strong>?
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmAppendModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmedAppendToDoc}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#0d4a38] hover:bg-[#09382a] rounded-xl transition-colors"
              >
                Confirm &amp; Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
