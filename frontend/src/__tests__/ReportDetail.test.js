import React from 'react';
import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import ReportDetail from '../components/ReportDetail';
import * as client from '../api/client';

jest.mock('../api/client');

const pendingReport = {
  id: 'test-id',
  projectName: 'DocuRAG',
  branch: 'main',
  status: 'pending',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  completedAt: null,
  findings: null,
};

const completedReport = {
  ...pendingReport,
  status: 'READY',
  completedAt: new Date().toISOString(),
  findings: [
    {
      agent: 'docs-config',
      severity: 'low',
      category: 'documentation',
      description: 'No CHANGELOG found',
      affectedFiles: ['CHANGELOG.md'],
      evidence: 'CHANGELOG.md does not exist',
      impact: 'Release history is undocumented',
      recommendation: 'Add a CHANGELOG.md',
    },
  ],
};

describe('ReportDetail', () => {
  beforeEach(() => jest.clearAllMocks());

  afterEach(() => {
    jest.useRealTimers();
  });

  test('shows running banner when status is pending', async () => {
    client.getReport.mockResolvedValue(pendingReport);
    await act(async () => {
      render(<ReportDetail id="test-id" onBack={() => {}} />);
    });
    expect(screen.getByText(/IBM Bob is analyzing/i)).toBeInTheDocument();
  });

  test('shows running banner when status is running', async () => {
    client.getReport.mockResolvedValue({ ...pendingReport, status: 'running' });
    await act(async () => {
      render(<ReportDetail id="test-id" onBack={() => {}} />);
    });
    expect(screen.getByText(/IBM Bob is analyzing/i)).toBeInTheDocument();
  });

  test('shows failed banner when status is failed', async () => {
    client.getReport.mockResolvedValue({ ...pendingReport, status: 'failed' });
    await act(async () => {
      render(<ReportDetail id="test-id" onBack={() => {}} />);
    });
    expect(screen.getByText(/analysis failed/i)).toBeInTheDocument();
  });

  test('renders findings when status is READY', async () => {
    client.getReport.mockResolvedValue(completedReport);
    await act(async () => {
      render(<ReportDetail id="test-id" onBack={() => {}} />);
    });
    expect(screen.getByText('No CHANGELOG found')).toBeInTheDocument();
  });

  test('polls until status is terminal', async () => {
    jest.useFakeTimers();
    client.getReport
      .mockResolvedValueOnce(pendingReport)
      .mockResolvedValueOnce(completedReport);

    await act(async () => {
      render(<ReportDetail id="test-id" onBack={() => {}} />);
    });

    expect(screen.getByText(/IBM Bob is analyzing/i)).toBeInTheDocument();

    await act(async () => {
      jest.advanceTimersByTime(3500);
      await Promise.resolve();
    });

    expect(screen.getByText('No CHANGELOG found')).toBeInTheDocument();
    expect(client.getReport).toHaveBeenCalledTimes(2);
  });

  test('shows "No findings — project looks good!" when findings array is empty', async () => {
    client.getReport.mockResolvedValue({ ...completedReport, findings: [] });
    await act(async () => {
      render(<ReportDetail id="test-id" onBack={() => {}} />);
    });
    expect(screen.getByText(/No findings.*project looks good/i)).toBeInTheDocument();
  });

  test('shows error message when fetch fails', async () => {
    client.getReport.mockRejectedValue(new Error('Network error'));
    await act(async () => {
      render(<ReportDetail id="test-id" onBack={() => {}} />);
    });
    expect(screen.getByText(/Network error/i)).toBeInTheDocument();
  });
});
