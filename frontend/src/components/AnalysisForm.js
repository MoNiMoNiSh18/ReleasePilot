import React, { useState } from 'react';
import { startAnalysis } from '../api/client';
import './AnalysisForm.css';

function AnalysisForm({ onAnalysisCreated }) {
  const [projectPath, setProjectPath] = useState('');
  const [projectName, setProjectName] = useState('');
  const [branch, setBranch] = useState('main');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await startAnalysis({ projectPath, projectName, branch });
      onAnalysisCreated(result.id);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="analysis-form-container">
      <h2>Start Release Analysis</h2>
      <p className="form-hint">
        Point ReleasePilot at the project you want to assess for release readiness.
        Bob will analyze code risk, test coverage, and documentation in parallel.
      </p>

      <form className="analysis-form" onSubmit={handleSubmit}>
        <label className="form-label">
          Project Path <span className="required">*</span>
          <input
            className="form-input"
            type="text"
            value={projectPath}
            onChange={(e) => setProjectPath(e.target.value)}
            placeholder="/absolute/path/to/your-project"
            required
          />
        </label>

        <label className="form-label">
          Project Name
          <input
            className="form-input"
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder="my-app (optional)"
          />
        </label>

        <label className="form-label">
          Branch
          <input
            className="form-input"
            type="text"
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
            placeholder="main"
          />
        </label>

        {error && <p className="form-error">{error}</p>}

        <button className="submit-btn" type="submit" disabled={loading}>
          {loading ? 'Starting…' : 'Start Analysis'}
        </button>
      </form>
    </div>
  );
}

export default AnalysisForm;
