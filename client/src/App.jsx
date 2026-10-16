import { Fragment, useEffect, useState } from "react";
import "./App.css";

const API_BASE = "http://127.0.0.1:8000";

const navItems = [
  {
    label: "Overview",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </svg>
    ),
  },
  {
    label: "Leads",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="9" cy="8" r="3" />
        <path d="M3.5 19c.6-3.1 2.5-5 5.5-5s4.9 1.9 5.5 5" />
        <path d="M16 5.5a3 3 0 0 1 0 5.8" />
        <path d="M16 14c2.3.3 3.9 1.9 4.5 4" />
      </svg>
    ),
  },
  {
    label: "AI Intelligence",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 3l1.5 5.5L19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5L12 3z" />
        <path d="M19 15l.7 2.3L22 18l-2.3.7L19 21l-.7-2.3L16 18l2.3-.7L19 15z" />
      </svg>
    ),
  },
  {
    label: "Follow-ups",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="8.5" />
        <path d="M12 7v5l3 2" />
      </svg>
    ),
  },
  {
    label: "Reports",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5 20V10" />
        <path d="M12 20V4" />
        <path d="M19 20v-7" />
        <path d="M3 20h18" />
      </svg>
    ),
  },
  {
    label: "Import Data",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 3v12" />
        <path d="M7 10l5 5 5-5" />
        <path d="M4 20h16" />
      </svg>
    ),
  },
];

function formatNumber(value) {
  return Number(value || 0).toLocaleString();
}

function getPriorityPercent(count, total) {
  if (!total) return 0;
  return Math.round((count / total) * 100);
}


