import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { ChevronLeft, Eye, RotateCcw } from "lucide-react";
import { type CashFlowScenario } from "@/lib/cashFlowDataGenerator";

export const Route = createFileRoute("/ratios")({
  head: () => ({
    meta: [
      { title: "Part 3: Ratio Analysis — LedgerLab" },
      { name: "description", content: "Calculate profitability, liquidity, efficiency and leverage ratios." },
    ],
  }),
  component: RatiosPage,
});

function RatiosPage() {
  const navigate = useNavigate();
  const [scenario, setScenario] = useState<CashFlowScenario | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem("cashFlowScenario");
    if (stored) setScenario(JSON.parse(stored));
    else navigate({ to: "/setup" });
  }, [navigate]);

  if (!scenario) return <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>;

  const { companyName, currentYearPosition: cy, profitLossStatement: pl } = scenario;

  const revenue = pl.revenue || 1;
  const inventory = cy.currentAssets.inventories || 1;
  const equity = cy.equity.total || 1;
  const cl = cy.currentLiabilities.total || 1;
  const ratios = {
    grossMargin: ((revenue - pl.costOfSales) / revenue * 100).toFixed(2) + "%",
    netMargin: (pl.profitForYear / revenue * 100).toFixed(2) + "%",
    roce: (pl.operatingProfit / (equity + cy.nonCurrentLiabilities.debentures) * 100).toFixed(2) + "%",
    currentRatio: (cy.currentAssets.total / cl).toFixed(2),
    quickRatio: ((cy.currentAssets.total - inventory) / cl).toFixed(2),
    inventoryTurnover: (pl.costOfSales / inventory).toFixed(2) + "x",
    receivablesDays: ((cy.currentAssets.tradeReceivables / revenue) * 365).toFixed(0) + " days",
    debtToEquity: ((cy.nonCurrentLiabilities.debentures + cy.currentLiabilities.total) / equity).toFixed(2),
  };

  const cats = [
    { title: "Profitability", icon: "📈", items: [
      { name: "Gross Profit Margin", formula: "(Gross Profit / Revenue) × 100%", a: ratios.grossMargin },
      { name: "Net Profit Margin", formula: "(Net Profit / Revenue) × 100%", a: ratios.netMargin },
      { name: "ROCE", formula: "Operating Profit / (Equity + LT Debt) × 100%", a: ratios.roce },
    ]},
    { title: "Liquidity", icon: "💧", items: [
      { name: "Current Ratio", formula: "Current Assets / Current Liabilities", a: ratios.currentRatio },
      { name: "Quick Ratio", formula: "(CA − Inventory) / CL", a: ratios.quickRatio },
    ]},
    { title: "Efficiency", icon: "⚙️", items: [
      { name: "Inventory Turnover", formula: "Cost of Sales / Inventory", a: ratios.inventoryTurnover },
      { name: "Receivables Days", formula: "(Receivables / Revenue) × 365", a: ratios.receivablesDays },
    ]},
    { title: "Leverage", icon: "🔗", items: [
      { name: "Debt-to-Equity", formula: "Total Debt / Total Equity", a: ratios.debtToEquity },
    ]},
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="border-b border-border/30">
        <div className="container py-4">
          <div className="flex items-center justify-between mb-4">
            <Link to="/cashflow" className="p-2 hover:bg-secondary rounded-lg transition"><ChevronLeft className="w-5 h-5" /></Link>
            <h1 className="text-2xl font-bold flex-1 text-center">{companyName}</h1>
            <div className="w-10" />
          </div>
          <p className="text-center text-muted-foreground">Ratio Analysis — Year ended 31 March {cy.year}</p>
        </div>
      </div>

      <div className="container py-8 max-w-5xl mx-auto space-y-8">
        <div className="ledger-card">
          <h2 className="text-2xl font-bold mb-4">Part 3: Ratio Analysis</h2>
          <p className="text-muted-foreground">Using the financial statements from Parts 1 and 2, calculate the following ratios.</p>
        </div>

        {cats.map((c, i) => (
          <div key={i} className="ledger-card">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><span>{c.icon}</span>{c.title}</h3>
            <div className="space-y-4">
              {c.items.map((r, j) => (
                <div key={j} className="border border-border rounded-lg p-4 bg-secondary/30">
                  <div className="mb-3">
                    <h4 className="font-semibold">{r.name}</h4>
                    <p className="text-sm text-muted-foreground">{r.formula}</p>
                  </div>
                  <input type="text" placeholder="Your answer..." className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="flex gap-4">
          <button onClick={() => setShowAnswer((s) => !s)} className="flex-1 btn-primary inline-flex items-center justify-center gap-2">
            <Eye className="w-4 h-4" />{showAnswer ? "Hide" : "Show"} Answer
          </button>
          <Link to="/setup" className="flex-1 bg-secondary hover:bg-secondary/80 text-foreground px-6 py-3 rounded-lg font-semibold inline-flex items-center justify-center gap-2">
            <RotateCcw className="w-4 h-4" />Generate New Question
          </Link>
        </div>

        {showAnswer && (
          <div className="ledger-card">
            <h3 className="text-xl font-bold mb-6">Answer</h3>
            <div className="space-y-4">
              {cats.map((c, i) => (
                <div key={i}>
                  <h4 className="font-semibold mb-3">{c.title}</h4>
                  <div className="space-y-2 text-sm">
                    {c.items.map((r, j) => (
                      <div key={j} className="flex justify-between p-3 bg-secondary/30 rounded border border-border">
                        <span>{r.name}</span>
                        <span className="ledger-figure text-primary font-semibold">{r.a}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}