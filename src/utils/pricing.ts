export interface CampusOption {
  id: string;
  name: string;
  shortCode: string;
  corridor: string;
  domain: string;
  isPartner: boolean;
  discountRate: number;
  securityGateAuthority: string;
}

export const CAMPUS_OPTIONS: CampusOption[] = [
  {
    id: 'uowd',
    name: 'University of Wollongong in Dubai (UOWD)',
    shortCode: 'UOWD',
    corridor: 'Route A · Dubai Knowledge Park (Block 14 & 15)',
    domain: 'uowdubai.ac.ae',
    isPartner: true,
    discountRate: 0.15,
    securityGateAuthority: 'TECOM DKP Block 14 Security & UOWD Residence Desk',
  },
  {
    id: 'mdx',
    name: 'Middlesex University Dubai',
    shortCode: 'MDX',
    corridor: 'Route A · Dubai Knowledge Park (Block 16)',
    domain: 'mdx.ac.ae',
    isPartner: true,
    discountRate: 0.15,
    securityGateAuthority: 'TECOM DKP Block 16 Loading Bay Control',
  },
  {
    id: 'hwu',
    name: 'Heriot-Watt University Dubai',
    shortCode: 'HWU',
    corridor: 'Route A · Dubai Knowledge Park',
    domain: 'hw.ac.uk',
    isPartner: true,
    discountRate: 0.15,
    securityGateAuthority: 'DKP Campus Facilities Gate Pass Office',
  },
  {
    id: 'bits',
    name: 'BITS Pilani, Dubai Campus',
    shortCode: 'BITS',
    corridor: 'Route B · Dubai International Academic City (DIAC)',
    domain: 'dubai.bits-pilani.ac.in',
    isPartner: true,
    discountRate: 0.15,
    securityGateAuthority: 'BITS Pilani DIAC Hostel Warden & Gate Security',
  },
  {
    id: 'amity',
    name: 'Amity University Dubai',
    shortCode: 'AMTY',
    corridor: 'Route B · Dubai International Academic City (DIAC)',
    domain: 'amityuniversity.ae',
    isPartner: true,
    discountRate: 0.15,
    securityGateAuthority: 'Amity DIAC Residence Security Control',
  },
  {
    id: 'myriad',
    name: 'The Myriad Dubai & KSK Homes (DIAC Partner Dorms)',
    shortCode: 'MYRD',
    corridor: 'Route B · DIAC Student Residence Complex',
    domain: 'themyriad.ae',
    isPartner: true,
    discountRate: 0.15,
    securityGateAuthority: 'The Myriad / KSK Homes Reception & Loading Bay Gate',
  },
  {
    id: 'other',
    name: 'Other UAE University Campus',
    shortCode: 'UAE',
    corridor: 'Standard Metro Corridor · Barsha Heights / DSO',
    domain: 'student.ac.ae',
    isPartner: false,
    discountRate: 0,
    securityGateAuthority: 'Building Management Move-Out Security Desk',
  },
];

export type HardwareCategory =
  | 'Dorm Essentials'
  | 'Kitchen & Coffee'
  | 'Tech & Gaming'
  | 'Comfort & Mobility';

export interface HardwareLeaseItem {
  id: string;
  name: string;
  category: HardwareCategory;
  monthlyRateAed: number;
  retailPriceAed: number;
  patCertId: string;
  specs: string;
  buyoutOriginAed: number;
  buyoutGradeAAed: number;
  buyoutGradeBAed: number;
  buyoutGradeCAed: number;
  isStarterCore?: boolean;
}

export const STARTER_PACK_ITEM_IDS = [
  'mini-fridge',
  'monitor-4k',
  'microwave-solo',
  'task-chair',
];

