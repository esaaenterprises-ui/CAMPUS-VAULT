import test from 'node:test';
import assert from 'node:assert/strict';
import {
  HARDWARE_CATALOG,
  calculateStorageQuote,
  calculateLeaseQuote,
  calculateUnitEconomics,
  generateVaultPassId,
  estimatePackingVolume,
  calculateSeniorBuyoutQuote,
  calculatePaymentPlan,
} from './pricing';

test('UT-01: Partner Discount Engine applies 15% Campus Partner Grant for UOWD', () => {
  const quote = calculateStorageQuote({
    campusId: 'uowd',
    boxCount: 3,
    bulkyCount: 1,
  });

  assert.equal(quote.campus.isPartner, true);
  assert.equal(quote.grossSubtotalAed, 480);
  assert.equal(quote.partnerDiscountAed, 72);
  assert.equal(quote.netTotalAed, 408);
});

test('UT-02: Non-Partner Institution applies 0% discount', () => {
  const quote = calculateStorageQuote({
    campusId: 'other',
    boxCount: 3,
    bulkyCount: 1,
  });

  assert.equal(quote.campus.isPartner, false);
  assert.equal(quote.grossSubtotalAed, 480);
  assert.equal(quote.partnerDiscountAed, 0);
  assert.equal(quote.netTotalAed, 480);
});

test('UT-03: Box Volume Slider recomputes 6 boxes to 720 AED gross', () => {
  const quote = calculateStorageQuote({
    campusId: 'other',
    boxCount: 6,
    bulkyCount: 0,
  });

  assert.equal(quote.boxCount, 6);
  assert.equal(quote.boxSubtotalAed, 720);
  assert.equal(quote.grossSubtotalAed, 720);
});

test('UT-04: Dorm Hardware 9-Month Lease calculates bundle and partner grant', () => {
  const fullPackQuote = calculateLeaseQuote({
    campusId: 'other',
    selectedItemIds: ['mini-fridge', 'monitor-4k', 'microwave-solo', 'task-chair'],
    termMonths: 9,
  });

  assert.equal(fullPackQuote.isFullStarterPack, true);
  assert.equal(fullPackQuote.grossMonthlyAed, 99);
  assert.equal(fullPackQuote.netContractTotalAed, 891);

  const partnerPackQuote = calculateLeaseQuote({
    campusId: 'uowd',
    selectedItemIds: ['mini-fridge', 'monitor-4k', 'microwave-solo', 'task-chair'],
    termMonths: 9,
  });

  assert.equal(partnerPackQuote.partnerMonthlyDiscountAed, 15);
  assert.equal(partnerPackQuote.netMonthlyAed, 84);
  assert.equal(partnerPackQuote.netContractTotalAed, 756);
});

test('UT-05 & Rule 2: Vault Pass ID formatting and 25kg overweight surcharge', () => {
  const passId = generateVaultPassId('uowd', '9812');
  assert.equal(passId, 'CV-UOWD-2026-9812');

  const overweightQuote = calculateStorageQuote({
    campusId: 'other',
    boxCount: 3,
    bulkyCount: 0,
    overweightBoxCount: 1,
    earlyBirdEligible: true,
  });

  assert.equal(overweightQuote.overweightSurchargeAed, 60);
  assert.equal(overweightQuote.grossSubtotalAed, 420);
  assert.equal(overweightQuote.earlyBirdDiscountAed, 50);
  assert.equal(overweightQuote.netTotalAed, 370);
});

test('UT-06: Unit Economics & Contribution Margin Break-Even is 200 students (90,000 AED)', () => {
  const model = calculateUnitEconomics(200, 200);
  assert.equal(model.unitContributionMarginAed, 360);
  assert.equal(model.contributionMarginRatioPercent, 80);
  assert.equal(model.fixedOperatingCostsAed, 72000);
  assert.equal(model.breakEvenUnits, 200);
  assert.equal(model.breakEvenSalesValueAed, 90000);
  assert.equal(model.summerNetProfitAed, 0);
  assert.equal(model.monthlyTermRecurringRevenueAed, 19800);
  assert.equal(model.eightMonthTermRevenueAed, 158400);
});

test('UT-07: Senior Buyout Calculator computes payouts and circular ROI', () => {
  const buyout = calculateSeniorBuyoutQuote('uowd', [
    { itemId: 'mini-fridge', grade: 'B' }, // 95 AED
    { itemId: 'monitor-4k', grade: 'A' }, // 120 AED
  ]);

  assert.equal(buyout.totalStudentPayoutAed, 215);
  assert.equal(buyout.items.length, 2);
  assert.ok(buyout.circularRoiPercent > 150);
});

test('UT-08: Room Packing Estimator & Tabby 4-Installment Splitter', () => {
  const est = estimatePackingVolume({
    clothingBundles: 2,
    textbookStacks: 1,
    beddingSets: 1,
    kitchenwareSets: 1,
    monitorsOrPcCount: 1,
    miniFridgeOrChairCount: 0,
  });

  assert.ok(est.recommendedBoxes >= 3);
  assert.equal(est.recommendedBulky, 1);

  const plan = calculatePaymentPlan(408, 'tabby');
  assert.equal(plan.installmentCount, 4);
  assert.equal(plan.perInstallmentAed, 102);
});

test('UT-09: Expanded 16-Item Hardware Catalog supports multi-category leasing & buyouts', () => {
  assert.equal(HARDWARE_CATALOG.length, 16);

  // Starter pack (99 AED/mo) + Air Fryer (19 AED/mo) + PS5 Slim (65 AED/mo) = 183 AED/mo gross
  const expandedLease = calculateLeaseQuote({
    campusId: 'other',
    selectedItemIds: [
      'mini-fridge',
      'monitor-4k',
      'microwave-solo',
      'task-chair',
      'air-fryer',
      'ps5-console',
    ],
    termMonths: 9,
  });
  assert.equal(expandedLease.grossMonthlyAed, 183);

  // Selling a PS5 Slim (Grade A: 450 AED) + Campus E-Scooter (Grade B: 290 AED) = 740 AED cash
  const expandedBuyout = calculateSeniorBuyoutQuote('uowd', [
    { itemId: 'ps5-console', grade: 'A' },
    { itemId: 'escooter-commute', grade: 'B' },
  ]);
  assert.equal(expandedBuyout.totalStudentPayoutAed, 740);
});
