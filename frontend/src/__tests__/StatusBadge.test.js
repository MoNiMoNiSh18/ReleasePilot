import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import StatusBadge from '../components/StatusBadge';

describe('StatusBadge', () => {
  test('renders READY status', () => {
    render(<StatusBadge status="READY" />);
    expect(screen.getByText(/READY/i)).toBeInTheDocument();
  });

  test('renders WARNING status', () => {
    render(<StatusBadge status="WARNING" />);
    expect(screen.getByText(/WARNING/i)).toBeInTheDocument();
  });

  test('renders BLOCKED status', () => {
    render(<StatusBadge status="BLOCKED" />);
    expect(screen.getByText(/BLOCKED/i)).toBeInTheDocument();
  });

  test('renders READY_WITH_WARNINGS status', () => {
    render(<StatusBadge status="READY_WITH_WARNINGS" />);
    expect(screen.getByText(/READY.*warnings/i)).toBeInTheDocument();
  });

  test('renders running status', () => {
    render(<StatusBadge status="running" />);
    expect(screen.getByText(/Running/i)).toBeInTheDocument();
  });

  test('renders failed status', () => {
    render(<StatusBadge status="failed" />);
    expect(screen.getByText(/Failed/i)).toBeInTheDocument();
  });

  test('renders pending status', () => {
    render(<StatusBadge status="pending" />);
    expect(screen.getByText(/Pending/i)).toBeInTheDocument();
  });

  test('applies large class when large prop is set', () => {
    const { container } = render(<StatusBadge status="READY" large />);
    expect(container.firstChild).toHaveClass('status-large');
  });
});
