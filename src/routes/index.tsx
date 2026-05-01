import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "LedgerLab — Practice Accounting Questions" },
      { name: "description", content: "Generate unlimited randomised, fully balanced accounting practice questions: Trial Balance, Financial Statements, Cash Flow and Ratios." },
      { property: "og:title", content: "LedgerLab" },
      { property: "og:description", content: "Master accounting with unlimited practice scenarios." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="border-b border-border/30">
        <div className="container flex items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <span className="text-sm font-bold text-primary-foreground">LL</span>
            </div>
            <span className="text-xl font-bold">LedgerLab</span>
          </div>
          <div className="text-sm text-muted-foreground">Accounting Revision Platform</div>
        </div>
      </nav>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-background to-background" />
        <div className="relative container py-24 md:py-32">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Master Accounting
            </h1>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              LedgerLab generates unlimited, randomised accounting practice questions. Every Trial Balance, P&amp;L, SOCE and SFP is mathematically linked and guaranteed to balance.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
              <div className="ledger-card text-left">
                <div className="text-3xl mb-2">📊</div>
                <h3 className="font-semibold mb-2">Financial Statements</h3>
                <p className="text-sm text-muted-foreground">P&amp;L, Statement of Changes in Equity, Statement of Financial Position</p>
              </div>
              <div className="ledger-card text-left">
                <div className="text-3xl mb-2">💰</div>
                <h3 className="font-semibold mb-2">Cash Flow Analysis</h3>
                <p className="text-sm text-muted-foreground">Indirect method with comparative scenarios</p>
              </div>
              <div className="ledger-card text-left">
                <div className="text-3xl mb-2">📈</div>
                <h3 className="font-semibold mb-2">Ratio Analysis</h3>
                <p className="text-sm text-muted-foreground">Profitability, liquidity, efficiency, leverage</p>
              </div>
            </div>

            <Link to="/setup" className="btn-primary inline-flex items-center gap-2 text-lg">
              Generate Question
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-border/30 py-8 text-center text-sm text-muted-foreground">
        <div className="container">LedgerLab © 2026 — Triple-Statement Integration</div>
      </footer>
    </div>
  );
}
