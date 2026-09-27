const fs = require('fs');
const path = require('path');

const DATA_DIR = path.resolve(__dirname, '../../data/reports');

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function reportPath(id) {
  return path.join(DATA_DIR, `${id}.json`);
}

function writeReport(id, data) {
  ensureDir();
  fs.writeFileSync(reportPath(id), JSON.stringify(data, null, 2), 'utf8');
}

function readReport(id) {
  ensureDir();
  const filePath = reportPath(id);
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function listReports() {
  ensureDir();
  return fs
    .readdirSync(DATA_DIR)
    .filter((f) => f.endsWith('.json'))
    .map((f) => {
      const filePath = path.join(DATA_DIR, f);
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

module.exports = { writeReport, readReport, listReports };
