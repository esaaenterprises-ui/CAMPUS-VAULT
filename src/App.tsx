/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { initAuth, googleSignIn, logout } from './lib/googleAuth';
import {
  GoogleDocSummary,
  VaultPassBookingRecord,
  createGoogleDocWithContent,
  formatVaultPassForGoogleDoc,
  formatExecutiveBriefForGoogleDoc,
} from './lib/googleDocs';
import { HomeView } from './components/HomeView';
import { ServicesView } from './components/ServicesView';
import { AboutSdlcView } from './components/AboutSdlcView';
import { VaultConfiguratorView } from './components/VaultConfiguratorView';
import { ContactDispatchView, MaintenanceSwapTicket } from './components/ContactDispatchView';
import { TermsDrawer } from './components/TermsDrawer';
import { playClickTone } from './utils/audio';

type NavTab = 'home' | 'services' | 'about' | 'configurator' | 'dispatch';

const INITIAL_BOOKINGS: VaultPassBookingRecord[] = [
  {
    passId: 'CV-UOWD-2026-9810',
    studentName: 'Aryan Sharma',
    studentEmail: 'as9810@uowmail.edu.au',
    dormAddress: 'Barsha Heights · Madison Residency, Apt 408',
    campusName: 'University of Wollongong in Dubai (UOWD)',
    corridor: 'Route A · Dubai Knowledge Park (Block 14 & 15)',
    mode: 'storage',
    summaryLine: '3× Double-Walled Boxes + 1× Bulky Tech Slot (27" 4K Monitor)',
    grossAmountAed: 480,
    discountAmountAed: 72,
    netAmountAed: 408,
    pickupDate: '2027-05-24',
    returnDate: '2027-09-02',
    createdAt: 'Nov 9, 2026, 10:15 AM',
    timeSlotLabel: '09:00 – 11:00 (Morning Batch)',
    paymentMethodLabel: 'Tabby / Tamara (4 × 102 AED · 0% Interest)',
    techSerialNumbers: 'SN-LG27UL850-99412-AE (Video Timestamp Logged)',
    securityGateAuthority: 'TECOM DKP Block 14 Security & UOWD Residence Desk',
    securityGatePassCode: 'GATE-UOWD-9810',
    custodyStage: 4,
  },
  {
    passId: 'CV-MYRD-2026-9811',
    studentName: 'Lina Al-Qasimi',
    studentEmail: 'lina.q@hw.ac.uk',
    dormAddress: 'The Myriad Dubai · Block C, Room 314',
    campusName: 'The Myriad Dubai & KSK Homes (DIAC Partner Dorms)',
    corridor: 'Route B · DIAC Student Residence Complex',
    mode: 'lease',
    summaryLine: 'Complete 4-Item Dorm Starter Hardware Pack (9-Mo Subscription)',
    grossAmountAed: 891,
    discountAmountAed: 135,
    netAmountAed: 756,
    pickupDate: '2027-09-01 (Dorm Installation)',
    returnDate: '2028-05-28 (End-of-Term Collection)',
    createdAt: 'Nov 9, 2026, 11:02 AM',
    timeSlotLabel: '11:00 – 13:00 (Midday Corridor Batch)',
    paymentMethodLabel: 'Parent Remote WhatsApp Checkout Link',
    techSerialNumbers: 'PAT-DXB-2026-F01 / M04 / K09 / C12',
    securityGateAuthority: 'The Myriad / KSK Homes Reception & Loading Bay Gate',
    securityGatePassCode: 'GATE-MYRD-9811',
    custodyStage: 5,
  },
  {
    passId: 'BUY-MDX-2026-9812',
    studentName: 'Tariq Mansoor (Graduating Senior)',
    studentEmail: 'tm441@live.mdx.ac.uk',
    dormAddress: 'KSK Homes DIAC · Wing A, Room 205',
    campusName: 'Middlesex University Dubai',
    corridor: 'Route A · Dubai Knowledge Park (Block 16)',
    mode: 'buyout',
    summaryLine: 'Senior Buyout: 50L Mini-Fridge (Grade B: 95 AED) + 27" 4K Monitor (Grade A: 120 AED)',
    grossAmountAed: 215,
    discountAmountAed: 0,
    netAmountAed: 215,
    pickupDate: '2027-05-26 (Dorm Checkout Buyout Inspection)',
    returnDate: 'Transferred to Al Quoz PAT Refurbishment Fleet',
    createdAt: 'Nov 9, 2026, 11:30 AM',
    timeSlotLabel: '16:00 – 18:00 (Off-Peak Evening Batch)',
    paymentMethodLabel: 'Instant FAST Bank Transfer at Dorm Checkout',
    techSerialNumbers: 'PAT Intake Verified · En Route to Al Quoz Steam Lab',
    securityGateAuthority: 'TECOM DKP Block 16 Loading Bay Control',
    securityGatePassCode: 'GATE-MDX-9812',
    custodyStage: 4,
  },
];

