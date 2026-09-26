import React, { useEffect, useState } from 'react';
import { getReport } from '../api/client';
import StatusBadge from './StatusBadge';
import FindingCard from './FindingCard';
import './ReportDetail.css';

function ReportDetail({ id, onBack }) {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    getReport(id)
      .then(setReport)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="loading">Loading report…</p>;
  if (error) return <p className="error">Error: {error}</p>;
  if (!report) return null;

  const findings = report.findings || [];
  const severities = ['critical', 'high', 'medium', 'low'];

  const filtered =
    filter === 'all' ? findings : findings.filter((f) => f.severity === filter);

  const counts = severities.reduce((acc, s) => {
    acc[s] = findings.filter((f) => f.severity === s).length;
    return acc;
  }, {});

  return (
    <div className="report-detail-container">
      <button className="back-btn" onClick={onBack}>← Back to Reports</button>

      <div className="report-header">
        <div>
          <h2>{report.projectName}</h2>
          <p className="report-meta">
            Branch: <code>{report.branch}</code> &nbsp;·&nbsp;
            Analyzed: {new Date(report.createdAt).toLocaleString()}
          </p>
        </div>
        <StatusBadge status={report.status} large />
      </div>

      <div className="finding-counts">
        {severities.map((s) => (
          <div key={s} className={`count-chip count-${s}`}>
            <span className="count-num">{counts[s]}</span>
            <span className="count-label">{s}</span>
          </div>
        ))}
      </div>

      <div className="filter-bar">
        <span>Filter:</span>
        {['all', ...severities].map((s) => (
          <button
            key={s}
            className={`filter-btn ${filter === s ? 'active' : ''}`}
            onClick={() => setFilter(s)}
          >
            {s}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="empty">No findings at this severity level.</p>
      ) : (
        <div className="findings-list">
          {filtered.map((finding, idx) => (
            <FindingCard key={idx} finding={finding} />
          ))}
        </div>
      )}
    </div>
  );
}

export default ReportDetail;
