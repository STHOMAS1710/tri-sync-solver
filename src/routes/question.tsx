import { ChevronDown, ChevronUp, HelpCircle } from "lucide-react"; 
// (Your existing icons might be different, just make sure HelpCircle is in there!)

import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { ChevronLeft, ChevronRight, Eye, Lightbulb } from "lucide-react";
import {
  computeStatements,
  type GeneratedScenario,
  type ComputedStatements,
} from "@/lib/dataGenerator";

export const Route = createFileRoute("/question")({
  head: () => ({
    meta: [
      { title: "Part 1: Financial Statements — LedgerLab" },
      { name: "description", content: "Trial balance, adjustments and the three integrated financial statements." },
    ],
  }),
  component: QuestionPage,
});

type Tab = "trialBalance" | "adjustments";

function fmt(n: number): string {
  if (n === 0) return "—";
  const abs = Math.abs(n).toLocaleString();
  return n < 0 ? `(${abs})` : abs;
}

function getAdjustmentHint(adjustment: GeneratedScenario["adjustments"][number]): string {
  const firstEntry = adjustment.entries[0];

  switch (adjustment.type) {
    case "closingInventory":
      return "Use closing inventory in the SFP and deduct it from purchases when calculating cost of sales.";
    case "depreciation":
      return `Charge the expense to profit or loss, then increase the related accumulated depreciation account.`;
    case "accrual":
      return `Increase the expense and recognise a current liability for the unpaid amount.`;
    case "prepayment":
      return `Remove the prepaid amount from the expense and show it as a current asset.`;
    case "allowance":
      return `Record the increase as an expense and deduct the allowance from receivables in the SFP.`;
    case "tax":
      return `Add the extra tax to income tax expense and recognise the unpaid amount as tax payable.`;
    case "disposal":
      return `Remove the asset cost and accumulated depreciation, then record any profit or loss on disposal.`;
    default:
      return `Think in double-entry terms: Dr ${firstEntry.debitAccount}, Cr ${firstEntry.creditAccount}.`;
  }
}

