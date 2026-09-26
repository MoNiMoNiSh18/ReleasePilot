import React, { useState } from 'react';
import AnalysisForm from './components/AnalysisForm';
import ReportList from './components/ReportList';
import ReportDetail from './components/ReportDetail';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('new');
  const [selectedReportId, setSelectedReportId] = useState(null);

  function handleReportSelect(id) {
    setSelectedReportId(id);
    setActiveTab('detail');
  }

  function handleBack() {
    setSelectedReportId(null);
    setActiveTab('reports');
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">✈ ReleasePilot</h1>
        <p className="app-subtitle">AI-powered release readiness analysis</p>
        <nav className="app-nav">
          <button
            className={`nav-btn ${activeTab === 'new' ? 'active' : ''}`}
            onClick={() => setActiveTab('new')}
          >
            New Analysis
          </button>
          <button
            className={`nav-btn ${activeTab === 'reports' ? 'active' : ''}`}
            onClick={() => { setActiveTab('reports'); setSelectedReportId(null); }}
          >
            Reports
          </button>
        </nav>
      </header>

      <main className="app-main">
        {activeTab === 'new' && (
          <AnalysisForm onAnalysisCreated={(id) => handleReportSelect(id)} />
        )}
        {activeTab === 'reports' && (
          <ReportList onSelect={handleReportSelect} />
        )}
        {activeTab === 'detail' && selectedReportId && (
          <ReportDetail id={selectedReportId} onBack={handleBack} />
        )}
      </main>
    </div>
  );
}

export default App;
