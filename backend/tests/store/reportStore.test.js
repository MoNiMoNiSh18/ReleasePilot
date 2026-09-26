const { writeReport, readReport, listReports } = require('../../src/store/reportStore');
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.resolve(__dirname, '../../data/reports');

describe('reportStore', () => {
  const testId = `test-${Date.now()}`;
  const testData = { id: testId, projectName: 'test', status: 'pending', createdAt: new Date().toISOString() };

  afterEach(() => {
    const filePath = path.join(DATA_DIR, `${testId}.json`);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  });

  test('writeReport creates a JSON file', () => {
    writeReport(testId, testData);
    expect(fs.existsSync(path.join(DATA_DIR, `${testId}.json`))).toBe(true);
  });

  test('readReport returns the stored object', () => {
    writeReport(testId, testData);
    const result = readReport(testId);
    expect(result).toEqual(testData);
  });

  test('readReport returns null for unknown id', () => {
    const result = readReport('no-such-id');
    expect(result).toBeNull();
  });

  test('listReports includes written report', () => {
    writeReport(testId, testData);
    const results = listReports();
    const found = results.find((r) => r.id === testId);
    expect(found).toBeDefined();
  });
});
