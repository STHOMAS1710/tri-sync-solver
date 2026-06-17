/**
 * LedgerLab Cash Flow & Ratio Data Generator
 * Generates separate financial statements for Part 2 (Cash Flow) and Part 3 (Ratios)
 * These are independent from Part 1 questions, only linked by company name
 */

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface StatementOfFinancialPositionData {
  year: number;
  nonCurrentAssets: {
    propertyPlantEquipmentCost: number;
    accumulatedDepreciation: number;
    net: number;
  };
  currentAssets: {
    inventories: number;
    tradeReceivables: number;
    cashAtBank: number;
    total: number;
  };
  totalAssets: number;
  equity: {
    shareCapital: number;
    sharePremium: number;
    retainedEarnings: number;
    total: number;
  };
  nonCurrentLiabilities: {
    debentures: number;
  };
  currentLiabilities: {
    tradePayables: number;
    taxPayable: number;
    total: number;
  };
  totalLiabilitiesAndEquity: number;
}

export interface ProfitLossStatement {
  year: number;
  revenue: number;
  costOfSales: number;
  grossProfit: number;
  operatingExpenses: number;
  operatingProfit: number;
  financeExpenses: number;
  profitBeforeTax: number;
  taxation: number;
  profitForYear: number;
}

export interface AdditionalInformation {
  assetDisposal?: {
    description: string;
    cost: number;
    accumulatedDepreciation: number;
    saleProceeds: number;
  };
  debentures?: {
    description: string;
    amount: number;
  };
  dividends?: {
    description: string;
    amount: number;
  };
  depreciation?: {
    description: string;
    amount: number;
  };
}

export interface CashFlowScenario {
  companyName: string;
  difficulty: Difficulty;
  currentYearPosition: StatementOfFinancialPositionData;
  priorYearPosition: StatementOfFinancialPositionData;
  profitLossStatement: ProfitLossStatement;
  additionalInformation: AdditionalInformation;
}

