import React, { useEffect, useState } from 'react';
import { listAnalyses } from '../api/client';
import StatusBadge from './StatusBadge';
import './ReportList.css';

function ReportList({ onSelect }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    listAnalyses()
      .then(setReports)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="loading">Loading reports…</p>;
  if (error) return <p className="error">Error: {error}</p>;
  if (reports.length === 0) return <p className="empty">No analyses yet. Run your first one!</p>;

  return (
    <div className="report-list-container">
      <h2>Analysis Reports</h2>
      <table className="report-table">
        <thead>
          <tr>
            <th>Project</th>
            <th>Branch</th>
            <th>Status</th>
            <th>Date</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {reports.map((r) => (
            <tr key={r.id} className="report-row">
              <td>{r.projectName}</td>
              <td><code>{r.branch}</code></td>
              <td><StatusBadge status={r.status} /></td>
              <td>{new Date(r.createdAt).toLocaleString()}</td>
              <td>
                <button className="view-btn" onClick={() => onSelect(r.id)}>
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ReportList;
