import React from 'react';
import './StatusBadge.css';

const STATUS_LABELS = {
  pending:             '⏳ Pending',
  running:             '🔄 Running',
  READY:               '✅ READY',
  READY_WITH_WARNINGS: '✅ READY (with warnings)',
  WARNING:             '⚠️ WARNING',
  BLOCKED:             '🚫 BLOCKED',
  failed:              '❌ Failed',
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
