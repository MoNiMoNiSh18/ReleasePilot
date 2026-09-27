import React, { useEffect, useRef, useState } from 'react';
import { getReport } from '../api/client';
import StatusBadge from './StatusBadge';
import FindingCard from './FindingCard';
import './ReportDetail.css';

const IN_PROGRESS_STATUSES = new Set(['pending', 'running']);
const POLL_INTERVAL_MS = 3000;

function ReportDetail({ id, onBack }) {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const pollTimer = useRef(null);

  function clearPoll() {
    if (pollTimer.current) {
      clearTimeout(pollTimer.current);
      pollTimer.current = null;
    }
  }

  function scheduleNextPoll() {
    pollTimer.current = setTimeout(fetchReport, POLL_INTERVAL_MS);
  }

  async function fetchReport() {
    try {
      const data = await getReport(id);
      setReport(data);
      setError(null);
      if (IN_PROGRESS_STATUSES.has(data.status)) {
        scheduleNextPoll();
      } else {
        clearPoll();
      }
    } catch (err) {
      setError(err.message);
      clearPoll();
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setLoading(true);
    fetchReport();
    return () => clearPoll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) return <p className="loading">Loading report…</p>;
  if (error) return <p className="error">Error: {error}</p>;
  if (!report) return null;

  const isInProgress = IN_PROGRESS_STATUSES.has(report.status);
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
            {report.completedAt
              ? `Completed: ${new Date(report.completedAt).toLocaleString()}`
              : `Started: ${new Date(report.createdAt).toLocaleString()}`}
          </p>
        </div>
        <StatusBadge status={report.status} large />
      </div>

      {isInProgress && (
        <div className="analysis-running-banner">
          <span className="spinner" aria-hidden="true" /> IBM Bob is analyzing the project… results will appear automatically.
        </div>
      )}

      {report.status === 'failed' && (
        <div className="analysis-failed-banner">
          The analysis failed. Check the Bob session for details. You can resubmit findings manually using the API.
        </div>
      )}

      {!isInProgress && report.status !== 'failed' && (
        <>
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
            <p className="empty">
              {findings.length === 0
                ? 'No findings — project looks good!'
                : 'No findings at this severity level.'}
            </p>
          ) : (
            <div className="findings-list">
              {filtered.map((finding, idx) => (
                <FindingCard key={idx} finding={finding} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default ReportDetail;