export const HARDWARE_CATALOG: HardwareLeaseItem[] = [
  // 1. DORM ESSENTIALS (4 Core Starter Items)
  {
    id: 'mini-fridge',
    name: '50L Silent Dorm Mini-Fridge',
    category: 'Dorm Essentials',
    monthlyRateAed: 38,
    retailPriceAed: 650,
    patCertId: 'PAT-DXB-2026-F01',
    specs: '38 dB whisper compressor · 24h defrost compliant · Energy Class A+',
    buyoutOriginAed: 95,
    buyoutGradeAAed: 110,
    buyoutGradeBAed: 95,
    buyoutGradeCAed: 75,
    isStarterCore: true,
  },
  {
    id: 'monitor-4k',
    name: '27" 4K UHD IPS Coding & Gaming Monitor',
    category: 'Dorm Essentials',
    monthlyRateAed: 36,
    retailPriceAed: 980,
    patCertId: 'PAT-DXB-2026-M04',
    specs: '3840×2160 UHD · USB-C 65W PD · Height-adjustable ergonomic stand',
    buyoutOriginAed: 120,
    buyoutGradeAAed: 120,
    buyoutGradeBAed: 105,
    buyoutGradeCAed: 85,
    isStarterCore: true,
  },
  {
    id: 'microwave-solo',
    name: '20L Digital Solo Dorm Microwave',
    category: 'Dorm Essentials',
    monthlyRateAed: 22,
    retailPriceAed: 340,
    patCertId: 'PAT-DXB-2026-K09',
    specs: '700W output · Steam-sanitized cavity · Dorm breaker safe',
    buyoutOriginAed: 75,
    buyoutGradeAAed: 90,
    buyoutGradeBAed: 80,
    buyoutGradeCAed: 75,
    isStarterCore: true,
  },
  {
    id: 'task-chair',
    name: 'Ergonomic Breathable Mesh Task Chair',
    category: 'Dorm Essentials',
    monthlyRateAed: 24,
    retailPriceAed: 530,
    patCertId: 'SAN-DXB-2026-C12',
    specs: 'Lumbar support · 180° steam-sterilized mesh · Heavy-duty casters',
    buyoutOriginAed: 85,
    buyoutGradeAAed: 100,
    buyoutGradeBAed: 85,
    buyoutGradeCAed: 75,
    isStarterCore: true,
  },

  // 2. KITCHEN & COFFEE (4 Additional Items)
  {
    id: 'air-fryer',
    name: '4.5L Digital Oil-Free Air Fryer',
    category: 'Kitchen & Coffee',
    monthlyRateAed: 19,
    retailPriceAed: 320,
    patCertId: 'PAT-DXB-2026-K14',
    specs: '1500W rapid air circulation · Non-stick dishwasher-safe basket',
    buyoutOriginAed: 70,
    buyoutGradeAAed: 85,
    buyoutGradeBAed: 70,
    buyoutGradeCAed: 55,
  },
  {
    id: 'espresso-maker',
    name: 'Nespresso Capsule Espresso Machine',
    category: 'Kitchen & Coffee',
    monthlyRateAed: 21,
    retailPriceAed: 420,
    patCertId: 'PAT-DXB-2026-K18',
    specs: '19-bar high-pressure pump · Descaled & steam-sterilized',
    buyoutOriginAed: 80,
    buyoutGradeAAed: 95,
    buyoutGradeBAed: 80,
    buyoutGradeCAed: 60,
  },
  {
    id: 'kettle-toaster',
    name: '1.7L Stainless Kettle & 2-Slice Toaster Set',
    category: 'Kitchen & Coffee',
    monthlyRateAed: 14,
    retailPriceAed: 210,
    patCertId: 'PAT-DXB-2026-K22',
    specs: 'Auto shut-off boil-dry protection · Brushed stainless steel',
    buyoutOriginAed: 50,
    buyoutGradeAAed: 60,
    buyoutGradeBAed: 50,
    buyoutGradeCAed: 35,
  },
  {
    id: 'blender-pro',
    name: '900W Personal Smoothie & Protein Blender',
    category: 'Kitchen & Coffee',
    monthlyRateAed: 15,
    retailPriceAed: 260,
    patCertId: 'PAT-DXB-2026-K27',
    specs: 'Includes 2 BPA-free travel cups · New extractor blade fitted',
    buyoutOriginAed: 55,
    buyoutGradeAAed: 65,
    buyoutGradeBAed: 55,
    buyoutGradeCAed: 40,
  },

  // 3. TECH & GAMING (4 Additional Items)
  {
    id: 'ultrawide-34',
    name: '34" Curved Ultrawide WQHD 144Hz Monitor',
    category: 'Tech & Gaming',
    monthlyRateAed: 48,
    retailPriceAed: 1450,
    patCertId: 'PAT-DXB-2026-M11',
    specs: '3440×1440 21:9 ultrawide · 144Hz refresh · Dual HDMI + DisplayPort',
    buyoutOriginAed: 150,
    buyoutGradeAAed: 180,
    buyoutGradeBAed: 150,
    buyoutGradeCAed: 120,
  },
  {
    id: 'ps5-console',
    name: 'PlayStation 5 Slim Console (2 DualSense)',
    category: 'Tech & Gaming',
    monthlyRateAed: 65,
    retailPriceAed: 1899,
    patCertId: 'PAT-DXB-2026-G02',
    specs: '1TB SSD · Includes 2 sanitized DualSense wireless controllers',
    buyoutOriginAed: 380,
    buyoutGradeAAed: 450,
    buyoutGradeBAed: 380,
    buyoutGradeCAed: 300,
  },
  {
    id: 'ipad-study',
    name: '11" Study Tablet + Magnetic Stylus Bundle',
    category: 'Tech & Gaming',
    monthlyRateAed: 52,
    retailPriceAed: 1550,
    patCertId: 'PAT-DXB-2026-T07',
    specs: '128GB Wi-Fi · Matte paper-feel screen protector · Stylus & folio',
    buyoutOriginAed: 270,
    buyoutGradeAAed: 320,
    buyoutGradeBAed: 270,
    buyoutGradeCAed: 210,
  },
  {
    id: 'laser-printer',
    name: 'Wireless Wi-Fi All-in-One Laser Printer',
    category: 'Tech & Gaming',
    monthlyRateAed: 20,
    retailPriceAed: 410,
    patCertId: 'PAT-DXB-2026-P05',
    specs: 'AirPrint & Wi-Fi Direct · Includes full starter toner (1,500 pages)',
    buyoutOriginAed: 75,
    buyoutGradeAAed: 90,
    buyoutGradeBAed: 75,
    buyoutGradeCAed: 55,
  },

  // 4. COMFORT & MOBILITY (4 Additional Items)
  {
    id: 'hepa-purifier',
    name: 'HEPA-13 Desert Dust Dorm Air Purifier',
    category: 'Comfort & Mobility',
    monthlyRateAed: 23,
    retailPriceAed: 460,
    patCertId: 'PAT-DXB-2026-A03',
    specs: 'Brand-new sealed True HEPA-13 filter · 24 dB sleep mode',
    buyoutOriginAed: 80,
    buyoutGradeAAed: 95,
    buyoutGradeBAed: 80,
    buyoutGradeCAed: 60,
  },
  {
    id: 'garment-steamer',
    name: '1800W Upright Garment & Abaya Steamer',
    category: 'Comfort & Mobility',
    monthlyRateAed: 16,
    retailPriceAed: 280,
    patCertId: 'PAT-DXB-2026-S15',
    specs: '1.8L water tank · Safe for silk, suits & abayas · Telescopic pole',
    buyoutOriginAed: 55,
    buyoutGradeAAed: 70,
    buyoutGradeBAed: 55,
    buyoutGradeCAed: 40,
  },
  {
    id: 'cordless-vac',
    name: 'Lightweight Cordless Stick Dorm Vacuum',
    category: 'Comfort & Mobility',
    monthlyRateAed: 22,
    retailPriceAed: 440,
    patCertId: 'PAT-DXB-2026-V09',
    specs: '40-min battery runtime · Wall dock · Washable HEPA cyclone filter',
    buyoutOriginAed: 80,
    buyoutGradeAAed: 95,
    buyoutGradeBAed: 80,
    buyoutGradeCAed: 60,
  },
  {
    id: 'escooter-commute',
    name: 'Foldable Campus Electric Scooter (25 km)',
    category: 'Comfort & Mobility',
    monthlyRateAed: 58,
    retailPriceAed: 1390,
    patCertId: 'PAT-DXB-2026-E01',
    specs: '25 km/h RTA-compliant speed · Puncture-proof tires · UL-certified charger',
    buyoutOriginAed: 290,
    buyoutGradeAAed: 350,
    buyoutGradeBAed: 290,
    buyoutGradeCAed: 220,
  },
];

