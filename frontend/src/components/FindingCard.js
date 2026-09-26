import React, { useState } from 'react';
import './FindingCard.css';

function FindingCard({ finding }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`finding-card severity-${finding.severity}`}>
      <div className="finding-header" onClick={() => setExpanded(!expanded)}>
        <span className={`severity-dot dot-${finding.severity}`} />
        <span className="finding-description">{finding.description}</span>
        <span className="finding-meta">
          <span className="finding-agent">{finding.agent}</span>
          <span className="finding-category">{finding.category}</span>
        </span>
        <span className="expand-icon">{expanded ? '▲' : '▼'}</span>
      </div>

      {expanded && (
        <div className="finding-body">
          {finding.affectedFiles && finding.affectedFiles.length > 0 && (
            <div className="finding-section">
              <strong>Affected Files</strong>
              <ul>
                {finding.affectedFiles.map((f, i) => (
                  <li key={i}><code>{f}</code></li>
                ))}
              </ul>
            </div>
          )}

          {finding.evidence && (
            <div className="finding-section">
              <strong>Evidence</strong>
              <pre className="finding-evidence">{finding.evidence}</pre>
            </div>
          )}

          {finding.impact && (
            <div className="finding-section">
              <strong>Impact</strong>
              <p>{finding.impact}</p>
            </div>
          )}

          {finding.recommendation && (
            <div className="finding-section">
              <strong>Recommendation</strong>
              <p>{finding.recommendation}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default FindingCard;
