import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.routes.js';
import runsRoutes from './routes/runs.routes.js';
import internalRoutes from './routes/internal.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootRuns = path.resolve(__dirname, '../../runs');
const mlRuns = path.resolve(__dirname, '../../ml-service/runs');
const localRuns = path.resolve(__dirname, '../runs');

const app = express();

app.use(cors());
app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));

// Favicon handler
app.get('/favicon.ico', (req, res) => res.status(204).end());

// Serve runs and screenshot artifacts statically from all possible locations
app.use('/runs', express.static(rootRuns));
app.use('/runs', express.static(mlRuns));
app.use('/runs', express.static(localRuns));

app.use('/screenshots', express.static(rootRuns));
app.use('/screenshots', express.static(mlRuns));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/runs', runsRoutes);
app.use('/api/internal', internalRoutes);

// Centralized error handler
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  return res.status(statusCode).json({
    error: message,
    success: false,
    errors: err.errors || [],
  });
});

export default app;
