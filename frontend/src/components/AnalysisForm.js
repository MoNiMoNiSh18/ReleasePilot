import React, { useState } from 'react';
import { startAnalysis } from '../api/client';
import './AnalysisForm.css';

function AnalysisForm({ onAnalysisCreated }) {
  const [projectPath, setProjectPath] = useState('');
  const [projectName, setProjectName] = useState('');
  const [branch, setBranch] = useState('main');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [created, setCreated] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await startAnalysis({ projectPath, projectName, branch });
      const resolvedName = projectName || projectPath.split('/').pop() || projectPath;
      setCreated({ id: result.id, projectPath, projectName: resolvedName, branch });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (created) {
    const bobPrompt = buildBobPrompt(created);
    return (
      <div className="analysis-form-container">
        <h2>Analysis Session Created</h2>
        <p className="form-hint">
          Session ID: <code>{created.id}</code>
        </p>

        <div className="bob-instructions">
          <h3>Run IBM Bob to perform the analysis</h3>
          <p>
            Open a new IBM Bob Agent session and paste the following prompt.
            Bob will analyze the project, run the critic pass, and automatically
            submit results back to ReleasePilot.
          </p>
          <pre className="bob-prompt">{bobPrompt}</pre>
          <button
            className="copy-btn"
            onClick={() => navigator.clipboard.writeText(bobPrompt).catch(() => {})}
          >
            Copy prompt
          </button>
        </div>

        <div className="session-actions">
          <button className="submit-btn" onClick={() => onAnalysisCreated(created.id)}>
            View Report (polls for updates automatically)
          </button>
          <button className="secondary-btn" onClick={() => setCreated(null)}>
            Start another analysis
          </button>
        </div>
      </div>
    );
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

function buildBobPrompt({ id, projectPath, projectName, branch }) {
  return `You are the Release Orchestrator for ReleasePilot. Follow the instructions in agents/AGENTS.md exactly.

Session details:
- analysisId: ${id}
- projectPath: ${projectPath}
- projectName: ${projectName}
- branch: ${branch}
- apiBase: http://localhost:3001/api

Step 1: PATCH ${`http://localhost:3001/api/analysis/${id}/status`} with body {"status":"running"} to mark the session as started.

Step 2: Spawn three subagents IN PARALLEL using spawn_subagent:
  (a) Code Risk Analyst    — instructions in agents/subagents/code-risk/AGENTS.md
  (b) Test Analyst         — instructions in agents/subagents/test-analysis/AGENTS.md
  (c) Docs & Config Analyst — instructions in agents/subagents/docs-config/AGENTS.md
  Pass each subagent: analysisId=${id}, projectPath=${projectPath}, projectName=${projectName}, branch=${branch}

Step 3: Collect all three findings arrays. Perform the CRITIC/REVIEW pass:
  - Drop findings without concrete file+evidence
  - Remove duplicates (keep the higher-severity version)
  - Verify severity is justified by the evidence
  - Verify affectedFiles paths exist in the project

Step 4: POST the final reviewed findings to:
  http://localhost:3001/api/analysis/${id}/results
  Body: {"findings": [ ...reviewed findings array... ]}

Each finding must have: severity, title (or description), file (or affectedFiles), evidence, impact, recommendation.

Do NOT invent findings. Every finding must cite real evidence from ${projectPath}.`;
}

export default AnalysisForm;
