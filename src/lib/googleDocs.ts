import { getAccessToken } from './googleAuth';

export interface GoogleDocSummary {
  documentId: string;
  title: string;
  revisionId?: string;
  bodyPreview: string;
  url: string;
  createdAt: string;
}

export interface VaultPassBookingRecord {
  passId: string;
  studentName: string;
  studentEmail: string;
  dormAddress: string;
  campusName: string;
  corridor: string;
  mode: 'storage' | 'lease' | 'buyout';
  summaryLine: string;
  grossAmountAed: number;
  discountAmountAed: number;
  netAmountAed: number;
  pickupDate: string;
  returnDate: string;
  createdAt: string;
  timeSlotLabel?: string;
  paymentMethodLabel?: string;
  techSerialNumbers?: string;
  securityGateAuthority?: string;
  securityGatePassCode?: string;
  custodyStage?: number; // 1 to 5
}

function extractPlainTextFromDoc(docData: {
  body?: {
    content?: Array<{
      paragraph?: {
        elements?: Array<{
          textRun?: { content?: string };
        }>;
      };
    }>;
  };
}): string {
  if (!docData.body?.content) return '';
  const chunks: string[] = [];
  for (const block of docData.body.content) {
    if (block.paragraph?.elements) {
      for (const el of block.paragraph.elements) {
        if (el.textRun?.content) {
          chunks.push(el.textRun.content);
        }
      }
    }
  }
  return chunks.join('').trim();
}

export async function createGoogleDocWithContent(
  title: string,
  contentText: string
): Promise<GoogleDocSummary> {
  const accessToken = await getAccessToken();
  if (!accessToken) {
    throw new Error('Authentication required. Please sign in with Google first.');
  }

  // Step 1: Create the blank Google Doc
  const createRes = await fetch('https://docs.googleapis.com/v1/documents', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ title }),
  });

  if (!createRes.ok) {
    const errBody = await createRes.text();
    throw new Error(`Google Docs creation failed (${createRes.status}): ${errBody}`);
  }

  const createdDoc = await createRes.json();
  const documentId: string = createdDoc.documentId;

  // Step 2: Populate the document body with structured text via batchUpdate
  const updateRes = await fetch(
    `https://docs.googleapis.com/v1/documents/${documentId}:batchUpdate`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: [
          {
            insertText: {
              location: { index: 1 },
              text: contentText,
            },
          },
        ],
      }),
    }
  );

  if (!updateRes.ok) {
    const errBody = await updateRes.text();
    throw new Error(`Google Docs content write failed (${updateRes.status}): ${errBody}`);
  }

  return {
    documentId,
    title: createdDoc.title || title,
    revisionId: createdDoc.revisionId,
    bodyPreview: contentText.slice(0, 360) + (contentText.length > 360 ? '...' : ''),
    url: `https://docs.google.com/document/d/${documentId}/edit`,
    createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };
}

export async function fetchGoogleDocById(documentId: string): Promise<GoogleDocSummary> {
  const accessToken = await getAccessToken();
  if (!accessToken) {
    throw new Error('Authentication required. Please sign in with Google first.');
  }

  const cleanId = documentId.trim();
  const res = await fetch(`https://docs.googleapis.com/v1/documents/${encodeURIComponent(cleanId)}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`Could not load Google Doc (${res.status}): ${errBody}`);
  }

  const data = await res.json();
  const plainText = extractPlainTextFromDoc(data);

  return {
    documentId: data.documentId,
    title: data.title || 'Untitled Document',
    revisionId: data.revisionId,
    bodyPreview: plainText || '(Empty Google Doc)',
    url: `https://docs.google.com/document/d/${data.documentId}/edit`,
    createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };
}

export async function appendTextToGoogleDoc(
  documentId: string,
  textToAppend: string
): Promise<GoogleDocSummary> {
  const accessToken = await getAccessToken();
  if (!accessToken) {
    throw new Error('Authentication required. Please sign in with Google first.');
  }

  const cleanId = documentId.trim();
  const res = await fetch(
    `https://docs.googleapis.com/v1/documents/${encodeURIComponent(cleanId)}:batchUpdate`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: [
          {
            insertText: {
              endOfSegmentLocation: { segmentId: '' },
              text: `\n\n${textToAppend}`,
            },
          },
        ],
      }),
    }
  );

  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`Failed to update Google Doc (${res.status}): ${errBody}`);
  }

  return fetchGoogleDocById(cleanId);
}

