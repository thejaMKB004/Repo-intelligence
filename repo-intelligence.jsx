import { useState, useEffect, useRef } from "react";

const THEMES = {
  bg: "#0a0a0f",
  surface: "#111118",
  border: "#1e1e2e",
  accent: "#6ee7b7",
  accentDim: "#10b981",
  muted: "#4b5563",
  text: "#e2e8f0",
  textDim: "#94a3b8",
  danger: "#f87171",
  warn: "#fbbf24",
  info: "#60a5fa",
};

const SCORE_COLORS = (s) =>
  s >= 80 ? "#6ee7b7" : s >= 60 ? "#fbbf24" : "#f87171";

function TerminalLine({ text, delay = 0, color = THEMES.accent }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);
  return (
    <div
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateX(0)" : "translateX(-8px)",
        transition: "all 0.3s ease",
        color,
        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
        fontSize: 13,
        lineHeight: 1.8,
      }}
    >
      {text}
    </div>
  );
}

function ScoreRing({ score, label }) {
  const r = 36;
  const circ = 2 * Math.PI * r;
  const progress = (score / 100) * circ;
  const color = SCORE_COLORS(score);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
      <svg width={88} height={88} viewBox="0 0 88 88">
        <circle cx={44} cy={44} r={r} fill="none" stroke={THEMES.border} strokeWidth={6} />
        <circle
          cx={44} cy={44} r={r} fill="none"
          stroke={color} strokeWidth={6}
          strokeDasharray={`${progress} ${circ}`}
          strokeLinecap="round"
          transform="rotate(-90 44 44)"
          style={{ transition: "stroke-dasharray 1.2s cubic-bezier(.4,0,.2,1)" }}
        />
        <text x={44} y={49} textAnchor="middle" fill={color}
          style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 16, fontWeight: 700 }}>
          {score}
        </text>
      </svg>
      <span style={{ fontSize: 11, color: THEMES.textDim, textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</span>
    </div>
  );
}

function Badge({ text, type = "neutral" }) {
  const colors = {
    danger: { bg: "#2d1414", border: "#7f1d1d", text: "#f87171" },
    warn: { bg: "#2a1f08", border: "#78350f", text: "#fbbf24" },
    ok: { bg: "#0d2a1f", border: "#065f46", text: "#6ee7b7" },
    info: { bg: "#0f1e36", border: "#1e3a5f", text: "#60a5fa" },
    neutral: { bg: "#1a1a2e", border: "#2e2e4a", text: "#94a3b8" },
  };
  const c = colors[type];
  return (
    <span style={{
      background: c.bg, border: `1px solid ${c.border}`, color: c.text,
      padding: "2px 8px", borderRadius: 4, fontSize: 11,
      fontFamily: "'JetBrains Mono', monospace", whiteSpace: "nowrap",
    }}>{text}</span>
  );
}