export const DORM_STARTER_PACK_MONTHLY_AED = 99;
export const BOX_RATE_SUMMER_AED = 120; // 3 boxes = 360 AED Standard Vault
export const BULKY_ITEM_RATE_AED = 120;
export const OVERWEIGHT_REPACK_SURCHARGE_AED = 60;
export const EARLY_BIRD_CREDIT_AED = 50;
export const BASE_INSURANCE_COVERAGE_AED = 2000;
export const MAX_ORDERS_PER_TWO_HOUR_WINDOW = 40;

export interface TimeSlotWindow {
  id: string;
  label: string;
  windowHours: string;
  bookedCount: number;
  maxCapacity: number;
  isOffPeak: boolean;
}

export const INITIAL_TIME_SLOTS: TimeSlotWindow[] = [
  {
    id: 'slot-09-11',
    label: 'Morning Batch',
    windowHours: '09:00 – 11:00',
    bookedCount: 38,
    maxCapacity: MAX_ORDERS_PER_TWO_HOUR_WINDOW,
    isOffPeak: false,
  },
  {
    id: 'slot-11-13',
    label: 'Midday Corridor Batch',
    windowHours: '11:00 – 13:00',
    bookedCount: 24,
    maxCapacity: MAX_ORDERS_PER_TWO_HOUR_WINDOW,
    isOffPeak: false,
  },
  {
    id: 'slot-14-16',
    label: 'Peak Afternoon Batch',
    windowHours: '14:00 – 16:00',
    bookedCount: 40,
    maxCapacity: MAX_ORDERS_PER_TWO_HOUR_WINDOW,
    isOffPeak: false,
  },
  {
    id: 'slot-16-18',
    label: 'Off-Peak Evening Batch',
    windowHours: '16:00 – 18:00',
    bookedCount: 14,
    maxCapacity: MAX_ORDERS_PER_TWO_HOUR_WINDOW,
    isOffPeak: true,
  },
];