export function formatVaultPassForGoogleDoc(booking: VaultPassBookingRecord): string {
  const modeTitle =
    booking.mode === 'storage'
      ? 'Summer Valet Micro-Storage (Al Quoz 21°C Bay)'
      : booking.mode === 'lease'
      ? 'VaultLoop 9-Month Dorm Hardware Lease (PAT Certified)'
      : 'VaultLoop Graduating Senior Hardware Buyout (Cash Payout)';

  return [
    '================================================================================',
    'CAMPUSVAULT UAE — OFFICIAL DIGITAL VAULT PASS & DORM GATE CLEARANCE',
    '================================================================================',
    `SERIAL REFERENCE ID:   ${booking.passId}`,
    `ISSUED TIMESTAMP:      ${booking.createdAt}`,
    `SERVICE MODE:          ${modeTitle}`,
    '',
    '1. STUDENT & LOGISTICS ROUTING',
    '--------------------------------------------------------------------------------',
    `Student Name:          ${booking.studentName}`,
    `Academic Email:        ${booking.studentEmail}`,
    `University / Campus:   ${booking.campusName}`,
    `Logistics Corridor:    ${booking.corridor}`,
    `Dorm / Room Address:   ${booking.dormAddress}`,
    `Scheduled Collection:  ${booking.pickupDate} (${booking.timeSlotLabel || '11:00 – 13:00 Window'})`,
    `Scheduled Redelivery:  ${booking.returnDate}`,
    `Security Gate Pass:    ${booking.securityGatePassCode || 'GATE-DXB-2026'} (${booking.securityGateAuthority || 'Dorm Security Desk'})`,
    '',
    '2. ITEMIZED CUSTODY & FINANCIAL SUMMARY',
    '--------------------------------------------------------------------------------',
    `Configured Package:    ${booking.summaryLine}`,
    `Declared Tech Serials: ${booking.techSerialNumbers || 'N/A (Standard Box Custody)'}`,
    `Gross Order Value:     ${booking.grossAmountAed} AED`,
    `Campus Partner Grant:  -${booking.discountAmountAed} AED`,
    `NET TOTAL:             ${booking.netAmountAed} AED ${booking.mode === 'buyout' ? '(Instant Buyout Payout to Student)' : ''}`,
    `Payment / Settlement:  ${booking.paymentMethodLabel || 'Tabby 4× Interest-Free Installments'}`,
    `Transit & Pickup:      FREE (Doorstep Valet Included)`,
    `Custody Insurance:     INCLUDED (Up to 2,000 AED Fire/Water/Transit Protection)`,
    '',
    '3. MANDATORY REGULATORY & CUSTODY COMPLIANCE (UAE DET & PDPL)',
    '--------------------------------------------------------------------------------',
    '• Rule 1 (Partner Verification): Verified .ac.ae Student ID must be presented to courier.',
    '• Rule 2 (25 kg Weight Ceiling): Max 25 kg per double-walled cardboard box.',
    '• Rule 3 (24-Hour Defrost Mandate): Mini-fridges must be unplugged & dry 12h prior.',
    '• Rule 4 (90-Day Abandonment Clause): Unclaimed items past Oct 1 incur 15 AED/day demurrage.',
    '• Rule 5 (Electronics Intake): Declared serial numbers covered up to 2,000 AED in 21°C vault.',
    '================================================================================',
  ].join('\n');
}

export function formatExecutiveBriefForGoogleDoc(): string {
  return [
    '================================================================================',
    'CAMPUSVAULT UAE — EXECUTIVE OPERATIONS & CIRCULAR ECONOMICS BRIEF',
    'Circular Student Valet Logistics & Dorm Hardware-as-a-Service (Dubai, UAE)',
    'Operational Corridors: Dubai Knowledge Park (DKP) · Academic City (DIAC) · Al Quoz Ind. 3',
    '================================================================================',
    '',
    '1. DUBAI STUDENT HOUSING & RELOCATION MARKET OVERVIEW',
    '• Expat Student Base: 42,000+ international students across Dubai | 38,500+ in DKP & DIAC.',
    '• International Mobility: Over 85% expatriate student ratio vacating dormitories for 90 days every summer.',
    '• Summer Dead-Rent Trap: 78% leave belongings unattended or pay 9,000–15,000 AED in empty apartment rent across Barsha Heights and Dubai Silicon Oasis.',
    '• Freshman Hardware Waste: Incoming students spend 2,000–2,500 AED on new dorm appliances and suffer an 80% forced-sale loss 9 months later.',
    '',
    '2. THE VAULTLOOP CIRCULAR LOGISTICS ECOSYSTEM',
    '• Summer Valet Micro-Storage (May–September): Free double-walled box delivery (60×40×40 cm, 25 kg max), tamper-evident QR seals, doorstep pickup, 21°C climate-controlled storage in Al Quoz Bay 14B, and scheduled September room redelivery.',
    '• Dorm-as-a-Service Leasing (September–May): 9-month subscriptions (99 AED/mo = 891 AED/academic year) for PAT-certified 50L mini-fridges, 27" 4K monitors, 20L digital microwaves, and ergonomic mesh chairs with a 24-hour replacement SLA.',
    '• Senior Buyout Program: Instant 75–120 AED cash buyouts for graduating seniors’ appliances, diverting 14.2 metric tons of e-waste annually.',
    '',
    '3. UNIT ECONOMICS & CONTRIBUTION MARGIN MODEL',
    '• Standard Summer Package Price (P) = 450 AED | Unit Variable Cost (V) = 90 AED:',
    '  - Double-walled boxes & tamper-evident QR seals: 25 AED',
    '  - Batched Sprinter van fuel & courier labor: 45 AED',
    '  - Al Quoz 21°C transit & custody insurance: 20 AED',
    '• Unit Contribution Margin (CM) = 360 AED per student (80% Contribution Margin Ratio).',
    '• Fixed Summer Operating Budget (FC) = 72,000 AED -> Break-Even Point = 200 Students (90,000 AED gross summer revenue).',
    '• Academic-Term Recurring Revenue: 200 leased hardware kits × 99 AED/mo = 19,800 AED/month MRR (158,400 AED across 8 active billing months).',
    '',
    '4. OPERATIONAL CAPACITY & REGULATORY STANDARDS',
    '• Batched Dispatch Cap: Strictly capped at 40 orders per 2-hour pickup window along Route A (DKP/Barsha) and Route B (DIAC/DSO).',
    '• Occupational Safety: 25 kg max box weight enforced via portable digital scales and rolling dollies.',
    '• Regulatory Compliance: Dubai Economy & Tourism (DET) Commercial License and UAE Federal Decree-Law No. 45/2021 (PDPL).',
    '================================================================================',
  ].join('\n');
}
