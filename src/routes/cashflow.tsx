import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Eye } from "lucide-react";
import { type CashFlowScenario } from "@/lib/cashFlowDataGenerator";

export const Route = createFileRoute("/cashflow")({
  head: () => ({
    meta: [
      { title: "Part 2: Cash Flow Statement — LedgerLab" },
      { name: "description", content: "Prepare a Cash Flow Statement using the indirect method." },
    ],
  }),
  component: CashFlowPage,
});

function CashFlowPage() {
  const navigate = useNavigate();
  const [scenario, setScenario] = useState<CashFlowScenario | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem("cashFlowScenario");
    if (stored) setScenario(JSON.parse(stored));
    else navigate({ to: "/setup" });
  }, [navigate]);

  if (!scenario) return <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>;

  const { companyName, currentYearPosition: cy, priorYearPosition: py, profitLossStatement: pl, additionalInformation: info } = scenario;

  const cell = (n: number) => <td className="ledger-figure">{n.toLocaleString()}</td>;
  const neg = (n: number) => <td className="ledger-figure">({n.toLocaleString()})</td>;

// ===== Worked Cash Flow Statement (Indirect Method) =====
  const disposalCost = info.assetDisposal?.cost ?? 0;
  const disposalAccDepn = info.assetDisposal?.accumulatedDepreciation ?? 0;
  const disposalProceeds = info.assetDisposal?.saleProceeds ?? 0;
  
  // THE FIX: If the note is missing (Medium/Hard), the answer key derives it mathematically!
  const depreciation = info.depreciation?.amount ?? 
    (cy.nonCurrentAssets.accumulatedDepreciation - py.nonCurrentAssets.accumulatedDepreciation + disposalAccDepn);

  const disposalNBV = disposalCost - disposalAccDepn;
  const gainOnDisposal = disposalProceeds - disposalNBV; // +gain / -loss
  const debenturesIssued = info.debentures?.amount ?? 0;
  const dividendsPaid = info.dividends?.amount ?? 0;

  // Working capital movements (increase in asset = outflow)
  const dInventories = cy.currentAssets.inventories - py.currentAssets.inventories;
  const dReceivables = cy.currentAssets.tradeReceivables - py.currentAssets.tradeReceivables;
  const dPayables = cy.currentLiabilities.tradePayables - py.currentLiabilities.tradePayables;

  // PPE additions: Closing cost = Opening cost - Disposal cost + Additions
  const ppeAdditions =
    cy.nonCurrentAssets.propertyPlantEquipmentCost -
    py.nonCurrentAssets.propertyPlantEquipmentCost +
    disposalCost;

  // Tax paid: Opening tax payable + tax charge - Closing tax payable
  const taxPaid =
    py.currentLiabilities.taxPayable + pl.taxation - cy.currentLiabilities.taxPayable;

  // Share issue proceeds (capital + premium movement)
  const shareIssue =
    (cy.equity.shareCapital - py.equity.shareCapital) +
    (cy.equity.sharePremium - py.equity.sharePremium);

  // Operating cash flow build-up
  const opAdjusted =
    pl.profitBeforeTax + depreciation + pl.financeExpenses - gainOnDisposal;
  const cashFromOps =
    opAdjusted - dInventories - dReceivables + dPayables;
  const netOperating = cashFromOps - pl.financeExpenses - taxPaid;

  // Investing
  const netInvesting = -ppeAdditions + disposalProceeds;

  // Financing
  const netFinancing = shareIssue + debenturesIssued - dividendsPaid;

  const netChangeInCash = netOperating + netInvesting + netFinancing;
  const computedClosingCash = py.currentAssets.cashAtBank + netChangeInCash;

  const fmt = (n: number) =>
    n < 0 ? `(${Math.abs(n).toLocaleString()})` : n.toLocaleString();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="border-b border-border/30">
        <div className="container py-4">
          <div className="flex items-center justify-between mb-4">
            <Link to="/question" className="p-2 hover:bg-secondary rounded-lg transition"><ChevronLeft className="w-5 h-5" /></Link>
            <h1 className="text-2xl font-bold flex-1 text-center">{companyName}</h1>
            <div className="w-10" />
          </div>
          <p className="text-center text-muted-foreground">Cash Flow Statement — Year ended 31 March {cy.year}</p>
        </div>
      </div>

      <div className="container py-8 max-w-5xl mx-auto space-y-8">
        <div className="ledger-card">
          <h2 className="text-2xl font-bold mb-4">Part 2: Cash Flow Statement (Indirect Method)</h2>
          <p className="text-muted-foreground">Using the financial statements below, prepare a Cash Flow Statement for the year ended 31 March {cy.year} using the indirect method.</p>
        </div>

        <div className="ledger-card">
          <h3 className="text-xl font-bold mb-4">Profit or Loss — Year ended 31 March {pl.year}</h3>
          <table className="ledger-table"><tbody>
            <tr><td>Profit before taxation</td>{cell(pl.profitBeforeTax)}</tr>
            <tr><td>Taxation</td>{neg(pl.taxation)}</tr>
            <tr className="font-bold border-t-2 border-foreground"><td>Profit for the year</td>{cell(pl.profitForYear)}</tr>
          </tbody></table>
        </div>

        <div className="ledger-card">
          <h3 className="text-xl font-bold mb-4">Statement of Financial Position</h3>
          <table className="ledger-table">
            <thead><tr><th>Account</th><th>{cy.year} (£k)</th><th>{py.year} (£k)</th></tr></thead>
            <tbody>
              <tr className="font-bold bg-secondary/50"><td>NON-CURRENT ASSETS</td><td></td><td></td></tr>
              <tr><td className="pl-4">PPE at cost</td>{cell(cy.nonCurrentAssets.propertyPlantEquipmentCost)}{cell(py.nonCurrentAssets.propertyPlantEquipmentCost)}</tr>
              <tr><td className="pl-4">Accumulated depreciation</td>{neg(cy.nonCurrentAssets.accumulatedDepreciation)}{neg(py.nonCurrentAssets.accumulatedDepreciation)}</tr>
              <tr className="font-semibold"><td>NBV</td>{cell(cy.nonCurrentAssets.net)}{cell(py.nonCurrentAssets.net)}</tr>

              <tr className="font-bold bg-secondary/50"><td>CURRENT ASSETS</td><td></td><td></td></tr>
              <tr><td className="pl-4">Inventories</td>{cell(cy.currentAssets.inventories)}{cell(py.currentAssets.inventories)}</tr>
              <tr><td className="pl-4">Trade receivables</td>{cell(cy.currentAssets.tradeReceivables)}{cell(py.currentAssets.tradeReceivables)}</tr>
              <tr><td className="pl-4">Cash at bank</td>{cell(cy.currentAssets.cashAtBank)}{cell(py.currentAssets.cashAtBank)}</tr>

              <tr className="font-bold border-t-2 border-foreground"><td>TOTAL ASSETS</td>{cell(cy.totalAssets)}{cell(py.totalAssets)}</tr>

              <tr className="font-bold bg-secondary/50"><td>EQUITY</td><td></td><td></td></tr>
              <tr><td className="pl-4">Share capital</td>{cell(cy.equity.shareCapital)}{cell(py.equity.shareCapital)}</tr>
              <tr><td className="pl-4">Share premium</td>{cell(cy.equity.sharePremium)}{cell(py.equity.sharePremium)}</tr>
              <tr><td className="pl-4">Retained earnings</td>{cell(cy.equity.retainedEarnings)}{cell(py.equity.retainedEarnings)}</tr>

              <tr className="font-bold bg-secondary/50"><td>NON-CURRENT LIABILITIES</td><td></td><td></td></tr>
              <tr><td className="pl-4">8% Debentures</td>{cell(cy.nonCurrentLiabilities.debentures)}{cell(py.nonCurrentLiabilities.debentures)}</tr>

              <tr className="font-bold bg-secondary/50"><td>CURRENT LIABILITIES</td><td></td><td></td></tr>
              <tr><td className="pl-4">Trade payables</td>{cell(cy.currentLiabilities.tradePayables)}{cell(py.currentLiabilities.tradePayables)}</tr>
              <tr><td className="pl-4">Tax payable</td>{cell(cy.currentLiabilities.taxPayable)}{cell(py.currentLiabilities.taxPayable)}</tr>

              <tr className="font-bold border-t-2 border-foreground"><td>TOTAL EQUITY & LIABILITIES</td>{cell(cy.totalLiabilitiesAndEquity)}{cell(py.totalLiabilitiesAndEquity)}</tr>
            </tbody>
          </table>
        </div>

        <div className="ledger-card">
          <h3 className="text-xl font-bold mb-4">Additional Information</h3>
          <div className="space-y-3 text-sm text-muted-foreground">
            {info.depreciation && <div className="border border-border rounded-lg p-3 bg-secondary/30">{info.depreciation.description}</div>}
            {info.assetDisposal && <div className="border border-border rounded-lg p-3 bg-secondary/30">{info.assetDisposal.description}</div>}
            {info.debentures && <div className="border border-border rounded-lg p-3 bg-secondary/30">{info.debentures.description}</div>}
            {info.dividends && <div className="border border-border rounded-lg p-3 bg-secondary/30">{info.dividends.description}</div>}
          </div>
        </div>

        <div className="flex gap-4">
          <button onClick={() => setShowAnswer((s) => !s)} className="flex-1 btn-primary inline-flex items-center justify-center gap-2">
            <Eye className="w-4 h-4" />{showAnswer ? "Hide" : "Show"} Answer
          </button>
          <Link to="/ratios" className="flex-1 bg-secondary hover:bg-secondary/80 text-foreground px-6 py-3 rounded-lg font-semibold inline-flex items-center justify-center gap-2">
            Next: Ratios<ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {showAnswer && (
          <div className="ledger-card answer-card">
            <h3 className="text-xl font-bold mb-4">
              Answer — Cash Flow Statement (Indirect Method)
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              For the year ended 31 March {cy.year} (£k)
            </p>
            <table className="ledger-table">
              <tbody>
                <tr className="font-bold bg-secondary/50">
                  <td colSpan={2}>Cash flows from operating activities</td>
                </tr>
                <tr><td>Profit before taxation</td><td className="ledger-figure">{fmt(pl.profitBeforeTax)}</td></tr>
                <tr><td className="pl-4">Add: Depreciation</td><td className="ledger-figure">{fmt(depreciation)}</td></tr>
                <tr><td className="pl-4">Add: Finance expenses</td><td className="ledger-figure">{fmt(pl.financeExpenses)}</td></tr>
                {info.assetDisposal && (
                  <tr>
                    <td className="pl-4">{gainOnDisposal >= 0 ? "Less: Gain on disposal" : "Add: Loss on disposal"}</td>
                    <td className="ledger-figure">{fmt(-gainOnDisposal)}</td>
                  </tr>
                )}
                <tr className="font-semibold border-t border-border">
                  <td>Operating profit before working capital changes</td>
                  <td className="ledger-figure">{fmt(opAdjusted)}</td>
                </tr>
                <tr><td className="pl-4">{dInventories >= 0 ? "Increase" : "Decrease"} in inventories</td><td className="ledger-figure">{fmt(-dInventories)}</td></tr>
                <tr><td className="pl-4">{dReceivables >= 0 ? "Increase" : "Decrease"} in receivables</td><td className="ledger-figure">{fmt(-dReceivables)}</td></tr>
                <tr><td className="pl-4">{dPayables >= 0 ? "Increase" : "Decrease"} in payables</td><td className="ledger-figure">{fmt(dPayables)}</td></tr>
                <tr className="font-semibold border-t border-border">
                  <td>Cash generated from operations</td>
                  <td className="ledger-figure">{fmt(cashFromOps)}</td>
                </tr>
                <tr><td className="pl-4">Interest paid</td><td className="ledger-figure">{fmt(-pl.financeExpenses)}</td></tr>
                <tr><td className="pl-4">Tax paid</td><td className="ledger-figure">{fmt(-taxPaid)}</td></tr>
                <tr className="font-bold border-t-2 border-foreground">
                  <td>Net cash from operating activities</td>
                  <td className="ledger-figure">{fmt(netOperating)}</td>
                </tr>

                <tr className="font-bold bg-secondary/50">
                  <td colSpan={2}>Cash flows from investing activities</td>
                </tr>
                <tr><td className="pl-4">Purchase of PPE</td><td className="ledger-figure">{fmt(-ppeAdditions)}</td></tr>
                {info.assetDisposal && (
                  <tr><td className="pl-4">Proceeds from disposal of PPE</td><td className="ledger-figure">{fmt(disposalProceeds)}</td></tr>
                )}
                <tr className="font-bold border-t-2 border-foreground">
                  <td>Net cash used in investing activities</td>
                  <td className="ledger-figure">{fmt(netInvesting)}</td>
                </tr>

                <tr className="font-bold bg-secondary/50">
                  <td colSpan={2}>Cash flows from financing activities</td>
                </tr>
                {shareIssue !== 0 && (
                  <tr><td className="pl-4">Proceeds from share issue</td><td className="ledger-figure">{fmt(shareIssue)}</td></tr>
                )}
                {debenturesIssued !== 0 && (
                  <tr><td className="pl-4">Proceeds from debenture issue</td><td className="ledger-figure">{fmt(debenturesIssued)}</td></tr>
                )}
                {dividendsPaid !== 0 && (
                  <tr><td className="pl-4">Dividends paid</td><td className="ledger-figure">{fmt(-dividendsPaid)}</td></tr>
                )}
                <tr className="font-bold border-t-2 border-foreground">
                  <td>Net cash from financing activities</td>
                  <td className="ledger-figure">{fmt(netFinancing)}</td>
                </tr>

                <tr className="font-bold border-t-2 border-foreground">
                  <td>Net increase / (decrease) in cash</td>
                  <td className="ledger-figure">{fmt(netChangeInCash)}</td>
                </tr>
                <tr><td>Cash at beginning of year</td><td className="ledger-figure">{fmt(py.currentAssets.cashAtBank)}</td></tr>
                <tr className="font-bold border-t-2 border-foreground">
                  <td>Cash at end of year</td>
                  <td className="ledger-figure">{fmt(computedClosingCash)}</td>
                </tr>
              </tbody>
            </table>

            <div className="mt-6 p-4 rounded-lg bg-secondary/30 border border-border text-sm space-y-2">
              <p className="font-semibold">Workings</p>
              <p><span className="font-medium">PPE additions:</span> Closing cost {cy.nonCurrentAssets.propertyPlantEquipmentCost.toLocaleString()} − Opening cost {py.nonCurrentAssets.propertyPlantEquipmentCost.toLocaleString()} + Disposal cost {disposalCost.toLocaleString()} = {ppeAdditions.toLocaleString()}</p>
              <p><span className="font-medium">Tax paid:</span> Opening tax {py.currentLiabilities.taxPayable.toLocaleString()} + P&L charge {pl.taxation.toLocaleString()} − Closing tax {cy.currentLiabilities.taxPayable.toLocaleString()} = {taxPaid.toLocaleString()}</p>
              {info.assetDisposal && (
                <p><span className="font-medium">Gain/(loss) on disposal:</span> Proceeds {disposalProceeds.toLocaleString()} − NBV ({disposalCost.toLocaleString()} − {disposalAccDepn.toLocaleString()} = {disposalNBV.toLocaleString()}) = {gainOnDisposal.toLocaleString()}</p>
              )}
              <p><span className="font-medium">Reconciliation check:</span> Computed closing cash {computedClosingCash.toLocaleString()} vs SFP closing cash {cy.currentAssets.cashAtBank.toLocaleString()} (difference {(computedClosingCash - cy.currentAssets.cashAtBank).toLocaleString()} — arises because the comparative SFPs are randomly generated independently of the cash-flow movements).</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
