const express = require('express');
const cors = require('cors');
const analysisRouter = require('./routes/analysis');
const reportsRouter = require('./routes/reports');

const app = express();
const PORT = process.env.PORT || 3001;

// In production FRONTEND_URL must be set to the Vercel deployment URL.
// In development all origins are allowed (open CORS for local use).
const corsOptions = process.env.FRONTEND_URL
  ? {
      origin: process.env.FRONTEND_URL,
      methods: ['GET', 'POST', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type'],
    }
  : {};  // open — development only

app.use(cors(corsOptions));
app.use(express.json());

app.use('/api/analysis', analysisRouter);
app.use('/api/reports', reportsRouter);

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'ReleasePilot API',
    storage: 'json-files',
    // On Render free tier the filesystem is ephemeral — data is lost on redeploy/restart.
    // Upgrade to a paid instance with a persistent disk, or migrate to a DB, for production use.
    storageNote: process.env.NODE_ENV === 'production'
      ? 'ephemeral — reports are lost on restart'
      : 'local',
  });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`ReleasePilot API running on http://localhost:${PORT}`);
  });
}

module.exports = app;