// ============ UTILITY FUNCTIONS ============
function randomRange(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ============ GENERATE COMPARATIVE FINANCIAL POSITIONS ============
function generateFinancialPositions(difficulty: Difficulty): {
  current: StatementOfFinancialPositionData;
  prior: StatementOfFinancialPositionData;
} {
  const currentYear = 2026;
  const priorYear = 2025;

  // Generate current year
  const currentPPECost = randomRange(2000, 4000);
  const currentAccDepn = randomRange(400, 1000);
  const currentInventories = randomRange(200, 600);
  const currentReceivables = randomRange(300, 800);
  const currentCash = randomRange(100, 500);
  const currentShareCapital = randomRange(1200, 2000);
  const currentSharePremium = randomRange(100, 300);
  const currentRetainedEarnings = randomRange(800, 1500);
  const currentDebentures = difficulty === 'easy' ? 0 : randomRange(400, 800);
  const currentPayables = randomRange(200, 600);
  const currentTaxPayable = randomRange(50, 200);

  const currentCurrentAssets = currentInventories + currentReceivables + currentCash;
  const currentPPENet = currentPPECost - currentAccDepn;
  const currentTotalAssets = currentPPENet + currentCurrentAssets;
  const currentEquity = currentShareCapital + currentSharePremium + currentRetainedEarnings;
  const currentCurrentLiabilities = currentPayables + currentTaxPayable;
  const currentTotalLiabilities = currentDebentures + currentCurrentLiabilities;

  // Ensure balance: adjust retained earnings if needed
  const adjustedRetainedEarnings = currentTotalAssets - currentShareCapital - currentSharePremium - currentDebentures - currentCurrentLiabilities;

  const current: StatementOfFinancialPositionData = {
    year: currentYear,
    nonCurrentAssets: {
      propertyPlantEquipmentCost: currentPPECost,
      accumulatedDepreciation: currentAccDepn,
      net: currentPPENet,
    },
    currentAssets: {
      inventories: currentInventories,
      tradeReceivables: currentReceivables,
      cashAtBank: currentCash,
      total: currentCurrentAssets,
    },
    totalAssets: currentTotalAssets,
    equity: {
      shareCapital: currentShareCapital,
      sharePremium: currentSharePremium,
      retainedEarnings: adjustedRetainedEarnings,
      total: currentShareCapital + currentSharePremium + adjustedRetainedEarnings,
    },
    nonCurrentLiabilities: {
      debentures: currentDebentures,
    },
    currentLiabilities: {
      tradePayables: currentPayables,
      taxPayable: currentTaxPayable,
      total: currentCurrentLiabilities,
    },
    totalLiabilitiesAndEquity: currentDebentures + currentCurrentLiabilities + currentShareCapital + currentSharePremium + adjustedRetainedEarnings,
  };

  // Generate prior year (slightly different figures)
  const priorPPECost = currentPPECost - randomRange(100, 300);
  const priorAccDepn = currentAccDepn - randomRange(50, 150);
  const priorInventories = currentInventories + randomRange(-100, 100);
  const priorReceivables = currentReceivables + randomRange(-100, 100);
  const priorCash = currentCash + randomRange(-100, 100);
  const priorShareCapital = currentShareCapital;
  const priorSharePremium = currentSharePremium;
  const priorPayables = currentPayables + randomRange(-50, 50);
  const priorTaxPayable = currentTaxPayable + randomRange(-30, 30);
  const priorDebentures = currentDebentures;

  const priorCurrentAssets = priorInventories + priorReceivables + priorCash;
  const priorPPENet = priorPPECost - priorAccDepn;
  const priorTotalAssets = priorPPENet + priorCurrentAssets;
  const priorCurrentLiabilities = priorPayables + priorTaxPayable;
  const priorRetainedEarnings = priorTotalAssets - priorShareCapital - priorSharePremium - priorDebentures - priorCurrentLiabilities;

  const prior: StatementOfFinancialPositionData = {
    year: priorYear,
    nonCurrentAssets: {
      propertyPlantEquipmentCost: priorPPECost,
      accumulatedDepreciation: priorAccDepn,
      net: priorPPENet,
    },
    currentAssets: {
      inventories: priorInventories,
      tradeReceivables: priorReceivables,
      cashAtBank: priorCash,
      total: priorCurrentAssets,
    },
    totalAssets: priorTotalAssets,
    equity: {
      shareCapital: priorShareCapital,
      sharePremium: priorSharePremium,
      retainedEarnings: priorRetainedEarnings,
      total: priorShareCapital + priorSharePremium + priorRetainedEarnings,
    },
    nonCurrentLiabilities: {
      debentures: priorDebentures,
    },
    currentLiabilities: {
      tradePayables: priorPayables,
      taxPayable: priorTaxPayable,
      total: priorCurrentLiabilities,
    },
    totalLiabilitiesAndEquity: priorDebentures + priorCurrentLiabilities + priorShareCapital + priorSharePremium + priorRetainedEarnings,
  };

  return { current, prior };
}

// ============ GENERATE PROFIT & LOSS STATEMENT ============
function generateProfitLossStatement(difficulty: Difficulty): ProfitLossStatement {
  const revenue = randomRange(5000, 15000);
  const costOfSales = Math.round(revenue * randomRange(0.4, 0.6) / 10) * 10;
  const grossProfit = revenue - costOfSales;
  const operatingExpenses = Math.round(grossProfit * randomRange(0.3, 0.5) / 10) * 10;
  const operatingProfit = grossProfit - operatingExpenses;
  const financeExpenses = difficulty === 'easy' ? 0 : randomRange(50, 200);
  const profitBeforeTax = operatingProfit - financeExpenses;
  const taxation = Math.round(profitBeforeTax * 0.19);
  const profitForYear = profitBeforeTax - taxation;

  return {
    year: 2026,
    revenue,
    costOfSales,
    grossProfit,
    operatingExpenses,
    operatingProfit,
    financeExpenses,
    profitBeforeTax,
    taxation,
    profitForYear,
  };
}

// ============ GENERATE ADDITIONAL INFORMATION ============
function generateAdditionalInformation(
  difficulty: Difficulty,
  current: StatementOfFinancialPositionData,
  prior: StatementOfFinancialPositionData
): AdditionalInformation {
  const info: AdditionalInformation = {};
  
  // 1. Dynamically set the number of adjustments
  const diffString = String(difficulty).toLowerCase();
  const numAdjustments = diffString === 'easy' ? 1 : 2;

  // 2. Randomly select which adjustments to include
  const possibleAdjustments = ['disposal', 'debenture', 'dividend'];
  const shuffled = possibleAdjustments.sort(() => 0.5 - Math.random());
  const selectedAdjustments = shuffled.slice(0, numAdjustments);

  // 3. Process Asset Disposals
  let accDepnDisposed = 0;
  if (selectedAdjustments.includes('disposal')) {
    const cost = Math.floor(Math.random() * (100 - 20 + 1)) + 20;
    const accDep = Math.floor(Math.random() * (cost - 5 - 5 + 1)) + 5;
    const nbv = cost - accDep;
    const proceeds = Math.floor(Math.random() * (nbv + 20 - 5 + 1)) + 5;
    const profitLoss = proceeds - nbv;
    accDepnDisposed = accDep;

    const phrasingType = Math.random() > 0.5 ? 'A' : 'B';
    let description = '';

    if (phrasingType === 'A') {
      description = `During the year, certain items of machinery were disposed of for proceeds of £${proceeds}k. The machines had originally cost £${cost}k and had a net book value at disposal of £${nbv}k.`;
    } else {
      const lossOrProfit = profitLoss < 0 ? `loss of £${Math.abs(profitLoss)}k` : `profit of £${profitLoss}k`;
      description = `During the year plant and equipment, which had originally cost £${cost}k and at the date of sale had accumulated depreciation of £${accDep}k, was sold for a ${lossOrProfit}.`;
    }

    // TS FIX APPLIED HERE: Properly mapped to saleProceeds
    info.assetDisposal = {
      description,
      cost,
      accumulatedDepreciation: accDep,
      saleProceeds: proceeds
    };
  }

  // 4. Process Debentures
  if (selectedAdjustments.includes('debenture')) {
    const changeAmount = Math.floor(Math.random() * (400 - 100 + 1)) + 100;
    const isIssue = Math.random() > 0.5;

    if (isIssue) {
      // Issue: Safely inflate the current year's assets and liabilities
      current.nonCurrentLiabilities.debentures += changeAmount;
      current.currentAssets.cashAtBank += changeAmount;
      current.currentAssets.total += changeAmount;
      current.totalAssets += changeAmount;
      current.totalLiabilitiesAndEquity += changeAmount;

      info.debentures = {
        description: `The issue of further debentures of £${changeAmount}k was made on 1 January 20X7. All interest has been paid up to date.`,
        amount: changeAmount
      };
    } else {
      // Repayment: Safely inflate the PRIOR year's assets and liabilities (MATH FIX APPLIED HERE)
      prior.nonCurrentLiabilities.debentures += changeAmount;
      prior.currentAssets.cashAtBank += changeAmount;
      prior.currentAssets.total += changeAmount;
      prior.totalAssets += changeAmount;
      prior.totalLiabilitiesAndEquity += changeAmount;

      info.debentures = {
        description: `The debentures of £${changeAmount}k were repaid on 30 September 20X3. All interest due has been paid.`,
        amount: -changeAmount
      };
    }
  }

  // 5. Process Dividends
  if (selectedAdjustments.includes('dividend')) {
    const dividendAmount = Math.floor(Math.random() * (50 - 10 + 1)) + 10;
    info.dividends = {
      description: `Dividends of £${dividendAmount}k were paid during the year.`,
      amount: dividendAmount
    };
  }

  // 6. Mandatory Depreciation Calculation
  const calculatedDepreciation = 
    current.nonCurrentAssets.accumulatedDepreciation - 
    prior.nonCurrentAssets.accumulatedDepreciation + 
    accDepnDisposed;

  info.depreciation = {
    description: `Depreciation for the year was £${calculatedDepreciation}k.`,
    amount: calculatedDepreciation,
  };

  return info;
}

// ============ MAIN GENERATOR ============
export function generateCashFlowScenario(companyName: string, difficulty: Difficulty): CashFlowScenario {
  const { current, prior } = generateFinancialPositions(difficulty);
  const profitLoss = generateProfitLossStatement(difficulty);
  const additionalInfo = generateAdditionalInformation(difficulty);

  return {
    companyName,
    difficulty,
    currentYearPosition: current,
    priorYearPosition: prior,
    profitLossStatement: profitLoss,
    additionalInformation: additionalInfo,
  };
}