function App() {
  const [activeNav, setActiveNav] = useState("Overview");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [globalSearch, setGlobalSearch] = useState("");
  const [globalSearchResults, setGlobalSearchResults] = useState([]);
  const [globalSearchOpen, setGlobalSearchOpen] = useState(false);
  const [selectedLeadFromSearch, setSelectedLeadFromSearch] = useState(null);

  const pageDescription = {
    Overview: "A clear view of your CRM performance and activity.",
    Leads: "Search, review and manage your customer records.",
    "AI Intelligence": "AI-powered scoring, intent and lead intelligence.",
    "Follow-ups": "Stay on top of pending and overdue customer actions.",
    Reports: "Business intelligence and CRM performance insights.",
    "Import Data": "Bring new CRM data into your workspace.",
    Settings: "Manage your workspace, AI and system preferences.",
  };

  const [allCRMLeads, setAllCRMLeads] = useState([]);

  useEffect(() => {
    let cancelled = false;

    async function loadCRMLeads() {
      try {
        const response = await fetch(`${API_BASE}/api/leads?limit=500`);

        if (!response.ok) {
          throw new Error("Failed to load CRM leads");
        }

        const data = await response.json();

        if (!cancelled) {
          setAllCRMLeads(data.leads || []);
        }
      } catch (error) {
        console.error("CRM search data error:", error);
        if (!cancelled) {
          setAllCRMLeads([]);
        }
      }
    }

    loadCRMLeads();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const query = globalSearch.trim().toLowerCase();

    if (!query) {
      setGlobalSearchResults([]);
      setGlobalSearchOpen(false);
      return;
    }

    const results = allCRMLeads
      .filter((lead) => {
        const searchableText = [
          lead.name,
          lead.email,
          lead.phone,
          lead.company,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return searchableText.includes(query);
      })
      .slice(0, 8);

    setGlobalSearchResults(results);
    setGlobalSearchOpen(true);
  }, [globalSearch, allCRMLeads]);

  const openSearchResult = (lead) => {
    setSelectedLeadFromSearch(lead);
    setGlobalSearchOpen(false);
    setActiveNav("Leads");
    setGlobalSearch(lead.name || "");
  };

  const handleGlobalSearchKeyDown = (event) => {
    if (event.key === "Enter" && globalSearchResults.length > 0) {
      event.preventDefault();
      openSearchResult(globalSearchResults[0]);
    }

    if (event.key === "Escape") {
      setGlobalSearchOpen(false);
    }
  };

  const handleNavigate = (page) => {
    setActiveNav(page);
    setGlobalSearch("");
    setGlobalSearchOpen(false);
  };

  return (
    <div className={`app-shell ${sidebarCollapsed ? "sidebar-collapsed" : ""}`}>
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">C</div>

          {!sidebarCollapsed && (
            <div className="brand-copy">
              <div className="brand-name">CRM Intelligence</div>
              <div className="brand-subtitle">AI-powered operations</div>
            </div>
          )}

          <button
            className="sidebar-toggle"
            onClick={() => setSidebarCollapsed((value) => !value)}
            aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {sidebarCollapsed ? "›" : "‹"}
          </button>
        </div>

        <nav className="nav">
          {!sidebarCollapsed && (
            <div className="nav-section-label">WORKSPACE</div>
          )}

          {navItems.map((item) => (
            <button
              key={item.label}
              className={`nav-item ${
                activeNav === item.label ? "active" : ""
              }`}
              onClick={() => handleNavigate(item.label)}
              title={sidebarCollapsed ? item.label : ""}
            >
              <span className="nav-icon">{item.icon}</span>

              {!sidebarCollapsed && (
                <span className="nav-label">{item.label}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <button
            className={`nav-item ${
              activeNav === "Settings" ? "active" : ""
            }`}
            onClick={() => handleNavigate("Settings")}
            title={sidebarCollapsed ? "Settings" : ""}
          >
            <span className="nav-icon">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7z" />
                <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-1.7 1.7-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5v.2h-2.4v-.2a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1L8 17l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H6.7v-2.4h.2a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.9L8 8.6l1.7-1.7.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.5v-.2h2.4v.2a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1 1.7 1.7-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.5 1h.2V14h-.2a1.7 1.7 0 0 0-1.5 1z" />
              </svg>
            </span>

            {!sidebarCollapsed && (
              <span className="nav-label">Settings</span>
            )}
          </button>

          <div className="workspace-card">
            <div className="workspace-avatar">A</div>

            {!sidebarCollapsed && (
              <>
                <div className="workspace-info">
                  <strong>Anaele</strong>
                  <span>Workspace</span>
                </div>

                <span className="workspace-menu">•••</span>
              </>
            )}
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="topbar-left">
            <div className="breadcrumb">
              Workspace <span>/</span> {activeNav}
            </div>

            <h1>{activeNav}</h1>

            <p>{pageDescription[activeNav] || "Manage your CRM workspace."}</p>
          </div>

          <div className="topbar-actions">
            <div className="global-search">
              <span className="global-search-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="6.5" />
                  <path d="M16 16l4.5 4.5" />
                </svg>
              </span>

              <input
                type="search"
                value={globalSearch}
                onChange={(event) => {
                  setGlobalSearch(event.target.value);
                  setGlobalSearchOpen(Boolean(event.target.value.trim()));
                }}
                onFocus={() => {
                  if (globalSearch.trim()) {
                    setGlobalSearchOpen(true);
                  }
                }}
                onKeyDown={handleGlobalSearchKeyDown}
                placeholder="Search CRM..."
                aria-label="Search CRM"
              />

              {globalSearchOpen && globalSearch.trim() && (
                <div className="global-search-results">
                  {globalSearchResults.length > 0 ? (
                    globalSearchResults.map((lead) => (
                      <button
                        key={lead.id}
                        className="global-search-result"
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => openSearchResult(lead)}
                      >
                        <span className="global-search-result-main">
                          <strong>{lead.name || "Unnamed lead"}</strong>
                          <small>
                            {lead.company || lead.email || "CRM record"}
                          </small>
                        </span>

                        <span className="global-search-result-arrow">
                          →
                        </span>
                      </button>
                    ))
                  ) : (
                    <div className="global-search-empty">
                      No matching CRM records
                    </div>
                  )}
                </div>
              )}

              {globalSearch && (
                <button
                  className="global-search-clear"
                  onClick={() => setGlobalSearch("")}
                  aria-label="Clear search"
                >
                  ×
                </button>
              )}
            </div>

            <button
              className="icon-button notification-button"
              onClick={() => handleNavigate("Follow-ups")}
              title="Open follow-ups"
              aria-label="Open follow-ups"
            >
              <svg
                className="notification-icon"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
                <path d="M10 21h4" />
              </svg>
              <span className="notification-dot" />
            </button>

            <button
              className="user-avatar topbar-user"
              onClick={() => handleNavigate("Settings")}
              title="Open settings"
              aria-label="Open settings"
            >
              A
            </button>
          </div>
        </header>

        {activeNav === "Overview" ? (
          <Dashboard
            onNavigate={handleNavigate}
            globalSearch={globalSearch}
          />
        ) : activeNav === "Leads" ? (
          <LeadsPage
            globalSearch={globalSearch}
            selectedLeadFromSearch={selectedLeadFromSearch}
          />
        ) : activeNav === "AI Intelligence" ? (
          <IntelligencePage globalSearch={globalSearch} />
        ) : activeNav === "Follow-ups" ? (
          <FollowUpsPage />
        ) : activeNav === "Reports" ? (
          <ReportsPage />
        ) : activeNav === "Import Data" ? (
          <ImportDataPage />
        ) : activeNav === "Settings" ? (
          <SettingsPage />
        ) : (
          <ComingSoon title={activeNav} />
        )}
      </main>
    </div>
  );
}

function Dashboard({ onNavigate }) {
  const [dashboard, setDashboard] = useState(null);
  const [quality, setQuality] = useState(null);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOverview() {
      try {
        setLoading(true);

        const [dashboardResponse, qualityResponse, leadsResponse] =
          await Promise.all([
            fetch(`${API_BASE}/api/dashboard`),
            fetch(`${API_BASE}/api/quality`),
            fetch(`${API_BASE}/api/leads?limit=5`),
          ]);

        if (
          !dashboardResponse.ok ||
          !qualityResponse.ok ||
          !leadsResponse.ok
        ) {
          throw new Error("Failed to load overview data");
        }

        const [dashboardData, qualityData, leadsData] =
          await Promise.all([
            dashboardResponse.json(),
            qualityResponse.json(),
            leadsResponse.json(),
          ]);

        setDashboard(dashboardData);
        setQuality(qualityData);
        setLeads(leadsData.leads || []);
      } catch (error) {
        console.error("Overview data error:", error);
      } finally {
        setLoading(false);
      }
    }

    loadOverview();
  }, []);

  const totalLeads = dashboard?.total_leads ?? 0;
  const averageScore = dashboard?.average_lead_score ?? 0;
  const highPriority = dashboard?.high_priority_leads ?? 0;
  const convertedLeads = dashboard?.converted_leads ?? 0;
  const conversionRate = dashboard?.conversion_rate ?? 0;

  const cleanRecords = quality?.clean_records ?? 0;
  const duplicateRecords = quality?.duplicate_records ?? 0;
  const reviewRequired = quality?.review_required ?? 0;
  const missingInformation = quality?.missing_information ?? 0;
  const dataHealth = quality?.data_quality_rate ?? 0;

  return (
    <section className="dashboard overview-dashboard">
      <div className="overview-toolbar">
        <div>
          <div className="overview-eyebrow">CRM Overview</div>
          <h2>Good morning, Anaele.</h2>
          <p>
            Monitor your CRM data, AI intelligence and follow-up activity.
          </p>
        </div>

        <div className="overview-actions">
          <button className="secondary-button">Import CRM</button>
          <button className="primary-button">+ Add Lead</button>
        </div>
      </div>

      <div className="metric-grid overview-metrics">
        <div className="metric-card overview-metric-card">
          <div className="metric-top">
            <span className="metric-label">Total Leads</span>
            <span className="metric-icon">◉</span>
          </div>

          <div className="metric-value">
            {loading ? "—" : formatNumber(totalLeads)}
          </div>

          <div className="metric-footer">
            <span className="metric-change">Live</span>
            <span>CRM records</span>
          </div>
        </div>

        <div className="metric-card overview-metric-card">
          <div className="metric-top">
            <span className="metric-label">Converted Leads</span>
            <span className="metric-icon">✓</span>
          </div>

          <div className="metric-value">
            {loading ? "—" : formatNumber(convertedLeads)}
          </div>

          <div className="metric-footer">
            <span>Live</span>
            <span>successful conversions</span>
          </div>
        </div>

        <div className="metric-card overview-metric-card">
          <div className="metric-top">
            <span className="metric-label">Data Health</span>
            <span className="metric-icon">✓</span>
          </div>

          <div className="metric-value">
            {loading ? "—" : `${dataHealth.toFixed(2)}%`}
          </div>

          <div className="metric-footer">
            <span className="metric-change">Healthy</span>
            <span>data quality</span>
          </div>
        </div>

        <div className="metric-card overview-metric-card">
          <div className="metric-top">
            <span className="metric-label">AI Score</span>
            <span className="metric-icon">✦</span>
          </div>

          <div className="metric-value">
            {loading ? "—" : averageScore.toFixed(1)}
          </div>

          <div className="metric-footer">
            <span>Average</span>
            <span>lead score</span>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <section className="panel priority-panel">
          <div className="panel-heading">
            <div>
              <h3>AI Intelligence</h3>
              <p>Signals generated from your CRM data.</p>
            </div>

            <button
              className="text-button"
              onClick={() => onNavigate("AI Intelligence")}
            >
              View intelligence →
            </button>
          </div>

          <div className="intelligence-grid">
            <div className="intelligence-stat">
              <span className="intelligence-icon">✦</span>
              <div>
                <strong>
                  {loading ? "—" : formatNumber(highPriority)}
                </strong>
                <span>High priority leads</span>
              </div>
            </div>

            <div className="intelligence-stat">
              <span className="intelligence-icon">◉</span>
              <div>
                <strong>
                  {loading ? "—" : averageScore.toFixed(1)}
                </strong>
                <span>Average AI score</span>
              </div>
            </div>

            <div className="intelligence-stat">
              <span className="intelligence-icon">✓</span>
              <div>
                <strong>
                  {loading ? "—" : formatNumber(convertedLeads)}
                </strong>
                <span>Converted leads</span>
              </div>
            </div>

            <div className="intelligence-stat">
              <span className="intelligence-icon">↗</span>
              <div>
                <strong>
                  {loading ? "—" : `${conversionRate.toFixed(1)}%`}
                </strong>
                <span>Conversion rate</span>
              </div>
            </div>
          </div>
        </section>

        <section className="panel activity-panel">
          <div className="panel-heading">
            <div>
              <h3>CRM Data Quality</h3>
              <p>Quality signals from your CRM database.</p>
            </div>

            <span className="data-health">
              <span>●</span>{" "}
              {loading ? "—" : `${dataHealth.toFixed(2)}%`}
            </span>
          </div>

          <div className="quality-list">
            <div className="quality-row">
              <div>
                <span className="quality-label">Clean records</span>
                <span className="quality-description">
                  Healthy CRM data
                </span>
              </div>
              <strong>{loading ? "—" : formatNumber(cleanRecords)}</strong>
            </div>

            <div className="quality-row">
              <div>
                <span className="quality-label">Duplicates</span>
                <span className="quality-description">
                  Records needing attention
                </span>
              </div>
              <strong>
                {loading ? "—" : formatNumber(duplicateRecords)}
              </strong>
            </div>

            <div className="quality-row">
              <div>
                <span className="quality-label">Review required</span>
                <span className="quality-description">
                  Records requiring inspection
                </span>
              </div>
              <strong>
                {loading ? "—" : formatNumber(reviewRequired)}
              </strong>
            </div>

            <div className="quality-row">
              <div>
                <span className="quality-label">Missing information</span>
                <span className="quality-description">
                  Records with incomplete data
                </span>
              </div>
              <strong>
                {loading ? "—" : formatNumber(missingInformation)}
              </strong>
            </div>
          </div>
        </section>
      </div>

      <section className="panel leads-panel">
        <div className="panel-heading">
          <div>
            <h3>Recent leads</h3>
            <p>Your latest CRM records.</p>
          </div>

          <button
            className="text-button"
            onClick={() => onNavigate("Leads")}
          >
            View all →
          </button>
        </div>

        {loading ? (
          <div className="empty-state">
            Loading recent leads...
          </div>
        ) : leads.length ? (
          <LeadTable rows={leads} />
        ) : (
          <div className="empty-state">
            No CRM leads available.
          </div>
        )}
      </section>
    </section>
  );
}

function Activity({ icon, type, title, text, count }) {
  return (
    <div className="activity-row">
      <div className={`activity-icon ${type}`}>{icon}</div>

      <div>
        <strong>{title}</strong>
        <span>{text}</span>
      </div>

      <span className="activity-count">{count}</span>
    </div>
  );
}


function ImportDataPage() {
  const [file, setFile] = useState(null);
  const [clientName, setClientName] = useState("CLIENT_A");
  const [datasetName, setDatasetName] = useState("CRM Import");
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [importHistory, setImportHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [batchLoading, setBatchLoading] = useState(false);
const [analyzingBatch, setAnalyzingBatch] = useState(false);
const [analysisResult, setAnalysisResult] = useState(null);
const [analysisError, setAnalysisError] = useState("");

  useEffect(() => {
    const loadImportHistory = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/imports`);

        if (!response.ok) {
          throw new Error("Could not load import history.");
        }

        const data = await response.json();
        setImportHistory(data.batches || []);
      } catch (err) {
        console.error("Import history error:", err);
      } finally {
        setHistoryLoading(false);
      }
    };

    loadImportHistory();
  }, []);

  const loadBatchDetails = async (batchId) => {
    setBatchLoading(true);

    try {
      const response = await fetch(`${API_BASE}/api/imports/${batchId}`);

      if (!response.ok) {
        throw new Error("Could not load batch details.");
      }

      const data = await response.json();
      setSelectedBatch(data);
    } catch (err) {
      console.error("Batch details error:", err);
    } finally {
      setBatchLoading(false);
    }
  };

  const runBatchAnalysis = async (batchId) => {
    setAnalyzingBatch(true);
    setAnalysisResult(null);
    setAnalysisError("");

    try {
      const response = await fetch(
        `${API_BASE}/api/imports/${batchId}/analyze`,
        {
          method: "POST",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "AI analysis failed.");
      }

      setAnalysisResult(data);

      await loadBatchDetails(batchId);
    } catch (err) {
      console.error("Batch AI analysis error:", err);
      setAnalysisError(err.message || "AI analysis failed.");
    } finally {
      setAnalyzingBatch(false);
    }
  };

  const handleImport = async () => {
    if (!file) {
      setError("Please select a CSV file.");
      return;
    }

    setImporting(true);
    setResult(null);
    setError("");

    try {
      const formData = new FormData();

      formData.append("file", file);
      formData.append("client_name", clientName);
      formData.append("dataset_name", datasetName);

      const response = await fetch(`${API_BASE}/api/import`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Import failed.");
      }

      setResult(data);
      setFile(null);
    } catch (err) {
      setError(err.message || "Import failed.");
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="page">
      <section className="page-intro">
        <div>
          <h2>Import Data</h2>
          <p>
            Upload CRM data and let the system clean, validate and process it.
          </p>
        </div>
      </section>

      <section className="import-layout">
        <div className="panel import-panel">
          <div className="import-panel-header">
            <div>
              <h3>Upload CSV</h3>
              <p>
                Required columns: name, email, phone, company, message.
              </p>
            </div>
          </div>

          <label className="import-dropzone">
            <input
              type="file"
              accept=".csv"
              onChange={(event) => {
                setFile(event.target.files?.[0] || null);
                setResult(null);
                setError("");
              }}
            />

            <div className="import-upload-icon">↥</div>

            <strong>
              {file ? file.name : "Choose a CSV file"}
            </strong>

            <span>
              {file
                ? `${(file.size / 1024).toFixed(1)} KB selected`
                : "CSV files only"}
            </span>
          </label>

          <div className="import-fields">
            <label>
              <span>Client</span>
              <input
                value={clientName}
                onChange={(event) => setClientName(event.target.value)}
                placeholder="CLIENT_A"
              />
            </label>

            <label>
              <span>Dataset</span>
              <input
                value={datasetName}
                onChange={(event) => setDatasetName(event.target.value)}
                placeholder="CRM Import"
              />
            </label>
          </div>

          <button
            className="primary-button import-button"
            onClick={handleImport}
            disabled={importing || !file}
          >
            {importing ? "Processing..." : "Process Import"}
          </button>

          {error && (
            <div className="import-error">
              {error}
            </div>
          )}
        </div>

        <div className="panel import-panel">
          <div className="import-panel-header">
            <div>
              <h3>Processing</h3>
              <p>
                Every upload passes through the CRM data pipeline.
              </p>
            </div>
          </div>

          <div className="import-pipeline">
            <div>
              <span>01</span>
              <strong>Clean</strong>
              <small>Normalize incoming data</small>
            </div>

            <div>
              <span>02</span>
              <strong>Validate</strong>
              <small>Check required fields</small>
            </div>

            <div>
              <span>03</span>
              <strong>Detect duplicates</strong>
              <small>Flag possible matches</small>
            </div>

            <div>
              <span>04</span>
              <strong>Import</strong>
              <small>Save clean records</small>
            </div>
          </div>
        </div>
      </section>

      {result && (
        <section className="panel import-result-panel">
          <div className="import-panel-header">
            <div>
              <h3>Import complete</h3>
              <p>{result.source_file}</p>
            </div>

            <span className="import-success">
              COMPLETED
            </span>
          </div>

          <div className="import-result-grid">
            <div>
              <span>Received</span>
              <strong>{result.rows_received}</strong>
            </div>

            <div>
              <span>Imported</span>
              <strong>{result.imported}</strong>
            </div>

            <div>
              <span>Invalid</span>
              <strong>{result.invalid_rows}</strong>
            </div>

            <div>
              <span>Duplicates</span>
              <strong>
                {(result.existing_duplicates || 0) +
                  (result.possible_duplicates || 0) +
                  (result.review_required || 0)}
              </strong>
            </div>

            <div>
              <span>Batch</span>
              <strong>#{result.batch_id}</strong>
            </div>
          </div>

          <div className="import-result-footer">
            <span>
              Batch {result.batch_key}
            </span>

            <span>
              {result.imported} records added to the CRM
            </span>
          </div>
        </section>
      )}

      {selectedBatch && (
        <section className="panel import-batch-details-panel">
          <div className="import-panel-header">
            <div>
              <h3>{selectedBatch.batch.dataset_name}</h3>
              <p>
                Batch #{selectedBatch.batch.batch_id} · {selectedBatch.batch.source_file}
              </p>
            </div>

            <div className="import-details-actions">
              <button
                className="import-ai-button"
                onClick={() => runBatchAnalysis(selectedBatch.batch.batch_id)}
                disabled={analyzingBatch || batchLoading}
              >
                {analyzingBatch ? "Analyzing..." : "Run AI Analysis"}
              </button>

              <button
                className="import-details-close"
                onClick={() => {
                  setSelectedBatch(null);
                  setAnalysisResult(null);
                  setAnalysisError("");
                }}
              >
                Close
              </button>
            </div>
          </div>

          {batchLoading ? (
            <div className="import-history-empty">
              Loading batch details...
            </div>
          ) : (
            <>
              <div className="import-batch-meta">
                <div>
                  <span>Client</span>
                  <strong>{selectedBatch.batch.client_name}</strong>
                </div>

                <div>
                  <span>Records</span>
                  <strong>{selectedBatch.batch.imported_count}</strong>
                </div>

                <div>
                  <span>Status</span>
                  <strong>{selectedBatch.batch.status}</strong>
                </div>

                <div>
                  <span>Conversion</span>
                  <strong>{selectedBatch.batch.conversion_rate}%</strong>
                </div>
              </div>

              {analysisError && (
                <div className="import-analysis-error">
                  {analysisError}
                </div>
              )}

              {analysisResult && (
                <div className="import-analysis-result">
                  <div>
                    <span>Total</span>
                    <strong>{analysisResult.total_leads}</strong>
                  </div>

                  <div>
                    <span>Analyzed</span>
                    <strong>{analysisResult.processed}</strong>
                  </div>

                  <div>
                    <span>Skipped</span>
                    <strong>{analysisResult.skipped}</strong>
                  </div>

                  <div>
                    <span>Failed</span>
                    <strong>{analysisResult.failed}</strong>
                  </div>
                </div>
              )}

              <div className="import-batch-section-title">
                Imported Records
              </div>

              <div className="import-history-table-wrap">
                <table className="import-history-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Company</th>
                      <th>Status</th>
                      <th>Priority</th>
                      <th>Score</th>
                    </tr>
                  </thead>

                  <tbody>
                    {selectedBatch.leads.map((lead) => (
                      <tr key={lead.id}>
                        <td>
                          <strong>{lead.name}</strong>
                        </td>
                        <td>{lead.email}</td>
                        <td>{lead.phone}</td>
                        <td>{lead.company}</td>
                        <td>{lead.status || "NEW"}</td>
                        <td>{lead.priority || "—"}</td>
                        <td>{lead.lead_score ?? 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </section>
      )}

      <section className="panel import-history-panel">
        <div className="import-panel-header">
          <div>
            <h3>Import History</h3>
            <p>Recent datasets processed by the CRM.</p>
          </div>
          <span className="import-history-count">
            {importHistory.filter((batch) => batch.imported_count > 0).length} successful
          </span>
        </div>

        {historyLoading ? (
          <div className="import-history-empty">
            Loading import history...
          </div>
        ) : importHistory.length === 0 ? (
          <div className="import-history-empty">
            No imports have been processed yet.
          </div>
        ) : (
          <div className="import-history-table-wrap">
            <table className="import-history-table">
              <thead>
                <tr>
                  <th>Dataset</th>
                  <th>Source</th>
                  <th>Client</th>
                  <th>Records</th>
                  <th>Status</th>
                  <th>Created</th>
                </tr>
              </thead>

              <tbody>
                {importHistory
                  .filter((batch) => batch.imported_count > 0)
                  .slice(0, 10)
                  .map((batch) => (
                    <tr
                      key={batch.batch_id}
                      className="import-history-clickable"
                      onClick={() => loadBatchDetails(batch.batch_id)}
                    >
                      <td>
                        <div className="import-history-primary">
                          {batch.dataset_name}
                        </div>
                        <div className="import-history-secondary">
                          Batch #{batch.batch_id} · View details
                        </div>
                      </td>

                      <td>
                        <span className="import-history-file">
                          {batch.source_file}
                        </span>
                      </td>

                      <td>{batch.client_name}</td>

                      <td>
                        <strong>{batch.imported_count}</strong>
                      </td>

                      <td>
                        <span className="import-history-status">
                          {batch.status}
                        </span>
                      </td>

                      <td>
                        <span className="import-history-date">
                          {batch.created_at}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

        {!historyLoading &&
          importHistory.filter((batch) => batch.imported_count > 0).length > 10 && (
            <div className="import-history-footer">
              Showing the 10 most recent successful imports.
            </div>
          )}
      </section>
    </div>
  );
}

function LeadsPage({
  globalSearch = "",
  selectedLeadFromSearch = null,
}) {
  const [search, setSearch] = useState(globalSearch);

  useEffect(() => {
    setSearch(globalSearch);
  }, [globalSearch]);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quality, setQuality] = useState(null);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");

  useEffect(() => {
    async function loadLeads() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_BASE}/api/leads?limit=500`
        );

        if (!response.ok) {
          throw new Error("Failed to load leads");
        }

        const data = await response.json();
        setLeads(data.leads);
      } catch (err) {
        console.error(err);
        setError(
          "Could not connect to the CRM API. Make sure FastAPI is running."
        );
      } finally {
        setLoading(false);
      }
    }

    loadLeads();
  }, []);

  useEffect(() => {
    fetch(`${API_BASE}/api/quality`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to load quality metrics");
        }

        return response.json();
      })
      .then((data) => setQuality(data))
      .catch((error) =>
        console.error("Quality metrics error:", error)
      );
  }, []);

  const filteredLeads = leads.filter((lead) => {
    const searchableText = [
      lead.name,
      lead.email,
      lead.phone,
      lead.company,
      lead.status,
      lead.priority,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    const matchesSearch = searchableText.includes(
      search.toLowerCase()
    );

    const matchesStatus =
      statusFilter === "ALL" ||
      String(lead.status || "").toUpperCase() === statusFilter;

    const matchesPriority =
      priorityFilter === "ALL" ||
      String(lead.priority || "").toUpperCase() === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const totalLeads = quality?.total_leads ?? 0;
  const cleanLeads = quality?.clean_records ?? 0;
  const duplicateLeads = quality?.duplicate_records ?? 0;
  const reviewLeads = quality?.review_required ?? 0;

  return (
    <section className="dashboard">
      <div className="section-heading">
        <div>
          <h2>Leads</h2>
          <p>Manage, search and inspect your CRM records.</p>
        </div>

        <button className="primary-button">+ Add Lead</button>
      </div>

      <div className="lead-summary">
        <div className="metric-card">
          <div className="metric-top">
            <span className="metric-label">Total Leads</span>
            <span className="metric-icon">◉</span>
          </div>
          <div className="metric-value">{totalLeads}</div>
          <div className="metric-footer">
            <span>All CRM records</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-top">
            <span className="metric-label">Clean Records</span>
            <span className="metric-icon">✓</span>
          </div>
          <div className="metric-value">{cleanLeads}</div>
          <div className="metric-footer">
            <span className="metric-change">Healthy</span>
            <span>records</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-top">
            <span className="metric-label">Duplicates</span>
            <span className="metric-icon">◌</span>
          </div>
          <div className="metric-value">{duplicateLeads}</div>
          <div className="metric-footer">
            <span>Need attention</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-top">
            <span className="metric-label">Review Required</span>
            <span className="metric-icon">!</span>
          </div>
          <div className="metric-value">{reviewLeads}</div>
          <div className="metric-footer">
            <span>Possible duplicates</span>
          </div>
        </div>
      </div>

      <section className="panel leads-page-panel">
        <div className="panel-heading leads-panel-heading">
          <div>
            <h3>All leads</h3>
            <p>Your complete CRM lead database.</p>
          </div>

          <span className="data-health">
            <span>●</span>{" "}
            {quality
              ? `${quality.data_quality_rate.toFixed(2)}%`
              : "—"}{" "}
            data health
          </span>
        </div>

        <div className="lead-toolbar">
          <div className="search-box">
            <span>⌕</span>

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search leads by name, email or company..."
            />
          </div>

          <div className="toolbar-actions">
            <select
              className="lead-filter"
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value)
              }
            >
              <option value="ALL">All statuses</option>
              <option value="NEW">New</option>
              <option value="CONTACTED">Contacted</option>
              <option value="QUALIFIED">Qualified</option>
              <option value="CONVERTED">Converted</option>
              <option value="LOST">Lost</option>
            </select>

            <select
              className="lead-filter"
              value={priorityFilter}
              onChange={(event) =>
                setPriorityFilter(event.target.value)
              }
            >
              <option value="ALL">All priorities</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>

            <button className="secondary-button">Import</button>
          </div>
        </div>

        {loading ? (
          <div className="empty-state">
            Loading CRM leads...
          </div>
        ) : error ? (
          <div className="empty-state">
            {error}
          </div>
        ) : (
          <>
            <div className="table-meta">
              <span>
                Showing <strong>{filteredLeads.length}</strong> of{" "}
                {totalLeads} leads
              </span>
            </div>

            <LeadTable
              rows={filteredLeads}
              selectedLeadFromSearch={selectedLeadFromSearch}
            />
          </>
        )}
      </section>
    </section>
  );
}

