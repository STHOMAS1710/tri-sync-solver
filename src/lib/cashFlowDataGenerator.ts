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
function generateAdditionalInformation(difficulty: Difficulty): AdditionalInformation {
  const info: AdditionalInformation = {};

  // Asset disposal (for medium/hard)
  if (difficulty !== 'easy' && Math.random() > 0.5) {
    const cost = randomRange(100, 400);
    const accDepn = randomRange(20, 100);
    info.assetDisposal = {
      description: `Plant and equipment which originally cost £${cost}k and had accumulated depreciation of £${accDepn}k was sold for £${cost - accDepn + randomRange(-50, 50)}k.`,
      cost,
      accumulatedDepreciation: accDepn,
      saleProceeds: cost - accDepn + randomRange(-50, 50),
    };
  }

  // Debentures (for hard)
  if (difficulty === 'hard' && Math.random() > 0.5) {
    info.debentures = {
      description: `New debentures of £${randomRange(200, 500)}k were issued during the year.`,
      amount: randomRange(200, 500),
    };
  }

  // Dividends
  if (Math.random() > 0.4) {
    info.dividends = {
      description: `Dividends of £${randomRange(50, 200)}k were paid during the year.`,
      amount: randomRange(50, 200),
    };
  }

  // Depreciation
  info.depreciation = {
    description: `Depreciation for the year was £${randomRange(100, 300)}k.`,
    amount: randomRange(100, 300),
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