export type PaymentMethodType = 'tabby' | 'apple_pay' | 'parent_link' | 'bursary';

export interface PaymentPlanSummary {
  method: PaymentMethodType;
  label: string;
  installmentCount: number;
  perInstallmentAed: number;
  badgeText: string;
}

export function calculatePaymentPlan(
  netTotalAed: number,
  method: PaymentMethodType
): PaymentPlanSummary {
  if (method === 'tabby') {
    const perInstallmentAed = Number((netTotalAed / 4).toFixed(2));
    return {
      method,
      label: 'Tabby / Tamara (4 Interest-Free Installments)',
      installmentCount: 4,
      perInstallmentAed,
      badgeText: `4 × ${perInstallmentAed} AED · 0% Interest`,
    };
  }
  if (method === 'parent_link') {
    return {
      method,
      label: 'Parent Remote WhatsApp Checkout Link',
      installmentCount: 1,
      perInstallmentAed: netTotalAed,
      badgeText: 'Instant WhatsApp Custody & Payment Link for Parents Abroad',
    };
  }
  if (method === 'bursary') {
    return {
      method,
      label: 'University Housing / Bursary Account Deduction',
      installmentCount: 1,
      perInstallmentAed: netTotalAed,
      badgeText: 'Billed via Student ID Housing Ledger',
    };
  }
  return {
    method: 'apple_pay',
    label: 'Apple Pay / UAE Student Debit Card',
    installmentCount: 1,
    perInstallmentAed: netTotalAed,
    badgeText: 'Instant One-Tap Checkout',
  };
}

export interface RoomPackingEstimatorInput {
  clothingBundles: number;
  textbookStacks: number;
  beddingSets: number;
  kitchenwareSets: number;
  monitorsOrPcCount: number;
  miniFridgeOrChairCount: number;
}

