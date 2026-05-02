/**
 * LedgerLab — Triple-Statement Integration Generator
 *
 * Pipeline guaranteed by construction:
 *   1. Generate a balanced Trial Balance (Total Dr = Total Cr) that contains
 *      BOTH SFP accounts AND P&L accounts, with Equity split into
 *      Share Capital + Retained Earnings (OPENING).
 *   2. Generate Adjustments — every adjustment is a balanced double-entry
 *      journal (Dr X / Cr Y), some hitting P&L accounts, some hitting SFP
 *      accounts (depreciation, accruals, prepayments, allowance, disposals).
 *   3. compute() applies adjustments to the TB, then constructs in order:
 *        a. Profit or Loss (Net Profit = Adjusted Revenue - Adjusted Expenses)
 *        b. Statement of Changes in Equity
 *           Closing RE = Opening RE + Net Profit - Dividends Paid
 *        c. Statement of Financial Position (uses Closing RE from SOCE)
 *   4. Validation: Total Assets - Total Liabilities === Total Equity (SOCE).
 *      generateScenario() retries until this holds.
 */

export type Difficulty = "easy" | "medium" | "hard";

export interface TrialBalanceAccount {
  name: string;
  debit: number;
  credit: number;
}

export interface JournalEntry {
  debitAccount: string;
  debitAmount: number;
  creditAccount: string;
  creditAmount: number;
}

export type AdjustmentType =
  | "depreciation"
  | "accrual"
  | "prepayment"
  | "allowance"
  | "closingInventory"
  | "disposal"
  | "tax";

export interface Adjustment {
  description: string;
  type: AdjustmentType;
  /** Compound entries supported (e.g. disposal: cost, acc dep, profit/loss) */
  entries: JournalEntry[];
}

export interface GeneratedScenario {
  companyName: string;
  yearEnd: string;
  difficulty: Difficulty;
  trialBalance: TrialBalanceAccount[];
  adjustments: Adjustment[];
  /** Cash dividends actually paid in the year — affect SOCE, not P&L */
  dividendsPaid: number;
}

// -----------------------------------------------------------------------------
// Account classification — every account in the system has exactly one nature.
// -----------------------------------------------------------------------------
type Nature =
  | "asset" // normal Dr balance
  | "contraAsset" // normal Cr balance, deducted from asset
  | "liability" // normal Cr balance
  | "equity" // normal Cr balance
  | "revenue" // P&L credit
  | "expense"; // P&L debit

const ACCOUNT_NATURE: Record<string, Nature> = {
  // SFP — Assets
  "Freehold land and buildings (cost)": "asset",
  "Plant and machinery (cost)": "asset",
  "Motor vehicles (cost)": "asset",
  Inventory: "asset",
  Receivables: "asset",
  Bank: "asset",
  Prepayments: "asset",
  // SFP — Contra-assets
  "Accumulated depreciation - Buildings": "contraAsset",
  "Accumulated depreciation - Plant and machinery": "contraAsset",
  "Accumulated depreciation - Motor vehicles": "contraAsset",
  "Allowance for receivables": "contraAsset",
  // SFP — Liabilities
  "8% Debentures": "liability",
  Payables: "liability",
  "Accrued expenses": "liability",
  "Income tax payable": "liability",
  // Equity
  "Ordinary shares (fully paid)": "equity",
  "Retained earnings": "equity",
  // P&L — Revenue
  Sales: "revenue",
  // P&L — Expenses
  Purchases: "expense",
  "Cost of sales": "expense", // used by closing-inventory adj
  "Wages and salaries": "expense",
  "Administrative expenses": "expense",
  "Light and heat": "expense",
  "Debenture interest": "expense",
  "Depreciation - Buildings": "expense",
  "Depreciation - Plant and machinery": "expense",
  "Depreciation - Motor vehicles": "expense",
  "Bad debt expense": "expense",
  "Income tax expense": "expense",
  "Loss on disposal": "expense",
  "Profit on disposal": "revenue",
};

