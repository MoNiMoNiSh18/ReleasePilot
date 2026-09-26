const request = require('supertest');
const app = require('../../src/index');
const { readReport, writeReport } = require('../../src/store/reportStore');

jest.mock('../../src/store/reportStore');

const baseSession = {
  id: 'test-id',
  projectPath: '/home/user/my-app',
  projectName: 'my-app',
  branch: 'main',
  status: 'pending',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  completedAt: null,
  findings: null,
};

describe('POST /api/analysis', () => {
  beforeEach(() => jest.clearAllMocks());

  test('returns 400 when projectPath is missing', async () => {
    const res = await request(app).post('/api/analysis').send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/projectPath/);
  });

  test('creates a new analysis session and returns 201', async () => {
    writeReport.mockImplementation(() => {});
    const res = await request(app)
      .post('/api/analysis')
      .send({ projectPath: '/home/user/my-app', projectName: 'my-app', branch: 'main' });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ status: 'pending' });
    expect(typeof res.body.id).toBe('string');
    expect(writeReport).toHaveBeenCalledTimes(1);
  });
});

describe('PATCH /api/analysis/:id/status', () => {
  beforeEach(() => jest.clearAllMocks());

  test('returns 404 when session does not exist', async () => {
    readReport.mockReturnValue(null);
    const res = await request(app)
      .patch('/api/analysis/nonexistent/status')
      .send({ status: 'running' });
    expect(res.status).toBe(404);
  });

  test('returns 400 for invalid status value', async () => {
    readReport.mockReturnValue(baseSession);
    const res = await request(app)
      .patch('/api/analysis/test-id/status')
      .send({ status: 'COMPLETED' });
    expect(res.status).toBe(400);
  });

  test('sets status to running', async () => {
    readReport.mockReturnValue(baseSession);
    writeReport.mockImplementation(() => {});
    const res = await request(app)
      .patch('/api/analysis/test-id/status')
      .send({ status: 'running' });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('running');
  });

  test('sets status to failed', async () => {
    readReport.mockReturnValue({ ...baseSession, status: 'running' });
    writeReport.mockImplementation(() => {});
    const res = await request(app)
      .patch('/api/analysis/test-id/status')
      .send({ status: 'failed' });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('failed');
  });
});

describe('POST /api/analysis/:id/results', () => {
  beforeEach(() => jest.clearAllMocks());

  test('returns 404 when session does not exist', async () => {
    readReport.mockReturnValue(null);
    const res = await request(app)
      .post('/api/analysis/nonexistent/results')
      .send({ findings: [] });
    expect(res.status).toBe(404);
  });

  test('returns 400 when findings is not an array', async () => {
    readReport.mockReturnValue(baseSession);
    const res = await request(app)
      .post('/api/analysis/test-id/results')
      .send({ findings: 'bad' });
    expect(res.status).toBe(400);
  });

  test('sets status to READY when findings are empty', async () => {
    readReport.mockReturnValue(baseSession);
    writeReport.mockImplementation(() => {});
    const res = await request(app)
      .post('/api/analysis/test-id/results')
      .send({ findings: [] });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('READY');
  });

  test('sets status to READY when only low findings exist', async () => {
    readReport.mockReturnValue(baseSession);
    writeReport.mockImplementation(() => {});
    const res = await request(app)
      .post('/api/analysis/test-id/results')
      .send({ findings: [{ severity: 'low', description: 'minor issue' }] });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('READY');
  });

  test('sets status to READY_WITH_WARNINGS when only medium findings exist', async () => {
    readReport.mockReturnValue(baseSession);
    writeReport.mockImplementation(() => {});
    const res = await request(app)
      .post('/api/analysis/test-id/results')
      .send({ findings: [{ severity: 'medium', description: 'moderate issue' }] });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('READY_WITH_WARNINGS');
  });

  test('sets status to WARNING when a high finding exists', async () => {
    readReport.mockReturnValue(baseSession);
    writeReport.mockImplementation(() => {});
    const res = await request(app)
      .post('/api/analysis/test-id/results')
      .send({ findings: [{ severity: 'high', description: 'serious issue' }] });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('WARNING');
  });

  test('sets status to BLOCKED when a critical finding exists', async () => {
    readReport.mockReturnValue(baseSession);
    writeReport.mockImplementation(() => {});
    const res = await request(app)
      .post('/api/analysis/test-id/results')
      .send({ findings: [{ severity: 'critical', description: 'breaking issue' }] });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('BLOCKED');
  });

  test('BLOCKED takes priority over high when both exist', async () => {
    readReport.mockReturnValue(baseSession);
    writeReport.mockImplementation(() => {});
    const res = await request(app)
      .post('/api/analysis/test-id/results')
      .send({
        findings: [
          { severity: 'high', description: 'high issue' },
          { severity: 'critical', description: 'critical issue' },
        ],
      });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('BLOCKED');
  });

  test('stores completedAt when results are submitted', async () => {
    readReport.mockReturnValue(baseSession);
    let saved;
    writeReport.mockImplementation((id, data) => { saved = data; });
    await request(app)
      .post('/api/analysis/test-id/results')
      .send({ findings: [] });
    expect(saved.completedAt).toBeTruthy();
  });
});