const INITIAL_SWAP_TICKETS: MaintenanceSwapTicket[] = [
  {
    ticketId: 'SWP-DXB-102',
    studentName: 'Rohan Nair',
    campusHub: 'BITS Pilani · DIAC Corridor',
    roomAddress: 'KSK Homes Building 2, Room 118',
    assetTagId: 'PAT-DXB-2026-F08',
    applianceType: '50L Silent Dorm Mini-Fridge',
    issueDescription: 'Compressor relay click; requested next-morning replacement unit.',
    status: 'Technician En Route',
    createdAt: '09:15 AM',
  },
  {
    ticketId: 'SWP-DXB-103',
    studentName: 'Maya Haddad',
    campusHub: 'UOWD · Dubai Knowledge Park',
    roomAddress: 'Barsha Heights · Tecom Tower A, Apt 902',
    assetTagId: 'PAT-DXB-2026-M19',
    applianceType: '27" 4K UHD IPS Coding & Gaming Monitor',
    issueDescription: 'USB-C PD cable port loose; swapping with freshly calibrated 4K unit.',
    status: 'Dispatched · Next-Morning SLA',
    createdAt: '10:40 AM',
  },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [configMode, setConfigMode] = useState<'storage' | 'lease' | 'buyout'>('storage');
  const [selectedCampusId, setSelectedCampusId] = useState<string>('uowd');
  const [boxCount, setBoxCount] = useState<number>(3);
  const [bulkyCount, setBulkyCount] = useState<number>(1);
  const [selectedLeaseItems, setSelectedLeaseItems] = useState<string[]>([
    'mini-fridge',
    'monitor-4k',
    'microwave-solo',
    'task-chair',
  ]);

  const [bookings, setBookings] = useState<VaultPassBookingRecord[]>(INITIAL_BOOKINGS);
  const [swapTickets, setSwapTickets] = useState<MaintenanceSwapTicket[]>(INITIAL_SWAP_TICKETS);
  const [termsOpen, setTermsOpen] = useState<boolean>(false);

  // Google Workspace Auth & Google Docs state
  const [user, setUser] = useState<User | null>(null);
  const [hasGoogleToken, setHasGoogleToken] = useState<boolean>(false);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  const [createdDocs, setCreatedDocs] = useState<GoogleDocSummary[]>([]);
  const [isExportingDoc, setIsExportingDoc] = useState<boolean>(false);
  const [lastExportedDocUrl, setLastExportedDocUrl] = useState<string | null>(null);
  const [docStatusMessage, setDocStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = initAuth(
      (authedUser) => {
        setUser(authedUser);
        setHasGoogleToken(true);
      },
      () => {
        setUser(null);
        setHasGoogleToken(false);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleGoogleLogin = async () => {
    setIsLoggingIn(true);
    setDocStatusMessage(null);
    try {
      const res = await googleSignIn();
      if (res) {
        setUser(res.user);
        setHasGoogleToken(true);
      }
    } catch (err: unknown) {
      setDocStatusMessage(
        err instanceof Error ? err.message : 'Google Sign-In was cancelled or failed.'
      );
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleGoogleLogout = async () => {
    await logout();
    setUser(null);
    setHasGoogleToken(false);
    setDocStatusMessage('Signed out of Google Workspace.');
  };

  const handleExportSdlcReportToDocs = async () => {
    setIsExportingDoc(true);
    setDocStatusMessage(null);
    try {
      const content = formatExecutiveBriefForGoogleDoc();
      const doc = await createGoogleDocWithContent(
        'CampusVault UAE — Executive Operations & Circular Economics Brief',
        content
      );
      setCreatedDocs((prev) => [doc, ...prev]);
      setLastExportedDocUrl(doc.url);
      setDocStatusMessage(`Exported Executive Operations Brief to Google Docs ("${doc.title}").`);
    } catch (err: unknown) {
      setDocStatusMessage(
        err instanceof Error ? err.message : 'Failed to export Executive Brief to Google Docs.'
      );
    } finally {
      setIsExportingDoc(false);
    }
  };

  const handleExportPassToGoogleDocs = async (booking: VaultPassBookingRecord) => {
    setIsExportingDoc(true);
    setDocStatusMessage(null);
    try {
      const content = formatVaultPassForGoogleDoc(booking);
      const doc = await createGoogleDocWithContent(
        `CampusVault UAE Pass — ${booking.passId} (${booking.studentName})`,
        content
      );
      setCreatedDocs((prev) => [doc, ...prev]);
      setLastExportedDocUrl(doc.url);
      setDocStatusMessage(`Exported Digital Vault Pass ${booking.passId} to Google Docs.`);
    } catch (err: unknown) {
      setDocStatusMessage(
        err instanceof Error ? err.message : 'Failed to export Vault Pass to Google Docs.'
      );
    } finally {
      setIsExportingDoc(false);
    }
  };

  const handleNavigateToConfigurator = (
    mode: 'storage' | 'lease' | 'buyout',
    presetCampusId?: string
  ) => {
    playClickTone();
    setConfigMode(mode);
    if (presetCampusId) {
      setSelectedCampusId(presetCampusId);
    }
    setActiveTab('configurator');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAdvanceBookingStage = (passId: string) => {
    setBookings((prev) =>
      prev.map((bk) => {
        if (bk.passId !== passId) return bk;
        const current = bk.custodyStage || 1;
        const nextStage = current >= 5 ? 1 : current + 1;
        return { ...bk, custodyStage: nextStage };
      })
    );
  };

  const handleSelectStoragePreset = (boxes: number, bulky: number) => {
    playClickTone();
    setBoxCount(boxes);
    setBulkyCount(bulky);
    setConfigMode('storage');
    setActiveTab('configurator');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectLeasePreset = (itemIds: string[]) => {
    playClickTone();
    setSelectedLeaseItems(itemIds);
    setConfigMode('lease');
    setActiveTab('configurator');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleLeaseItem = (itemId: string) => {
    setSelectedLeaseItems((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
    );
  };

  const handleSelectAllLeaseItems = () => {
    setSelectedLeaseItems(['mini-fridge', 'monitor-4k', 'microwave-solo', 'task-chair']);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f6f5f0] text-[#141413]">
      {/* Clean 3-Zone Top Bar */}
      <header className="sticky top-0 z-40 border-b border-stone-200/80 bg-[#f6f5f0]/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-8 px-6 py-4">
          {/* Zone 1: Wordmark */}
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              playClickTone();
              setActiveTab('home');
            }}
            className="text-lg font-extrabold tracking-tight text-stone-950 whitespace-nowrap shrink-0"
          >
            CampusVault <span className="text-[#0d4a38]">UAE</span>
          </a>

          {/* Zone 2: 5 concise single-line navigation links */}
          <nav
            aria-label="Primary platform navigation"
            className="hidden md:flex items-center gap-7 text-sm font-medium"
          >
            {[
              { id: 'home', label: 'Overview' },
              { id: 'services', label: 'Plans & Hardware' },
              { id: 'about', label: 'Circular Economics' },
              { id: 'configurator', label: 'Book a Vault' },
              { id: 'dispatch', label: '24h Swap & Docs' },
            ].map((item) => {
              const isCurrent = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    playClickTone();
                    setActiveTab(item.id as NavTab);
                  }}
                  className={`py-1 border-b-2 transition-colors whitespace-nowrap shrink-0 ${
                    isCurrent
                      ? 'border-[#0d4a38] text-stone-950 font-semibold'
                      : 'border-transparent text-stone-600 hover:text-stone-950'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: 1 primary action button */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => handleNavigateToConfigurator('storage')}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#0d4a38] hover:bg-[#09382a] rounded-xl transition-colors whitespace-nowrap shrink-0 shadow-xs"
            >
              Book Summer Storage
            </button>
          </div>
        </div>

        {/* Mobile Sub-Row Navigation */}
        <div className="flex md:hidden items-center gap-2 overflow-x-auto px-6 py-2.5 border-t border-stone-200 bg-white">
          {[
            { id: 'home', label: 'Overview' },
            { id: 'services', label: 'Plans' },
            { id: 'about', label: 'Economics' },
            { id: 'configurator', label: 'Book Vault' },
            { id: 'dispatch', label: '24h Swap & Docs' },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id as NavTab)}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap shrink-0 ${
                activeTab === item.id
                  ? 'bg-[#0d4a38] text-white'
                  : 'text-stone-600 hover:text-stone-950 bg-stone-100'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </header>

      {/* Main Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 pt-8">
        {activeTab === 'home' && (
          <HomeView
            onNavigateToConfigurator={handleNavigateToConfigurator}
            onNavigateTab={(tab) => setActiveTab(tab)}
            onOpenTerms={() => setTermsOpen(true)}
          />
        )}

        {activeTab === 'services' && (
          <ServicesView
            onSelectStoragePreset={handleSelectStoragePreset}
            onSelectLeasePreset={handleSelectLeasePreset}
            onOpenTerms={() => setTermsOpen(true)}
          />
        )}

        {activeTab === 'about' && (
          <AboutSdlcView
            user={user}
            hasGoogleToken={hasGoogleToken}
            isLoggingIn={isLoggingIn}
            onGoogleLogin={handleGoogleLogin}
            onGoogleLogout={handleGoogleLogout}
            onExportSdlcReportToDocs={handleExportSdlcReportToDocs}
            isExportingDoc={isExportingDoc}
            lastExportedDocUrl={lastExportedDocUrl}
            docStatusMessage={docStatusMessage}
            onOpenTerms={() => setTermsOpen(true)}
          />
        )}

        {activeTab === 'configurator' && (
          <VaultConfiguratorView
            mode={configMode}
            onModeChange={setConfigMode}
            selectedCampusId={selectedCampusId}
            onCampusChange={setSelectedCampusId}
            boxCount={boxCount}
            onBoxCountChange={setBoxCount}
            bulkyCount={bulkyCount}
            onBulkyCountChange={setBulkyCount}
            selectedLeaseItems={selectedLeaseItems}
            onToggleLeaseItem={handleToggleLeaseItem}
            onSelectAllLeaseItems={handleSelectAllLeaseItems}
            bookings={bookings}
            onAddBooking={(bk) => setBookings((prev) => [bk, ...prev])}
            onAdvanceBookingStage={handleAdvanceBookingStage}
            onOpenTerms={() => setTermsOpen(true)}
            user={user}
            hasGoogleToken={hasGoogleToken}
            isLoggingIn={isLoggingIn}
            onGoogleLogin={handleGoogleLogin}
            onGoogleLogout={handleGoogleLogout}
            onExportPassToGoogleDocs={handleExportPassToGoogleDocs}
            isExportingDoc={isExportingDoc}
            lastExportedDocUrl={lastExportedDocUrl}
            docStatusMessage={docStatusMessage}
          />
        )}

        {activeTab === 'dispatch' && (
          <ContactDispatchView
            tickets={swapTickets}
            onAddTicket={(tk) => setSwapTickets((prev) => [tk, ...prev])}
            bookings={bookings}
            onOpenTerms={() => setTermsOpen(true)}
            user={user}
            hasGoogleToken={hasGoogleToken}
            isLoggingIn={isLoggingIn}
            onGoogleLogin={handleGoogleLogin}
            onGoogleLogout={handleGoogleLogout}
            createdDocs={createdDocs}
            onExportSdlcReport={handleExportSdlcReportToDocs}
            onExportVaultPass={handleExportPassToGoogleDocs}
            isExportingDoc={isExportingDoc}
          />
        )}
      </main>

      {/* Quiet Editorial Footer */}
      <footer className="border-t border-stone-200 bg-white py-8 mt-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <div>
            <span className="font-bold text-stone-900">CampusVault UAE</span>
            <span aria-hidden="true" className="mx-2 text-stone-300">·</span>
            <span>Student Valet Storage &amp; Dorm Hardware Subscriptions</span>
            <span aria-hidden="true" className="mx-2 text-stone-300">·</span>
            <span>Al Quoz Ind. 3 · DKP · DIAC</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setTermsOpen(true)}
              className="hover:text-stone-900 font-medium transition-colors"
            >
              Terms, 24h Defrost &amp; Custody Rules
            </button>
            <span aria-hidden="true" className="text-stone-300">·</span>
            <button
              type="button"
              onClick={() => setActiveTab('about')}
              className="hover:text-stone-900 font-medium transition-colors"
            >
              Circular Economics
            </button>
          </div>
        </div>
      </footer>

      {/* Global Slide-Over Terms & Conditions Drawer */}
      <TermsDrawer isOpen={termsOpen} onClose={() => setTermsOpen(false)} />
    </div>
  );
}