function LeadTable({
  rows,
  selectedLeadFromSearch = null,
}) {
  const [selectedLead, setSelectedLead] = useState(null);

  useEffect(() => {
    if (!selectedLeadFromSearch) return;

    setSelectedLead(selectedLeadFromSearch);
  }, [selectedLeadFromSearch]);
  const [actionState, setActionState] = useState({});
  const [actionLoading, setActionLoading] = useState(false);

  async function loadActionStatus(leadId) {
    try {
      const response = await fetch(
        `${API_BASE}/api/leads/${leadId}/action`
      );

      if (!response.ok) {
        throw new Error("Failed to load action status");
      }

      const data = await response.json();

      setActionState((current) => ({
        ...current,
        [leadId]: data,
      }));

      return data;
    } catch (error) {
      console.error("Action status error:", error);
      return null;
    }
  }

  async function handleSelectLead(lead) {
    const selected = selectedLead?.id === lead.id;

    if (selected) {
      setSelectedLead(null);
      return;
    }

    setSelectedLead(lead);

    if (!actionState[lead.id]) {
      await loadActionStatus(lead.id);
    }
  }

  async function updateActionStatus(leadId, status) {
    try {
      setActionLoading(true);

      const response = await fetch(
        `${API_BASE}/api/leads/${leadId}/action`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action_status: status,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update action status");
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setActionState((current) => ({
        ...current,
        [leadId]: data,
      }));
    } catch (error) {
      console.error("Action update error:", error);
    } finally {
      setActionLoading(false);
    }
  }

  function getActionStatus(leadId) {
    return actionState[leadId]?.action_status || "PENDING";
  }

  function getActionStatusClass(status) {
    return String(status)
      .toLowerCase()
      .replace(/\s+/g, "-");
  }

  if (!rows.length) {
    return (
      <div className="empty-state">
        No leads match your current search or filters.
      </div>
    );
  }

  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Lead</th>
            <th>Company</th>
            <th>Status</th>
            <th>Priority</th>
            <th>AI Score</th>
            <th>Activity</th>
            <th>AI</th>
          </tr>
        </thead>

        <tbody>
          {rows.map((lead) => {
            const name = lead.name || "Unknown";
            const email = lead.email || "";
            const company = lead.company || "—";
            const status = lead.status || "NEW";
            const priority = lead.priority || "—";
            const score = lead.lead_score;
            const selected = selectedLead?.id === lead.id;
            const currentActionStatus = getActionStatus(lead.id);
            const actionData = actionState[lead.id];

            const initials = name
              .split(" ")
              .filter(Boolean)
              .slice(0, 2)
              .map((part) => part.charAt(0).toUpperCase())
              .join("");

            return (
              <Fragment key={lead.id}>
                <tr className={selected ? "lead-row-selected" : ""}>
                  <td>
                    <div className="lead-cell">
                      <div className="lead-avatar">
                        {initials || "?"}
                      </div>

                      <div className="lead-identity">
                        <strong>{name}</strong>
                        <span>
                          {email || "No email available"}
                        </span>
                      </div>
                    </div>
                  </td>

                  <td>
                    <span className="company-name">
                      {company}
                    </span>
                  </td>

                  <td>
                    <span
                      className={`status-pill ${String(status)
                        .toLowerCase()
                        .replace(/\s+/g, "-")}`}
                    >
                      {status}
                    </span>
                  </td>

                  <td>
                    <span
                      className={`priority-pill ${String(priority)
                        .toLowerCase()
                        .replace(/\s+/g, "-")}`}
                    >
                      <span />
                      {priority}
                    </span>
                  </td>

                  <td>
                    <div className="score-cell">
                      <strong>
                        {score !== null && score !== undefined
                          ? Number(score).toFixed(0)
                          : "—"}
                      </strong>

                      {score !== null &&
                        score !== undefined && (
                          <div className="score-bar">
                            <span
                              style={{
                                width: `${Math.min(
                                  Math.max(Number(score), 0),
                                  100
                                )}%`,
                              }}
                            />
                          </div>
                        )}
                    </div>
                  </td>

                  <td>
                    <span className="activity-time">
                      {currentActionStatus}
                    </span>
                  </td>

                  <td>
                    <button
                      type="button"
                      className="ai-view-button"
                      onClick={() =>
                        handleSelectLead(lead)
                      }
                    >
                      {selected ? "Close" : "View AI"}
                    </button>
                  </td>
                </tr>

                {selected && (
                  <tr className="ai-detail-row">
                    <td colSpan="7">
                      <div className="ai-detail-panel">
                        <div className="ai-detail-header">
                          <div>
                            <span className="ai-detail-eyebrow">
                              AI ANALYSIS
                            </span>

                            <h4>{name}</h4>

                            <p>
                              {lead.summary ||
                                "No AI summary available."}
                            </p>
                          </div>

                          <div className="ai-detail-score">
                            <span>AI SCORE</span>

                            <strong>
                              {score !== null &&
                              score !== undefined
                                ? Number(score).toFixed(0)
                                : "—"}
                            </strong>
                          </div>
                        </div>

                        <div className="ai-detail-grid">
                          <div>
                            <span>Intent</span>
                            <strong>
                              {lead.intent || "Unknown"}
                            </strong>
                          </div>

                          <div>
                            <span>Lead Type</span>
                            <strong>
                              {lead.lead_type || "Unknown"}
                            </strong>
                          </div>

                          <div>
                            <span>Product</span>
                            <strong>
                              {lead.product || "Unknown"}
                            </strong>
                          </div>

                          <div>
                            <span>Quantity</span>
                            <strong>
                              {lead.quantity ?? "Unknown"}
                            </strong>
                          </div>

                          <div>
                            <span>Timeline</span>
                            <strong>
                              {lead.timeline || "Unknown"}
                            </strong>
                          </div>

                          <div>
                            <span>Follow-up</span>
                            <strong>
                              {lead.follow_up_timing ||
                                "Not specified"}
                            </strong>
                          </div>
                        </div>

                        <div className="ai-detail-action">
                          <span>RECOMMENDED ACTION</span>

                          <p>
                            {lead.recommended_action ||
                              "No recommendation available."}
                          </p>

                          <div className="action-control">
                            <div className="action-status-line">
                              <span>ACTION STATUS</span>

                              <strong
                                className={`action-status-pill ${getActionStatusClass(
                                  currentActionStatus
                                )}`}
                              >
                                {currentActionStatus}
                              </strong>
                            </div>

                            <div className="action-buttons">
                              {currentActionStatus === "PENDING" && (
                                <button
                                  type="button"
                                  className="action-button secondary"
                                  onClick={() =>
                                    updateActionStatus(
                                      lead.id,
                                      "IN PROGRESS"
                                    )
                                  }
                                  disabled={actionLoading}
                                >
                                  {actionLoading
                                    ? "Updating..."
                                    : "Start Action"}
                                </button>
                              )}

                              {currentActionStatus ===
                                "IN PROGRESS" && (
                                <button
                                  type="button"
                                  className="action-button primary"
                                  onClick={() =>
                                    updateActionStatus(
                                      lead.id,
                                      "COMPLETED"
                                    )
                                  }
                                  disabled={actionLoading}
                                >
                                  {actionLoading
                                    ? "Updating..."
                                    : "Complete"}
                                </button>
                              )}

                              {currentActionStatus ===
                                "COMPLETED" && (
                                <span className="action-completed">
                                  Completed
                                  {actionData?.action_completed_at
                                    ? ` · ${new Date(
                                        actionData.action_completed_at
                                      ).toLocaleString()}`
                                    : ""}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function IntelligencePage() {
  const [intelligence, setIntelligence] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function loadIntelligence(isRefresh = false) {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const [intelligenceResponse, dashboardResponse] =
        await Promise.all([
          fetch(`${API_BASE}/api/intelligence?limit=10`),
          fetch(`${API_BASE}/api/dashboard`),
        ]);

      if (
        !intelligenceResponse.ok ||
        !dashboardResponse.ok
      ) {
        throw new Error("Failed to load AI intelligence");
      }

      const [intelligenceData, dashboardData] =
        await Promise.all([
          intelligenceResponse.json(),
          dashboardResponse.json(),
        ]);

      setIntelligence(intelligenceData);
      setDashboard(dashboardData);
    } catch (error) {
      console.error("AI intelligence error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadIntelligence();
  }, []);

  const totalAnalyzed =
    intelligence?.total_analyzed ?? 0;

  const highPriority =
    intelligence?.high_priority ?? 0;

  const averageScore =
    intelligence?.average_score ?? 0;

  const converted =
    dashboard?.converted_leads ?? 0;

  const topLeads =
    intelligence?.top_leads ?? [];

  const intentBreakdown =
    intelligence?.intent_breakdown ?? [];

  const priorityBreakdown =
    intelligence?.priority_breakdown ?? [];

  const getPercentages = (items, key) => {
    if (!totalAnalyzed || !items.length) return {};

    const raw = items.map((item) => ({
      key: item[key],
      value: (item.count / totalAnalyzed) * 100,
    }));

    const percentages = raw.map((item) => Math.floor(item.value));
    let remaining =
      100 - percentages.reduce((sum, value) => sum + value, 0);

    const ranked = raw
      .map((item, index) => ({
        index,
        remainder: item.value - percentages[index],
      }))
      .sort((a, b) => b.remainder - a.remainder);

    for (let i = 0; i < remaining; i += 1) {
      percentages[ranked[i].index] += 1;
    }

    return Object.fromEntries(
      raw.map((item, index) => [
        item.key,
        percentages[index],
      ])
    );
  };

  const intentPercentages =
    getPercentages(intentBreakdown, "intent");

  const priorityPercentages =
    getPercentages(priorityBreakdown, "priority");

  return (
    <section className="dashboard intelligence-page">
      <div className="overview-toolbar">
        <div>
          <div className="overview-eyebrow">
            AI Intelligence
          </div>

          <h2>Understand your leads.</h2>

          <p>
            AI-generated signals help you identify priority,
            intent and conversion opportunities.
          </p>
        </div>

        <div className="overview-actions">
          <button
            className="secondary-button"
            onClick={() => loadIntelligence(true)}
            disabled={refreshing}
          >
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      <div className="metric-grid overview-metrics">
        <div className="metric-card overview-metric-card">
          <div className="metric-top">
            <span className="metric-label">
              Scored Leads
            </span>
            <span className="metric-icon">✦</span>
          </div>

          <div className="metric-value">
            {loading
              ? "—"
              : formatNumber(totalAnalyzed)}
          </div>

          <div className="metric-footer">
            <span>AI</span>
            <span>analyzed records</span>
          </div>
        </div>

        <div className="metric-card overview-metric-card">
          <div className="metric-top">
            <span className="metric-label">
              High Priority
            </span>
            <span className="metric-icon">!</span>
          </div>

          <div className="metric-value">
            {loading
              ? "—"
              : formatNumber(highPriority)}
          </div>

          <div className="metric-footer">
            <span>Priority</span>
            <span>needs attention</span>
          </div>
        </div>

        <div className="metric-card overview-metric-card">
          <div className="metric-top">
            <span className="metric-label">
              Average Score
            </span>
            <span className="metric-icon">◉</span>
          </div>

          <div className="metric-value">
            {loading
              ? "—"
              : averageScore.toFixed(1)}
          </div>

          <div className="metric-footer">
            <span>AI</span>
            <span>lead score</span>
          </div>
        </div>

        <div className="metric-card overview-metric-card">
          <div className="metric-top">
            <span className="metric-label">
              Converted
            </span>
            <span className="metric-icon">✓</span>
          </div>

          <div className="metric-value">
            {loading
              ? "—"
              : formatNumber(converted)}
          </div>

          <div className="metric-footer">
            <span>CRM</span>
            <span>successful conversions</span>
          </div>
        </div>
      </div>

      <div className="intelligence-breakdown-grid">
        <section className="panel intelligence-breakdown-panel">
          <div className="panel-heading">
            <div>
              <h3>Intent distribution</h3>
              <p>
                What your leads are asking for.
              </p>
            </div>

            <span className="data-health">
              <span>●</span>{" "}
              {loading ? "—" : `${intentBreakdown.length} intents`}
            </span>
          </div>

          {loading ? (
            <div className="empty-state">
              Loading intent data...
            </div>
          ) : intentBreakdown.length ? (
            <div className="breakdown-list">
              {intentBreakdown.map((item) => {
                const percentage = intentPercentages[item.intent] ?? 0;

                return (
                  <div
                    className="breakdown-row"
                    key={item.intent}
                  >
                    <div className="breakdown-label">
                      <span>{item.intent}</span>
                      <strong>
                        {formatNumber(item.count)} · {percentage}%
                      </strong>
                    </div>

                    <div className="breakdown-track">
                      <span
                        style={{
                          width: `${percentage}%`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="empty-state">
              No intent data available.
            </div>
          )}
        </section>

        <section className="panel intelligence-breakdown-panel">
          <div className="panel-heading">
            <div>
              <h3>Priority distribution</h3>
              <p>
                How AI is ranking your leads.
              </p>
            </div>

            <span className="data-health">
              <span>●</span>{" "}
              {loading ? "—" : `${priorityBreakdown.length} levels`}
            </span>
          </div>

          {loading ? (
            <div className="empty-state">
              Loading priority data...
            </div>
          ) : priorityBreakdown.length ? (
            <div className="breakdown-list">
              {priorityBreakdown.map((item) => {
                const percentage = priorityPercentages[item.priority] ?? 0;

                return (
                  <div
                    className="breakdown-row"
                    key={item.priority}
                  >
                    <div className="breakdown-label">
                      <span>{item.priority}</span>
                      <strong>
                        {formatNumber(item.count)} · {percentage}%
                      </strong>
                    </div>

                    <div className="breakdown-track">
                      <span
                        style={{
                          width: `${percentage}%`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="empty-state">
              No priority data available.
            </div>
          )}
        </section>
      </div>

      <section className="panel leads-panel">
        <div className="panel-heading">
          <div>
            <h3>Top AI-scored leads</h3>
            <p>
              Leads ranked by their current AI score.
            </p>
          </div>

          <span className="data-health">
            <span>●</span>{" "}
            {loading
              ? "—"
              : `${topLeads.length} shown`}
          </span>
        </div>

        {loading ? (
          <div className="empty-state">
            Loading AI intelligence...
          </div>
        ) : topLeads.length ? (
          <LeadTable rows={topLeads} />
        ) : (
          <div className="empty-state">
            No AI-scored leads available.
          </div>
        )}
      </section>
    </section>
  );
}
function FollowUpsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [queueFilter, setQueueFilter] = useState("ALL");

  async function loadFollowUps(isRefresh = false) {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await fetch(
        `${API_BASE}/api/follow-ups`
      );

      if (!response.ok) {
        throw new Error("Failed to load follow-ups");
      }

      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error("Follow-ups error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadFollowUps();
  }, []);

  async function updateActionStatus(leadId, actionStatus) {
    try {
      setUpdatingId(leadId);

      const response = await fetch(
        `${API_BASE}/api/leads/${leadId}/action`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action_status: actionStatus,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update action");
      }

      const result = await response.json();

      if (result.error) {
        throw new Error(result.error);
      }

      await loadFollowUps(true);
    } catch (error) {
      console.error("Follow-up action error:", error);
    } finally {
      setUpdatingId(null);
    }
  }

  function formatDueDate(value) {
    if (!value) return "Not scheduled";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleString();
  }

  function isOverdue(value, status) {
    if (!value) return false;
    if (
      status === "COMPLETED" ||
      status === "SKIPPED"
    ) {
      return false;
    }

    const due = new Date(value);

    return (
      !Number.isNaN(due.getTime()) &&
      due.getTime() < Date.now()
    );
  }

  function getPriorityClass(priority) {
    return String(priority || "LOW")
      .toLowerCase()
      .replace(/\s+/g, "-");
  }

  function getStatusClass(status) {
    return String(status || "PENDING")
      .toLowerCase()
      .replace(/\s+/g, "-");
  }

  function getInitials(name) {
    return (name || "U")
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) =>
        part.charAt(0).toUpperCase()
      )
      .join("");
  }

  const metrics = data?.metrics || {};
  const followUps = data?.follow_ups || [];

  const filteredFollowUps = followUps.filter((item) => {
    if (queueFilter === "HIGH") {
      return item.priority === "HIGH";
    }

    if (queueFilter === "OVERDUE") {
      return isOverdue(
        item.follow_up_due_at,
        item.action_status
      );
    }

    if (queueFilter === "IN PROGRESS") {
      return item.action_status === "IN PROGRESS";
    }

    return true;
  });

  const completionPercent =
    metrics.total > 0
      ? Math.min(
          100,
          ((metrics.completed || 0) /
            metrics.total) *
            100
        )
      : 0;

  return (
    <section className="dashboard follow-ups-page">
      <section className="page-intro">
        <div>
          <span className="section-eyebrow">
            FOLLOW-UP OPERATIONS
          </span>

          <h2>Stay on top of your leads.</h2>

          <p>
            Turn AI recommendations into completed sales actions.
          </p>
        </div>

        <button
          className="secondary-button"
          onClick={() => loadFollowUps(true)}
          disabled={refreshing}
        >
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </section>

      <section className="follow-up-metrics">
        <div className="follow-up-metric">
          <div className="follow-up-metric-label">
            Active Follow-ups
          </div>

          <div className="follow-up-metric-value">
            {loading ? "—" : formatNumber(metrics.total)}
          </div>

          <div className="follow-up-metric-meta">
            Leads requiring action
          </div>
        </div>

        <div className="follow-up-metric">
          <div className="follow-up-metric-label">
            Pending
          </div>

          <div className="follow-up-metric-value">
            {loading ? "—" : formatNumber(metrics.pending)}
          </div>

          <div className="follow-up-metric-meta">
            Actions not started
          </div>
        </div>

        <div className="follow-up-metric">
          <div className="follow-up-metric-label">
            In Progress
          </div>

          <div className="follow-up-metric-value">
            {loading
              ? "—"
              : formatNumber(metrics.in_progress)}
          </div>

          <div className="follow-up-metric-meta">
            Actions currently active
          </div>
        </div>

        <div className="follow-up-metric">
          <div className="follow-up-metric-label">
            Overdue
          </div>

          <div className="follow-up-metric-value">
            {loading
              ? "—"
              : formatNumber(metrics.overdue)}
          </div>

          <div className="follow-up-metric-meta">
            Follow-ups past due
          </div>
        </div>
      </section>

      <section className="follow-up-layout">
        <div className="follow-up-panel">
          <div className="follow-up-panel-heading">
            <div>
              <h3>Action progress</h3>
              <p>
                Current state of recommended actions.
              </p>
            </div>

            <span className="data-health">
              <span>●</span>
              {loading
                ? "—"
                : `${Number(
                    metrics.completion_rate || 0
                  ).toFixed(2)}%`}
            </span>
          </div>

          <div className="follow-up-progress">
            <div className="follow-up-progress-track">
              <span
                style={{
                  width: `${completionPercent}%`,
                }}
              />
            </div>

            <div className="follow-up-progress-meta">
              <span>
                {metrics.completed || 0} completed
              </span>

              <span>
                {metrics.total || 0} active actions
              </span>
            </div>
          </div>

          <div className="follow-up-breakdown">
            <div className="follow-up-breakdown-row">
              <span>Pending</span>
              <strong>{metrics.pending || 0}</strong>
            </div>

            <div className="follow-up-breakdown-row">
              <span>In Progress</span>
              <strong>{metrics.in_progress || 0}</strong>
            </div>

            <div className="follow-up-breakdown-row">
              <span>Completed</span>
              <strong>{metrics.completed || 0}</strong>
            </div>

            <div className="follow-up-breakdown-row">
              <span>Overdue</span>
              <strong>{metrics.overdue || 0}</strong>
            </div>
          </div>
        </div>

        <div className="follow-up-panel">
          <div className="follow-up-panel-heading">
            <div>
              <h3>Priority queue</h3>
              <p>
                Follow-ups ranked by lead priority.
              </p>
            </div>

            <span className="data-health">
              <span>●</span>
              {metrics.high || 0} high priority
            </span>
          </div>

          <div className="follow-up-breakdown">
            <div className="follow-up-breakdown-row">
              <span>High priority</span>
              <strong>{metrics.high || 0}</strong>
            </div>

            <div className="follow-up-breakdown-row">
              <span>Medium priority</span>
              <strong>{metrics.medium || 0}</strong>
            </div>

            <div className="follow-up-breakdown-row">
              <span>Low priority</span>
              <strong>{metrics.low || 0}</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="follow-up-panel follow-up-queue">
        <div className="follow-up-panel-heading">
          <div>
            <h3>Follow-up queue</h3>
            <p>
              Recommended actions generated from CRM intelligence.
            </p>
          </div>

          <span className="data-health">
            <span>●</span>
            {loading
              ? "—"
              : `${filteredFollowUps.length} shown`}
          </span>
        </div>

        <div className="follow-up-filters">
          <button
            type="button"
            className={
              queueFilter === "ALL"
                ? "follow-up-filter active"
                : "follow-up-filter"
            }
            onClick={() => setQueueFilter("ALL")}
          >
            All
          </button>

          <button
            type="button"
            className={
              queueFilter === "OVERDUE"
                ? "follow-up-filter active"
                : "follow-up-filter"
            }
            onClick={() => setQueueFilter("OVERDUE")}
          >
            Overdue
          </button>

          <button
            type="button"
            className={
              queueFilter === "HIGH"
                ? "follow-up-filter active"
                : "follow-up-filter"
            }
            onClick={() => setQueueFilter("HIGH")}
          >
            High Priority
          </button>

          <button
            type="button"
            className={
              queueFilter === "IN PROGRESS"
                ? "follow-up-filter active"
                : "follow-up-filter"
            }
            onClick={() =>
              setQueueFilter("IN PROGRESS")
            }
          >
            In Progress
          </button>
        </div>

        {loading ? (
          <div className="empty-state">
            Loading follow-ups...
          </div>
        ) : !filteredFollowUps.length ? (
          <div className="empty-state">
            No follow-ups match this filter.
          </div>
        ) : (
          <div className="follow-up-list">
            {filteredFollowUps.map((item) => {
              const isUpdating =
                updatingId === item.id;

              const overdue = isOverdue(
                item.follow_up_due_at,
                item.action_status
              );

              return (
                <div
                  className="follow-up-item"
                  key={item.id}
                >
                  <div className="follow-up-lead">
                    <div className="follow-up-avatar">
                      {getInitials(item.name)}
                    </div>

                    <div className="follow-up-identity">
                      <strong>
                        {item.name || "Unknown"}
                      </strong>

                      <span>
                        {item.company || "No company"}
                      </span>
                    </div>
                  </div>

                  <div className="follow-up-action">
                    <span className="follow-up-action-label">
                      Recommended action
                    </span>

                    <span className="follow-up-action-text">
                      {item.recommended_action ||
                        "No action specified"}
                    </span>
                  </div>

                  <div className="follow-up-meta">
                    <span
                      className={`follow-up-priority follow-up-priority-${getPriorityClass(
                        item.priority
                      )}`}
                    >
                      {item.priority || "LOW"}
                    </span>

                    <span
                      className={`follow-up-status follow-up-status-${getStatusClass(
                        item.action_status
                      )}`}
                    >
                      {item.action_status || "PENDING"}
                    </span>

                    {overdue && (
                      <span className="follow-up-overdue">
                        OVERDUE
                      </span>
                    )}

                    <button
                      type="button"
                      className="follow-up-button"
                      disabled={isUpdating}
                      onClick={() =>
                        updateActionStatus(
                          item.id,
                          item.action_status ===
                            "IN PROGRESS"
                            ? "COMPLETED"
                            : "IN PROGRESS"
                        )
                      }
                    >
                      {isUpdating
                        ? "..."
                        : item.action_status ===
                          "IN PROGRESS"
                        ? "Complete"
                        : "Start"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </section>
  );
}


function ReportsPage() {
  const [dashboard, setDashboard] = useState(null);
  const [quality, setQuality] = useState(null);
  const [intelligence, setIntelligence] = useState(null);
  const [followUps, setFollowUps] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function loadReports(isRefresh = false) {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const [dashboardResponse, qualityResponse, intelligenceResponse, followUpResponse] =
        await Promise.all([
          fetch(`${API_BASE}/api/dashboard`),
          fetch(`${API_BASE}/api/quality`),
          fetch(`${API_BASE}/api/intelligence?limit=20`),
          fetch(`${API_BASE}/api/follow-ups`),
        ]);

      if (
        !dashboardResponse.ok ||
        !qualityResponse.ok ||
        !intelligenceResponse.ok ||
        !followUpResponse.ok
      ) {
        throw new Error("Failed to load reports.");
      }

      const [
        dashboardData,
        qualityData,
        intelligenceData,
        followUpData,
      ] = await Promise.all([
        dashboardResponse.json(),
        qualityResponse.json(),
        intelligenceResponse.json(),
        followUpResponse.json(),
      ]);

      setDashboard(dashboardData);
      setQuality(qualityData);
      setIntelligence(intelligenceData);
      setFollowUps(followUpData);
    } catch (error) {
      console.error("Reports error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadReports();
  }, []);

  function percent(value) {
    if (value === null || value === undefined || Number.isNaN(Number(value))) {
      return "0%";
    }

    return `${Number(value).toFixed(1)}%`;
  }

  function exportReport() {
    const rows = [
      ["CRM REPORT", ""],
      ["Generated", new Date().toLocaleString()],
      ["", ""],

      ["LEAD PERFORMANCE", ""],
      ["Total Leads", dashboard?.total_leads || 0],
      ["New Leads", dashboard?.new_leads || 0],
      ["Contacted Leads", dashboard?.contacted_leads || 0],
      ["Qualified Leads", dashboard?.qualified_leads || 0],
      ["Converted Leads", dashboard?.converted_leads || 0],
      ["Lost Leads", dashboard?.lost_leads || 0],
      ["Duplicate Leads", dashboard?.duplicate_leads || 0],
      ["Conversion Rate", percent(dashboard?.conversion_rate || 0)],
      ["", ""],

      ["DATA QUALITY", ""],
      ["Clean Records", quality?.clean_records || 0],
      ["Duplicate Records", quality?.duplicate_records || 0],
      ["Review Required", quality?.review_required || 0],
      ["Missing Information", quality?.missing_information || 0],
      ["Data Quality Rate", percent(quality?.data_quality_rate || 0)],
      ["", ""],

      ["AI INTELLIGENCE", ""],
      ["Total Analyzed", intelligence?.total_analyzed || 0],
      ["High Priority", intelligence?.high_priority || 0],
      ["Average Lead Score", intelligence?.average_score || 0],
      ["", ""],

      ["AI INTENT BREAKDOWN", ""],
      ...intentBreakdown.map((item) => [
        item.intent,
        item.count,
      ]),
      ["", ""],

      ["AI PRIORITY BREAKDOWN", ""],
      ...priorityBreakdown.map((item) => [
        item.priority,
        item.count,
      ]),
      ["", ""],

      ["FOLLOW-UP PERFORMANCE", ""],
      ["Active Follow-ups", followUpMetrics.total || 0],
      ["Pending", followUpMetrics.pending || 0],
      ["In Progress", followUpMetrics.in_progress || 0],
      ["Completed", followUpMetrics.completed || 0],
      ["Skipped", followUpMetrics.skipped || 0],
      ["Overdue", followUpMetrics.overdue || 0],
      ["Completion Rate", percent(followUpMetrics.completion_rate || 0)],
    ];

    const csv = rows
      .map((row) =>
        row
          .map((value) => {
            const cell = String(value ?? "");
            return `"${cell.replace(/"/g, '""')}"`;
          })
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `crm-report-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  }

  function score(value) {
    if (value === null || value === undefined || Number.isNaN(Number(value))) {
      return "0.0";
    }

    return Number(value).toFixed(1);
  }

  const conversionRate = dashboard?.conversion_rate || 0;
  const qualityRate = quality?.data_quality_rate || 0;
  const averageScore = intelligence?.average_score || 0;

  const totalLeads = dashboard?.total_leads || 0;
  const convertedLeads = dashboard?.converted_leads || 0;
  const duplicateLeads = dashboard?.duplicate_leads || 0;
  const highPriority = intelligence?.high_priority || 0;

  const followUpMetrics = followUps?.metrics || {};

  const intentBreakdown = Array.isArray(
    intelligence?.intent_breakdown
  )
    ? intelligence.intent_breakdown
    : [];

  const priorityBreakdown = Array.isArray(
    intelligence?.priority_breakdown
  )
    ? intelligence.priority_breakdown
    : [];

  const topIntent = [...intentBreakdown]
    .sort((a, b) => b.count - a.count)
    .slice(0, 4);

  const priorityRows = ["HIGH", "MEDIUM", "LOW"].map((priority) => {
    const match = priorityBreakdown.find(
      (item) => item.priority === priority
    );

    return [
      priority,
      match?.count || 0,
    ];
  });

  const totalPriorities =
    priorityRows.reduce((sum, item) => sum + item[1], 0) || 1;

  return (
    <section className="dashboard reports-page">
      <section className="page-intro">
        <div>
          <span className="section-eyebrow">
            CRM REPORTING
          </span>

          <h2>See the bigger picture.</h2>

          <p>
            A consolidated view of lead performance, data quality and AI activity.
          </p>
        </div>

        <div className="report-header-actions">
          <button
            className="secondary-button"
            onClick={exportReport}
            disabled={loading}
          >
            Export Report
          </button>

          <button
            className="secondary-button"
            onClick={() => loadReports(true)}
            disabled={refreshing}
          >
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </section>

      <section className="reports-summary-grid">
        <div className="report-summary-card">
          <span>Total Leads</span>
          <strong>
            {loading ? "—" : formatNumber(totalLeads)}
          </strong>
          <small>CRM records</small>
        </div>

        <div className="report-summary-card">
          <span>Data Quality</span>
          <strong>
            {loading ? "—" : percent(qualityRate)}
          </strong>
          <small>Clean records rate</small>
        </div>

        <div className="report-summary-card">
          <span>AI Score</span>
          <strong>
            {loading ? "—" : score(averageScore)}
          </strong>
          <small>Average lead score</small>
        </div>

        <div className="report-summary-card">
          <span>Conversion</span>
          <strong>
            {loading ? "—" : percent(conversionRate)}
          </strong>
          <small>{formatNumber(convertedLeads)} converted leads</small>
        </div>
      </section>

      <section className="reports-main-grid">
        <div className="panel report-panel">
          <div className="panel-heading">
            <div>
              <span className="panel-kicker">
                LEAD PERFORMANCE
              </span>
              <h3>Pipeline overview</h3>
            </div>
          </div>

          <div className="report-stat-list">
            <div>
              <span>New leads</span>
              <strong>
                {loading
                  ? "—"
                  : formatNumber(dashboard?.new_leads || 0)}
              </strong>
            </div>

            <div>
              <span>Contacted</span>
              <strong>
                {loading
                  ? "—"
                  : formatNumber(dashboard?.contacted_leads || 0)}
              </strong>
            </div>

            <div>
              <span>Qualified</span>
              <strong>
                {loading
                  ? "—"
                  : formatNumber(dashboard?.qualified_leads || 0)}
              </strong>
            </div>

            <div>
              <span>Converted</span>
              <strong>
                {loading
                  ? "—"
                  : formatNumber(convertedLeads)}
              </strong>
            </div>

            <div>
              <span>Lost</span>
              <strong>
                {loading
                  ? "—"
                  : formatNumber(dashboard?.lost_leads || 0)}
              </strong>
            </div>

            <div>
              <span>Duplicates</span>
              <strong>
                {loading
                  ? "—"
                  : formatNumber(duplicateLeads)}
              </strong>
            </div>
          </div>
        </div>

        <div className="panel report-panel">
          <div className="panel-heading">
            <div>
              <span className="panel-kicker">
                DATA QUALITY
              </span>
              <h3>Record health</h3>
            </div>
          </div>

          <div className="report-quality-score">
            <strong>
              {loading ? "—" : percent(qualityRate)}
            </strong>

            <span>
              Overall data quality
            </span>
          </div>

          <div className="report-quality-track">
            <span
              style={{
                width: `${Math.min(100, Math.max(0, qualityRate))}%`,
              }}
            />
          </div>

          <div className="report-quality-grid">
            <div>
              <span>Clean</span>
              <strong>
                {formatNumber(quality?.clean_records || 0)}
              </strong>
            </div>

            <div>
              <span>Duplicates</span>
              <strong>
                {formatNumber(quality?.duplicate_records || 0)}
              </strong>
            </div>

            <div>
              <span>Review</span>
              <strong>
                {formatNumber(quality?.review_required || 0)}
              </strong>
            </div>

            <div>
              <span>Missing</span>
              <strong>
                {formatNumber(quality?.missing_information || 0)}
              </strong>
            </div>
          </div>
        </div>
      </section>

      <section className="reports-visual-grid">
        <div className="panel report-panel report-visual-panel">
          <div className="panel-heading">
            <div>
              <span className="panel-kicker">
                PIPELINE
              </span>
              <h3>Lead movement</h3>
            </div>

            <span className="report-panel-meta">
              {formatNumber(totalLeads)} total
            </span>
          </div>

          <div className="report-pipeline">
            {[
              ["NEW", dashboard?.new_leads || 0],
              ["CONTACTED", dashboard?.contacted_leads || 0],
              ["QUALIFIED", dashboard?.qualified_leads || 0],
              ["CONVERTED", dashboard?.converted_leads || 0],
              ["LOST", dashboard?.lost_leads || 0],
            ].map(([label, count]) => {
              const percentage =
                totalLeads > 0
                  ? (count / totalLeads) * 100
                  : 0;

              return (
                <div className="report-pipeline-row" key={label}>
                  <div className="report-pipeline-label">
                    <span>{label}</span>
                    <strong>{formatNumber(count)}</strong>
                  </div>

                  <div className="report-pipeline-track">
                    <span
                      style={{
                        width: `${Math.max(
                          count > 0 ? 2 : 0,
                          percentage
                        )}%`,
                      }}
                    />
                  </div>

                  <small>
                    {percentage.toFixed(1)}%
                  </small>
                </div>
              );
            })}
          </div>
        </div>

        <div className="panel report-panel report-visual-panel">
          <div className="panel-heading">
            <div>
              <span className="panel-kicker">
                DATA QUALITY
              </span>
              <h3>Record distribution</h3>
            </div>

            <span className="report-panel-meta">
              {formatNumber(totalLeads)} records
            </span>
          </div>

          <div className="report-quality-breakdown">
            {[
              ["CLEAN", quality?.clean_records || 0],
              ["DUPLICATES", quality?.duplicate_records || 0],
              ["REVIEW", quality?.review_required || 0],
              ["MISSING", quality?.missing_information || 0],
            ].map(([label, count]) => {
              const percentage =
                totalLeads > 0
                  ? (count / totalLeads) * 100
                  : 0;

              return (
                <div
                  className="report-quality-row"
                  key={label}
                >
                  <div className="report-quality-row-top">
                    <span>{label}</span>
                    <strong>
                      {formatNumber(count)}
                    </strong>
                  </div>

                  <div className="report-quality-row-track">
                    <span
                      style={{
                        width: `${Math.max(
                          count > 0 ? 1.5 : 0,
                          percentage
                        )}%`,
                      }}
                    />
                  </div>

                  <small>
                    {percentage.toFixed(1)}%
                  </small>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="reports-main-grid">
        <div className="panel report-panel">
          <div className="panel-heading">
            <div>
              <span className="panel-kicker">
                AI INTELLIGENCE
              </span>
              <h3>Lead intent</h3>
            </div>

            <span className="report-panel-meta">
              {formatNumber(intelligence?.total_analyzed || 0)} analyzed
            </span>
          </div>

          <div className="report-breakdown-list">
            {topIntent.map((item) => {
              const intent = item.intent;
              const count = item.count || 0;

              const total =
                intelligence?.total_analyzed || 1;

              const percentage =
                (count / total) * 100;

              return (
                <div className="report-breakdown-row" key={intent}>
                  <div>
                    <span>{intent}</span>
                    <strong>{formatNumber(count)}</strong>
                  </div>

                  <div className="report-breakdown-track">
                    <span
                      style={{
                        width: `${percentage}%`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="panel report-panel">
          <div className="panel-heading">
            <div>
              <span className="panel-kicker">
                AI PRIORITY
              </span>
              <h3>Lead priority</h3>
            </div>
          </div>

          <div className="report-breakdown-list">
            {priorityRows.map(([priority, count]) => {
              const percentage =
                (count / totalPriorities) * 100;

              return (
                <div
                  className="report-breakdown-row"
                  key={priority}
                >
                  <div>
                    <span>{priority}</span>
                    <strong>{formatNumber(count)}</strong>
                  </div>

                  <div className="report-breakdown-track">
                    <span
                      style={{
                        width: `${percentage}%`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="report-highlight">
            <span>High-priority opportunities</span>
            <strong>{formatNumber(highPriority)}</strong>
          </div>
        </div>
      </section>

      <section className="panel report-follow-up-panel">
        <div className="panel-heading">
          <div>
            <span className="panel-kicker">
              FOLLOW-UP PERFORMANCE
            </span>
            <h3>Recommended actions</h3>
          </div>

          <span className="report-panel-meta">
            {formatNumber(followUpMetrics.total || 0)} active
          </span>
        </div>

        <div className="report-follow-up-grid">
          <div>
            <span>Pending</span>
            <strong>
              {formatNumber(followUpMetrics.pending || 0)}
            </strong>
          </div>

          <div>
            <span>In progress</span>
            <strong>
              {formatNumber(followUpMetrics.in_progress || 0)}
            </strong>
          </div>

          <div>
            <span>Completed</span>
            <strong>
              {formatNumber(followUpMetrics.completed || 0)}
            </strong>
          </div>

          <div>
            <span>Overdue</span>
            <strong>
              {formatNumber(followUpMetrics.overdue || 0)}
            </strong>
          </div>

          <div>
            <span>Completion rate</span>
            <strong>
              {percent(followUpMetrics.completion_rate || 0)}
            </strong>
          </div>
        </div>
      </section>

      <section className="report-footer-note">
        <span>REPORT STATUS</span>
        <p>
          Generated from the current CRM database, AI intelligence and follow-up activity.
        </p>
      </section>
    </section>
  );
}


function SettingsPage() {
  const settings = [
    {
      title: "Workspace",
      description: "Basic information about this CRM workspace.",
      rows: [
        ["Workspace name", "AI CRM Automation"],
        ["Environment", "Local development"],
        ["Version", "CRM MVP"],
      ],
    },
    {
      title: "API & Backend",
      description: "Connection status for the CRM backend.",
      rows: [
        ["API status", "Connected"],
        ["API endpoint", API_BASE],
        ["Database", "SQLite"],
      ],
    },
    {
      title: "AI Intelligence",
      description: "AI processing configuration and status.",
      rows: [
        ["AI analysis", "Enabled"],
        ["Lead scoring", "Enabled"],
        ["Duplicate detection", "Enabled"],
      ],
    },
    {
      title: "Data Processing",
      description: "How incoming CRM data is handled.",
      rows: [
        ["Validation", "Enabled"],
        ["Data cleaning", "Enabled"],
        ["Human review", "Enabled"],
      ],
    },
  ];

  return (
    <div className="page">
      <section className="settings-grid">
        {settings.map((section) => (
          <div className="panel settings-panel" key={section.title}>
            <div className="settings-panel-header">
              <div>
                <h3>{section.title}</h3>
                <p>{section.description}</p>
              </div>
            </div>

            <div className="settings-rows">
              {section.rows.map(([label, value]) => (
                <div className="settings-row" key={label}>
                  <span>{label}</span>
                  <strong>{value}</strong>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>

      <section className="panel settings-health-panel">
        <div className="settings-health-header">
          <div>
            <h3>System health</h3>
            <p>Current status of the CRM application.</p>
          </div>

          <span className="settings-status">
            <span className="settings-status-dot" />
            Operational
          </span>
        </div>

        <div className="settings-health-grid">
          <div>
            <span>Frontend</span>
            <strong>Running</strong>
          </div>

          <div>
            <span>Backend API</span>
            <strong>Connected</strong>
          </div>

          <div>
            <span>Database</span>
            <strong>Available</strong>
          </div>

          <div>
            <span>AI pipeline</span>
            <strong>Ready</strong>
          </div>
        </div>
      </section>
    </div>
  );
}

function ComingSoon({ title }) {
  return (
    <section className="dashboard">
      <div className="coming-soon">
        <div className="coming-icon">✦</div>
        <h2>{title}</h2>
        <p>This workspace is coming next.</p>
      </div>
    </section>
  );
}

export default App;
