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

  test('applies large class when large prop is set', () => {
    const { container } = render(<StatusBadge status="READY" large />);
    expect(container.firstChild).toHaveClass('status-large');
  });
});
