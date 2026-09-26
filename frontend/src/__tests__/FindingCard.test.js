import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import FindingCard from '../components/FindingCard';

const mockFinding = {
  agent: 'code-risk',
  severity: 'critical',
  category: 'security',
  description: 'Hardcoded API key in config.js',
  affectedFiles: ['src/config.js'],
  evidence: "const API_KEY = 'abc123secret';",
  impact: 'Credential exposure if repo is public',
  recommendation: 'Move to environment variable',
};

describe('FindingCard', () => {
  test('renders description', () => {
    render(<FindingCard finding={mockFinding} />);
    expect(screen.getByText(mockFinding.description)).toBeInTheDocument();
  });

  test('hides body by default', () => {
    render(<FindingCard finding={mockFinding} />);
    expect(screen.queryByText(mockFinding.evidence)).not.toBeInTheDocument();
  });

  test('expands body on click', () => {
    render(<FindingCard finding={mockFinding} />);
    fireEvent.click(screen.getByText(mockFinding.description).closest('.finding-header'));
    expect(screen.getByText(mockFinding.evidence)).toBeInTheDocument();
  });

  test('applies severity class to card', () => {
    const { container } = render(<FindingCard finding={mockFinding} />);
    expect(container.firstChild).toHaveClass('severity-critical');
  });
});