export interface RoomPackingEstimateResult {
  recommendedBoxes: number;
  recommendedBulky: number;
  estimatedTotalWeightKg: number;
  packingSummaryText: string;
}

export function estimatePackingVolume(
  input: RoomPackingEstimatorInput
): RoomPackingEstimateResult {
  const rawBoxes =
    Math.ceil(input.clothingBundles * 0.6) +
    Math.ceil(input.textbookStacks * 0.7) +
    input.beddingSets * 1 +
    Math.ceil(input.kitchenwareSets * 0.5);

  const recommendedBoxes = Math.max(1, Math.min(8, rawBoxes));
  const recommendedBulky = Math.max(
    0,
    Math.min(4, input.monitorsOrPcCount + input.miniFridgeOrChairCount)
  );
  const estimatedTotalWeightKg =
    input.clothingBundles * 8 +
    input.textbookStacks * 11 +
    input.beddingSets * 6 +
    input.kitchenwareSets * 7;

  return {
    recommendedBoxes,
    recommendedBulky,
    estimatedTotalWeightKg,
    packingSummaryText: `${recommendedBoxes} Standard Boxes (~${estimatedTotalWeightKg} kg total) + ${recommendedBulky} Bulky Slots`,
  };
}

export type BuyoutConditionGrade = 'A' | 'B' | 'C';

export interface SeniorBuyoutSelection {
  itemId: string;
  grade: BuyoutConditionGrade;
}

export interface SeniorBuyoutQuoteResult {
  campus: CampusOption;
  items: Array<{
    item: HardwareLeaseItem;
    grade: BuyoutConditionGrade;
    payoutAed: number;
    projectedNineMonthLeaseAed: number;
  }>;
  totalStudentPayoutAed: number;
  dubizzleAlternativeAed: number;
  projectedVaultLoopRevenueAed: number;
  circularRoiPercent: number;
}