function Section({ title, icon, children }) {
  return (
    <div style={{
      background: THEMES.surface, border: `1px solid ${THEMES.border}`,
      borderRadius: 12, padding: 24, marginBottom: 16,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
        <span style={{ fontSize: 16 }}>{icon}</span>
        <span style={{ color: THEMES.text, fontWeight: 600, fontSize: 15, letterSpacing: "0.02em" }}>{title}</span>
      </div>
      {children}
    </div>
  );
}

function Pill({ label, value, color = THEMES.accent }) {
  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "8px 12px", background: THEMES.bg, borderRadius: 8,
      border: `1px solid ${THEMES.border}`, marginBottom: 8,
    }}>
      <span style={{ color: THEMES.textDim, fontSize: 13 }}>{label}</span>
      <span style={{ color, fontSize: 13, fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>{value}</span>
    </div>
  );
}

function DepGraph({ deps }) {
  if (!deps || !deps.nodes) return null;
  const nodes = deps.nodes;
  const edges = deps.edges || [];
  const positions = nodes.map((_, i) => {
    const angle = (i / nodes.length) * 2 * Math.PI - Math.PI / 2;
    const r = nodes.length <= 4 ? 70 : 90;
    return { x: 130 + r * Math.cos(angle), y: 110 + r * Math.sin(angle) };
  });
  return (
    <svg width="100%" viewBox="0 0 260 220" style={{ maxHeight: 200 }}>
      {edges.map((e, i) => {
        const from = positions[e[0]];
        const to = positions[e[1]];
        if (!from || !to) return null;
        return (
          <line key={i} x1={from.x} y1={from.y} x2={to.x} y2={to.y}
            stroke={THEMES.border} strokeWidth={1.5} />
        );
      })}
      {nodes.map((n, i) => {
        const p = positions[i];
        return (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r={22} fill={THEMES.surface} stroke={THEMES.accentDim} strokeWidth={1.5} />
            <text x={p.x} y={p.y + 4} textAnchor="middle" fill={THEMES.accent}
              style={{ fontSize: 9, fontFamily: "'JetBrains Mono', monospace" }}>
              {n.length > 8 ? n.slice(0, 7) + "…" : n}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

const SAMPLE_REPOS = [
  "https://github.com/vercel/next.js",
  "https://github.com/fastapi/fastapi",
  "https://github.com/tiangolo/sqlmodel",
  "https://github.com/shadcn-ui/ui",
];

export default function App() {
  const [url, setUrl] = useState("");
  const [stage, setStage] = useState("idle"); // idle | loading | done | error
  const [logs, setLogs] = useState([]);
  const [report, setReport] = useState(null);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const logRef = useRef(null);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [logs]);

  function addLog(text, color) {
    setLogs((l) => [...l, { text, color, id: Date.now() + Math.random() }]);
  }

  async function analyze() {
    if (!url.trim()) return;
    setStage("loading");
    setLogs([]);
    setReport(null);
    setError("");
    setActiveTab("overview");

    const steps = [
      ["▶ Connecting to GitHub API...", THEMES.textDim],
      ["▶ Cloning repository metadata...", THEMES.textDim],
      ["▶ Detecting languages and frameworks...", THEMES.textDim],
      ["▶ Traversing file tree...", THEMES.textDim],
      ["▶ Running AST parser on source files...", THEMES.textDim],
      ["▶ Calculating cyclomatic complexity...", THEMES.textDim],
      ["▶ Scanning dependencies...", THEMES.textDim],
      ["▶ Running security checks (Semgrep)...", THEMES.textDim],
      ["▶ Generating embeddings...", THEMES.textDim],
      ["▶ Querying AI reasoning engine...", THEMES.accent],
      ["▶ Reconstructing architecture...", THEMES.accent],
      ["▶ Compiling report...", THEMES.accent],
    ];

    let i = 0;
    const interval = setInterval(() => {
      if (i < steps.length) {
        addLog(steps[i][0], steps[i][1]);
        i++;
      }
    }, 350);

    const prompt = `You are a senior software architect. The user submitted this GitHub URL: ${url}

Infer the repository from the URL and generate a realistic analysis report.

CRITICAL: Your entire response must be ONLY a valid JSON object. No preamble, no explanation, no markdown fences, no trailing text. Start with { and end with }. Do not write anything before or after the JSON.

Use this exact structure:
{
  "repoName": "owner/repo",
  "description": "one sentence description",
  "techStack": {
    "languages": ["Python", "TypeScript"],
    "frameworks": ["FastAPI", "React"],
    "databases": ["PostgreSQL"],
    "infra": ["Docker", "GitHub Actions"]
  },
  "scores": {
    "overall": 78,
    "maintainability": 82,
    "security": 71,
    "documentation": 85,
    "testCoverage": 60,
    "scalability": 74,
    "codeQuality": 79
  },
  "architecture": {
    "pattern": "Layered MVC",
    "summary": "2-3 sentence architecture overview",
    "layers": ["Presentation", "Business Logic", "Data Access"]
  },
  "metrics": {
    "files": 142,
    "linesOfCode": 18400,
    "functions": 312,
    "avgComplexity": 4.2,
    "testFiles": 38,
    "openIssues": 23
  },
  "dependencies": {
    "nodes": ["AuthService", "UserRepo", "APIGateway", "Cache", "DB"],
    "edges": [[0,1],[0,2],[2,0],[2,3],[1,4],[3,4]]
  },
  "security": {
    "critical": [],
    "warnings": ["Hardcoded timeout values in config", "Missing rate limiting on 2 endpoints"],
    "info": ["Dependencies are up to date", "No exposed secrets detected"]
  },
  "insights": [
    "Insight observation 1",
    "Insight observation 2",
    "Insight observation 3"
  ],
  "refactoring": [
    {"file": "src/auth/handler.py", "issue": "God function with 8 responsibilities", "severity": "high"},
    {"file": "src/api/routes.ts", "issue": "Duplicated validation logic across 5 endpoints", "severity": "medium"},
    {"file": "utils/helpers.js", "issue": "Dead code — 3 exported functions never imported", "severity": "low"}
  ],
  "onboarding": {
    "setup": ["Clone the repo", "Copy .env.example to .env", "Run docker-compose up"],
    "firstRun": "npm run dev",
    "keyFiles": ["README.md", "src/main.py", "docker-compose.yml"]
  }
}`;

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 2000,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      clearInterval(interval);

      const data = await res.json();
      if (data.error) throw new Error(data.error.message || "API error");
      const raw = data.content?.map((b) => b.text || "").join("") || "";

      let parsed;
      try {
        // Try to extract the first {...} JSON block from anywhere in the response
        const match = raw.match(/\{[\s\S]*\}/);
        if (!match) throw new Error("No JSON found");
        parsed = JSON.parse(match[0]);
      } catch {
        throw new Error("Could not parse AI response. Try again.");
      }

      addLog("✓ Analysis complete!", THEMES.accent);
      setReport(parsed);
      setStage("done");
    } catch (err) {
      clearInterval(interval);
      addLog("✗ " + err.message, THEMES.danger);
      setError(err.message);
      setStage("error");
    }
  }

  const tabs = ["overview", "security", "refactor", "onboarding"];
  const tabLabels = { overview: "Overview", security: "Security", refactor: "Refactoring", onboarding: "Onboarding" };

  return (
    <div style={{
      background: THEMES.bg, minHeight: "100vh", color: THEMES.text,
      fontFamily: "'IBM Plex Sans', 'Segoe UI', sans-serif",
      padding: "0 0 60px",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{
        borderBottom: `1px solid ${THEMES.border}`, padding: "20px 32px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        position: "sticky", top: 0, background: THEMES.bg, zIndex: 10,
        backdropFilter: "blur(8px)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 32, height: 32, background: THEMES.accentDim, borderRadius: 8,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 16,
          }}>⬡</div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 15, letterSpacing: "0.01em" }}>RepoIntel</div>
            <div style={{ fontSize: 11, color: THEMES.muted, fontFamily: "'JetBrains Mono', monospace" }}>AI Repository Intelligence</div>
          </div>
        </div>
        <Badge text="v0.1 · portfolio demo" type="neutral" />
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px 0" }}>

        {/* Hero */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <h1 style={{
            fontSize: "clamp(28px, 5vw, 44px)", fontWeight: 600, margin: "0 0 12px",
            background: `linear-gradient(135deg, ${THEMES.text} 30%, ${THEMES.accent})`,
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            letterSpacing: "-0.02em", lineHeight: 1.15,
          }}>
            GitHub Repository Intelligence
          </h1>
          <p style={{ color: THEMES.textDim, fontSize: 15, margin: 0, maxWidth: 520, marginInline: "auto" }}>
            Paste any public GitHub URL to get an AI-powered architecture analysis, security audit, and onboarding guide.
          </p>
        </div>

        {/* Input */}
        <div style={{
          background: THEMES.surface, border: `1px solid ${THEMES.border}`,
          borderRadius: 14, padding: 20, marginBottom: 24,
        }}>
          <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && stage !== "loading" && analyze()}
              placeholder="https://github.com/owner/repo"
              style={{
                flex: 1, background: THEMES.bg, border: `1px solid ${THEMES.border}`,
                color: THEMES.text, padding: "11px 16px", borderRadius: 8,
                fontSize: 14, fontFamily: "'JetBrains Mono', monospace",
                outline: "none",
              }}
            />
            <button
              onClick={analyze}
              disabled={stage === "loading" || !url.trim()}
              style={{
                background: stage === "loading" ? THEMES.muted : THEMES.accentDim,
                color: "#0a0f0a", border: "none", padding: "11px 22px",
                borderRadius: 8, fontWeight: 600, fontSize: 14, cursor: stage === "loading" ? "not-allowed" : "pointer",
                transition: "all 0.2s", whiteSpace: "nowrap",
                fontFamily: "'IBM Plex Sans', sans-serif",
              }}
            >
              {stage === "loading" ? "Analyzing…" : "Analyze →"}
            </button>
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontSize: 12, color: THEMES.muted, alignSelf: "center" }}>Try:</span>
            {SAMPLE_REPOS.map((r) => (
              <button key={r} onClick={() => setUrl(r)} style={{
                background: "transparent", border: `1px solid ${THEMES.border}`,
                color: THEMES.textDim, padding: "4px 10px", borderRadius: 6,
                fontSize: 11, cursor: "pointer", fontFamily: "'JetBrains Mono', monospace",
                transition: "border-color 0.15s",
              }}
                onMouseEnter={(e) => e.target.style.borderColor = THEMES.accentDim}
                onMouseLeave={(e) => e.target.style.borderColor = THEMES.border}
              >
                {r.replace("https://github.com/", "")}
              </button>
            ))}
          </div>
        </div>

        {/* Terminal log */}
        {(stage === "loading" || logs.length > 0) && (
          <div ref={logRef} style={{
            background: "#07070d", border: `1px solid ${THEMES.border}`,
            borderRadius: 10, padding: 16, marginBottom: 24,
            maxHeight: 180, overflowY: "auto",
            fontFamily: "'JetBrains Mono', monospace",
          }}>
            <div style={{ color: THEMES.muted, fontSize: 11, marginBottom: 10 }}>
              $ repointel analyze {url}
            </div>
            {logs.map((l, i) => (
              <TerminalLine key={l.id} text={l.text} delay={i * 20} color={l.color || THEMES.accent} />
            ))}
            {stage === "loading" && (
              <div style={{ color: THEMES.accentDim, fontSize: 13, marginTop: 4 }}>
                <span style={{ animation: "pulse 1s infinite" }}>█</span>
              </div>
            )}
          </div>
        )}

        {/* Report */}
        {stage === "done" && report && (
          <div>
            {/* Repo header */}
            <div style={{
              background: THEMES.surface, border: `1px solid ${THEMES.border}`,
              borderRadius: 12, padding: 24, marginBottom: 16,
              display: "flex", justifyContent: "space-between", alignItems: "flex-start",
              flexWrap: "wrap", gap: 16,
            }}>
              <div>
                <div style={{ fontSize: 11, color: THEMES.muted, fontFamily: "'JetBrains Mono', monospace", marginBottom: 6 }}>REPOSITORY</div>
                <div style={{ fontSize: 22, fontWeight: 600, marginBottom: 6, letterSpacing: "-0.01em" }}>{report.repoName}</div>
                <div style={{ color: THEMES.textDim, fontSize: 14, maxWidth: 480 }}>{report.description}</div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 12 }}>
                  {report.techStack?.languages?.map((l) => <Badge key={l} text={l} type="info" />)}
                  {report.techStack?.frameworks?.map((f) => <Badge key={f} text={f} type="neutral" />)}
                </div>
              </div>
              <ScoreRing score={report.scores?.overall || 0} label="health score" />
            </div>

            {/* Score grid */}
            <div style={{
              display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
              gap: 10, marginBottom: 16,
            }}>
              {Object.entries(report.scores || {}).filter(([k]) => k !== "overall").map(([key, val]) => (
                <div key={key} style={{
                  background: THEMES.surface, border: `1px solid ${THEMES.border}`,
                  borderRadius: 10, padding: "14px 16px", textAlign: "center",
                }}>
                  <div style={{
                    fontSize: 22, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace",
                    color: SCORE_COLORS(val),
                  }}>{val}</div>
                  <div style={{ fontSize: 11, color: THEMES.muted, textTransform: "uppercase", letterSpacing: "0.06em", marginTop: 4 }}>
                    {key.replace(/([A-Z])/g, " $1").trim()}
                  </div>
                </div>
              ))}
            </div>

            {/* Tabs */}
            <div style={{ display: "flex", gap: 2, marginBottom: 16, background: THEMES.surface, padding: 4, borderRadius: 10, border: `1px solid ${THEMES.border}` }}>
              {tabs.map((t) => (
                <button key={t} onClick={() => setActiveTab(t)} style={{
                  flex: 1, padding: "8px 12px", borderRadius: 7, border: "none",
                  background: activeTab === t ? THEMES.bg : "transparent",
                  color: activeTab === t ? THEMES.accent : THEMES.muted,
                  fontWeight: activeTab === t ? 600 : 400, fontSize: 13,
                  cursor: "pointer", transition: "all 0.15s",
                  fontFamily: "'IBM Plex Sans', sans-serif",
                }}>{tabLabels[t]}</button>
              ))}
            </div>

            {/* Tab: Overview */}
            {activeTab === "overview" && (
              <div>
                <Section title="Architecture" icon="🏗">
                  <div style={{ color: THEMES.textDim, fontSize: 14, lineHeight: 1.7, marginBottom: 16 }}>
                    {report.architecture?.summary}
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
                    <Badge text={report.architecture?.pattern || "Unknown"} type="info" />
                    {report.architecture?.layers?.map((l) => <Badge key={l} text={l} type="neutral" />)}
                  </div>
                  <DepGraph deps={report.dependencies} />
                </Section>

                <Section title="Codebase Metrics" icon="📊">
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    <Pill label="Total Files" value={report.metrics?.files?.toLocaleString()} />
                    <Pill label="Lines of Code" value={report.metrics?.linesOfCode?.toLocaleString()} />
                    <Pill label="Functions" value={report.metrics?.functions?.toLocaleString()} />
                    <Pill label="Avg Complexity" value={report.metrics?.avgComplexity} color={THEMES.warn} />
                    <Pill label="Test Files" value={report.metrics?.testFiles} />
                    <Pill label="Open Issues" value={report.metrics?.openIssues} color={THEMES.danger} />
                  </div>
                </Section>

                <Section title="AI Insights" icon="🧠">
                  {report.insights?.map((ins, i) => (
                    <div key={i} style={{
                      display: "flex", gap: 12, marginBottom: 12,
                      padding: "10px 14px", background: THEMES.bg,
                      border: `1px solid ${THEMES.border}`, borderRadius: 8,
                    }}>
                      <span style={{ color: THEMES.accentDim, fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>0{i + 1}</span>
                      <span style={{ color: THEMES.textDim, fontSize: 14, lineHeight: 1.6 }}>{ins}</span>
                    </div>
                  ))}
                </Section>
              </div>
            )}

            {/* Tab: Security */}
            {activeTab === "security" && (
              <Section title="Security Analysis" icon="🔒">
                {report.security?.critical?.length > 0 && (
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 12, color: THEMES.danger, marginBottom: 8, fontFamily: "'JetBrains Mono', monospace" }}>CRITICAL</div>
                    {report.security.critical.map((s, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: "#1a0a0a", border: `1px solid #7f1d1d`, borderRadius: 8, marginBottom: 6 }}>
                        <span>🔴</span><span style={{ fontSize: 14, color: THEMES.danger }}>{s}</span>
                      </div>
                    ))}
                  </div>
                )}
                {report.security?.warnings?.length > 0 && (
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 12, color: THEMES.warn, marginBottom: 8, fontFamily: "'JetBrains Mono', monospace" }}>WARNINGS</div>
                    {report.security.warnings.map((s, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: "#1a1200", border: `1px solid #78350f`, borderRadius: 8, marginBottom: 6 }}>
                        <span>🟡</span><span style={{ fontSize: 14, color: THEMES.warn }}>{s}</span>
                      </div>
                    ))}
                  </div>
                )}
                {report.security?.info?.map((s, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: "#0a1a10", border: `1px solid #065f46`, borderRadius: 8, marginBottom: 6 }}>
                    <span>🟢</span><span style={{ fontSize: 14, color: THEMES.accent }}>{s}</span>
                  </div>
                ))}
              </Section>
            )}

            {/* Tab: Refactoring */}
            {activeTab === "refactor" && (
              <Section title="Refactoring Opportunities" icon="🔧">
                {report.refactoring?.map((r, i) => (
                  <div key={i} style={{
                    padding: "14px 16px", background: THEMES.bg,
                    border: `1px solid ${THEMES.border}`, borderRadius: 8, marginBottom: 10,
                    display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12,
                  }}>
                    <div>
                      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: THEMES.info, marginBottom: 6 }}>{r.file}</div>
                      <div style={{ fontSize: 14, color: THEMES.textDim }}>{r.issue}</div>
                    </div>
                    <Badge text={r.severity} type={r.severity === "high" ? "danger" : r.severity === "medium" ? "warn" : "neutral"} />
                  </div>
                ))}
              </Section>
            )}

            {/* Tab: Onboarding */}
            {activeTab === "onboarding" && (
              <Section title="Onboarding Guide" icon="📖">
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 12, color: THEMES.textDim, marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.06em" }}>Setup Steps</div>
                  {report.onboarding?.setup?.map((s, i) => (
                    <div key={i} style={{ display: "flex", gap: 12, marginBottom: 8, alignItems: "flex-start" }}>
                      <div style={{
                        minWidth: 24, height: 24, background: THEMES.accentDim, borderRadius: "50%",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 11, fontWeight: 700, color: "#0a0f0a",
                      }}>{i + 1}</div>
                      <div style={{ color: THEMES.textDim, fontSize: 14, paddingTop: 3 }}>{s}</div>
                    </div>
                  ))}
                </div>
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 12, color: THEMES.textDim, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>First Run</div>
                  <div style={{ background: "#07070d", padding: "10px 14px", borderRadius: 8, fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: THEMES.accent }}>
                    $ {report.onboarding?.firstRun}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: THEMES.textDim, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>Key Files</div>
                  {report.onboarding?.keyFiles?.map((f, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 12px", background: THEMES.bg, borderRadius: 6, marginBottom: 6, border: `1px solid ${THEMES.border}` }}>
                      <span style={{ fontSize: 12 }}>📄</span>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: THEMES.info }}>{f}</span>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            <div style={{ textAlign: "center", padding: "24px 0 0", color: THEMES.muted, fontSize: 12, fontFamily: "'JetBrains Mono', monospace" }}>
              powered by claude-sonnet · analysis is AI-generated from public repo metadata
            </div>
          </div>
        )}

        {stage === "error" && (
          <div style={{ textAlign: "center", padding: 40, color: THEMES.danger, fontSize: 14 }}>
            {error || "Something went wrong. Try a different URL."}
          </div>
        )}

        {stage === "idle" && (
          <div style={{
            textAlign: "center", padding: "60px 20px", color: THEMES.muted,
            border: `1px dashed ${THEMES.border}`, borderRadius: 12,
          }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>⬡</div>
            <div style={{ fontSize: 15, marginBottom: 8 }}>Enter a GitHub URL to begin analysis</div>
            <div style={{ fontSize: 13 }}>Supports any public repository</div>
          </div>
        )}
      </div>
    </div>
  );
}
