import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { ChevronLeft, Eye, HelpCircle } from "lucide-react";
import type { GeneratedScenario } from "@/lib/dataGenerator";

export const Route = createFileRoute("/ratios")({
  head: () => ({
    meta: [
      { title: "Part 3: Financial Ratios — LedgerLab" },
      { name: "description", content: "Calculate and analyze key financial ratios." },
    ],
  }),
  component: RatiosPage,
});

type Tab = "statements" | "formulas";

// --- Standalone Ratio Data Generator ---
function generateRatioData() {
  const randomRange = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
  
  // P&L Generation
  const revenue = randomRange(800, 2500) * 10;
  const costOfSales = Math.round(revenue * (randomRange(40, 65) / 100));
  const grossProfit = revenue - costOfSales;
  const operatingExpenses = Math.round(revenue * (randomRange(15, 25) / 100));
  const operatingProfit = grossProfit - operatingExpenses;
  
  // SFP Generation
  const nca = Math.round(revenue * (randomRange(80, 120) / 100));
  const loan = Math.round(nca * (randomRange(20, 40) / 100));
  const financeCosts = Math.round(loan * 0.08); // 8% interest
  const profitBeforeTax = operatingProfit - financeCosts;
  const tax = Math.round(profitBeforeTax * 0.20);
  const profitForYear = profitBeforeTax - tax;

  const inventory = Math.round((costOfSales / 365) * randomRange(40, 80));
  const receivables = Math.round((revenue / 365) * randomRange(30, 60));
  const cash = randomRange(10, 100);
  const totalCa = inventory + receivables + cash;
  const totalAssets = nca + totalCa;

  const payables = Math.round((costOfSales / 365) * randomRange(30, 60));
  const overdraft = randomRange(0, 1) === 1 ? randomRange(20, 80) : 0;
  const totalCl = payables + overdraft;
  
  const totalEquity = totalAssets - loan - totalCl;
  const shareCapital = Math.round(totalEquity * 0.4);
  const retainedEarnings = totalEquity - shareCapital;

  return {
    pl: { revenue, costOfSales, grossProfit, operatingExpenses, operatingProfit, financeCosts, profitBeforeTax, tax, profitForYear },
    sfp: {
      nca,
      ca: { inventory, receivables, cash, total: totalCa },
      totalAssets,
      equity: { shareCapital, retainedEarnings, total: totalEquity },
      ncl: { loan },
      cl: { payables, overdraft, total: totalCl },
      totalEquityLiabilities: totalEquity + loan + totalCl
    }
  };
}

function fmt(n: number): string {
  if (n === 0) return "—";
  const abs = Math.abs(n).toLocaleString();
  return n < 0 ? `(${abs})` : abs;
}

