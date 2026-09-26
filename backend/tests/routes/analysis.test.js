const request = require('supertest');
const app = require('../../src/index');
const { readReport, writeReport } = require('../../src/store/reportStore');

jest.mock('../../src/store/reportStore');

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

describe('POST /api/analysis/:id/results', () => {
  const mockSession = {
    id: 'test-id',
    projectPath: '/home/user/my-app',
    projectName: 'my-app',
    branch: 'main',
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    findings: null,
    report: null,
  };

  beforeEach(() => jest.clearAllMocks());

  test('returns 404 when session does not exist', async () => {
    readReport.mockReturnValue(null);
    const res = await request(app)
      .post('/api/analysis/nonexistent/results')
      .send({ findings: [] });
    expect(res.status).toBe(404);
  });

  test('returns 400 when findings is not an array', async () => {
    readReport.mockReturnValue(mockSession);
    const res = await request(app)
      .post('/api/analysis/test-id/results')
      .send({ findings: 'bad' });
    expect(res.status).toBe(400);
  });

  test('sets status to READY when no critical/high findings', async () => {
    readReport.mockReturnValue(mockSession);
    writeReport.mockImplementation(() => {});
    const res = await request(app)
      .post('/api/analysis/test-id/results')
      .send({ findings: [{ severity: 'low', description: 'minor issue' }] });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('READY');
  });

  test('sets status to WARNING when a high finding exists', async () => {
    readReport.mockReturnValue(mockSession);
    writeReport.mockImplementation(() => {});
    const res = await request(app)
      .post('/api/analysis/test-id/results')
      .send({ findings: [{ severity: 'high', description: 'serious issue' }] });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('WARNING');
  });

  test('sets status to BLOCKED when a critical finding exists', async () => {
    readReport.mockReturnValue(mockSession);
    writeReport.mockImplementation(() => {});
    const res = await request(app)
      .post('/api/analysis/test-id/results')
      .send({ findings: [{ severity: 'critical', description: 'breaking issue' }] });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('BLOCKED');
  });
});
