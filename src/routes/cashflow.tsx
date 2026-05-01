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
          <div className="ledger-card">
            <h3 className="text-xl font-bold mb-4">Answer outline</h3>
            <p className="text-sm text-muted-foreground">A worked Cash Flow Statement (operating, investing, financing) will appear here using the comparative SFPs above.</p>
          </div>
        )}
      </div>
    </div>
  );
}