export function calculateSeniorBuyoutQuote(
  campusId: string,
  selections: SeniorBuyoutSelection[]
): SeniorBuyoutQuoteResult {
  const campus = getCampusById(campusId);
  const detailed = selections
    .map((sel) => {
      const item = HARDWARE_CATALOG.find((h) => h.id === sel.itemId);
      if (!item) return null;
      const payoutAed =
        sel.grade === 'A'
          ? item.buyoutGradeAAed
          : sel.grade === 'B'
          ? item.buyoutGradeBAed
          : item.buyoutGradeCAed;
      return {
        item,
        grade: sel.grade,
        payoutAed,
        projectedNineMonthLeaseAed: item.monthlyRateAed * 9,
      };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  const totalStudentPayoutAed = detailed.reduce((acc, x) => acc + x.payoutAed, 0);
  const dubizzleAlternativeAed = Math.round(totalStudentPayoutAed * 0.45);
  const projectedVaultLoopRevenueAed = detailed.reduce(
    (acc, x) => acc + x.projectedNineMonthLeaseAed,
    0
  );
  const circularRoiPercent =
    totalStudentPayoutAed > 0
      ? Math.round(
          ((projectedVaultLoopRevenueAed - totalStudentPayoutAed) / totalStudentPayoutAed) * 100
        )
      : 0;

  return {
    campus,
    items: detailed,
    totalStudentPayoutAed,
    dubizzleAlternativeAed,
    projectedVaultLoopRevenueAed,
    circularRoiPercent,
  };
}

export interface StorageCalculationInput {
  campusId: string;
  boxCount: number;
  bulkyCount: number;
  overweightBoxCount?: number;
  earlyBirdEligible?: boolean;
}

export interface StorageQuoteResult {
  campus: CampusOption;
  boxCount: number;
  bulkyCount: number;
  boxSubtotalAed: number;
  bulkySubtotalAed: number;
  overweightSurchargeAed: number;
  grossSubtotalAed: number;
  partnerDiscountAed: number;
  earlyBirdDiscountAed: number;
  netTotalAed: number;
  insuranceCoverageAed: number;
  deadRentComparisonAed: number;
  estimatedSavingsAed: number;
  savingsPercent: number;
}

export function getCampusById(campusId: string): CampusOption {
  return (
    CAMPUS_OPTIONS.find((c) => c.id === campusId) ||
    CAMPUS_OPTIONS[CAMPUS_OPTIONS.length - 1]
  );
}

export function calculateStorageQuote(input: StorageCalculationInput): StorageQuoteResult {
  const campus = getCampusById(input.campusId);
  const clampedBoxes = Math.max(1, Math.min(8, Math.round(input.boxCount)));
  const clampedBulky = Math.max(0, Math.min(4, Math.round(input.bulkyCount)));
  const overweightBoxes = Math.max(
    0,
    Math.min(clampedBoxes, Math.round(input.overweightBoxCount || 0))
  );

  const boxSubtotalAed = clampedBoxes * BOX_RATE_SUMMER_AED;
  const bulkySubtotalAed = clampedBulky * BULKY_ITEM_RATE_AED;
  const overweightSurchargeAed = overweightBoxes * OVERWEIGHT_REPACK_SURCHARGE_AED;

  const grossSubtotalAed = boxSubtotalAed + bulkySubtotalAed + overweightSurchargeAed;
  const partnerDiscountAed = campus.isPartner
    ? Math.round(grossSubtotalAed * campus.discountRate)
    : 0;
  const earlyBirdDiscountAed = input.earlyBirdEligible ? EARLY_BIRD_CREDIT_AED : 0;

  const netTotalAed = Math.max(0, grossSubtotalAed - partnerDiscountAed - earlyBirdDiscountAed);
  const deadRentComparisonAed = 10500;
  const estimatedSavingsAed = Math.max(0, deadRentComparisonAed - netTotalAed);
  const savingsPercent = Math.round((estimatedSavingsAed / deadRentComparisonAed) * 100);

  return {
    campus,
    boxCount: clampedBoxes,
    bulkyCount: clampedBulky,
    boxSubtotalAed,
    bulkySubtotalAed,
    overweightSurchargeAed,
    grossSubtotalAed,
    partnerDiscountAed,
    earlyBirdDiscountAed,
    netTotalAed,
    insuranceCoverageAed: BASE_INSURANCE_COVERAGE_AED,
    deadRentComparisonAed,
    estimatedSavingsAed,
    savingsPercent,
  };
}

export interface LeaseCalculationInput {
  campusId: string;
  selectedItemIds: string[];
  termMonths?: number;
}

export interface LeaseQuoteResult {
  campus: CampusOption;
  selectedItems: HardwareLeaseItem[];
  isFullStarterPack: boolean;
  termMonths: number;
  grossMonthlyAed: number;
  partnerMonthlyDiscountAed: number;
  netMonthlyAed: number;
  grossContractTotalAed: number;
  partnerContractDiscountAed: number;
  netContractTotalAed: number;
  retailPurchaseEquivalentAed: number;
  circularSavingsAed: number;
}

export function calculateLeaseQuote(input: LeaseCalculationInput): LeaseQuoteResult {
  const campus = getCampusById(input.campusId);
  const termMonths = input.termMonths && input.termMonths > 0 ? input.termMonths : 9;
  const selectedItems = HARDWARE_CATALOG.filter((item) =>
    input.selectedItemIds.includes(item.id)
  );

  const hasAllStarterCore = STARTER_PACK_ITEM_IDS.every((coreId) =>
    input.selectedItemIds.includes(coreId)
  );

  const addonItemsMonthly = selectedItems
    .filter((item) => !STARTER_PACK_ITEM_IDS.includes(item.id))
    .reduce((acc, item) => acc + item.monthlyRateAed, 0);

  const sumMonthly = selectedItems.reduce((acc, item) => acc + item.monthlyRateAed, 0);
  const grossMonthlyAed = hasAllStarterCore
    ? DORM_STARTER_PACK_MONTHLY_AED + addonItemsMonthly
    : sumMonthly;

  const partnerMonthlyDiscountAed = campus.isPartner
    ? Math.round(grossMonthlyAed * campus.discountRate)
    : 0;
  const netMonthlyAed = Math.max(0, grossMonthlyAed - partnerMonthlyDiscountAed);

  const grossContractTotalAed = grossMonthlyAed * termMonths;
  const partnerContractDiscountAed = partnerMonthlyDiscountAed * termMonths;
  const netContractTotalAed = netMonthlyAed * termMonths;

  const retailPurchaseEquivalentAed = selectedItems.reduce(
    (acc, item) => acc + item.retailPriceAed,
    0
  );
  const circularSavingsAed = Math.max(0, retailPurchaseEquivalentAed - netContractTotalAed);

  return {
    campus,
    selectedItems,
    isFullStarterPack: hasAllStarterCore && selectedItems.length === STARTER_PACK_ITEM_IDS.length,
    termMonths,
    grossMonthlyAed,
    partnerMonthlyDiscountAed,
    netMonthlyAed,
    grossContractTotalAed,
    partnerContractDiscountAed,
    netContractTotalAed,
    retailPurchaseEquivalentAed,
    circularSavingsAed,
  };
}

export interface UnitEconomicsResult {
  unitSellingPriceAed: number;
  unitVariableCostAed: number;
  unitContributionMarginAed: number;
  contributionMarginRatioPercent: number;
  fixedOperatingCostsAed: number;
  breakEvenUnits: number;
  breakEvenSalesValueAed: number;
  dubaiStudentPopulation: number;
  breakEvenMarketSharePercent: number;
  projectedStudents: number;
  summerGrossRevenueAed: number;
  summerNetProfitAed: number;
  leasedKitsCount: number;
  monthlyTermRecurringRevenueAed: number;
  eightMonthTermRevenueAed: number;
  combinedAnnualOperatingSurplusAed: number;
}

export function calculateUnitEconomics(
  projectedStudents = 200,
  leasedKitsCount = 200
): UnitEconomicsResult {
  const unitSellingPriceAed = 450;
  const unitVariableCostAed = 90;
  const unitContributionMarginAed = unitSellingPriceAed - unitVariableCostAed;
  const contributionMarginRatioPercent = Math.round(
    (unitContributionMarginAed / unitSellingPriceAed) * 100
  );

  const fixedOperatingCostsAed = 72000;
  const breakEvenUnits = fixedOperatingCostsAed / unitContributionMarginAed;
  const breakEvenSalesValueAed = breakEvenUnits * unitSellingPriceAed;
  const dubaiStudentPopulation = 30000;
  const breakEvenMarketSharePercent = Number(
    ((breakEvenUnits / dubaiStudentPopulation) * 100).toFixed(2)
  );

  const summerGrossRevenueAed = projectedStudents * unitSellingPriceAed;
  const summerTotalVariableCostAed = projectedStudents * unitVariableCostAed;
  const summerNetProfitAed =
    summerGrossRevenueAed - summerTotalVariableCostAed - fixedOperatingCostsAed;

  const monthlyTermRecurringRevenueAed = leasedKitsCount * DORM_STARTER_PACK_MONTHLY_AED;
  const eightMonthTermRevenueAed = monthlyTermRecurringRevenueAed * 8;
  const combinedAnnualOperatingSurplusAed = summerNetProfitAed + eightMonthTermRevenueAed;

  return {
    unitSellingPriceAed,
    unitVariableCostAed,
    unitContributionMarginAed,
    contributionMarginRatioPercent,
    fixedOperatingCostsAed,
    breakEvenUnits,
    breakEvenSalesValueAed,
    dubaiStudentPopulation,
    breakEvenMarketSharePercent,
    projectedStudents,
    summerGrossRevenueAed,
    summerNetProfitAed,
    leasedKitsCount,
    monthlyTermRecurringRevenueAed,
    eightMonthTermRevenueAed,
    combinedAnnualOperatingSurplusAed,
  };
}

export function generateVaultPassId(campusId: string, deterministicDigits?: string): string {
  const campus = getCampusById(campusId);
  const digits =
    deterministicDigits ||
    String(Math.floor(1000 + Math.random() * 9000));
  return `CV-${campus.shortCode}-2026-${digits}`;
}