function QuestionPage() {
  const navigate = useNavigate();
  const [scenario, setScenario] = useState<GeneratedScenario | null>(null);
  const [hintsEnabled, setHintsEnabled] = useState(true);
  const [showAnswer, setShowAnswer] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("trialBalance");

  useEffect(() => {
    const stored = sessionStorage.getItem("currentScenario");
    const hints = sessionStorage.getItem("hintsEnabled");
    if (stored) {
      setScenario(JSON.parse(stored));
      setHintsEnabled(hints ? JSON.parse(hints) : true);
    } else {
      navigate({ to: "/setup" });
    }
  }, [navigate]);

  const computed: ComputedStatements | null = useMemo(
    () => (scenario ? computeStatements(scenario) : null),
    [scenario],
  );

  if (!scenario || !computed) {
    return <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>;
  }

  const { companyName, yearEnd, trialBalance, adjustments, dividendsPaid } = scenario;
  const totalDr = trialBalance.reduce((s, a) => s + a.debit, 0);
  const totalCr = trialBalance.reduce((s, a) => s + a.credit, 0);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="border-b border-border/30">
        <div className="container py-4">
          <div className="flex items-center justify-between mb-4 gap-4">
            <Link to="/setup" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
              <ChevronLeft className="w-4 h-4" />Back to Setup
            </Link>
            <div className="text-right">
              <h1 className="text-2xl font-bold text-primary">{companyName}</h1>
              <p className="text-sm text-muted-foreground">Year ended {yearEnd}</p>
            </div>
            <button
              onClick={() => setShowAnswer((s) => !s)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/20 hover:bg-primary/30 text-primary transition-colors"
            >
              <Eye className="w-4 h-4" />
              {showAnswer ? "Hide" : "Show"} Answers
            </button>
          </div>
<div className="flex items-center gap-2">
            {([["trialBalance", "Trial Balance"], ["adjustments", "Adjustments"]] as const).map(([id, label]) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  activeTab === id ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground hover:text-foreground"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* --- Part 1 Instructions --- */}
          <div className="flex items-start gap-3 mt-6 p-4 rounded-lg bg-secondary/30 border border-border">
            <HelpCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
            <p className="text-sm text-muted-foreground font-medium leading-relaxed">
              Using the trial balance given and accounting for the adjustments, produce 3 statements: PNL, changes in equity & financial position.
            </p>
          </div>

        </div>
      </div>

      <div className="container py-8 space-y-6">
        {activeTab === "trialBalance" && (
          <div className="ledger-card">
            <h2 className="text-xl font-bold mb-4">Trial Balance as at {yearEnd}</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 px-4 font-semibold">Account</th>
                    <th className="text-right py-2 px-4 font-semibold">Debit (£000)</th>
                    <th className="text-right py-2 px-4 font-semibold">Credit (£000)</th>
                  </tr>
                </thead>
                <tbody>
                  {trialBalance.map((acc, i) => (
                    <tr key={i} className="border-b border-border/30">
                      <td className="py-2 px-4">{acc.name}</td>
                      <td className="py-2 px-4 text-right font-mono">{acc.debit > 0 ? acc.debit.toLocaleString() : "—"}</td>
                      <td className="py-2 px-4 text-right font-mono">{acc.credit > 0 ? acc.credit.toLocaleString() : "—"}</td>
                    </tr>
                  ))}
                  <tr className="border-t-2 border-foreground font-bold">
                    <td className="py-3 px-4">TOTAL</td>
                    <td className="py-3 px-4 text-right font-mono">{totalDr.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right font-mono">{totalCr.toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            {showAnswer && (
              <div className="mt-4 p-3 bg-emerald-900/20 border border-emerald-700/50 rounded-lg text-sm text-emerald-300">
                ✓ Trial Balance balances: Dr = Cr = £{totalDr.toLocaleString()}k
              </div>
            )}
          </div>
        )}

        {activeTab === "adjustments" && (
          <div className="ledger-card">
            <h2 className="text-xl font-bold mb-4">Adjustments at year-end</h2>
            <p className="text-sm text-muted-foreground mb-6">
              The following adjustments have not yet been reflected in the Trial Balance. Each is a balanced double-entry journal.
              {dividendsPaid > 0 && ` In addition, an ordinary dividend of £${dividendsPaid}k was paid in cash during the year.`}
            </p>
            <ol className="space-y-4 list-decimal list-inside">
              {adjustments.map((a, i) => (
                <li key={i} className="bg-background/50 border border-border rounded-lg p-4">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <span className="font-medium">{a.description}</span>
                    {hintsEnabled && <Lightbulb className="w-4 h-4 text-primary flex-shrink-0 mt-1" />}
                  </div>
                  {hintsEnabled && (
                    <div className="mb-3 rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 text-sm text-muted-foreground">
                      <span className="font-semibold text-primary">Hint:</span> {getAdjustmentHint(a)}
                    </div>
                  )}
                  {showAnswer && (
                    <div className="bg-background rounded p-3 font-mono text-sm space-y-1 border border-border/40">
                      {a.entries.map((e, j) => (
                        <div key={j}>
                          <div className="flex justify-between"><span>Dr {e.debitAccount}</span><span>{e.debitAmount.toLocaleString()}</span></div>
                          <div className="flex justify-between pl-6"><span>Cr {e.creditAccount}</span><span>{e.creditAmount.toLocaleString()}</span></div>
                        </div>
                      ))}
                    </div>
                  )}
                </li>
              ))}
            </ol>
          </div>
        )}

        {showAnswer && <AnswersPanel computed={computed} dividendsPaid={dividendsPaid} yearEnd={yearEnd} />}
      </div>

      <div className="border-t border-border/30 bg-background/50">
        <div className="container py-4 flex justify-between items-center">
          <Link to="/setup" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-background hover:bg-card transition-colors">
            <ChevronLeft className="w-4 h-4" />Previous
          </Link>
          <div className="text-sm text-muted-foreground">Part 1 of 3</div>
          <Link to="/cashflow" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity">
            Next: Cash Flow<ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, bold, indent }: { label: string; value: number | string; bold?: boolean; indent?: boolean }) {
  return (
    <tr className={bold ? "border-t-2 border-foreground font-bold" : "border-b border-border/30"}>
      <td className={`py-1.5 ${indent ? "pl-6" : "pl-0"}`}>{label}</td>
      <td className="py-1.5 text-right font-mono">{typeof value === "number" ? fmt(value) : value}</td>
    </tr>
  );
}

function AnswersPanel({ computed, dividendsPaid, yearEnd }: { computed: ComputedStatements; dividendsPaid: number; yearEnd: string }) {
  const { incomeStatement: pl, soce, sfp } = computed;
  const lhs = sfp.totalAssets - sfp.nonCurrentLiabilities.total - sfp.currentLiabilities.total;
  return (
    <div className="space-y-6">
      {/* P&L */}
      <div className="ledger-card answer-card">
        <h2 className="text-xl font-bold mb-4">Answer · Statement of Profit or Loss for the year ended {yearEnd}</h2>
        <table className="w-full text-sm">
          <thead><tr className="text-muted-foreground"><th className="text-left">£000</th><th className="text-right"></th></tr></thead>
          <tbody>
            <Row label="Revenue" value={pl.revenue} />
            <Row label="Cost of sales" value={-pl.costOfSales} />
            <Row label="Gross profit" value={pl.grossProfit} bold />
            {pl.operatingExpenses.map((e, i) => (
              <Row key={i} label={e.name} value={-e.amount} indent />
            ))}
            <Row label="Total operating expenses" value={-pl.totalOperatingExpenses} />
            <Row label="Operating profit" value={pl.operatingProfit} bold />
            {pl.financeExpenses > 0 && <Row label="Finance expenses" value={-pl.financeExpenses} />}
            <Row label="Profit before tax" value={pl.profitBeforeTax} bold />
            <Row label="Income tax expense" value={-pl.taxExpense} />
            <Row label="Profit for the year" value={pl.profitForYear} bold />
          </tbody>
        </table>
      </div>

      {/* SOCE */}
      <div className="ledger-card answer-card">
        <h2 className="text-xl font-bold mb-4">Answer · Statement of Changes in Equity</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-muted-foreground border-b border-border">
              <th className="text-left py-2">£000</th>
              <th className="text-right py-2">Share capital</th>
              <th className="text-right py-2">Retained earnings</th>
              <th className="text-right py-2">Total</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-border/30">
              <td className="py-1.5">Balance at start of year</td>
              <td className="text-right font-mono">{soce.openingShareCapital.toLocaleString()}</td>
              <td className="text-right font-mono">{soce.openingRetainedEarnings.toLocaleString()}</td>
              <td className="text-right font-mono">{(soce.openingShareCapital + soce.openingRetainedEarnings).toLocaleString()}</td>
            </tr>
            <tr className="border-b border-border/30">
              <td className="py-1.5">Profit for the year</td>
              <td className="text-right font-mono">—</td>
              <td className="text-right font-mono">{soce.profitForYear.toLocaleString()}</td>
              <td className="text-right font-mono">{soce.profitForYear.toLocaleString()}</td>
            </tr>
            {dividendsPaid > 0 && (
              <tr className="border-b border-border/30">
                <td className="py-1.5">Dividends paid</td>
                <td className="text-right font-mono">—</td>
                <td className="text-right font-mono">({dividendsPaid.toLocaleString()})</td>
                <td className="text-right font-mono">({dividendsPaid.toLocaleString()})</td>
              </tr>
            )}
            <tr className="border-t-2 border-foreground font-bold">
              <td className="py-2">Balance at end of year</td>
              <td className="text-right font-mono">{soce.closingShareCapital.toLocaleString()}</td>
              <td className="text-right font-mono">{soce.closingRetainedEarnings.toLocaleString()}</td>
              <td className="text-right font-mono">{soce.totalEquity.toLocaleString()}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* SFP */}
      <div className="ledger-card answer-card">
        <h2 className="text-xl font-bold mb-4">Answer · Statement of Financial Position as at {yearEnd}</h2>
        <table className="w-full text-sm">
          <tbody>
            <tr className="bg-secondary/40 font-bold"><td className="py-2 px-2" colSpan={2}>NON-CURRENT ASSETS</td></tr>
            {sfp.nonCurrentAssets.map((r, i) => (
              <tr key={i} className="border-b border-border/30">
                <td className="py-1.5 pl-4">{r.name} (cost {r.cost.toLocaleString()}, dep {r.depn.toLocaleString()})</td>
                <td className="text-right font-mono">{r.nbv.toLocaleString()}</td>
              </tr>
            ))}
            <Row label="Total non-current assets" value={sfp.totalNonCurrentAssets} bold />

            <tr className="bg-secondary/40 font-bold"><td className="py-2 px-2" colSpan={2}>CURRENT ASSETS</td></tr>
            <Row label="Inventory (closing)" value={sfp.currentAssets.inventory} indent />
            <Row label={`Receivables (${sfp.currentAssets.receivables.toLocaleString()} − allowance ${sfp.currentAssets.allowance.toLocaleString()})`} value={sfp.currentAssets.netReceivables} indent />
            {sfp.currentAssets.prepayments > 0 && <Row label="Prepayments" value={sfp.currentAssets.prepayments} indent />}
            <Row label="Cash at bank" value={sfp.currentAssets.cash} indent />
            <Row label="Total current assets" value={sfp.currentAssets.total} bold />

            <Row label="TOTAL ASSETS" value={sfp.totalAssets} bold />

            <tr className="bg-secondary/40 font-bold"><td className="py-2 px-2" colSpan={2}>EQUITY</td></tr>
            <Row label="Ordinary share capital" value={sfp.equity.shareCapital} indent />
            <Row label="Retained earnings (from SOCE)" value={sfp.equity.retainedEarnings} indent />
            <Row label="Total equity" value={sfp.equity.total} bold />

            <tr className="bg-secondary/40 font-bold"><td className="py-2 px-2" colSpan={2}>NON-CURRENT LIABILITIES</td></tr>
            <Row label="8% Debentures" value={sfp.nonCurrentLiabilities.debentures} indent />

            <tr className="bg-secondary/40 font-bold"><td className="py-2 px-2" colSpan={2}>CURRENT LIABILITIES</td></tr>
            <Row label="Trade payables" value={sfp.currentLiabilities.payables} indent />
            {sfp.currentLiabilities.accruals > 0 && <Row label="Accrued expenses" value={sfp.currentLiabilities.accruals} indent />}
            <Row label="Income tax payable" value={sfp.currentLiabilities.taxPayable} indent />
            <Row label="Total liabilities" value={sfp.nonCurrentLiabilities.total + sfp.currentLiabilities.total} bold />

            <Row label="TOTAL EQUITY AND LIABILITIES" value={sfp.totalEquityAndLiabilities} bold />
          </tbody>
        </table>
        <div className={`mt-4 p-3 rounded-lg text-sm border ${lhs === sfp.equity.total ? "bg-emerald-900/20 border-emerald-700/50 text-emerald-300" : "bg-red-900/20 border-red-700/50 text-red-300"}`}>
          {lhs === sfp.equity.total
            ? `✓ Validation: Total Assets − Total Liabilities = £${lhs.toLocaleString()}k = Total Equity from SOCE`
            : `✗ Imbalance: Assets − Liabilities = £${lhs.toLocaleString()}k vs Equity £${sfp.equity.total.toLocaleString()}k`}
        </div>
      </div>
    </div>
  );
}
