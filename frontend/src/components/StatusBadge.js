import React from 'react';
import './StatusBadge.css';

const STATUS_LABELS = {
  READY: '✅ READY',
  WARNING: '⚠️ WARNING',
  BLOCKED: '🚫 BLOCKED',
  pending: '⏳ Pending',
};

function StatusBadge({ status, large }) {
  const label = STATUS_LABELS[status] || status;
  return (
    <span className={`status-badge status-${status} ${large ? 'status-large' : ''}`}>
      {label}
    </span>
  );
}

export default StatusBadge;