function RatiosPage() {
  const navigate = useNavigate();
const [scenario, setScenario] = useState<GeneratedScenario | null>(null);
  const [ratioData, setRatioData] = useState<ReturnType<typeof generateRatioData> | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("statements");
  const [hintsEnabled, setHintsEnabled] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem("currentScenario");
    const storedHints = sessionStorage.getItem("hintsEnabled");
    if (stored) {
      setScenario(JSON.parse(stored));
      setRatioData(generateRatioData());
      if (storedHints) setHintsEnabled(JSON.parse(storedHints));
    } else {
      navigate({ to: "/setup" });
    }
  }, [navigate]);

  if (!scenario || !ratioData) {
    return <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>;
  }

  const { companyName, yearEnd, difficulty } = scenario;
  const { pl, sfp } = ratioData;

  // Calculate actual answers
  const capitalEmployed = sfp.equity.total + sfp.ncl.loan;
  const answers = {
    grossMargin: (pl.grossProfit / pl.revenue) * 100,
    opMargin: (pl.operatingProfit / pl.revenue) * 100,
    roce: (pl.operatingProfit / capitalEmployed) * 100,
    currentRatio: sfp.ca.total / sfp.cl.total,
    quickRatio: (sfp.ca.total - sfp.ca.inventory) / sfp.cl.total,
    invDays: (sfp.ca.inventory / pl.costOfSales) * 365,
    recDays: (sfp.ca.receivables / pl.revenue) * 365,
    payDays: (sfp.cl.payables / pl.costOfSales) * 365,
    gearing: (sfp.ncl.loan / capitalEmployed) * 100,
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      <div className="border-b border-border/30">
        <div className="container py-4">
          <div className="flex items-center justify-between mb-4 gap-4">
            <Link to="/cashflow" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
              <ChevronLeft className="w-4 h-4" />Back to Cash Flow
            </Link>
            <div className="text-right">
              <h1 className="text-2xl font-bold text-primary">{companyName}</h1>
              <p className="text-sm text-muted-foreground">Year ended {yearEnd}</p>
            </div>
            
            {/* Answer Button & Scroll Prompt */}
            <div className="flex flex-col items-end gap-2">
              <button
                onClick={() => setShowAnswer((s) => !s)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/20 hover:bg-primary/30 text-primary transition-colors"
              >
                <Eye className="w-4 h-4" />
                {showAnswer ? "Hide" : "Show"} Answers
              </button>
              {showAnswer && (
                <div className="px-2 py-1 text-[11px] font-medium bg-secondary/40 border border-border/50 rounded-md text-muted-foreground whitespace-nowrap">
                  ↓ Scroll down for answers
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("statements")}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeTab === "statements" ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground hover:text-foreground"
              }`}
            >
              Financial Statements
            </button>
                    {hintsEnabled && (
              <button
                onClick={() => setActiveTab("formulas")}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  activeTab === "formulas" ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground hover:text-foreground"
                }`}
              >
                Formulas
              </button>
            )}
          </div>

          {/* --- Part 3 Instructions --- */}
          <div className="flex items-start gap-3 mt-6 p-4 rounded-lg bg-secondary/30 border border-border">
            <HelpCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
            <p className="text-sm text-muted-foreground font-medium leading-relaxed">
              Using the standalone financial statements provided below, calculate the requested financial ratios for the year. Round your answers to two decimal places. Assume closing balances are used for all efficiency ratios.
            </p>
          </div>
        </div>
      </div>

      <div className="container py-8 space-y-6">
        {activeTab === "formulas" && hintsEnabled && (
          <div className="ledger-card">
            <h2 className="text-xl font-bold mb-4">Formula Cheat Sheet</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-bold text-primary mb-2 border-b border-border/50 pb-1">Profitability</h3>
                <ul className="space-y-2 text-sm">
                  <li><span className="font-semibold">Gross Profit Margin:</span> (Gross Profit ÷ Revenue) × 100</li>
                  <li><span className="font-semibold">Operating Margin:</span> (Operating Profit ÷ Revenue) × 100</li>
                  <li><span className="font-semibold">ROCE:</span> (Operating Profit ÷ Capital Employed) × 100</li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-primary mb-2 border-b border-border/50 pb-1">Liquidity</h3>
                <ul className="space-y-2 text-sm">
                  <li><span className="font-semibold">Current Ratio:</span> Current Assets ÷ Current Liabilities</li>
                  <li><span className="font-semibold">Quick Ratio:</span> (Current Assets - Inventory) ÷ Current Liabilities</li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-primary mb-2 border-b border-border/50 pb-1">Efficiency</h3>
                <ul className="space-y-2 text-sm">
                  <li><span className="font-semibold">Inventory Days:</span> (Closing Inventory ÷ Cost of Sales) × 365</li>
                  <li><span className="font-semibold">Receivables Days:</span> (Trade Receivables ÷ Revenue) × 365</li>
                  <li><span className="font-semibold">Payables Days:</span> (Trade Payables ÷ Cost of Sales) × 365</li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-primary mb-2 border-b border-border/50 pb-1">Leverage</h3>
                <ul className="space-y-2 text-sm">
                  <li><span className="font-semibold">Gearing:</span> [Non-Current Liabilities ÷ Capital Employed] × 100</li>
                  <li className="text-muted-foreground text-xs mt-2">*Note: Capital Employed = Total Equity + Non-Current Liabilities</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeTab === "statements" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* P&L Table */}
            <div className="ledger-card">
              <h2 className="text-lg font-bold mb-4">Statement of Profit or Loss</h2>
              <table className="w-full text-sm">
                <thead><tr className="text-muted-foreground border-b border-border"><th className="text-left pb-2">£000</th><th className="text-right pb-2"></th></tr></thead>
                <tbody>
                  <tr className="border-b border-border/30"><td className="py-1.5">Revenue</td><td className="text-right font-mono">{fmt(pl.revenue)}</td></tr>
                  <tr className="border-b border-border/30"><td className="py-1.5">Cost of sales</td><td className="text-right font-mono text-red-400">({fmt(pl.costOfSales)})</td></tr>
                  <tr className="border-t-2 border-foreground font-bold"><td className="py-1.5">Gross profit</td><td className="text-right font-mono">{fmt(pl.grossProfit)}</td></tr>
                  <tr className="border-b border-border/30"><td className="py-1.5">Operating expenses</td><td className="text-right font-mono text-red-400">({fmt(pl.operatingExpenses)})</td></tr>
                  <tr className="border-t border-border/50 font-bold"><td className="py-1.5">Operating profit</td><td className="text-right font-mono">{fmt(pl.operatingProfit)}</td></tr>
                  <tr className="border-b border-border/30"><td className="py-1.5">Finance costs</td><td className="text-right font-mono text-red-400">({fmt(pl.financeCosts)})</td></tr>
                  <tr className="border-t border-border/50 font-bold"><td className="py-1.5">Profit before tax</td><td className="text-right font-mono">{fmt(pl.profitBeforeTax)}</td></tr>
                  <tr className="border-b border-border/30"><td className="py-1.5">Taxation</td><td className="text-right font-mono text-red-400">({fmt(pl.tax)})</td></tr>
                  <tr className="border-t-4 border-double border-foreground font-bold"><td className="py-2">Profit for the year</td><td className="text-right font-mono">{fmt(pl.profitForYear)}</td></tr>
                </tbody>
              </table>
            </div>

            {/* SFP Table */}
            <div className="ledger-card">
              <h2 className="text-lg font-bold mb-4">Statement of Financial Position</h2>
              <table className="w-full text-sm">
                <thead><tr className="text-muted-foreground border-b border-border"><th className="text-left pb-2">£000</th><th className="text-right pb-2"></th></tr></thead>
                <tbody>
                  <tr className="bg-secondary/40 font-bold"><td className="py-1 px-2" colSpan={2}>NON-CURRENT ASSETS</td></tr>
                  <tr className="border-b border-border/30"><td className="py-1.5 pl-4">Property, plant and equipment</td><td className="text-right font-mono">{fmt(sfp.nca)}</td></tr>
                  
                  <tr className="bg-secondary/40 font-bold"><td className="py-1 px-2 mt-2" colSpan={2}>CURRENT ASSETS</td></tr>
                  <tr className="border-b border-border/30"><td className="py-1.5 pl-4">Inventory</td><td className="text-right font-mono">{fmt(sfp.ca.inventory)}</td></tr>
                  <tr className="border-b border-border/30"><td className="py-1.5 pl-4">Trade receivables</td><td className="text-right font-mono">{fmt(sfp.ca.receivables)}</td></tr>
                  <tr className="border-b border-border/30"><td className="py-1.5 pl-4">Cash at bank</td><td className="text-right font-mono">{fmt(sfp.ca.cash)}</td></tr>
                  <tr className="border-b border-border/30 font-bold"><td className="py-1.5 pl-4"></td><td className="text-right font-mono">{fmt(sfp.ca.total)}</td></tr>
                  <tr className="border-t-2 border-foreground font-bold"><td className="py-2">TOTAL ASSETS</td><td className="text-right font-mono">{fmt(sfp.totalAssets)}</td></tr>

                  <tr className="bg-secondary/40 font-bold"><td className="py-1 px-2 mt-4" colSpan={2}>EQUITY</td></tr>
                  <tr className="border-b border-border/30"><td className="py-1.5 pl-4">Share capital</td><td className="text-right font-mono">{fmt(sfp.equity.shareCapital)}</td></tr>
                  <tr className="border-b border-border/30"><td className="py-1.5 pl-4">Retained earnings</td><td className="text-right font-mono">{fmt(sfp.equity.retainedEarnings)}</td></tr>
                  <tr className="border-b border-border/30 font-bold"><td className="py-1.5 pl-4"></td><td className="text-right font-mono">{fmt(sfp.equity.total)}</td></tr>

                  <tr className="bg-secondary/40 font-bold"><td className="py-1 px-2 mt-2" colSpan={2}>NON-CURRENT LIABILITIES</td></tr>
                  <tr className="border-b border-border/30"><td className="py-1.5 pl-4">Bank loan</td><td className="text-right font-mono">{fmt(sfp.ncl.loan)}</td></tr>

                  <tr className="bg-secondary/40 font-bold"><td className="py-1 px-2 mt-2" colSpan={2}>CURRENT LIABILITIES</td></tr>
                  <tr className="border-b border-border/30"><td className="py-1.5 pl-4">Trade payables</td><td className="text-right font-mono">{fmt(sfp.cl.payables)}</td></tr>
                  {sfp.cl.overdraft > 0 && <tr className="border-b border-border/30"><td className="py-1.5 pl-4">Bank overdraft</td><td className="text-right font-mono">{fmt(sfp.cl.overdraft)}</td></tr>}
                  <tr className="border-b border-border/30 font-bold"><td className="py-1.5 pl-4"></td><td className="text-right font-mono">{fmt(sfp.cl.total)}</td></tr>
                  
                  <tr className="border-t-4 border-double border-foreground font-bold"><td className="py-2">TOTAL EQUITY & LIABILITIES</td><td className="text-right font-mono">{fmt(sfp.totalEquityLiabilities)}</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Requirements Box */}
        <div className="ledger-card bg-secondary/10">
          <h2 className="text-xl font-bold mb-4">Required Ratios</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="font-bold text-primary block mb-1">Profitability</span>
              <ul className="list-disc list-inside text-muted-foreground">
                <li>Gross Profit Margin</li>
                <li>Operating Margin</li>
                <li>ROCE</li>
              </ul>
            </div>
            <div>
              <span className="font-bold text-primary block mb-1">Liquidity</span>
              <ul className="list-disc list-inside text-muted-foreground">
                <li>Current Ratio</li>
                <li>Quick Ratio</li>
              </ul>
            </div>
            <div>
              <span className="font-bold text-primary block mb-1">Efficiency</span>
              <ul className="list-disc list-inside text-muted-foreground">
                <li>Inventory Days</li>
                <li>Receivables Days</li>
                <li>Payables Days</li>
              </ul>
            </div>
            <div>
              <span className="font-bold text-primary block mb-1">Leverage</span>
              <ul className="list-disc list-inside text-muted-foreground">
                <li>Gearing Ratio</li>
              </ul>
            </div>
          </div>
        </div>

        {/* ANSWERS SECTION (With green answer-card class) */}
        {showAnswer && (
          <div className="ledger-card answer-card">
            <h2 className="text-xl font-bold mb-4">Answer Key</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Profitability Answers */}
              <div>
                <h3 className="font-bold text-primary mb-3">Profitability</h3>
                <table className="w-full text-sm">
                  <tbody>
                    <tr className="border-b border-border/30"><td className="py-2">Gross Profit Margin</td><td className="text-right font-mono">{answers.grossMargin.toFixed(2)}%</td></tr>
                    <tr className="border-b border-border/30"><td className="py-2">Operating Margin</td><td className="text-right font-mono">{answers.opMargin.toFixed(2)}%</td></tr>
                    <tr className="border-b border-border/30"><td className="py-2">ROCE</td><td className="text-right font-mono">{answers.roce.toFixed(2)}%</td></tr>
                  </tbody>
                </table>
              </div>

              {/* Liquidity Answers */}
              <div>
                <h3 className="font-bold text-primary mb-3">Liquidity</h3>
                <table className="w-full text-sm">
                  <tbody>
                    <tr className="border-b border-border/30"><td className="py-2">Current Ratio</td><td className="text-right font-mono">{answers.currentRatio.toFixed(2)} : 1</td></tr>
                    <tr className="border-b border-border/30"><td className="py-2">Quick Ratio</td><td className="text-right font-mono">{answers.quickRatio.toFixed(2)} : 1</td></tr>
                  </tbody>
                </table>
              </div>

              {/* Efficiency Answers */}
              <div>
                <h3 className="font-bold text-primary mb-3">Efficiency</h3>
                <table className="w-full text-sm">
                  <tbody>
                    <tr className="border-b border-border/30"><td className="py-2">Inventory Days</td><td className="text-right font-mono">{Math.round(answers.invDays)} days</td></tr>
                    <tr className="border-b border-border/30"><td className="py-2">Receivables Days</td><td className="text-right font-mono">{Math.round(answers.recDays)} days</td></tr>
                    <tr className="border-b border-border/30"><td className="py-2">Payables Days</td><td className="text-right font-mono">{Math.round(answers.payDays)} days</td></tr>
                  </tbody>
                </table>
              </div>

              {/* Leverage Answers */}
              <div>
                <h3 className="font-bold text-primary mb-3">Leverage</h3>
                <table className="w-full text-sm">
                  <tbody>
                    <tr className="border-b border-border/30"><td className="py-2">Gearing Ratio</td><td className="text-right font-mono">{answers.gearing.toFixed(2)}%</td></tr>
                  </tbody>
                </table>
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}
