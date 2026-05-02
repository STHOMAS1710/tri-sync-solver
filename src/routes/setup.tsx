import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronLeft, Lightbulb } from "lucide-react";
import { generateScenario, type Difficulty } from "@/lib/dataGenerator";
import { generateCashFlowScenario } from "@/lib/cashFlowDataGenerator";

export const Route = createFileRoute("/setup")({
  head: () => ({
    meta: [
      { title: "Configure Question — LedgerLab" },
      { name: "description", content: "Choose difficulty and hint mode, then generate a fully-balanced accounting practice scenario." },
    ],
  }),
  component: SetupPage,
});

function SetupPage() {
  const navigate = useNavigate();
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [hintsEnabled, setHintsEnabled] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const part1 = generateScenario(difficulty);
      const part2 = generateCashFlowScenario(part1.companyName, difficulty);
      sessionStorage.setItem("currentScenario", JSON.stringify(part1));
      sessionStorage.setItem("cashFlowScenario", JSON.stringify(part2));
      sessionStorage.setItem("hintsEnabled", JSON.stringify(hintsEnabled));
      navigate({ to: "/question" });
    }, 300);
  };

  const options: { value: Difficulty; label: string; description: string; icon: string }[] = [
    { value: "easy", label: "Easy", description: "3–4 adjustments\nSimpler accounts", icon: "🌱" },
    { value: "medium", label: "Medium", description: "5–6 adjustments\nBalanced complexity", icon: "📊" },
    { value: "hard", label: "Hard", description: "6–7 adjustments\nAdvanced scenarios", icon: "🚀" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="border-b border-border/30">
        <div className="container py-4 flex items-center gap-4">
          <Link to="/" className="p-2 hover:bg-secondary rounded-lg transition">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold">Configure Your Question</h1>
        </div>
      </div>

      <div className="container py-12">
        <div className="max-w-2xl mx-auto space-y-8">
          <div className="ledger-card">
            <h2 className="text-xl font-bold mb-6">Select Difficulty Level</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setDifficulty(option.value)}
                  className={`difficulty-card p-6 rounded-lg border-2 transition-all text-center ${
                    difficulty === option.value
                      ? "selected border-primary bg-secondary"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="text-3xl mb-2">{option.icon}</div>
                  <h3 className="font-semibold mb-2">{option.label}</h3>
                  <p className="text-sm text-muted-foreground whitespace-pre-line">{option.description}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="ledger-card">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-primary" />
                  Hint Mode
                </h2>
                <p className="text-muted-foreground">
                  {hintsEnabled
                    ? "Hints enabled — you'll see guidance for each adjustment."
                    : "Hints disabled — exam mode."}
                </p>
              </div>
              <button
                onClick={() => setHintsEnabled(!hintsEnabled)}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                  hintsEnabled ? "bg-primary" : "bg-secondary"
                }`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                    hintsEnabled ? "translate-x-7" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="ledger-card">
            <h2 className="text-xl font-bold mb-4">Question Structure</h2>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex gap-3"><span className="text-primary font-bold">Part 1:</span><span>Trial Balance + Adjustments → P&amp;L, SOCE, SFP</span></div>
              <div className="flex gap-3"><span className="text-primary font-bold">Part 2:</span><span>Cash Flow Statement (Indirect Method)</span></div>
              <div className="flex gap-3"><span className="text-primary font-bold">Part 3:</span><span>Ratio Analysis</span></div>
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="btn-primary w-full disabled:opacity-50"
          >
            {isGenerating ? "Generating..." : "Generate Statements"}
          </button>

          <div className="bg-secondary/50 border border-border rounded-lg p-4 text-sm text-muted-foreground">
            <strong>Note:</strong> Triple-Statement Integration guarantees: Trial Balance balances, every adjustment is double-entry, and Total Assets − Total Liabilities = Total Equity from SOCE.
          </div>
        </div>
      </div>
    </div>
  );
}