// -----------------------------------------------------------------------------
// Utilities
// -----------------------------------------------------------------------------
function rand(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function companyName(): string {
  const a = ["Apex", "Zenith", "Stellar", "Quantum", "Horizon", "Nexus", "Pinnacle", "Aurora"];
  const n = ["Tech", "Solutions", "Ventures", "Dynamics", "Systems", "Industries", "Group"];
  const s = ["plc", "Ltd"];
  return `${a[rand(0, a.length - 1)]} ${n[rand(0, n.length - 1)]} ${s[rand(0, s.length - 1)]}`;
}

// -----------------------------------------------------------------------------
// Step 1 — Build a balanced Trial Balance
// -----------------------------------------------------------------------------
/**
 * Strategy:
 *  - Pick concrete numbers for every SFP and P&L account except `Bank`.
 *  - Use `Bank` (a debit-natured asset) as the balancing figure so that
 *    Total Dr = Total Cr. This gives us a fully balanced TB without
 *    requiring later "patching" of any account.
 *  - Retained earnings on this TB is the OPENING figure.
 */
function buildTrialBalance(difficulty: Difficulty): {
  tb: TrialBalanceAccount[];
  meta: { openingInventory: number; receivables: number; nca: { buildings: number; plant: number; vehicles: number } };
} {
  const scale = difficulty === "easy" ? 1 : difficulty === "medium" ? 2 : 3;

  // --- P&L figures (drive Net Profit) ---
  const sales = rand(8000, 14000) * scale;
  const purchases = Math.round(sales * (0.4 + Math.random() * 0.15)); // 40-55% of sales
  const wages = Math.round(sales * (0.08 + Math.random() * 0.05));
  const admin = Math.round(sales * (0.04 + Math.random() * 0.04));
  const lightHeat = Math.round(sales * (0.01 + Math.random() * 0.02));
  const debentureInterest = difficulty === "easy" ? 0 : rand(80, 200) * scale;
  const incomeTaxPaidInYear = rand(100, 300) * scale; // already paid -> debit

  // --- SFP figures (opening balances) ---
  const buildingsCost = rand(3000, 6000) * scale;
  const plantCost = rand(2000, 4000) * scale;
  const vehiclesCost = rand(800, 1500) * scale;
  const accDepBuildings = Math.round(buildingsCost * (0.1 + Math.random() * 0.2));
  const accDepPlant = Math.round(plantCost * (0.15 + Math.random() * 0.25));
  const accDepVehicles = Math.round(vehiclesCost * (0.2 + Math.random() * 0.3));

  const openingInventory = rand(400, 900) * scale;
  const receivables = rand(500, 1100) * scale;
  const allowanceForReceivables = Math.round(receivables * (0.03 + Math.random() * 0.04));

  const debentures = difficulty === "easy" ? 0 : rand(1000, 2500) * scale;
  const payables = rand(400, 900) * scale;
  const incomeTaxPayable = rand(80, 250) * scale;

  const shareCapital = rand(2000, 4000) * scale;
  // Opening retained earnings — choose first, then Bank is the TB plug.
  const openingRetainedEarnings = rand(1500, 3500) * scale;

  // ----- Compute Bank as the balancing debit so Dr = Cr -----
  const credits =
    accDepBuildings +
    accDepPlant +
    accDepVehicles +
    allowanceForReceivables +
    debentures +
    payables +
    incomeTaxPayable +
    shareCapital +
    openingRetainedEarnings +
    sales;

  const debitsExBank =
    buildingsCost +
    plantCost +
    vehiclesCost +
    openingInventory +
    receivables +
    purchases +
    wages +
    admin +
    lightHeat +
    debentureInterest +
    incomeTaxPaidInYear;

  const bank = credits - debitsExBank;
  if (bank < 100) {
    // Bank too small / negative — caller will retry with new randoms
    throw new Error("Bank balance unrealistic, retry");
  }

  const tb: TrialBalanceAccount[] = [
    { name: "Sales", debit: 0, credit: sales },
    { name: "Purchases", debit: purchases, credit: 0 },
    { name: "Inventory", debit: openingInventory, credit: 0 },
    { name: "Wages and salaries", debit: wages, credit: 0 },
    { name: "Administrative expenses", debit: admin, credit: 0 },
    { name: "Light and heat", debit: lightHeat, credit: 0 },
    { name: "Debenture interest", debit: debentureInterest, credit: 0 },
    { name: "Income tax expense", debit: incomeTaxPaidInYear, credit: 0 },
    { name: "Freehold land and buildings (cost)", debit: buildingsCost, credit: 0 },
    { name: "Plant and machinery (cost)", debit: plantCost, credit: 0 },
    { name: "Motor vehicles (cost)", debit: vehiclesCost, credit: 0 },
    { name: "Accumulated depreciation - Buildings", debit: 0, credit: accDepBuildings },
    { name: "Accumulated depreciation - Plant and machinery", debit: 0, credit: accDepPlant },
    { name: "Accumulated depreciation - Motor vehicles", debit: 0, credit: accDepVehicles },
    { name: "Receivables", debit: receivables, credit: 0 },
    { name: "Allowance for receivables", debit: 0, credit: allowanceForReceivables },
    { name: "Bank", debit: bank, credit: 0 },
    { name: "Payables", debit: 0, credit: payables },
    { name: "Income tax payable", debit: 0, credit: incomeTaxPayable },
    { name: "8% Debentures", debit: 0, credit: debentures },
    { name: "Ordinary shares (fully paid)", debit: 0, credit: shareCapital },
    { name: "Retained earnings", debit: 0, credit: openingRetainedEarnings },
  ].filter((a) => a.debit !== 0 || a.credit !== 0);

  // Sanity: TB balances
  const totalDr = tb.reduce((s, a) => s + a.debit, 0);
  const totalCr = tb.reduce((s, a) => s + a.credit, 0);
  if (totalDr !== totalCr) throw new Error(`TB unbalanced: ${totalDr} vs ${totalCr}`);

  return {
    tb,
    meta: {
      openingInventory,
      receivables,
      nca: { buildings: buildingsCost, plant: plantCost, vehicles: vehiclesCost },
    },
  };
}

// -----------------------------------------------------------------------------
// Step 2 — Generate balanced double-entry adjustments
// -----------------------------------------------------------------------------
function generateAdjustments(
  difficulty: Difficulty,
  meta: ReturnType<typeof buildTrialBalance>["meta"],
): { adjustments: Adjustment[]; dividendsPaid: number } {
  const adjs: Adjustment[] = [];

  const target =
    difficulty === "easy" ? rand(3, 4) : difficulty === "medium" ? rand(5, 6) : rand(6, 7);

  // 1. Closing inventory — Dr Inventory / Cr Cost of sales (purchases adj)
  const closingInv = Math.round(meta.openingInventory * (0.7 + Math.random() * 0.4));
  adjs.push({
    description: `Closing inventory was valued at £${closingInv}k.`,
    type: "closingInventory",
    entries: [
      {
        debitAccount: "Inventory",
        debitAmount: closingInv,
        creditAccount: "Cost of sales",
        creditAmount: closingInv,
      },
    ],
  });

  // Candidate adjustments — randomly select enough to hit the exact target
  // range for each difficulty level: Easy 3-4, Medium 5-6, Hard 6-7.
  const depB = Math.round(meta.nca.buildings * 0.02);
  const depP = Math.round(meta.nca.plant * 0.10);
  const depV = Math.round(meta.nca.vehicles * 0.20);
  const accr = rand(40, 180);
  const prep = rand(30, 120);
  const allowanceIncrease = Math.round(meta.receivables * (0.01 + Math.random() * 0.02));
  const taxAccrual = rand(90, 260);
  const candidates: Adjustment[] = [
    {
      description: `Depreciation: buildings 2% straight-line on cost (£${depB}k).`,
      type: "depreciation",
      entries: [{
        debitAccount: "Depreciation - Buildings", debitAmount: depB,
        creditAccount: "Accumulated depreciation - Buildings", creditAmount: depB,
      }],
    },
    {
      description: `Depreciation: plant & machinery 10% straight-line on cost (£${depP}k).`,
      type: "depreciation",
      entries: [{
        debitAccount: "Depreciation - Plant and machinery", debitAmount: depP,
        creditAccount: "Accumulated depreciation - Plant and machinery", creditAmount: depP,
      }],
    },
    {
      description: `Depreciation: motor vehicles 20% straight-line on cost (£${depV}k).`,
      type: "depreciation",
      entries: [{
        debitAccount: "Depreciation - Motor vehicles", debitAmount: depV,
        creditAccount: "Accumulated depreciation - Motor vehicles", creditAmount: depV,
      }],
    },
    {
      description: `Wages of £${accr}k were accrued at year-end.`,
      type: "accrual",
      entries: [{
        debitAccount: "Wages and salaries", debitAmount: accr,
        creditAccount: "Accrued expenses", creditAmount: accr,
      }],
    },
    {
      description: `Insurance of £${prep}k included in administrative expenses was prepaid.`,
      type: "prepayment",
      entries: [{
        debitAccount: "Prepayments", debitAmount: prep,
        creditAccount: "Administrative expenses", creditAmount: prep,
      }],
    },
    {
      description: `Allowance for receivables to be increased by £${allowanceIncrease}k.`,
      type: "allowance",
      entries: [{
        debitAccount: "Bad debt expense", debitAmount: allowanceIncrease,
        creditAccount: "Allowance for receivables", creditAmount: allowanceIncrease,
      }],
    },
    {
      description: `Income tax for the year was estimated to be a further £${taxAccrual}k.`,
      type: "tax",
      entries: [{
        debitAccount: "Income tax expense", debitAmount: taxAccrual,
        creditAccount: "Income tax payable", creditAmount: taxAccrual,
      }],
    },
  ].sort(() => Math.random() - 0.5);

  adjs.push(...candidates.slice(0, target - adjs.length));

  // Dividends actually paid in cash during the year (affect SOCE only).
  const dividendsPaid = Math.random() > 0.4 ? rand(80, 250) : 0;

  return { adjustments: adjs, dividendsPaid };
}

// -----------------------------------------------------------------------------
// Step 3 — Apply adjustments + build the three statements
// -----------------------------------------------------------------------------
export interface IncomeStatement {
  revenue: number;
  costOfSales: number;
  grossProfit: number;
  operatingExpenses: { name: string; amount: number }[];
  totalOperatingExpenses: number;
  operatingProfit: number;
  financeExpenses: number;
  profitBeforeTax: number;
  taxExpense: number;
  profitForYear: number;
}

export interface SOCE {
  openingShareCapital: number;
  openingRetainedEarnings: number;
  profitForYear: number;
  dividendsPaid: number;
  closingShareCapital: number;
  closingRetainedEarnings: number;
  totalEquity: number;
}

export interface SFP {
  nonCurrentAssets: { name: string; cost: number; depn: number; nbv: number }[];
  totalNonCurrentAssets: number;
  currentAssets: {
    inventory: number;
    receivables: number;
    allowance: number;
    netReceivables: number;
    prepayments: number;
    cash: number;
    total: number;
  };
  totalAssets: number;
  equity: { shareCapital: number; retainedEarnings: number; total: number };
  nonCurrentLiabilities: { debentures: number; total: number };
  currentLiabilities: { payables: number; accruals: number; taxPayable: number; total: number };
  totalEquityAndLiabilities: number;
}

export interface ComputedStatements {
  adjustedBalances: Record<string, number>; // signed: Dr positive, Cr negative
  incomeStatement: IncomeStatement;
  soce: SOCE;
  sfp: SFP;
}

/**
 * Convert a TB account into a signed running balance:
 *   assets / expenses : positive = Dr balance
 *   liabilities / equity / revenue / contra-assets : positive = Cr balance
 * We store Dr positive everywhere internally, then read with sign-aware helpers.
 */
function tbToBalances(tb: TrialBalanceAccount[]): Record<string, number> {
  const bal: Record<string, number> = {};
  for (const a of tb) bal[a.name] = (bal[a.name] ?? 0) + a.debit - a.credit;
  return bal;
}

function applyAdjustments(
  bal: Record<string, number>,
  adjs: Adjustment[],
): Record<string, number> {
  const out = { ...bal };
  for (const adj of adjs) {
    for (const e of adj.entries) {
      if (e.debitAmount !== e.creditAmount) {
        throw new Error(`Unbalanced JE in '${adj.description}'`);
      }
      // Treat "Cost of sales" credit on closing-inv adj as reducing Purchases
      // (since we have no opening Cost of sales account on the TB).
      const dr = e.debitAccount;
      const cr = e.creditAccount === "Cost of sales" ? "Purchases" : e.creditAccount;
      out[dr] = (out[dr] ?? 0) + e.debitAmount;
      out[cr] = (out[cr] ?? 0) - e.creditAmount;
    }
  }
  return out;
}

function get(bal: Record<string, number>, name: string): number {
  return bal[name] ?? 0;
}

/** Read the closing inventory injected via the closing-inv adjustment. */
function readClosingInventory(adjs: Adjustment[], openingInv: number): number {
  const adj = adjs.find((a) => a.type === "closingInventory");
  if (!adj) return openingInv;
  // Dr Inventory / Cr Cost of sales — the Dr amount IS closing inventory
  return adj.entries[0].debitAmount;
}

export function computeStatements(scenario: GeneratedScenario): ComputedStatements {
  const initial = tbToBalances(scenario.trialBalance);
  const openingInv = get(initial, "Inventory");
  const adjusted = applyAdjustments(initial, scenario.adjustments);
  // Dividends paid in cash during the year (Dr Retained Earnings / Cr Bank).
  // Recorded internally so SFP cash reflects the outflow; SOCE handles the
  // RE side directly via openingRE + profit - dividends.
  if (scenario.dividendsPaid > 0) {
    adjusted["Bank"] = (adjusted["Bank"] ?? 0) - scenario.dividendsPaid;
  }

  // ---- Income Statement (P&L) ----
  const revenue = -get(adjusted, "Sales"); // Sales is Cr-natured (negative)
  const closingInv = readClosingInventory(scenario.adjustments, openingInv);
  // After closing-inv adj, Inventory (in adjusted) = opening + closing.
  // Cost of sales = opening inventory + purchases (after closing adj credit).
  const purchasesAdj = get(adjusted, "Purchases");
  const costOfSales = openingInv + purchasesAdj;
  const grossProfit = revenue - costOfSales;

  const opExpenseNames = [
    "Wages and salaries",
    "Administrative expenses",
    "Light and heat",
    "Depreciation - Buildings",
    "Depreciation - Plant and machinery",
    "Depreciation - Motor vehicles",
    "Bad debt expense",
    "Loss on disposal",
  ];
  const operatingExpenses = opExpenseNames
    .map((n) => ({ name: n, amount: get(adjusted, n) }))
    .filter((x) => x.amount !== 0);
  const profitOnDisposal = -get(adjusted, "Profit on disposal");
  const totalOperatingExpenses =
    operatingExpenses.reduce((s, x) => s + x.amount, 0) - profitOnDisposal;
  const operatingProfit = grossProfit - totalOperatingExpenses;
  const financeExpenses = get(adjusted, "Debenture interest");
  const profitBeforeTax = operatingProfit - financeExpenses;
  const taxExpense = get(adjusted, "Income tax expense");
  const profitForYear = profitBeforeTax - taxExpense;

  const incomeStatement: IncomeStatement = {
    revenue,
    costOfSales,
    grossProfit,
    operatingExpenses,
    totalOperatingExpenses,
    operatingProfit,
    financeExpenses,
    profitBeforeTax,
    taxExpense,
    profitForYear,
  };

  // ---- SOCE ----
  const openingShareCapital = -get(initial, "Ordinary shares (fully paid)");
  const openingRE = -get(initial, "Retained earnings");
  const closingRE = openingRE + profitForYear - scenario.dividendsPaid;
  const soce: SOCE = {
    openingShareCapital,
    openingRetainedEarnings: openingRE,
    profitForYear,
    dividendsPaid: scenario.dividendsPaid,
    closingShareCapital: openingShareCapital,
    closingRetainedEarnings: closingRE,
    totalEquity: openingShareCapital + closingRE,
  };

  // ---- SFP (uses Closing RE from SOCE) ----
  const ncaDefs: { cost: string; dep: string; label: string }[] = [
    { cost: "Freehold land and buildings (cost)", dep: "Accumulated depreciation - Buildings", label: "Freehold land & buildings" },
    { cost: "Plant and machinery (cost)", dep: "Accumulated depreciation - Plant and machinery", label: "Plant & machinery" },
    { cost: "Motor vehicles (cost)", dep: "Accumulated depreciation - Motor vehicles", label: "Motor vehicles" },
  ];
  const ncaRows = ncaDefs.map((d) => {
    const cost = get(adjusted, d.cost);
    const depn = -get(adjusted, d.dep);
    return { name: d.label, cost, depn, nbv: cost - depn };
  });
  const totalNCA = ncaRows.reduce((s, r) => s + r.nbv, 0);

  // For inventory on SFP: closing inventory only (replace opening).
  const inventory = closingInv;
  const receivables = get(adjusted, "Receivables");
  const allowance = -get(adjusted, "Allowance for receivables");
  const netReceivables = receivables - allowance;
  const prepayments = get(adjusted, "Prepayments");
  const cash = get(adjusted, "Bank");
  const totalCA = inventory + netReceivables + prepayments + cash;
  const totalAssets = totalNCA + totalCA;

  const debentures = -get(adjusted, "8% Debentures");
  const payables = -get(adjusted, "Payables");
  const accruals = -get(adjusted, "Accrued expenses");
  // Tax payable on SFP = opening tax payable + tax expense booked - tax already paid?
  // Simpler: leave as tax payable account (any tax adjustment via journals updates it).
  const taxPayable = -get(adjusted, "Income tax payable");
  const totalCL = payables + accruals + taxPayable;

  const sfp: SFP = {
    nonCurrentAssets: ncaRows,
    totalNonCurrentAssets: totalNCA,
    currentAssets: { inventory, receivables, allowance, netReceivables, prepayments, cash, total: totalCA },
    totalAssets,
    equity: {
      shareCapital: openingShareCapital,
      retainedEarnings: closingRE,
      total: openingShareCapital + closingRE,
    },
    nonCurrentLiabilities: { debentures, total: debentures },
    currentLiabilities: { payables, accruals, taxPayable, total: totalCL },
    totalEquityAndLiabilities: openingShareCapital + closingRE + debentures + totalCL,
  };

  return { adjustedBalances: adjusted, incomeStatement, soce, sfp };
}

export function validateBalances(c: ComputedStatements): { ok: boolean; diff: number } {
  const lhs = c.sfp.totalAssets - (c.sfp.nonCurrentLiabilities.total + c.sfp.currentLiabilities.total);
  const rhs = c.soce.totalEquity;
  const diff = lhs - rhs;
  return { ok: diff === 0, diff };
}

// -----------------------------------------------------------------------------
// Public API — generateScenario with retry until SFP balances
// -----------------------------------------------------------------------------
export function generateScenario(difficulty: Difficulty): GeneratedScenario {
  for (let attempt = 0; attempt < 50; attempt++) {
    try {
      const { tb, meta } = buildTrialBalance(difficulty);
      const { adjustments, dividendsPaid } = generateAdjustments(difficulty, meta);
      const scenario: GeneratedScenario = {
        companyName: companyName(),
        yearEnd: "31 May 2026",
        difficulty,
        trialBalance: tb,
        adjustments,
        dividendsPaid,
      };
      const computed = computeStatements(scenario);
      const { ok, diff } = validateBalances(computed);
      if (ok) return scenario;
      // Retry — random variables produced an unbalanced SFP
      if (attempt > 40) console.warn(`Retry ${attempt}: SFP imbalance £${diff}k`);
    } catch {
      // Bank too small / unbalanced TB — retry
    }
  }
  throw new Error("Failed to generate a balanced scenario after 50 attempts");
}

export { ACCOUNT_NATURE };