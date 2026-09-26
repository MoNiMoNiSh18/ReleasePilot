const fs = require('fs');
const path = require('path');

const DATA_DIR = path.resolve(__dirname, '../../data/reports');

// Ensure the reports directory exists on first use
function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function reportPath(id) {
  return path.join(DATA_DIR, `${id}.json`);
}

/**
 * Write (create or overwrite) a report JSON file.
 * @param {string} id
 * @param {object} data
 */
function writeReport(id, data) {
  ensureDir();
  fs.writeFileSync(reportPath(id), JSON.stringify(data, null, 2), 'utf8');
}

/**
 * Read a report JSON file. Returns null if not found.
 * @param {string} id
 * @returns {object|null}
 */
function readReport(id) {
  ensureDir();
  const filePath = reportPath(id);
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

/**
 * List all stored reports, sorted newest-first.
 * @returns {object[]}
 */
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
